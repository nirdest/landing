# Blender export for models/car-*.glb. Source: CGTrader "Red Bull 2022 Formula 1 Car" (free, royalty-free), kept outside the repo.
# Run: blender -b --disable-autoexec RED+BULL+2022+F1+CAR.blend --python tools/car-export.py -- <unpacked TEXTURES dir> <scratch>/car.gltf
# Then: node tools/car-opt.mjs (see its header). --disable-autoexec: never run scripts embedded in a downloaded .blend.
# blender -b --disable-autoexec RB.blend --python export.py -- <texdir> <out.gltf>
import bpy, sys, os, math, re
a = sys.argv[sys.argv.index('--')+1:]; texdir, out = a[0], a[1]
idx = {f: os.path.join(r, f) for r, _, fs in os.walk(texdir) for f in fs}
for im in bpy.data.images:
    if im.source == 'FILE' and not os.path.exists(bpy.path.abspath(im.filepath)):
        b = os.path.basename(im.filepath.replace('\\', '/')) or im.name
        im.filepath = idx.get(b) or idx.get(im.name) or im.filepath
for o in list(bpy.data.objects):
    if o.type != 'MESH' or o.name == 'Plane': bpy.data.objects.remove(o, do_unlink=True)
# группы разборки: id -> регулярка по имени объекта
G = [('fwing', r'^(Spoiler Front|Front Spoiler Holder|Canard|Front Wing)'),
     ('rwing', r'^(Spoiler( Big| Small| DRS)?|Swan_Neck|Lights)(\.\d+)?$'),
     ('wheel', r'^(Control|Control Shaft|Shifter|Switch)$'),
     ('cockpit', r'^(Cabin|Seat|Leg Belt|Waist Belt|Shoulder Belt|Belt Lock|Clip\d)$'),
     ('fsusp', r'^[345](\.\d+)?$'),
     ('rsusp', r'^([1267](\.\d+)?|Differential)$'),
     ('wheels', r'^(Front Tires|Back Tires|Rim Front|Rim Bck|Inside Rim|Bujon|Tires Lid)'),
     ('brakes', r'^(Front Disk|Fender)'),
     ('floor', r'^DOWN CANARD'),
     ('gearbox', r'^(Chassis|Exhaust)$'),
     ('body', r'.')]
root = bpy.data.objects.new('car', None); bpy.context.scene.collection.objects.link(root)
root.rotation_euler = (0, 0, math.pi / 2); root.scale = (.5, .5, .5); root.location = (0, 0, 1.13 * .5)
emp = {}
for gid, _ in G:
    e = bpy.data.objects.new('p_' + gid, None); bpy.context.scene.collection.objects.link(e); e.parent = root; emp[gid] = e
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    gid = next(g for g, rx in G if re.search(rx, o.name))
    mw = o.matrix_world.copy(); o.parent = emp[gid]; o.matrix_parent_inverse = emp[gid].matrix_world.inverted() if False else o.matrix_parent_inverse
    bpy.context.view_layer.update(); o.matrix_world = root.matrix_world @ mw
    print('PART', gid, o.name)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLTF_SEPARATE', export_texture_dir='tex', export_image_format='AUTO',
    export_cameras=False, export_lights=False, export_extras=False, export_yup=True, export_apply=True)
print('EXPORTED', out)
