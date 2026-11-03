/* ai.html: фотореалистичный болид Формулы-1 (Red Bull RB18, сезон 2022) — модель
   CGTrader (royalty-free), сжатая в GLB (meshopt + WebP), под студийной HDRI.
   Вращение, разборка, выбор детали.
   Кадр рисуется только когда что-то сдвинулось (камера, разборка, автоповорот):
   машина, которая стоит, не тратит ни GPU, ни батарею. */
const $ = id => document.getElementById(id);
const view = $('view'), cv = $('car'), boom = $('boom'), ex = $('ex'), aside = $('partsBox'), load = $('load');
const pd = $('pd'), pd0 = $('pd0');
const btns = [...document.querySelectorAll('[data-part]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = matchMedia('(min-width: 901px)');
const conn = navigator.connection;
const lite = !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));
const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
/* лёгкая модель (текстуры ≤1024, ~31 МБ видеопамяти) — телефонам и слабым машинам */
const MODEL = `models/car-${weak || matchMedia('(max-width: 900px), (pointer: coarse)').matches ? 'lo' : 'hi'}.glb?v=1`;
const INSIDE = ['cockpit', 'wheel', 'gearbox', 'rsusp', 'fsusp', 'brakes', 'fuel', 'ers', 'engine', 'cooling'];   // видны только после разборки

/* ============ ui (работает и без 3D) ============ */
let sel = null, car = null;
function select(id) {
  sel = id === sel ? null : id;
  for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.part === sel));
  const b = btns.find(b => b.dataset.part === sel);
  pd.textContent = b ? b.nextElementSibling.textContent : '';
  pd.hidden = !b; pd0.hidden = !!b;
  car?.select(sel);
}
btns.forEach(b => b.addEventListener('click', () => select(b.dataset.part)));
document.addEventListener('langchange', () => { if (sel) { const s = sel; sel = null; select(s); } });

if (lite) { view.classList.add('is-lite'); load.hidden = false; load.addEventListener('click', start, { once: true }); }
else start();

async function start() {
  load.hidden = true;
  try { car = await build(await import('./vendor/three-car.js?v=r169d')); car.select(sel); }
  catch (e) { console.error(e); view.classList.add('is-failed'); }
}

/* ============ scene ============ */
async function build(T) {
  const renderer = new T.WebGLRenderer({ canvas: cv, antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;           // свет не двигается: тени пересчитываем только при разборке

  const scene = new T.Scene();
  scene.background = new T.Color(0xf3f1ec);
  const cam = new T.PerspectiveCamera(28, 1, .1, 60);
  cam.position.set(5.2, 2.3, 6.4);

  /* модель и студийная HDRI (Poly Haven, CC0) качаются параллельно; прогресс — по модели */
  const prog = $('prog');
  const gltfP = new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder).loadAsync(MODEL, ev => {
    if (ev.total) { prog.hidden = false; prog.value = ev.loaded / ev.total; }
  });
  const hdrP = new T.RGBELoader().loadAsync('models/studio.hdr?v=1');
  /* внутренности (двигатель, ERS, бак, радиаторы, суппорты…) смоделированы отдельно — tools/car-inner.py */
  const innerP = new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder).loadAsync('models/car-inner.glb?v=7');
  const [gltf, hdr, inner] = await Promise.all([gltfP, hdrP, innerP]);
  prog.hidden = true;

  const pmrem = new T.PMREMGenerator(renderer);
  hdr.mapping = T.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  scene.environmentIntensity = 1.1;
  hdr.dispose(); pmrem.dispose();

  const sun = new T.DirectionalLight(0xffffff, 1.6);
  sun.position.set(2.5, 8, 3.5);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  scene.add(sun, sun.target);

  /* ---- parts: узлы p_<id> из экспорта Blender (tools/car-export.py) ---- */
  /* dir — куда уезжает деталь; lat — левая и правая половины разъезжаются в разные стороны по Z */
  const DIRS = {
    fwing:   { d: [1.1, 0, 0], t: 0 },
    body:    { d: [0, 2.0, 0], t: 0 },
    rwing:   { d: [-.9, .55, 0], t: .05 },
    wheels:  { d: [0, 0, .95], t: .05, lat: true },
    floor:   { d: [0, -.15, .5], t: .1, lat: true },
    brakes:  { d: [0, 0, .55], t: .15, lat: true },
    fsusp:   { d: [0, 0, .3], t: .2, lat: true },
    rsusp:   { d: [0, 0, .3], t: .2, lat: true },
    gearbox: { d: [-.6, 0, 0], t: .25 },
    cockpit: { d: [0, .55, 0], t: .25 },
    wheel:   { d: [.25, 1.15, 0], t: .3 },
    fuel:    { d: [0, 1.3, 0], t: .3 },
    engine:  { d: [-.25, .9, 0], t: .3 },
    cooling: { d: [0, .25, .55], t: .25, lat: true },
    ers:     { d: [0, -.3, 0], t: .35 },
  };
  /* меши переносим из повёрнутой/масштабированной иерархии glTF в группу, выровненную по миру:
     так направления разборки задаются прямо в мировых осях (нос +X, верх +Y, борта ±Z) */
  const src = gltf.scene; src.updateMatrixWorld(true); inner.scene.updateMatrixWorld(true);
  const root = new T.Group(); scene.add(root);
  const parts = {}, pickable = [], box = new T.Box3(), c = new T.Vector3(), paint = [];
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const meshes = []; src.traverse(o => { if (o.isMesh) meshes.push(o); }); inner.scene.traverse(o => { if (o.isMesh) meshes.push(o); });
  /* у внутренних карбоновых деталей — настоящий карбон модели (текстура плетения), а не плоский цвет */
  let carbon = null; src.traverse(o => { if (!carbon && o.isMesh && /Karbon/.test(o.material.name)) carbon = o.material; });
  if (carbon) inner.scene.traverse(o => { if (o.isMesh && o.material.name === 'carbon') o.material = carbon; });
  for (const o of meshes) {
    let p = o; while (p && !/^p_/.test(p.name)) p = p.parent;
    const id = p ? p.name.slice(2) : 'body', D = DIRS[id] || DIRS.body;
    const P = parts[id] ||= { id, t: D.t, pieces: [], mats: new Set() };
    box.setFromObject(o).getCenter(c);
    const dir = new T.Vector3(...D.d); if (D.lat) dir.z *= Math.abs(c.z) < .05 ? 0 : Math.sign(c.z);   // центральные детали (дифференциал) остаются на оси
    const g = new T.Group(); g.matrixAutoUpdate = false; root.add(g); g.attach(o);
    o.castShadow = o.receiveShadow = true;
    o.matrixAutoUpdate = false; o.updateMatrix();
    o.userData.part = id; pickable.push(o);
    const ms = [].concat(o.material).map(m => {
      m = m.clone();
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) if (m[k]) m[k].anisotropy = aniso;   // без ряби на карбоне под острым углом
      if (m.normalMap) m.normalScale.multiplyScalar(.45);   // мелкая карбоновая нормаль иначе мерцает «зеброй» в отражениях                                // своя копия на деталь: подсветка не течёт на соседей
      if (id === 'body' || id === 'fwing' || id === 'rwing') paint.push(m);
      P.mats.add(m); return m;
    });
    o.material = Array.isArray(o.material) ? ms : ms[0];
    P.pieces.push({ g, dir, lc: c.clone(), name: o.name, c: c.toArray().map(v => +v.toFixed(2)) });
  }
  /* лак: кузов и крылья получают clearcoat поверх PBR-текстуры — блик как на настоящей краске */
  for (const m of paint) {
    if (!m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) continue;
    const ph = new T.MeshPhysicalMaterial();
    T.MeshStandardMaterial.prototype.copy.call(ph, m);
    ph.defines = { STANDARD: '', PHYSICAL: '' };
    Object.assign(ph, { clearcoat: .8, clearcoatRoughness: .08, ior: 1.5, specularIntensity: 1, specularColor: new T.Color(1, 1, 1), sheen: 0, transmission: 0, thickness: 0, iridescence: 0, anisotropy: 0, dispersion: 0, attenuationDistance: Infinity, attenuationColor: new T.Color(1, 1, 1), sheenColor: new T.Color(0, 0, 0) });
    root.traverse(o => { if (o.isMesh && o.material === m) o.material = ph; });
    for (const P of Object.values(parts)) if (P.mats.delete(m)) P.mats.add(ph);
  }

  /* ============ callouts ============ */
  /* Выноска как на техническом чертеже: точка на детали → диагональ → горизонталь, над которой
     стоит название. Только для детали под курсором (на машине или в списке); на тач-экранах,
     где наведения нет, — для выбранной. */
  const coBox = $('co'), coSvg = coBox.querySelector('svg'), coL = coBox.querySelector('.co-l');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const nameOf = id => btns.find(b => b.dataset.part === id)?.querySelector('span').textContent || id;
  const wp = new T.Vector3(), cbox = new T.Box3(), corner = new T.Vector3();
  function anchor(P) {                              // центр куска детали, ближайшего к камере
    let best = null, bd = Infinity;
    for (const pc of P.pieces) {
      const v = pc.lc.clone().add(pc.g.position).add(root.position), d = v.distanceToSquared(cam.position);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  }
  function callouts() {
    const id = hover || (fine ? null : sel), P = id && parts[id];
    coBox.classList.toggle('on', !!P);
    if (!P) { coSvg.innerHTML = ''; return; }
    const w = cv.clientWidth, h = cv.clientHeight, narrow = w < 620;
    wp.copy(anchor(P)).project(cam);
    const ax = (wp.x + 1) / 2 * w, ay = (1 - wp.y) / 2 * h;
    let L = Infinity, Rr = -Infinity;               // габарит машины на экране: подпись встаёт за ним, в пустом месте
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? cbox.max.x : cbox.min.x, i & 2 ? cbox.max.y : cbox.min.y, i & 4 ? cbox.max.z : cbox.min.z).project(cam);
      const x = (corner.x + 1) / 2 * w; L = Math.min(L, x); Rr = Math.max(Rr, x);
    }
    const t = nameOf(id); if (coL.textContent !== t) coL.textContent = t;
    const lw = coL.offsetWidth, lh = coL.offsetHeight, maxR = wide.matches ? aside.offsetLeft - 16 : w - 6;
    const pad = narrow ? 8 : 12;
    const lxOf = s => s > 0 ? Math.max(ax + 40, Rr + 10) : Math.min(ax - 40, L - 10) - lw;
    let s = ax < (L + Rr) / 2 ? -1 : 1, lx = lxOf(s);
    if (lx < 6 || lx + lw > maxR) { const o = lxOf(-s); if (o >= 6 && o + lw <= maxR) { s = -s; lx = o; } else lx = Math.min(Math.max(lx, 6), maxR - lw); }
    /* как на чертеже: длинная диагональ от точки почти до подписи, короткая горизонталь под ней */
    const ex = s > 0 ? lx - pad : lx + lw + pad, end = s > 0 ? lx + lw + 4 : lx - 4;
    /* вверх или вниз — куда подпись не ляжет на заголовок и блок описания слева */
    const cr = cv.getBoundingClientRect(), avoid = [document.querySelector('.car-txt'), document.querySelector('.car-info')]
      .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height).map(r => [r.left - cr.left, r.top - cr.top, r.right - cr.left, r.bottom - cr.top]);
    const dy = Math.min(Math.max(Math.abs(ex - ax) * .5, narrow ? 24 : 34), narrow ? 50 : 80);
    const bad = ey => avoid.some(([l, t, r, b]) => lx < r && lx + lw > l && ey - lh - 4 < b && ey > t) || ey - lh < 4 || ey > h - 12;
    const pref = ay > h * .55 ? -1 : 1;
    let ey = ay + pref * dy; if (bad(ey) && !bad(ay - pref * dy)) ey = ay - pref * dy;
    ey = Math.min(Math.max(ey, lh + 8), h - 12);
    coSvg.innerHTML = `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3.5"/><path d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}H${end.toFixed(1)}"/>`;
    coL.style.transform = `translate(${lx.toFixed(1)}px, ${(ey - lh - 4).toFixed(1)}px)`;
  }
  const draw = () => { renderer.render(scene, cam); callouts(); };

  /* земля: мягкая тень от солнца + пятно контактной тени под машиной */
  const ground = new T.Mesh(new T.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), new T.ShadowMaterial({ opacity: .22 }));
  ground.receiveShadow = true;
  const bc = document.createElement('canvas'); bc.width = 256; bc.height = 128;
  { const g = bc.getContext('2d'); g.setTransform(1, 0, 0, .5, 0, 0);
    const r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(.6, 'rgba(0,0,0,.2)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); }
  const blobTex = new T.CanvasTexture(bc); blobTex.colorSpace = T.SRGBColorSpace;
  const blob = new T.Mesh(new T.PlaneGeometry(6.4, 2.8).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false }));
  blob.position.y = .002;
  scene.add(ground, blob);
  [ground, blob].forEach(m => { m.matrixAutoUpdate = false; m.updateMatrix(); });

  /* ============ explode ============ */
  const smooth = t => (t = Math.min(Math.max(t, 0), 1), t * t * (3 - 2 * t));
  let e = -1;
  function setE(v) {
    if (v === e) return; e = v;
    root.position.y = smooth(e / .4) * .45;
    root.updateMatrix();
    for (const P of Object.values(parts)) {
      const k = smooth((e - P.t) / .6);
      for (const pc of P.pieces) { pc.g.position.copy(pc.dir).multiplyScalar(k); pc.g.updateMatrix(); }
    }
    root.updateMatrixWorld(true); cbox.setFromObject(root);
    blob.material.opacity = 1 - smooth(e / .3);
    renderer.shadowMap.needsUpdate = true;
    ex.value = e;
    const open = e > .5;
    boom.setAttribute('aria-pressed', String(open)); view.classList.toggle('is-open', open);
    fitCam();
  }
  let tw = null;
  function tween(to) {
    if (reduced) { tw = null; setE(to); req(); return; }
    tw = { from: e, to, t0: performance.now(), d: 1400 * Math.abs(to - e) + 200 }; req();
  }
  boom.addEventListener('click', () => tween(e > .5 ? 0 : 1));
  ex.addEventListener('input', () => { tw = null; setE(+ex.value); req(); });

  /* ============ camera ============ */
  const controls = new T.OrbitControls(cam, cv);
  Object.assign(controls, { enableDamping: true, dampingFactor: .08, enablePan: false, rotateSpeed: .7, zoomSpeed: .8,
    minPolarAngle: .25, maxPolarAngle: 1.47, autoRotate: !reduced, autoRotateSpeed: 1.1 });
  let idleT = 0, lastFit = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleT); });
  controls.addEventListener('end', () => { if (!reduced) idleT = setTimeout(() => { controls.autoRotate = true; req(); }, 7000); });
  controls.addEventListener('change', req);
  /* расстояние, при котором машина влезает в кадр; при разборке камера отъезжает
     пропорционально, сохраняя приближение, которое выбрал посетитель */
  function fitDist() {
    const w = cv.clientWidth - (wide.matches ? aside.offsetWidth : 0), h = cv.clientHeight;
    const vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * Math.max(w, 1) / Math.max(h, 1));
    return (3.0 + 1.7 * Math.max(e, 0)) / Math.sin(Math.min(vf, hf) / 2) * (wide.matches ? 1.02 : 1.05);
  }
  /* на широком экране машина сдвинута от списка деталей и вниз от заголовка; разобранная — ещё ниже */
  function offset() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    const sx = wide.matches ? aside.offsetWidth / 2 : 0;
    cam.setViewOffset(w, h, sx, wide.matches ? -h * (.07 + .1 * Math.max(e, 0)) : 0, w, h);
    cam.updateProjectionMatrix();
  }
  function fitCam() {
    offset();
    const f = fitDist();
    controls.target.set(0, .35 + .95 * smooth(e / .4), 0);
    if (lastFit) cam.position.sub(controls.target).multiplyScalar(f / lastFit).add(controls.target);
    else cam.position.sub(controls.target).setLength(f).add(controls.target);
    controls.minDistance = f * .3; controls.maxDistance = f * 1.8;
    lastFit = f;
  }
  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    offset();
    const f = fitDist(); if (lastFit) { cam.position.sub(controls.target).multiplyScalar(f / lastFit).add(controls.target); lastFit = f; }
    req();
  }

  /* ============ pick ============ */
  const ray = new T.Raycaster(), ptr = new T.Vector2();
  let hover = null, down = null;
  function hit(ev) {
    const r = cv.getBoundingClientRect();
    ptr.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ptr, cam);
    return ray.intersectObjects(pickable, false)[0]?.object.userData.part || null;
  }
  function glow() {
    for (const P of Object.values(parts)) {
      const v = P.id === sel ? .35 : P.id === hover ? .12 : 0;
      for (const m of P.mats) { m.emissive.setHex(0xff4a1c); m.emissiveIntensity = v; }
    }
    req();
  }
  cv.addEventListener('pointerdown', ev => { down = [ev.clientX, ev.clientY]; });
  cv.addEventListener('pointerup', ev => {
    if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 6) return;
    const id = hit(ev);
    if (id !== sel) select(id ?? sel);             // клик мимо снимает выбор (select(sel) переключает)
    btns.find(b => b.dataset.part === sel)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
  if (fine) {
    for (const b of btns) {
      b.addEventListener('mouseenter', () => { hover = b.dataset.part; glow(); });
      b.addEventListener('mouseleave', () => { hover = null; glow(); });
    }
    let pend = 0;
    cv.addEventListener('pointermove', ev => {
      if (ev.buttons || pend) return;
      pend = requestAnimationFrame(() => { pend = 0; const h = hit(ev); if (h !== hover) { hover = h; cv.style.cursor = h ? 'pointer' : ''; glow(); } });
    });
    cv.addEventListener('pointerleave', () => { if (hover) { hover = null; glow(); } });
  }

  /* ============ quality ============ */
  /* только вниз: если кадры стабильно опаздывают — меньше пикселей, потом без теней, потом 30 fps */
  const TIERS = [{ dpr: 2, sh: 2048 }, { dpr: 1.5, sh: 2048 }, { dpr: 1.25, sh: 1024 }, { dpr: 1, sh: 1024 }, { dpr: 1, sh: 0 }, { dpr: .8, sh: 0, fps: 30 }];
  let tier = weak ? 2 : 0;
  function applyTier() {
    const t = TIERS[tier];
    renderer.setPixelRatio(Math.min(devicePixelRatio, t.dpr));
    if (!t.sh && sun.castShadow) { sun.castShadow = false; ground.visible = false; }
    else if (t.sh && sun.shadow.mapSize.x !== t.sh) { sun.shadow.mapSize.set(t.sh, t.sh); sun.shadow.map?.dispose(); sun.shadow.map = null; }
    renderer.shadowMap.needsUpdate = true;
    resize();
  }
  let samples = [], frames = 0;
  function quality(dt) {
    if (++frames < 30 || tier === TIERS.length - 1) return;
    samples.push(dt);
    if (samples.length < 45) return;
    const avg = samples.reduce((a, b) => a + b) / samples.length, target = 1 / (TIERS[tier].fps || 60);
    samples = [];
    if (avg > target * 1.45) { tier++; applyTier(); frames = 0; }
  }

  /* ============ loop ============ */
  let raf = 0, last = 0, drawn = 0, visible = true;
  function req() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const minGap = 1000 / (TIERS[tier].fps || 60) - 3;
    if (now - drawn < minGap) { req(); return; }    // 120 Гц экрану хватит 60 кадров
    const dt = last ? Math.min((now - last) / 1000, .1) : 1 / 60;
    let busy = false;
    if (tw) {
      const k = Math.min((now - tw.t0) / tw.d, 1), s = k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      setE(tw.from + (tw.to - tw.from) * s); busy = k < 1; if (!busy) tw = null;
    }
    busy = controls.update(dt) || busy || controls.autoRotate;
    draw();
    drawn = now;
    if (busy) { if (last) quality(dt); last = now; req(); } else last = 0;
  }
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) req(); }).observe(view);
  document.addEventListener('visibilitychange', () => { last = 0; req(); });
  new ResizeObserver(resize).observe(cv);
  wide.addEventListener('change', resize);

  setE(0);
  applyTier();
  await renderer.compileAsync(scene, cam);
  draw();
  view.classList.add('is-ready');
  req();

  const api = {
    select(id) { sel = id; if (id && INSIDE.includes(id) && e < .6 && !tw) tween(1); glow(); },
    explode(v) { tw = null; setE(v); draw(); },
    render() { draw(); },
    debugCam(v, pos, tgt) {                          // для Playwright: кадр с заданной точки
      tw = null; setE(v); controls.autoRotate = false;
      cam.position.set(...pos); controls.target.set(...tgt); cam.lookAt(...tgt); cam.clearViewOffset(); cam.updateProjectionMatrix();
      draw();
    },
    pieces: () => Object.values(parts).flatMap(P => P.pieces.map(p => [P.id, p.name, p.c, p.dir.toArray()])),
    info: () => ({ tier, model: MODEL, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, gpuTex: renderer.info.memory.textures, e }),
    ready: true,
  };
  window.__car = api;
  return api;
}
