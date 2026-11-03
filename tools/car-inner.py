# Внутренности RB18 для сайта: блендер-скрипт, реальные метры. Оси как у car.gltf после импорта:
# Source of models/car-inner.glb. Then compress: node car-opt.mjs inner-raw.glb car-inner.glb 1000 2048 (meshopt only, no textures).
# X — вперёд (нос), Y — поперёк, Z — вверх. Запуск: blender -b --python inner.py -- <car.gltf> <out.glb> [preview.png]
import bpy, bmesh, sys, math, mathutils
from math import radians as R
a = sys.argv[sys.argv.index('--')+1:]; CAR, OUT = a[0], a[1]; PREV = a[2] if len(a) > 2 else None
V = mathutils.Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, col, metal, rough, coat=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if coat: b.inputs['Coat Weight'].default_value = coat
    return m
def srgb(h): return tuple(((int(h[i:i+2], 16) / 255 + .055) / 1.055) ** 2.4 for i in (0, 2, 4))
M = dict(
    alu=mat('alu', srgb('c8c8c4'), 1, .32), alu_cast=mat('alu_cast', srgb('9d9c97'), 1, .55),
    titan=mat('titan', srgb('8c837a'), 1, .3), inconel=mat('inconel', srgb('8a6a4c'), 1, .38),
    heat=mat('heat', srgb('5a4a3c'), 1, .5), gold=mat('gold', srgb('e2b65a'), 1, .22),
    black=mat('black_anod', srgb('1c1c1d'), .6, .42), rubber=mat('rubber', srgb('161616'), 0, .8),
    hv=mat('hv_orange', srgb('ff6a00'), 0, .5), carbon=mat('carbon', srgb('2a2a2a'), .3, .3, 1),
    fins=mat('fins', srgb('b9b9b4'), 1, .45), hose=mat('hose', srgb('202020'), 0, .65),
    disc=mat('disc', srgb('2c2826'), .3, .7), red=mat('coil_red', srgb('b3261e'), 0, .45),
    wrap=mat('heat_wrap', srgb('a29d93'), .55, .62), purple=mat('purple_anod', srgb('7b3a96'), .85, .3),
    loom=mat('loom', srgb('2b2b2b'), 0, .55), braid=mat('braid', srgb('7c7c78'), .9, .4))
GROUPS = {}
def grp(gid):
    if gid not in GROUPS:
        e = bpy.data.objects.new('p_' + gid, None); sc.collection.objects.link(e); GROUPS[gid] = e
    return GROUPS[gid]
def fin(o, gid, m, smooth=.6, bev=0, seg=2):
    o.data.materials.append(M[m]); sc.collection.objects.link(o) if o.name not in sc.collection.objects else None
    if bev:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bev; md.segments = seg; md.limit_method = 'ANGLE'
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
    bpy.ops.object.shade_smooth_by_angle(angle=smooth); o.select_set(False)
    o.parent = grp(gid); return o
def new(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); return o
def box(gid, name, size, loc, rot=(0, 0, 0), m='alu', bev=.008):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=V(size), verts=bm.verts)
    o = new(name, bm); o.location = loc; o.rotation_euler = rot; return fin(o, gid, m, bev=bev, seg=3)
def cyl(gid, name, r, depth, loc, rot=(0, 0, 0), m='alu', n=32, bev=.004, r2=None):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=n, radius1=r, radius2=r2 if r2 is not None else r, depth=depth)
    o = new(name, bm); o.location = loc; o.rotation_euler = rot; return fin(o, gid, m, bev=bev)
def tor(gid, name, R1, r, loc, rot, m):
    bpy.ops.mesh.primitive_torus_add(major_radius=R1, minor_radius=r, major_segments=40, minor_segments=14, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; sc.collection.objects.unlink(o) if False else None; return fin(o, gid, m, smooth=1.2)
def tube(gid, name, pts, r, m='inconel'):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 3; cu.use_fill_caps = True
    sp = cu.splines.new('NURBS'); sp.points.add(len(pts) - 1); sp.use_endpoint_u = True; sp.order_u = 3
    for p, q in zip(sp.points, pts): p.co = (*q, 1)
    cu.resolution_u = 8
    o = bpy.data.objects.new(name, cu); sc.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target='MESH'); o.select_set(False)
    return fin(o, gid, m, smooth=1.2)
def core(gid, name, L, H, T, loc, rot):
    """радиатор: рамка + ряд пластин-оребрения + бачки по краям"""
    out = [box(gid, name + '_tankA', (.03, T + .01, H + .02), (0, 0, 0), m='alu_cast', bev=.006),
           box(gid, name + '_tankB', (.03, T + .01, H + .02), (0, 0, 0), m='alu_cast', bev=.006)]
    out[0].location = (L / 2, 0, 0); out[1].location = (-L / 2, 0, 0)
    bm = bmesh.new(); n = int(H / .007)
    for i in range(n):
        g = bmesh.ops.create_cube(bm, size=1)['verts']; bmesh.ops.scale(bm, vec=V((L - .03, T, .0025)), verts=g); bmesh.ops.translate(bm, vec=V((0, 0, -H / 2 + (i + .5) * H / n)), verts=g)
    f = new(name + '_fins', bm); f.data.materials.append(M['fins']); f.parent = grp(gid); out.append(f)
    out.append(box(gid, name + '_frame', (L - .03, T * .3, .012), (0, 0, H / 2), m='alu', bev=.002))
    out.append(box(gid, name + '_frame2', (L - .03, T * .3, .012), (0, 0, -H / 2), m='alu', bev=.002))
    piv = bpy.data.objects.new(name, None); sc.collection.objects.link(piv); piv.location = loc; piv.rotation_euler = rot; piv.parent = grp(gid)
    for o in out: o.parent = piv
    return piv

S = (-1, 1)
# ============ двигатель V6 90° (по фото Honda RA621H/RA620H и RB18 в боксах) ============
# Сверху — большой карбоновый ресивер во всю длину; выпуск в серебристой термообмотке
# низко по бокам к турбине сзади; спереди крупный компрессор с фиолетовой крышкой;
# катушки — чёрные блоки на внешней стороне головок; фиолетовый крепёж — фирменная деталь Honda.
X0, X1 = -.58, -1.25; XC = (X0 + X1) / 2; LEN = X0 - X1
box('engine', 'crankcase', (LEN, .30, .17), (XC, 0, .19), m='alu_cast', bev=.02)
box('engine', 'sump', (LEN - .08, .22, .05), (XC, 0, .115), m='alu_cast', bev=.012)
XS = (-.71, -.915, -1.12)
for s in S:
    up = V((0, s * .707, .707)); out = V((0, s * .707, -.707)); side = V((0, .707, -s * .707))
    c = V((XC, s * .17, .40))
    box('engine', f'head{s}', (LEN - .04, .16, .19), c, (-s * R(45), 0, 0), m='alu_cast', bev=.015)
    for k in (-1, 1):
        cyl('engine', f'cam{s}{k}', .03, LEN - .08, c + up * .1 + side * (.04 * k), (0, R(90), 0), m='alu', n=24, bev=.01)
    for i, x in enumerate(XS):
        # катушка: чёрный блок на внешнем верхнем боку головки + фиолетовые болты
        p = c + out * .03 + up * .07; p.x = x
        box('engine', f'coil{s}{i}', (.06, .035, .05), p, (-s * R(45), 0, 0), m='black', bev=.006)
        for j in (-1, 1): cyl('engine', f'bolt{s}{i}{j}', .006, .012, (x + j * .022, (p + out * .02).y, (p + out * .02).z), (-s * R(45) + R(90) * s, 0, 0), m='purple', n=10)
        # впускной канал из ресивера в головку (карбон)
        tube('engine', f'runner{s}{i}', [(x, s * .08, .64), (x, s * .13, .6), (x, s * .16, .53)], .026, m='carbon')
        # выпуск: толстая труба в термообмотке, вниз по боку и назад к турбине
        port = c + out * .085; port.x = x
        tube('engine', f'exh{s}{i}', [tuple(port), tuple(port + out * .05), (x - .05, s * .33, .25), (-1.1, s * .32, .22), (-1.24, s * .24, .3), (-1.33, s * .09, .44)], .027, m='wrap')
    tube('engine', f'collector{s}', [(-.95, s * .34, .22), (-1.12, s * .33, .23), (-1.27, s * .24, .36), (-1.33, s * .1, .44)], .062, m='wrap')
    cyl('engine', f'pump{s}', .042, .07, (X0 + .02, s * .2, .3), (0, R(90), 0), m='alu', bev=.006)
    for j in range(5): cyl('engine', f'hb{s}{j}', .007, .014, (X0 - .06 - j * .13, (c + up * .1).y, (c + up * .1).z + .035), m='purple', n=10)
# ресивер: высокий карбоновый короб во всю длину двигателя
# ресивер — два сдвоенных карбоновых «горба» вдоль двигателя (фото спереди/сзади)
for s in S: cyl('engine', f'plenum{s}', .09, LEN - .02, (XC - .01, s * .068, .7), (0, R(90), 0), m='carbon', n=40, bev=.035)
box('engine', 'plenum_web', (LEN - .06, .14, .1), (XC - .01, 0, .66), m='carbon', bev=.02)
# разнесённый турбонагнетатель: компрессор спереди, турбина сзади, между ними вал с MGU-H
tor('engine', 'compressor', .095, .048, (-.49, 0, .44), (0, R(90), 0), 'alu')
cyl('engine', 'comp_hub', .062, .09, (-.46, 0, .44), (0, R(90), 0), m='alu', n=32)
cyl('engine', 'comp_cap', .04, .02, (-.41, 0, .44), (0, R(90), 0), m='purple', n=32, bev=.004)
tube('engine', 'comp_inlet', [(-.46, 0, .53), (-.4, 0, .66), (-.37, 0, .82), (-.37, 0, .92)], .05, m='carbon')
tube('engine', 'comp_out', [(-.52, .11, .46), (-.56, .15, .56), (-.6, .1, .66)], .038, m='alu')
cyl('engine', 'mguh_shaft', .022, .78, (-.92, 0, .47), (0, R(90), 0), m='titan', n=20)
# MGU-H — длинный цилиндр почти во всю длину между компрессором и турбиной (разрез RA621H)
cyl('engine', 'mguh', .062, .4, (-.92, 0, .46), (0, R(90), 0), m='alu_cast', n=40, bev=.012)
for x in (-.73, -1.11): cyl('engine', f'mguh_fl{x}', .074, .022, (x, 0, .46), (0, R(90), 0), m='alu', n=40, bev=.004)
# турбина сзади, в термообмотке; выхлоп из её центра уходит вертикально вверх (фото сзади)
tor('engine', 'turbine', .095, .048, (-1.36, 0, .45), (0, R(90), 0), 'wrap')
cyl('engine', 'turb_hub', .06, .08, (-1.39, 0, .45), (0, R(90), 0), m='heat', n=32)
tube('engine', 'tail_in', [(-1.42, 0, .45), (-1.45, 0, .52), (-1.46, 0, .6), (-1.5, 0, .63)], .055, m='heat')
for s in S:
    tube('engine', f'wastegate{s}', [(-1.3, s * .13, .52), (-1.36, s * .12, .62), (-1.48, s * .07, .7), (-1.56, s * .05, .72)], .018, m='heat')
    cyl('engine', f'wg_valve{s}', .03, .06, (-1.3, s * .13, .52), (0, 0, 0), m='alu', n=20, bev=.006)
box('engine', 'oiltank', (.07, .3, .24), (-.535, 0, .23), m='alu_cast', bev=.02)
box('engine', 'bellhousing', (.12, .26, .2), (-1.31, 0, .22), m='alu_cast', bev=.02)
# «седловидный» охладитель — сзади над силовой установкой, выходит в заднее отверстие капота (Bahrain 2022)
core('engine', 'saddle', .2, .14, .04, (-1.42, 0, .82), (R(90), R(-25), 0))
# шланги и жгуты поверх двигателя (на фото RB18 в боксах их десятки)
for i, (y0, y1, z, r, m) in enumerate([(.1, .14, .84, .009, 'hose'), (-.1, -.15, .84, .009, 'hose'), (.05, .2, .82, .006, 'loom'), (-.06, -.21, .82, .006, 'loom'),
                                       (.13, .02, .86, .012, 'braid'), (-.13, -.03, .86, .012, 'braid'), (0, .17, .83, .005, 'loom')]):
    tube('engine', f'hose{i}', [(-.6, y0, .62), (-.7, y0, z), (-.95, (y0 + y1) / 2, z + .01), (-1.15, y1, z - .02), (-1.27, y1, .55)], r, m=m)
# ============ ERS: батарея, MGU-K, электроника ============
box('ers', 'battery', (.42, .5, .1), (-.33, 0, .155), m='black', bev=.012)
for i in range(7): box('ers', f'batrib{i}', (.4, .006, .012), (-.33, -.21 + i * .07, .21), m='alu', bev=.002)
for i in range(6):
    for s in S: cyl('ers', f'batbolt{i}{s}', .008, .01, (-.14 - i * .075, s * .235, .21), m='alu', n=10)
box('ers', 'battery_hv', (.06, .12, .04), (-.12, .15, .2), m='hv', bev=.006)
cyl('ers', 'mguk', .068, .22, (-.56, .25, .2), (0, R(90), 0), m='black', n=32, bev=.01)
cyl('ers', 'mguk_ring', .071, .02, (-.47, .25, .2), (0, R(90), 0), m='hv', n=32)
box('ers', 'ce', (.2, .14, .07), (-.36, -.32, .24), m='alu', bev=.01)
tube('ers', 'hv1', [(-.12, .17, .21), (-.2, .26, .24), (-.4, .27, .24), (-.45, .25, .22)], .012, m='hv')
tube('ers', 'hv2', [(-.12, .12, .21), (-.18, -.1, .25), (-.28, -.3, .25)], .012, m='hv')
# ============ топливный бак ============
box('fuel', 'fuelcell', (.42, .6, .4), (-.33, 0, .42), m='rubber', bev=.07)
cyl('fuel', 'fuelcap', .07, .015, (-.33, 0, .625), m='alu', n=32)
for s in S: tube('fuel', f'fuelline{s}', [(-.12, s * .25, .3), (-.2, s * .3, .36), (-.5, s * .3, .36), (-.6, s * .2, .4)], .008, m='titan')
# ============ охлаждение ============
for s in S:
    # радиатор RB18: длинный узкий, ребром наружу, задний конец выше (фото понтона, Бахрейн 2022)
    core('cooling', f'rad{s}', .7, .2, .06, (-.04, s * .5, .38), (-s * R(12), R(18), 0))
    core('cooling', f'ic{s}', .26, .2, .055, (-.56, s * .46, .3), (-s * R(10), R(10), 0))
    tube('cooling', f'hoseA{s}', [(-.2, s * .52, .2), (-.35, s * .4, .2), (-.5, s * .25, .27), (-.56, s * .2, .3)], .02, m='hose')
    tube('cooling', f'hoseB{s}', [(.3, s * .5, .44), (.1, s * .38, .55), (-.3, s * .3, .58), (-.55, s * .18, .5)], .018, m='hose')
# ============ коробка передач: корпус ============
box('gearbox', 'gb_main', (.62, .22, .24), (-1.66, 0, .27), m='titan', bev=.025)
box('gearbox', 'gb_diff', (.2, .3, .18), (-1.95, 0, .36), m='titan', bev=.03)
box('gearbox', 'gb_rear', (.24, .14, .14), (-2.15, 0, .32), m='carbon', bev=.03)
# ============ тормоза: суппорты, задние диски ============
for s in S:
    for x, zc, rr in ((1.66, .63, .17), (-1.94, .62, .145)):
        a = R(60)
        if x < 0: cyl('brakes', f'rdisc{s}', .14, .028, (x, s * zc, .39), (R(90), 0, 0), m='disc', n=48, bev=.003)
        box('brakes', f'caliper{s}{x>0}', (.15, .065, .09), (x + (-1 if x > 0 else 1) * rr * math.cos(a), s * (zc - .005), .39 + rr * math.sin(a)), (0, (1 if x > 0 else -1) * R(30), 0), m='black', bev=.018)
# ============ рулевая рейка ============
cyl('fsusp', 'rack', .022, .32, (1.52, 0, .4), (R(90), 0, 0), m='alu', n=24)
cyl('fsusp', 'rack_body', .034, .14, (1.52, .03, .4), (R(90), 0, 0), m='alu_cast', n=24, bev=.006)

# UV под карбон (у импортного карбона — свои текстуры); ресайз и прочее — в car-opt.mjs
for o in [o for o in sc.objects if o.type == 'MESH' and o.data.materials and o.data.materials[0].name == 'carbon']:
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.cube_project(cube_size=.3); bpy.ops.object.mode_set(mode='OBJECT'); o.select_set(False)
tris = sum(len(o.data.polygons) for o in sc.objects if o.type == 'MESH')
print('INNER objects', len([o for o in sc.objects if o.type == 'MESH']), 'polys', tris)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_cameras=False, export_lights=False, export_yup=True, export_apply=True)
print('EXPORTED', OUT)
if PREV:   # превью в Cycles вместе с машиной без кузова
    bpy.ops.import_scene.gltf(filepath=CAR)
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.parent and o.parent.name in ('p_body', 'p_cockpit') and o.name not in [x.name for x in sc.objects if x.parent and x.parent.name.startswith('p_') and False]:
            pass
    imported_body = [o for o in bpy.data.objects if o.type == 'MESH' and o.parent and o.parent.name.startswith('p_body.') or (o.parent and o.parent.name == 'p_body' and o.name not in ())]
    for o in bpy.data.objects:
        p = o.parent
        while p and not p.name.startswith('p_'): p = p.parent
        if o.type == 'MESH' and p and p.name.split('.')[0] in ('p_body',) and o.data.materials and o.data.materials[0].name not in M: o.hide_render = True
    cam = bpy.data.objects.new('C', bpy.data.cameras.new('C')); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = (1.6, -2.6, 1.9); cam.rotation_euler = (V((-.8, 0, .4)) - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = 32
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.8, .79, .77, 1)
    sun = bpy.data.objects.new('S', bpy.data.lights.new('S', 'SUN')); sun.data.energy = 3.5; sun.rotation_euler = (.5, .3, .9); sc.collection.objects.link(sun)
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 40; sc.cycles.use_denoising = True
    p = bpy.context.preferences.addons['cycles'].preferences; p.compute_device_type = 'METAL'; p.get_devices(); [setattr(d, 'use', True) for d in p.devices]; sc.cycles.device = 'GPU'
    sc.render.resolution_x, sc.render.resolution_y = 1400, 800; sc.render.filepath = PREV; bpy.ops.render.render(write_still=True); print('PREVIEW', PREV)
