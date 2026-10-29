/* Сцена ролика с ai.html. Работает и в Web Worker (OffscreenCanvas — главный поток
   страницы остаётся свободным), и в главном потоке как запасной путь: здесь нет DOM.
   Каждый кадр — чистая функция времени render(t): состояния между кадрами нет,
   поэтому перемотка и статичный финальный кадр бесплатны.
   Единицы — метры, земля y=0, лента вдоль +x. */
/* Один свой бандл вместо ~10 цепочкой грузящихся модулей с CDN (см. tools/three-ai.entry.js). */
import * as THREE from './vendor/three-ai.js?v=r169b';
export const END = 34, FIN = 31;
const { Sky, RoomEnvironment, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, RoundedBoxGeometry, mergeGeometries } = THREE;

/* ============ math ============ */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const lerp = (a, b, u) => a + (b - a) * u;
const eio = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const eout = u => 1 - Math.pow(1 - u, 3);
const eback = u => { const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ============ conveyor timeline ============ */
/* ×1 до AI, экспонента до ×60 к взрыву, дальше ровно. dist() — интеграл скорости,
   tAt() — обратная: коробка k проходит точку пути d в момент tAt(k*SP + d). */
const V0 = 1.4, SP = 1.7, T_AI = 7.5, T_POP = 13, VMAX = 60, K = Math.log(VMAX) / (T_POP - T_AI);
const D_AI = V0 * T_AI, D_POP = D_AI + V0 * (VMAX - 1) / K;
const speed = t => t < T_AI ? 1 : t < T_POP ? Math.exp(K * (t - T_AI)) : VMAX;
const dist = t => t < T_AI ? V0 * t : t < T_POP ? D_AI + V0 * (Math.exp(K * (t - T_AI)) - 1) / K : D_POP + V0 * VMAX * (t - T_POP);
const tAt = d => d < D_AI ? d / V0 : d < D_POP ? T_AI + Math.log(1 + (d - D_AI) * K / V0) / K : T_POP + (d - D_POP) / (V0 * VMAX);
const BX0 = .4, BL = 11.4, BX1 = BX0 + BL, BY = 1.22, BOX = .8;
const DOCK0 = 12;                          /* задний борт первой фуры: лента въезжает прямо в двери */

/* После взрыва — сортировочный узел и четыре ленты к четырём фурам. */
const HUB = V(13.4, 0, 0), LANES = [-6, -2, 2, 6], DOCK = 19, LANE_A = V(14.8, BY, 0), VB = 16, HUB_T = .18;
const T_HUB = 13.35, T_AI2 = 13.9, T_LANES = 14.7;
const docks = LANES.map((z, j) => {
  const out = []; let s = T_LANES + .1 + j * .13, g = .95;
  while (s < 24.5) { const stay = Math.max(.3, g); out.push({ s, l: s + stay, z }); s += stay + .35; g *= .82; }
  return out;
});
function truckX(tr, t){
  if (t < tr.l) return DOCK;
  const dt = t - tr.l, a = 120, vm = 60, tc = vm / a;
  return DOCK + (dt < tc ? .5 * a * dt * dt : .5 * a * tc * tc + vm * (dt - tc));
}

const mkCanvas = (w, h) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });

export async function createFilm(canvas, opts = {}){
  /* antialias не нужен: кадр рисуется в render target композитора, MSAA канваса туда не попадает */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });

  /* ============ quality ============ */
  /* Ступени качества: выбирает и понижает их плеер (ai-film.js) по частоте кадров.
     Картинка от ступени не зависит, только чёткость и цена кадра. */
  const TIERS = [
    { dpr: 1.5, bloom: true, shadow: 2048 },
    { dpr: 1, bloom: true, shadow: 1024 },
    { dpr: .8, bloom: false, shadow: 1024, fps: 30 },
    { dpr: .65, bloom: false, shadow: 512, fps: 30 }
  ];
  let tier = opts.tier || 0;
  renderer.info.autoReset = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  /* карта теней перерисовывается через кадр (тень отстаёт на 1/30 с — глазу не видно), см. render() */
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .5;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 30000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .9;
  scene.fog = new THREE.Fog(0xc4cfd8, 160, 1400);
  scene.background = new THREE.Color(0x000000);

  /* ============ sky & light ============ */
  const sky = new Sky(); sky.scale.setScalar(20000); scene.add(sky);
  const su = sky.material.uniforms;
  su.mieDirectionalG.value = .8;
  const sunDir = V(0, 1, 0);
  const sun = new THREE.DirectionalLight(0xfff0dc, 3.4);
  sun.castShadow = true; sun.shadow.mapSize.setScalar(TIERS[tier].shadow);
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .04;
  const scam = sun.shadow.camera; scam.near = 1; scam.far = 600;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x6a5a48, .9));
  const flash = new THREE.PointLight(0xffa060, 0, 0, 2); scene.add(flash);

  const stars = (() => {
    const n = 3000, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rnd(i) * Math.PI * 2, z = rnd(i + 9e3) * .95 + .05, r = Math.sqrt(1 - z * z);
      p.set([Math.cos(a) * r * 9000, z * 9000, Math.sin(a) * r * 9000], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    const s = new THREE.Points(g, m); scene.add(s); return s;
  })();

  /* ============ textures ============ */
  function ctex(w, h, fn, rx = 1, ry = 1){
    const c = mkCanvas(w, h);
    fn(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry); t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  /* Зерно рисуется один раз в плитку 128×128 и потом заливается узором —
     раньше каждая текстура ставила тысячи точек сама. */
  const tile = rgb => {
    const c = mkCanvas(128, 128);
    const g = c.getContext('2d');
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${rgb},${Math.random()})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5); }
    return c;
  };
  const tiles = { dark: tile('20,18,16'), light: tile('255,255,250') };
  function grain(g, w, h, n, a, rgb){
    const light = rgb.startsWith('255') || rgb.startsWith('120') || rgb.startsWith('90,90');
    g.save(); g.globalAlpha = Math.min(1, a * .6 * Math.min(1.2, n / (w * h / 128 / 128 * 700) + .2));
    g.fillStyle = g.createPattern(light ? tiles.light : tiles.dark, 'repeat'); g.fillRect(0, 0, w, h); g.restore();
  }
  const tConcrete = ctex(512, 512, (g, w, h) => {
    g.fillStyle = '#8e8b84'; g.fillRect(0, 0, w, h);
    grain(g, w, h, 9000, .18, '40,38,34'); grain(g, w, h, 5000, .15, '255,255,250');
    g.strokeStyle = 'rgba(40,38,34,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
  }, 400, 400);
  const tAsphalt = ctex(512, 256, (g, w, h) => {
    g.fillStyle = '#2c2d2f'; g.fillRect(0, 0, w, h);
    grain(g, w, h, 9000, .25, '120,120,120');
    g.fillStyle = '#e9e6dc';
    g.fillRect(0, 8, w, 5); g.fillRect(0, h - 13, w, 5);
    for (const y of [.25, .5, .75]) g.fillRect(0, h * y - 3, w * .5, 5);
  }, 40, 1);
  const tCard = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#b4834f'; g.fillRect(0, 0, w, h);
    grain(g, w, h, 2500, .2, '90,55,25');
    for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(120,80,40,.15)'; g.beginPath(); g.moveTo(0, Math.random() * h); g.lineTo(w, Math.random() * h); g.stroke(); }
    g.fillStyle = '#d2ad7a'; g.fillRect(w * .4, 0, w * .2, h);
    g.strokeStyle = 'rgba(60,35,15,.5)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  });
  const tCorr = ctex(256, 256, (g, w, h) => {
    for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#9aa3aa'); gr.addColorStop(.5, '#d6dade'); gr.addColorStop(1, '#8a939a'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
    grain(g, w, h, 1500, .08, '40,40,40');
  }, 8, 2);
  const tBrick = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#5a4a40'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 16; r++) for (let c = 0; c < 9; c++) {
      g.fillStyle = `hsl(${8 + Math.random() * 10},${40 + Math.random() * 15}%,${30 + Math.random() * 12}%)`;
      g.fillRect(c * 32 - (r % 2) * 16 + 1, r * 16 + 1, 30, 14);
    }
  }, 3, 6);
  const tBelt = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#18191a'; g.fillRect(0, 0, w, h); grain(g, w, h, 900, .2, '90,90,90');
    g.strokeStyle = '#3a3b3d'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(10, 20); g.lineTo(60, 64); g.lineTo(10, 108); g.stroke();
  }, 9, 1);
  const tLane = tBelt.clone(); tLane.repeat.set(4, 1);
  const tTrailer = ctex(512, 256, (g, w, h) => {
    g.fillStyle = '#eeeeea'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 24) { g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(x, 0, 3, h); }
    g.fillStyle = '#ff4a1c'; g.fillRect(0, h - 30, w, 11);
  });
  const tRear = ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#e4e4e0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16120e'; g.fillRect(20, 16, w - 40, h - 30);
    const gr = g.createRadialGradient(w / 2, h * .7, 10, w / 2, h * .6, 140); gr.addColorStop(0, 'rgba(255,170,90,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(20, 16, w - 40, h - 30);
  });
  const drawChip = (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ff6a2c'; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = '#ff7a3c'; g.font = '800 120px "Inter Tight Variable",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('AI', w / 2, h / 2 + 6);
  };
  const tChip = ctex(256, 256, drawChip);
  /* Окна: шесть пар текстур на весь город; clone() делит картинку, у каждого дома свой repeat. */
  function windowTex(seed, lit){
    return ctex(256, 256, (g, w, h) => {
      g.fillStyle = lit ? '#000' : '#6f7378'; g.fillRect(0, 0, w, h);
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const q = rnd(seed + r * 8 + c);
        if (lit) { if (q < .45) { g.fillStyle = q < .05 ? '#ff7a3c' : `hsl(${38 + q * 20},90%,${55 + q * 40}%)`; g.fillRect(c * 32 + 5, r * 32 + 6, 22, 20); } }
        else { const gr = g.createLinearGradient(0, r * 32, 0, r * 32 + 26); gr.addColorStop(0, '#9fb3c4'); gr.addColorStop(1, '#2a3743'); g.fillStyle = gr; g.fillRect(c * 32 + 5, r * 32 + 6, 22, 20); }
      }
    });
  }
  function planetTex(h1, h2, bands){
    return ctex(512, 256, (g, w, h) => {
      for (let y = 0; y < h; y++) {
        const v = Math.sin(y / h * Math.PI * bands + Math.sin(y * .09) * 1.5) * .5 + .5;
        g.fillStyle = `hsl(${lerp(h1[0], h2[0], v)},${lerp(h1[1], h2[1], v)}%,${lerp(h1[2], h2[2], v)}%)`; g.fillRect(0, y, w, 1);
      }
      grain(g, w, h, 6000, .12, '0,0,0'); grain(g, w, h, 3000, .1, '255,255,255');
      for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 30, 3 + Math.random() * 10, 0, 0, Math.PI * 2); g.fill(); }
    });
  }

  /* ============ materials ============ */
  const std = o => new THREE.MeshStandardMaterial(o);
  const M = {
    concrete: std({ map: tConcrete, roughness: .95 }),
    asphalt: std({ map: tAsphalt, roughness: .9 }),
    metal: std({ color: 0x8c939a, metalness: .75, roughness: .35 }),
    steel: std({ color: 0x5d646b, metalness: .8, roughness: .45 }),
    dark: std({ color: 0x1f2124, metalness: .5, roughness: .55 }),
    rubber: std({ color: 0x121212, roughness: .92 }),
    /* MeshStandard вместо Physical с clearcoat: на таком плане разницы не видно, а шейдер в разы дешевле */
    paint: std({ color: 0xff4a1c, metalness: .35, roughness: .28 }),
    glass: std({ color: 0x14202a, metalness: .6, roughness: .05 }),
    white: std({ color: 0xf2f2ee, metalness: .3, roughness: .4 }),
    card: std({ map: tCard, roughness: .85 }),
    corr: std({ map: tCorr, metalness: .55, roughness: .45 }),
    roof: std({ color: 0x6b7177, metalness: .6, roughness: .5 }),
    brick: std({ map: tBrick, roughness: .9 }),
    belt: std({ map: tBelt, roughness: .8 }),
    lane: std({ map: tLane, roughness: .8 }),
    trailer: std({ map: tTrailer, metalness: .25, roughness: .45 }),
    trailerPlain: std({ color: 0xeeeeea, metalness: .25, roughness: .45 }),
    rear: std({ map: tRear, roughness: .6 }),
    tail: std({ color: 0x331010, emissive: 0xff2a10, emissiveIntensity: .8 }),
    chip: std({ color: 0x0d0f0e, metalness: .4, roughness: .35, emissive: 0xffffff, emissiveMap: tChip, emissiveIntensity: 3 }),
    pin: std({ color: 0xd4b56a, metalness: 1, roughness: .25 }),
    skin: std({ color: 0xc8956d, roughness: .7 }),
    vest: std({ color: 0xff7a1c, roughness: .6 }),
    hat: std({ color: 0xf2c230, roughness: .35 }),
    pants: std({ color: 0x2b3442, roughness: .85 }),
    glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.6, .5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, cast = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  /* скруглённые рёбра ловят блики — главный признак «настоящего» предмета */
  const rbox = (w, h, d, r = .06) => new RoundedBoxGeometry(w, h, d, 3, r);
  const cyl = (r1, r2, h, s = 24) => new THREE.CylinderGeometry(r1, r2, h, s);
  const sph = (r, a = 16, b = 12) => new THREE.SphereGeometry(r, a, b);
  const glowRing = (r, tube) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 64), M.glow.clone()); m.rotation.x = Math.PI / 2; m.userData.keep = true; return m; };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V(1, 1, 1), _p = V();
  /* Статика пакуется в один меш на материал: сотни мелких деталей (ноги ленты, ролики,
     части фур) раньше были сотнями draw calls, плюс столько же в проходе теней. */
  function batch(){
    const parts = new Map();
    const api = {
      add(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0){
        return api.addMatrix(geo, mat, _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(1, 1, 1)));
      },
      addMatrix(geo, mat, matrix){
        const g = geo.index ? geo.toNonIndexed() : geo.clone();
        for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
        g.applyMatrix4(matrix);
        (parts.get(mat) || parts.set(mat, []).get(mat)).push(g);
        return api;
      },
      geos(){ return [...parts].map(([mat, gs]) => [mergeGeometries(gs), mat]); },
      flush(parent = scene, cast = true){ for (const [g, mat] of api.geos()) mesh(g, mat, 0, 0, 0, parent, cast); }
    };
    return api;
  }
  /* То же для подвижных групп (робот, рабочий, ракета, чип): меши-соседи внутри
     одной группы двигаются вместе, значит их можно склеить по материалам.
     Вложенные группы (суставы) и помеченные keep остаются отдельными. */
  function bakeTree(root){
    root.traverse(g => {
      if (!g.isGroup) return;
      const kids = g.children.filter(c => c.isMesh && !c.isInstancedMesh && !c.userData.keep && !Array.isArray(c.material));
      if (kids.length < 2) return;
      const b = batch();
      for (const k of kids) { k.updateMatrix(); b.addMatrix(k.geometry, k.material, k.matrix); g.remove(k); }
      for (const [geo, mat] of b.geos()) mesh(geo, mat, 0, 0, 0, g);
    });
  }

  /* ============ ground & road ============ */
  mesh(new THREE.PlaneGeometry(4000, 4000), M.concrete, 0, 0, 0, scene, false).rotation.x = -Math.PI / 2;
  /* Четырёхполосная дорога от погрузки — проспектом сквозь город. */
  mesh(new THREE.PlaneGeometry(170, 17), M.asphalt, 11 + 85, .02, 0, scene, false).rotation.x = -Math.PI / 2;

  /* деревья вдоль дороги — без них бетонная равнина выглядит макетом */
  {
    const n = 140, trunks = new THREE.InstancedMesh(cyl(.12, .18, 1.6, 6), std({ color: 0x4a3626, roughness: 1 }), n);
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 3), std({ color: 0x3f5a2c, roughness: .9 }), n);
    trunks.castShadow = crowns.castShadow = true;
    for (let i = 0; i < n; i++) {
      const x = 24 + rnd(i * 5) * 30, side = rnd(i * 5 + 1) < .5 ? -1 : 1, z = side * (11 + rnd(i * 5 + 2) * (side > 0 ? 8 : 26));
      const k = .7 + rnd(i * 5 + 3) * .6;
      trunks.setMatrixAt(i, _m.compose(_p.set(x, .8 * k, z), _q.identity(), _s.setScalar(k)));
      crowns.setMatrixAt(i, _m.compose(_p.set(x, 2.3 * k, z), _q.identity(), _s.set(1.3 * k, 1.6 * k, 1.3 * k)));
    }
    scene.add(trunks, crowns);
  }

  /* ============ factory ============ */
  {
    const f = batch().add(box(20, 7.5, 8), M.corr, 0, 3.75, -9);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(5, 0); sh.lineTo(5, 2.6); sh.closePath();
    const roof = new THREE.ExtrudeGeometry(sh, { depth: 8, bevelEnabled: false });
    for (let i = 0; i < 4; i++) f.add(roof, M.roof, -10 + i * 5, 7.5, -13);
    f.add(box(5, 5, .1), M.dark, -5, 2.5, -4.95)
      .add(cyl(.9, 1.25, 18, 32), M.brick, -7, 9, -11)
      .add(cyl(.95, .95, .8, 32), M.white, -7, 17.2, -11)
      .add(cyl(.95, .95, .5, 32), M.paint, -7, 16.4, -11)
      .flush();
  }

  /* лента: от рабочих мест прямо в задние двери первой фуры */
  /* Ролики — гладкие цилиндры, их вращение глазу не видно: они статичны и склеены с рамой. */
  const rail = box(1, .2, .1), leg = box(.12, 1, .12), roller = cyl(.13, .13, 1.5, 16);
  function belt(x0, len, mat, parent){
    const b = batch();
    for (const z of [-.78, .78]) b.add(box(len + .3, .2, .1), M.steel, x0 + len / 2, 1.05, z);
    for (let x = x0 + .5; x < x0 + len; x += 2.4) for (const z of [-.7, .7]) b.add(leg, M.steel, x, .5, z);
    for (let x = x0; x <= x0 + len; x += .85) b.add(roller, M.metal, x, 1.06, 0, Math.PI / 2);
    b.flush(parent);
    mesh(new THREE.PlaneGeometry(len, 1.45), mat, x0 + len / 2, BY, 0, parent, false).rotation.x = -Math.PI / 2;
  }
  belt(BX0, BL + .4, M.belt, scene);

  /* ============ people ============ */
  /* Люди собирают коробки вручную — до AI это единственная «мощность». */
  function makeWorker(x, z, ry){
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    for (const s of [-.13, .13]) mesh(cyl(.09, .08, .85, 10), M.pants, s, .43, 0, g);
    const torso = new THREE.Group(); torso.position.y = .85; g.add(torso);
    mesh(new THREE.CapsuleGeometry(.23, .42, 4, 14), M.vest, 0, .42, 0, torso);
    mesh(sph(.15), M.skin, 0, 1.0, 0, torso);
    mesh(new THREE.SphereGeometry(.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.hat, 0, 1.05, 0, torso);
    mesh(cyl(.2, .2, .02, 16), M.hat, 0, 1.05, .03, torso);
    const arms = [-1, 1].map(s => {
      const a = new THREE.Group(); a.position.set(s * .29, .72, 0); torso.add(a);
      mesh(cyl(.06, .05, .58, 8), M.vest, 0, -.29, 0, a); mesh(sph(.06, 8, 6), M.skin, 0, -.6, 0, a);
      return a;
    });
    return { torso, arms };
  }
  const workers = [[.5, -1.5, 0], [1.7, -1.55, 0], [2.9, -1.5, 0], [1.1, 1.5, Math.PI]].map(w => makeWorker(...w));

  /* ============ robots ============ */
  function makeRobot(parent, x, y, z, ry){
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    mesh(cyl(.42, .5, .3, 28), M.dark, 0, .15, 0, g);
    const ring = glowRing(.47, .03); ring.position.y = .31; g.add(ring);
    const turret = new THREE.Group(); turret.position.y = .3; g.add(turret);
    mesh(cyl(.3, .34, .35, 28), M.paint, 0, .17, 0, turret);
    const sh = new THREE.Group(); sh.position.y = .42; turret.add(sh);
    mesh(sph(.2), M.dark, 0, 0, 0, sh);
    mesh(rbox(.22, 1.3, .22, .06), M.paint, 0, .65, 0, sh);
    const el = new THREE.Group(); el.position.y = 1.3; sh.add(el);
    mesh(sph(.16), M.dark, 0, 0, 0, el);
    mesh(rbox(.18, 1.05, .18, .05), M.paint, 0, .52, 0, el);
    const wr = new THREE.Group(); wr.position.y = 1.05; el.add(wr);
    mesh(cyl(.1, .1, .16, 12), M.dark, 0, 0, 0, wr);
    for (const s of [-1, 1]) mesh(box(.04, .2, .1), M.steel, s * .1, .14, 0, wr);
    return { g, turret, sh, el, ring };
  }
  const robots = [3.9, 5.7, 7.5, 9.3].map((x, i) => makeRobot(scene, x, 0, -1.85, 0));

  /* контроллер, в который встаёт первый чип */
  const PED = V(6.6, 0, -4.3);
  mesh(rbox(.9, 1.2, .9, .06), M.dark, PED.x, .6, PED.z);
  const pedRing = glowRing(.55, .03); pedRing.position.set(PED.x, 1.22, PED.z); scene.add(pedRing);

  /* ============ AI chips ============ */
  function makeChip(){
    const chip = new THREE.Group(); scene.add(chip);
    mesh(rbox(1.1, .2, 1.1, .04), M.chip, 0, 0, 0, chip);
    for (let i = -2; i <= 2; i++) for (const [x, z, w, d] of [[i * .2, .62, .07, .16], [i * .2, -.62, .07, .16], [.62, i * .2, .16, .07], [-.62, i * .2, .16, .07]]) mesh(box(w, .05, d), M.pin, x, -.05, z, chip);
    const cable = mesh(cyl(.025, .025, 40, 8), M.dark, 0, 20.1, 0, chip); cable.userData.keep = true;
    const ring = glowRing(1, .05); scene.add(ring);
    return { chip, cable, ring };
  }
  const chip1 = makeChip(), chip2 = makeChip();
  /* второй чип ждёт сортировочный узел (этап B) — до него скрыт */
  chip2.chip.visible = chip2.ring.visible = false;
  const shock = new THREE.Mesh(new THREE.TorusGeometry(1, .08, 8, 64), M.glow.clone()); scene.add(shock);

  /* ============ trucks ============ */
  /* Фура собирается из общих склеенных геометрий: ~7 draw calls вместо ~27.
     Колёса — гладкие цилиндры, их вращение не видно, поэтому они статичны. */
  const truckParts = (() => {
    const b = batch()
      .add(box(8.6, .3, 2.1), M.dark, 4.3, .95, 0)
      .add(box(.12, .35, 2.5), M.dark, 9.58, .85, 0)
      .add(rbox(2.2, 2.5, 2.45, .18), M.paint, 7.6, 2.15, 0)
      .add(rbox(1, 1.2, 2.45, .14), M.paint, 9.1, 1.5, 0)
      .add(box(.06, 1.05, 2.15), M.glass, 8.72, 2.75, 0, 0, 0, -.12)
      .add(box(1.3, .8, .04), M.glass, 7.7, 2.8, 1.23).add(box(1.3, .8, .04), M.glass, 7.7, 2.8, -1.23);
    for (const z of [-1, 1]) b.add(box(.05, .2, .3), M.tail, -.03, 1.3, z);
    for (const x of [1.2, 2.5, 7.9]) for (const z of [-1.08, 1.08]) {
      b.add(cyl(.52, .52, .42, 28), M.rubber, x, .52, z, Math.PI / 2).add(cyl(.26, .26, .44, 12), M.metal, x, .52, z, Math.PI / 2);
    }
    return b.geos();
  })();
  const trailerGeo = rbox(6.4, 2.7, 2.5, .08), rearGeo = new THREE.PlaneGeometry(2.3, 2.5);
  function makeTruck(balloon){
    const g = new THREE.Group();
    if (balloon) mesh(balloon, [M.trailerPlain, M.rear, M.trailerPlain, M.dark, M.trailer, M.trailer], 3.2, 2.45, 0, g);
    else {
      mesh(trailerGeo, M.trailer, 3.2, 2.45, 0, g);
      mesh(rearGeo, M.rear, -.01, 2.45, 0, g, false).rotation.y = -Math.PI / 2;
    }
    for (const [geo, mat] of truckParts) mesh(geo, mat, 0, 0, 0, g);
    scene.add(g);
    return { g };
  }
  /* Первая фура: свой кузов с сегментами, чтобы раздуть его в шар. */
  const balloonGeo = new THREE.BoxGeometry(6.4, 2.7, 2.5, 14, 8, 8);
  const bBase = balloonGeo.attributes.position.array.slice();
  const truck0 = makeTruck(balloonGeo);
  truck0.g.position.x = DOCK0;
  function inflate(infl, t){
    const p = balloonGeo.attributes.position.array, hx = 3.2, hy = 1.35, hz = 1.25;
    const w = 1 + Math.sin(t * 43) * .03 * infl * infl, h = 1 + Math.cos(t * 39) * .03 * infl * infl;
    const Rx = (hx + infl * 1.2) * w, Ry = (hy + infl * 2.6) * h, Rz = (hz + infl * 2.3) * w;
    for (let i = 0; i < p.length; i += 3) {
      const x = bBase[i], y = bBase[i + 1], z = bBase[i + 2];
      const l = Math.hypot(x / hx, y / hy, z / hz) || 1;
      p[i] = lerp(x, x / hx / l * Rx, infl) + infl * 1.1;      /* раздувается вперёд и вверх, не на ленту */
      p[i + 1] = lerp(y, y / hy / l * Ry, infl) + (Ry - hy) * infl * .9;
      p[i + 2] = lerp(z, z / hz / l * Rz, infl);
    }
    balloonGeo.attributes.position.needsUpdate = true;
    balloonGeo.computeVertexNormals();
  }

  /* ============ boxes & debris ============ */
  const boxes = new THREE.InstancedMesh(rbox(BOX, BOX, BOX, .04), M.card, 360);
  boxes.castShadow = boxes.receiveShadow = true; boxes.frustumCulled = false; scene.add(boxes);
  const shards = new THREE.InstancedMesh(box(1, .05, .7), M.white, 60);
  shards.castShadow = true; shards.frustumCulled = false; scene.add(shards);
  let nb = 0, ns = 0;
  function putBox(x, y, z, rx = 0, ry = 0, rz = 0, sy = 1){
    if (nb >= 360) return;
    _q.setFromEuler(_e.set(rx, ry, rz)); _s.set(1, sy, 1);
    boxes.setMatrixAt(nb++, _m.compose(_p.set(x, y, z), _q, _s));
  }
  function putShard(x, y, z, rx, ry, rz){
    _q.setFromEuler(_e.set(rx, ry, rz)); _s.setScalar(1);
    shards.setMatrixAt(ns++, _m.compose(_p.set(x, y, z), _q, _s));
  }

  /* ============ particles ============ */
  /* Один буфер на дым/облака (обычное смешивание) и один на огонь/искры (аддитивное,
     значения > 1 подхватывает bloom). Размер — в метрах. */
  function particles(n, additive){
    const g = new THREE.BufferGeometry();
    const a = { p: new Float32Array(n * 3), s: new Float32Array(n), a: new Float32Array(n), c: new Float32Array(n * 3) };
    g.setAttribute('position', new THREE.BufferAttribute(a.p, 3));
    g.setAttribute('size', new THREE.BufferAttribute(a.s, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(a.a, 1));
    g.setAttribute('color', new THREE.BufferAttribute(a.c, 3));
    const m = new THREE.ShaderMaterial({
      uniforms: { scale: { value: 1 } },
      vertexShader: 'attribute float size;attribute float alpha;attribute vec3 color;uniform float scale;varying float vA;varying vec3 vC;' +
        'void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*scale/-mv.z;gl_Position=projectionMatrix*mv;vA=alpha;vC=color;}',
      fragmentShader: 'varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5)*2.;float a=' +
        (additive ? 'pow(max(0.,1.-d),2.)' : 'smoothstep(1.,.15,d)*(.75+.25*(1.-d))') + ';if(a<.003)discard;gl_FragColor=vec4(vC,a*vA);}',
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = additive ? 2 : 1; scene.add(pts);
    let k = 0;
    return {
      m, reset(){ k = 0; },
      add(x, y, z, s, al, r, gg, b){ if (k >= n) return; a.p[k * 3] = x; a.p[k * 3 + 1] = y; a.p[k * 3 + 2] = z; a.s[k] = s; a.a[k] = al; a.c[k * 3] = r; a.c[k * 3 + 1] = gg; a.c[k * 3 + 2] = b; k++; },
      flush(){
        g.setDrawRange(0, k);
        for (const key of ['position', 'size', 'alpha', 'color']) {
          const at = g.attributes[key]; at.clearUpdateRanges(); at.addUpdateRange(0, Math.max(1, k) * at.itemSize); at.needsUpdate = true;
        }
      }
    };
  }
  const smoke = particles(4000, false), fire = particles(2500, true);

  /* ============ city ============ */
  /* Город по обе стороны проспекта. Растёт и вширь, и ввысь: кварталы появляются
     кольцами от центра наружу, каждый дом сначала расширяется, потом тянется вверх. */
  const CX = 100, buildings = [];
  {
    let i = 0;
    for (let c = 0; c < 11; c++) for (const side of [-1, 1]) for (let r = 0; r < 5; r++) {
      const w = 5 + rnd(i * 3) * 3.5, d = 5 + rnd(i * 3 + 1) * 3.5;
      const x = 58 + c * 9 + (rnd(i * 5) - .5) * 1.2, z = side * (12.5 + r * 9.5 + (rnd(i * 7) - .5) * 1.2);
      const dn = Math.min(1, Math.hypot((x - CX) / 50, z / 52));
      const g1 = 18.4 + dn * 3.6 + rnd(i * 17) * .5;
      buildings.push({ set: i % 6, w, d, x, z, h1: 3 + rnd(i * 11) * 5, h2: 10 + Math.pow(1 - dn, 2) * (70 + rnd(i * 13) * 80), g1, g2: g1 + .5 + rnd(i * 19) * 1.2 });
      i++;
    }
  }
  const grow = (b, t) => eback(seg(t, b.g1, b.g1 + .5));
  const bh = (b, t) => b.h1 * grow(b, t) + (b.h2 - b.h1) * eback(seg(t, b.g2, b.g2 + .9));

  /* ============ rockets & planets ============ */
  /* Планеты далеко друг от друга и в разной глубине; к финалу камера плавно отъезжает. */
  const planets = [
    { c: V(-90, 540, -420), r: 32, tex: [[200, 30, 55], [215, 45, 30], 7] },
    { c: V(20, 650, -600), r: 22, tex: [[20, 15, 45], [30, 20, 25], 11] },
    { c: V(115, 560, -470), r: 48, tex: [[35, 45, 70], [20, 50, 45], 9], ring: 1 },
    { c: V(215, 680, -640), r: 26, tex: [[270, 25, 50], [250, 30, 30], 6] },
    { c: V(310, 530, -400), r: 36, tex: [[14, 90, 55], [8, 80, 32], 8] }
  ];
  const pads = [...buildings].sort((a, b) => b.h2 - a.h2).slice(0, 10);
  /* траектории ракет нужны камере с первого кадра; сами ракеты строятся позже (этап D) */
  const rockets = pads.map((b, i) => {
    const p = planets[i % planets.length];
    const n = V(-.4 + rnd(i * 31) * .8, -1, .35 + rnd(i * 37) * .5).normalize();
    const T = p.c.clone().addScaledVector(n, p.r);
    const P0 = V(b.x, b.h2 + 3.6, b.z);
    return { g: null, b, p, n, T, P0, P1: P0.clone().add(V(0, 150, 0)), P2: T.clone().addScaledVector(n, 140), L: 24 + i * .28, dur: 5.2 + rnd(i * 17) * .6 };
  });
  const bez = (a, b, c, d, s, out) => {
    const m = 1 - s;
    return out.set(0, 0, 0).addScaledVector(a, m * m * m).addScaledVector(b, 3 * m * m * s).addScaledVector(c, 3 * m * s * s).addScaledVector(d, s * s * s);
  };
  const _a = V(), _b = V(), UP = V(0, 1, 0);
  const rocketPos = (r, s, out) => bez(r.P0, r.P1, r.P2, r.T, s, out);


  /* ============ staged build ============ */
  /* До первого кадра строится только завод. Сортировка, город и космос
     достраиваются в фоне между кадрами (и компилируют шейдеры асинхронно),
     а если зритель перемотал вперёд — строятся сразу, когда понадобятся. */
  const moving = new Set();
  let hub = null, hubRing, sorter, lanes = [], fleet = [], cityMats = [], cityMeshes = [];
  const stages = [
    { at: 13.2, done: false, build(roots){
  /* ============ sorter hub & lanes ============ */
    hub = new THREE.Group(); hub.position.copy(HUB); scene.add(hub); roots.push(hub);
    mesh(rbox(2.6, 1.5, 3.2, .12), M.metal, 0, .75, 0, hub);
    mesh(box(2.64, .22, 3.24), M.paint, 0, .3, 0, hub);
    hubRing = glowRing(1.1, .04); hubRing.position.y = 1.52; hub.add(hubRing);
    sorter = makeRobot(hub, .5, 1.5, -.7, 0);
    lanes = LANES.map(z => {
    const dx = DOCK - .2 - LANE_A.x, len = Math.hypot(dx, z), g = new THREE.Group();
    g.position.set(LANE_A.x, 0, 0); g.rotation.y = -Math.atan2(z, dx); scene.add(g); roots.push(g);
    belt(0, len, M.lane, g);
    return { g, z, len, ang: g.rotation.y };
  });

  /* Поток фур — по InstancedMesh на материал: все фуры одинаковые, это 9 draw calls на весь поток. */
    fleet = [
    ...truckParts,
    [trailerGeo.clone().translate(3.2, 2.45, 0), M.trailer],
    [rearGeo.clone().rotateY(-Math.PI / 2).translate(-.01, 2.45, 0), M.rear]
  ].map(([geo, mat]) => { const im = new THREE.InstancedMesh(geo, mat, 24); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.count = 0; scene.add(im); return im; });

    } },
    { at: 18.2, done: false, build(roots){
    const winSets = Array.from({ length: 6 }, (_, i) => [windowTex(i * 64, false), windowTex(i * 64, true)]);
  /* Дома — шесть InstancedMesh (по набору окон) вместо 110 мешей с тремя группами.
     Окна масштабируются по размеру экземпляра прямо в шейдере. */
    const cityGeo = (() => {
    const g = box(1, 1, 1); g.translate(0, .5, 0);
    const ix = g.index.array, f = i => Array.from(ix.slice(i * 6, i * 6 + 6));
    g.setIndex([...f(0), ...f(1), ...f(4), ...f(5), ...f(2)]);
    g.clearGroups(); g.addGroup(0, 24, 0); g.addGroup(24, 6, 1);
    return g;
  })();
    cityMats = winSets.map(([day, lit]) => {
    const m = std({ map: day, metalness: .55, roughness: .25, emissive: 0xffffff, emissiveMap: lit, emissiveIntensity: 0 });
    m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
        #ifdef USE_INSTANCING
          vec2 bs = vec2(abs(normal.x) > .5 ? length(instanceMatrix[2].xyz) : length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
          vMapUv = uv * bs / vec2(9., 10.); vEmissiveMapUv = vMapUv;
        #endif`);
    };
    m.customProgramCacheKey = () => 'city-uv';
    return m;
  });
    cityMeshes = cityMats.map(m => { const im = new THREE.InstancedMesh(cityGeo, [m, M.roof], 20); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.count = 0; scene.add(im); return im; });
    for (const im of cityMeshes) roots.push(im);
    } },
    { at: 22.5, done: false, build(roots){
  const rocketGeo = new THREE.LatheGeometry([[0, -3], [.62, -3], [.68, -2.6], [.68, 1], [.55, 1.9], [.32, 2.6], [0, 3.1]].map(([x, y]) => new THREE.Vector2(x, y)), 32);
  const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(1, -.9); finShape.lineTo(1, -1.5); finShape.lineTo(0, -.9); finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: .08, bevelEnabled: false }); finGeo.translate(.6, -1.4, -.04);
    for (const r of rockets) {
      const g = r.g = new THREE.Group(); scene.add(g); roots.push(g);
      mesh(rocketGeo, M.white, 0, 0, 0, g);
      mesh(cyl(.69, .69, .35, 32), M.paint, 0, 1.2, 0, g);
      for (let f = 0; f < 4; f++) mesh(finGeo, M.paint, 0, 0, 0, g).rotation.y = f * Math.PI / 2;
      mesh(cyl(.38, .55, .6, 20), M.steel, 0, -3.25, 0, g);
      mesh(sph(.2), M.glass, 0, 1.75, .56, g);
      g.visible = false;
    }
  for (const p of planets) {
    p.mesh = mesh(new THREE.SphereGeometry(p.r, 64, 32), std({ map: planetTex(...p.tex), roughness: .95 }), p.c.x, p.c.y, p.c.z, scene, false);
    p.mesh.rotation.z = .3;
    if (p.ring) {
      const rt = ctex(512, 8, (g, w) => { for (let x = 0; x < w; x++) { const v = Math.sin(x * .19) * .5 + .5; g.fillStyle = `rgba(${220 - v * 60},${190 - v * 70},${150 - v * 60},${.25 + v * .55})`; g.fillRect(x, 0, 1, 8); } });
      const rg = new THREE.RingGeometry(p.r * 1.35, p.r * 2.2, 128, 1);
      const uv = rg.attributes.uv, pos = rg.attributes.position;
      for (let i = 0; i < uv.count; i++) { const l = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (l - p.r * 1.35) / (p.r * .85), .5); }
      p.ringMesh = mesh(rg, std({ map: rt, transparent: true, side: THREE.DoubleSide, roughness: 1, depthWrite: false }), p.c.x, p.c.y, p.c.z, scene, false);
      p.ringMesh.rotation.set(-Math.PI / 2 + .35, .2, 0); roots.push(p.ringMesh);
    }
  }
    for (const p of planets) { roots.push(p.mesh); moving.add(p.mesh); }
    for (const r of rockets) r.g.traverse(m => { if (m.isMesh) m.castShadow = false; });
    } }
  ];
  function finish(roots){
    for (const o of roots) if (o.isGroup) bakeTree(o);
    for (const o of roots) o.traverse(m => { if (m.isMesh && !moving.has(m)) { m.updateMatrix(); m.matrixAutoUpdate = false; } });
  }
  function buildStage(st){ if (st.done) return; st.done = true; const roots = []; st.build(roots); finish(roots); }
  const ensure = t => { for (const st of stages) if (t >= st.at) buildStage(st); };
  /* Фоновая достройка: по одному этапу за раз, с паузой, чтобы не мешать кадрам. */
  async function buildRest(){
    for (const st of stages) {
      await new Promise(r => setTimeout(r, 120));
      if (st.done) continue;
      buildStage(st);
      try { await renderer.compileAsync(scene, camera); } catch (e) {}
    }
  }

  /* ============ camera ============ */
  const keys = [
    [0, [3.2, 4.8, 9.5], [2.2, 1.2, -.6]],
    [4.4, [5.5, 5.2, 10.5], [6.2, 1.6, -2.4]],
    [7.4, [6.5, 4.6, 13], [6.5, 1.8, -1]],
    [10.2, [9.5, 4.2, 15], [11.5, 2.2, 0]],
    [12.9, [11, 5.2, 19], [15.5, 3.8, 0]],
    [14.8, [12, 7.5, 21], [15, 2, 0]],
    [16.8, [17, 13, 31], [22, 2, 0]],
    [18.6, [34, 15, 42], [48, 3, 0]],
    [20.8, [72, 48, 92], [CX, 10, 0]],
    [23.6, [86, 62, 104], [CX, 24, -4]],
    [24.6, [94, 56, 110], [CX, 55, -8]]
  ].map(([t, p, g]) => ({ t, p: V(...p), g: V(...g) }));
  const cr = (p0, p1, p2, p3, u, out) => {
    const u2 = u * u, u3 = u2 * u;
    return out.set(0, 0, 0)
      .addScaledVector(p0, -.5 * u3 + u2 - .5 * u).addScaledVector(p1, 1.5 * u3 - 2.5 * u2 + 1)
      .addScaledVector(p2, -1.5 * u3 + 2 * u2 + .5 * u).addScaledVector(p3, .5 * u3 - .5 * u2);
  };
  const MID_P = V(110, 500, 20), MID_G = V(110, 580, -500), FINAL_P = V(110, 470, 170), FINAL_G = V(110, 575, -500);
  const camP = V(), camG = V(), lead = V(), _c = V(), _d = V(), FOLLOW_P = V(8, -26, 70), FOLLOW_G = V(0, 18, 0);
  function cameraAt(t){
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
    const u = eio(seg(t, k1.t, k2.t));
    cr(k0.p, k1.p, k2.p, k3.p, u, camP); cr(k0.g, k1.g, k2.g, k3.g, u, camG);
    /* за ракетами наверх, затем плавный отъезд до общего плана планет */
    const r = rockets[2];
    rocketPos(r, eio(seg(t, r.L, r.L + r.dur)), lead);
    const w = eio(seg(t, 24.6, 26.6));
    if (w > 0) { camP.lerp(_c.copy(lead).add(FOLLOW_P), w); camG.lerp(_d.copy(lead).add(FOLLOW_G), w); }
    const f1 = eio(seg(t, 28.2, 31)), f2 = seg(t, 30, END);
    if (f1 > 0) { camP.lerp(MID_P, f1); camG.lerp(MID_G, f1); }
    if (f2 > 0) { const e = f2 * (2 - f2); camP.lerp(FINAL_P, e); camG.lerp(FINAL_G, e); }
    const dp = t - T_POP;
    if (dp > 0 && dp < .7) { const s = .35 * (1 - dp / .7); camP.x += Math.sin(dp * 80) * s; camP.y += Math.cos(dp * 67) * s; }
    if (t > 9 && t < T_POP) { const s = .02 * seg(speed(t), 5, 60); camP.x += Math.sin(t * 70) * s; camP.y += Math.cos(t * 83) * s; }
  }

  /* Локальные матрицы почти всех мешей не меняются (двигаются их группы) —
     не пересчитываем их каждый кадр. Исключения — меши, которые сами двигаются. */
  for (const o of [shock, chip1.ring, chip2.ring]) moving.add(o);
  finish([...scene.children]);
  /* Тени от того, что в воздухе, на земле не видны — не рисуем их в проходе теней. */
  for (const o of [chip1.chip, chip2.chip]) o.traverse(m => { if (m.isMesh) m.castShadow = false; });

  /* ============ post ============ */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .45, .4, 2.6);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ============ frame ============ */
  const c0 = V(DOCK0 + 4.3, 3.5, 0), _r = V();

  function chipAt(c, t, t0, x, y, z){
    const cu = seg(t, t0, t0 + 1.6);
    c.chip.visible = cu > 0;
    c.chip.position.set(x, lerp(y + 12, y, eback(cu)), z);
    c.cable.visible = t < t0 + 2.2;
    const cf = seg(t, t0 + 1.6, t0 + 2.6);
    c.ring.visible = cf > 0 && cf < 1; c.ring.position.set(x, .05, z); c.ring.scale.setScalar(.5 + eout(cf) * 9); c.ring.material.opacity = .8 * (1 - cf);
    if (cf > 0 && cf < 1) for (let k = 0; k < 36; k++) {
      const a = rnd(k) * Math.PI * 2, v = 2 + rnd(k + 50) * 6;
      fire.add(x + Math.cos(a) * v * cf, y + rnd(k + 90) * 4 * cf - 4 * cf * cf, z + Math.sin(a) * v * cf, .22, 1 - cf, 4, 1.6, .5);
    }
    if (cf > 0 && cf < .35) fire.add(x, y + .2, z, 5 * (1 - cf / .35), 1, 3, 1.5, .6);
    return cf;
  }
  function animRobot(rb, ph, k){
    rb.g.scale.set(1, Math.max(.001, k), 1); rb.g.visible = k > .001;
    rb.turret.rotation.y = Math.sin(ph * .5) * .55;
    rb.sh.rotation.x = .45 + Math.sin(ph) * .35;
    rb.el.rotation.x = 1 + Math.cos(ph) * .45;
    rb.ring.material.opacity = .5 + .5 * Math.sin(ph * 2);
  }

  let drawn = 0, lastT = -1;
  function render(t){
    ensure(t);
    renderer.info.reset();
    if (drawn % 2 === 0 || Math.abs(t - lastT) > .25) renderer.shadowMap.needsUpdate = true;
    drawn++; lastT = t;
    cameraAt(t);
    camera.position.copy(camP); camera.lookAt(camG);
    const alt = camP.y, space = seg(alt, 70, 330), eve = seg(t, 16, 24);

    /* солнце садится к вечеру, наверху небо гаснет до чёрного.
       Sky-шейдер при нулевых коэффициентах даёт NaN, а bloom размазывает NaN
       на весь кадр — держим минимумы и выше прячем небо целиком. */
    sunDir.setFromSphericalCoords(1, Math.PI / 2 - THREE.MathUtils.degToRad(lerp(30, 9, eve)), THREE.MathUtils.degToRad(205));
    su.sunPosition.value.copy(sunDir);
    su.turbidity.value = lerp(5, .6, space); su.rayleigh.value = lerp(1.2 + eve * .8, .03, space); su.mieCoefficient.value = lerp(.005, .0002, space);
    sky.visible = space < .97;
    stars.material.opacity = seg(alt, 140, 330);
    sun.position.copy(camG).addScaledVector(sunDir, 200); sun.target.position.copy(camG);
    const sh = t < 17 ? 30 : 110;
    if (scam.right !== sh) { scam.left = -sh; scam.right = sh; scam.top = sh; scam.bottom = -sh; scam.updateProjectionMatrix(); }
    sun.color.setHSL(.09, .6, lerp(.92, .7, eve));
    scene.fog.near = lerp(160, 4000, space); scene.fog.far = lerp(1400, 9000, space);
    scene.fog.color.setHSL(.58, .2, lerp(.8, .62, eve) * (1 - space));
    renderer.toneMappingExposure = lerp(.5, .9, space);

    smoke.reset(); fire.reset(); nb = 0; ns = 0;
    const D = dist(t), sp = speed(t);

    /* лента и ролики */
    tBelt.offset.x = -D / ((BL + .4) / 9);
    tLane.offset.x = -t * VB / 1.6;

    /* дым из трубы — валит быстрее вместе с лентой */
    const ph = t * .08 + D / 260;
    for (let k = 0; k < 50; k++) {
      const u = (ph + k / 50) % 1;
      smoke.add(-7 + u * 10 + Math.sin(u * 5 + k) * .8, 18.2 + u * 16, -11 - u * 4, 2 + u * 9, (1 - u) * .45 * Math.min(1, u / .06), .82, .82, .8);
    }

    /* люди работают в своём темпе; роботы поднимаются из пола и разгоняются вместе с лентой */
    workers.forEach((w, i) => {
      const p = t * 2.6 + i * 1.7;
      w.torso.rotation.x = .18 + Math.sin(p) * .08;
      w.arms[0].rotation.x = -(.7 + Math.sin(p) * .45); w.arms[1].rotation.x = -(.7 + Math.sin(p + .9) * .45);
    });
    chipAt(chip1, t, 4.9, PED.x, 1.32, PED.z);
    pedRing.material.opacity = t > 6.5 ? .6 + .4 * Math.sin(t * 6) : 0;
    const rf = Math.min(2.2, sp) * 3 + Math.min(1, sp / 20) * 8;
    robots.forEach((rb, i) => animRobot(rb, t * rf + i * 1.3, eback(seg(t, 6.9 + i * .14, 7.5 + i * .14))));

    /* коробки: собираются на ленте (сначала плоские, потом в полный рост) */
    const infl = eio(seg(t, 8.6, 12.9));
    const kTop = Math.floor(D / SP);
    for (let k = Math.max(0, kTop - 8); k <= kTop; k++) {
      const p = D - k * SP;
      if (p < 0 || p > BL + .9) continue;
      const sy = Math.max(.06, eout(seg(p, 0, 1.4)));
      putBox(BX0 + .3 + p, BY + BOX * sy / 2, (rnd(k) - .5) * .25, 0, (rnd(k + 4) - .5) * .15, 0, sy);
    }

    /* после взрыва: узел сортирует поток по четырём лентам */
    const hubK = eback(seg(t, T_HUB, T_HUB + .45));
    if (hub) {
    hub.visible = hubK > .001; hub.scale.set(1, Math.max(.001, hubK), 1);
    hubRing.material.opacity = t > T_AI2 + 1.6 ? .6 + .4 * Math.sin(t * 7) : 0;
    chipAt(chip2, t, T_AI2, HUB.x - .5, 1.62, HUB.z + .7);
    animRobot(sorter, t * 9, hubK);
    lanes.forEach((l, j) => { const k = eout(seg(t, T_LANES - .3 + j * .08, T_LANES + .1 + j * .08)); l.g.visible = k > .001; l.g.scale.set(Math.max(.001, k), 1, 1); });
    if (t > T_LANES) {
      const span = HUB_T + Math.max(...lanes.map(l => l.len)) / VB;
      const kMin = Math.max(0, Math.ceil((dist(Math.max(0, t - span)) - BL - .9) / SP)), kMax = Math.floor((D - BL - .9) / SP);
      for (let k = kMin; k <= kMax; k++) {
        const te = tAt(k * SP + BL + .9);
        if (te < T_LANES) continue;
        const l = lanes[k % 4], s = (t - te - HUB_T) * VB;
        if (s < 0 || s > l.len) continue;
        const u = s / l.len;
        putBox(lerp(LANE_A.x, DOCK - .2, u), BY + BOX / 2, l.z * u, 0, l.ang, 0);
      }
    }
    }

    /* фура №0: лента заходит в задние двери; кузов надувается и лопается */
    const dp = t - T_POP;
    truck0.g.visible = dp < 0;
    if (dp < 0) inflate(infl, t);
    flash.intensity = 0; shock.visible = false;
    if (dp >= 0 && dp < 3) {
      flash.position.copy(c0); flash.intensity = dp < .4 ? 2500 * (1 - dp / .4) : 0;
      if (dp < .3) fire.add(c0.x, c0.y, c0.z, 12 * (1 - dp / .3) + 3, 1 - dp / .3, 4, 2, .8);
      shock.visible = dp < 1; shock.position.copy(c0); shock.lookAt(camera.position);
      shock.scale.setScalar(1 + eout(Math.min(1, dp)) * 32); shock.material.opacity = 1 - Math.min(1, dp);
      for (let i = 0; i < 120; i++) {
        const a = rnd(i * 3) * Math.PI * 2, el = rnd(i * 3 + 1) * 1.3, v = 8 + rnd(i * 3 + 2) * 26;
        const x = c0.x + Math.cos(a) * Math.cos(el) * v * dp, y = c0.y + Math.sin(el) * v * dp - 4.9 * dp * dp, z = Math.sin(a) * Math.cos(el) * v * dp;
        if (y > 0 && dp < 1.4) fire.add(x, y, z, .35, 1 - dp / 1.4, 4, 1.5, .4);
      }
      /* обломки улетают от ленты и узла, а не сквозь них */
      for (let i = 0; i < 70; i++) {
        const a = (rnd(i * 7) - .5) * Math.PI * 1.4, el = .15 + rnd(i * 7 + 1) * 1.2, v = 5 + rnd(i * 7 + 2) * 16;
        const x = c0.x + Math.cos(a) * Math.cos(el) * v * dp, z = Math.sin(a) * Math.cos(el) * v * dp;
        const y = Math.max(BOX / 2, c0.y + Math.sin(el) * v * dp - 4.9 * dp * dp);
        const rot = dp * (rnd(i * 7 + 3) - .5) * 14 * (y > BOX / 2 + .01 ? 1 : .2);
        const fade = 1 - seg(dp, 2.2, 3);
        if (fade <= 0) continue;
        if (i < 50) putBox(x, y, z, rot, rot * .7, rot * 1.3, fade);
        else putShard(x, Math.max(.05, y), z, rot, rot * 1.2, rot * .5);
      }
      for (let i = 0; i < 40; i++) {
        const a = rnd(i * 13) * Math.PI * 2, r = 2 + eout(seg(dp, 0, 2.5)) * (6 + rnd(i * 13 + 1) * 8);
        smoke.add(c0.x + Math.cos(a) * r, 1 + rnd(i) * 4 + dp * 1.2, Math.sin(a) * r, 4 + dp * 4, .55 * (1 - dp / 3), .7, .68, .64);
      }
    }

    /* фуры у четырёх доков: появляются, грузятся, уезжают по проспекту в город */
    let slot = 0;
    for (const list of docks) for (const tr of list) {
      if (t < tr.s) break;
      const x = truckX(tr, t);
      if (x > 140 || slot >= 24) continue;
      _m.compose(_p.set(x, 0, tr.z), _q.identity(), _s.setScalar(Math.max(.001, eback(seg(t, tr.s, tr.s + .25)) * (1 - seg(x, 122, 140)))));
      for (const im of fleet) im.setMatrixAt(slot, _m);
      slot++;
      const f = seg(t, tr.s, tr.s + .4);
      if (f < 1) for (let k = 0; k < 18; k++) {
        const a = k / 18 * Math.PI * 2;
        fire.add(DOCK + 4.5 + Math.cos(a) * (2 + f * 6), 2 + Math.sin(a * 3) * .5, tr.z + Math.sin(a) * (1.4 + f * 2), .35, 1 - f, 4, 1.4, .4);
      }
    }

    for (const im of fleet) { im.count = slot; im.instanceMatrix.needsUpdate = true; }

    /* город растёт; к вечеру зажигаются окна */
    const dusk = seg(t, 19, 24);
    for (const im of cityMeshes) im.count = 0;
    if (t > 18.3 && cityMeshes.length) for (const b of buildings) {
      const k = grow(b, t);
      if (k <= .01) continue;
      const im = cityMeshes[b.set];
      im.setMatrixAt(im.count++, _m.compose(_p.set(b.x, 0, b.z), _q.identity(), _s.set(b.w * k, Math.max(.05, bh(b, t)), b.d * k)));
    }
    for (const im of cityMeshes) im.instanceMatrix.needsUpdate = true;
    for (const m of cityMats) m.emissiveIntensity = dusk * 1.6;

    /* облака */
    for (let i = 0; i < 60; i++) {
      smoke.add(20 + rnd(i * 3) * 170 + t * .6, 150 + rnd(i * 3 + 1) * 120, -160 + rnd(i * 3 + 2) * 220, 40 + rnd(i) * 70, .55 * (1 - space * .7), .95, .95, .97);
    }

    /* ракеты */
    for (let i = 0; i < rockets.length; i++) {
      const r = rockets[i], ap = seg(t, 22.8 + i * .06, 23.4 + i * .06);
      if (!r.g) continue;
      r.g.visible = ap > 0;
      if (!r.g.visible) continue;
      const s = eio(seg(t, r.L, r.L + r.dur));
      rocketPos(r, s, _a);
      if (s > 0 && s < 1) { rocketPos(r, Math.min(1, s + .004), _b); _b.sub(rocketPos(r, Math.max(0, s - .004), _c)).normalize(); }
      else if (s >= 1) _b.copy(r.n).negate();
      else _b.copy(UP);
      r.g.quaternion.setFromUnitVectors(UP, _b);
      if (s >= 1) _a.addScaledVector(_b, -3.1);
      r.g.position.copy(_a); r.g.scale.setScalar(Math.max(.001, eback(ap)));
      const ls = t - r.L;
      if (ls > -.6 && ls < 3) for (let k = 0; k < 26; k++) {
        const u = seg(ls, -.6 + k * .02, 3), a = rnd(i * 50 + k) * Math.PI * 2, rr = 1 + eout(u) * (4 + rnd(k) * 6);
        smoke.add(r.P0.x + Math.cos(a) * rr, r.P0.y - 3 + u * 2, r.P0.z + Math.sin(a) * rr, 2.5 + u * 7, .6 * (1 - u) * seg(ls, -.6, -.3), .9, .89, .87);
      }
      if (s > 0 && s < 1) {
        for (let k = 1; k < 50; k++) {
          const ss = s - k * .006;
          if (ss <= 0) break;
          rocketPos(r, ss, _c);
          smoke.add(_c.x, _c.y - 3, _c.z, 1.4 + k * .5, .5 * (1 - k / 50) * (1 - space * .6), .92, .92, .92);
        }
        if (s < .97) {
          _d.copy(r.g.position).addScaledVector(_b, -3.7);
          for (let k = 0; k < 12; k++) {
            const fl = .8 + .2 * Math.sin(t * 50 + k * 3 + i);
            fire.add(_d.x - _b.x * k * .45, _d.y - _b.y * k * .45, _d.z - _b.z * k * .45, (1.8 - k * .12) * fl, 1 - k / 12, 4, 1.4 + (k < 3 ? 1.5 : 0), .3 + (k < 2 ? 1 : 0));
          }
        }
      }
      const land = t - (r.L + r.dur);
      if (land > 0) {
        if (land < .7) fire.add(r.T.x, r.T.y, r.T.z, 30 * (1 - land / .7), 1, 4, 2, .8);
        for (let q = 0; q < 6; q++) {
          _c.copy(r.n).add(_r.set(rnd(i * 9 + q) - .5, rnd(i * 9 + q + 3) - .5, rnd(i * 9 + q + 6) - .5).multiplyScalar(.5)).normalize();
          _c.multiplyScalar(r.p.r + .2).add(r.p.c);
          fire.add(_c.x, _c.y, _c.z, 2 * seg(land, q * .12, q * .12 + .4), 1, 4, 1.8, .6);
        }
      }
    }
    for (const p of planets) if (p.mesh) { p.mesh.visible = alt > 40; p.mesh.rotation.y = t * .05; if (p.ringMesh) p.ringMesh.visible = alt > 40; }

    boxes.count = nb; boxes.instanceMatrix.needsUpdate = true;
    shards.count = ns; shards.instanceMatrix.needsUpdate = true;
    smoke.flush(); fire.flush();
    composer.render();
    /* что нужно плееру для HUD и цвета подписей */
    return { t, sp: Math.round(sp), km: Math.max(0, Math.round((alt - 34) / 3.6)), night: space > .45 };
  }

  let size = [1, 1, 1];
  function resize(W = size[0], H = size[1], deviceDpr = size[2]){
    size = [W, H, deviceDpr];
    const T = TIERS[tier], dpr = Math.min(T.dpr, deviceDpr);
    bloom.enabled = T.bloom;
    if (sun.shadow.mapSize.x !== T.shadow) { sun.shadow.mapSize.setScalar(T.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    composer.setPixelRatio(dpr); composer.setSize(W, H);
    camera.aspect = W / H;
    /* на узком экране шире угол, чтобы сцена влезала по ширине */
    camera.fov = W / H < 1 ? 62 : 40;
    camera.updateProjectionMatrix();
    const sc = H * dpr / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    smoke.m.uniforms.scale.value = sc; fire.m.uniforms.scale.value = sc;
  }

  /* Шейдеры первого кадра компилируются параллельно (KHR_parallel_shader_compile),
     поток не блокируется на сотни миллисекунд. */
  camera.position.set(3.2, 4.8, 9.5); camera.lookAt(2.2, 1.2, -.6);
  try { await renderer.compileAsync(scene, camera); } catch (e) {}

  const gl = renderer.getContext(), px = new Uint8Array(4);
  return {
    render, resize, buildRest, tiers: TIERS.length,
    tierFps: () => TIERS[tier].fps || 0,
    setTier(n){ tier = Math.min(TIERS.length - 1, n); resize(); },
    /* Надпись «AI» на чипе: в воркере нет шрифтов страницы, плеер присылает готовую картинку. */
    setChip(img){ tChip.image.getContext('2d').drawImage(img, 0, 0, 256, 256); tChip.needsUpdate = true; },
    /* стоимость кадра с синхронизацией GPU — для замеров */
    bench(t, n = 20){
      render(t); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const a = performance.now();
      for (let i = 0; i < n; i++) { render(t + i * .001); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
      return (performance.now() - a) / n;
    },
    info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, programs: renderer.info.programs.length, textures: renderer.info.memory.textures }),
    drawn: () => drawn
  };
}
