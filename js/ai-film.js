/* Плеер ролика на ai.html: время, подписи, HUD, кнопки. Сама 3D-сцена — в
   ai-scene.js и рисуется в Web Worker на OffscreenCanvas, если браузер умеет;
   иначе в этом же потоке. Пока сцена грузится, на месте холста — постер (CSS). */
const cv = document.getElementById('film');
const stage = document.getElementById('stage');
const caps = [...document.querySelectorAll('.cap')];
const fin = document.getElementById('fin');
const scrub = document.getElementById('scrub');
const playB = document.getElementById('play');
const hud = document.getElementById('hud'), hudK = document.getElementById('hudK'), hudV = document.getElementById('hudV');

const END = 34, FIN = 31, V = '2026-10-30g';

/* ============ captions ============ */
/* Режем каждую подпись на слова (<mark> — одним куском), чтобы они выскакивали
   по очереди за первую половину своего отрезка. applyLang переписывает innerHTML,
   поэтому режем заново по langchange. Только ASCII-пробелы: NBSP держит пары слов. */
function splitCaps(){
  for (const c of caps) {
    /* слово = группа узлов; «<mark>…</mark>.» — одно слово, точка не отрывается */
    const parts = [];
    let glue = false;
    for (const n of [...c.childNodes]) {
      if (n.nodeType !== 3) { glue && parts.length ? parts[parts.length - 1].push(n) : parts.push([n]); glue = true; continue; }
      const bits = n.textContent.split(/[ \t\n]+/);
      bits.forEach((w, i) => {
        if (!w) return;
        if (i === 0 && glue && parts.length) parts[parts.length - 1].push(document.createTextNode(w));
        else parts.push([document.createTextNode(w)]);
      });
      glue = !/[ \t\n]$/.test(n.textContent);
    }
    c.textContent = '';
    const [a, b] = c.getAttribute('data-t').split(',').map(Number);
    c.style.setProperty('--step', Math.min(.16, (b - a) * .45 / parts.length).toFixed(3) + 's');
    parts.forEach((p, i) => {
      const w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', i); w.append(...p);
      c.appendChild(w); if (i < parts.length - 1) c.appendChild(document.createTextNode(' '));
    });
  }
}
splitCaps();
document.addEventListener('langchange', splitCaps);

/* ============ driver ============ */
/* Один интерфейс для двух путей: frame(t) → Promise<{sp, km, night}>.
   Воркер получает следующий кадр, только когда отдал предыдущий — очередь не копится. */
const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || matchMedia('(pointer: coarse)').matches;
let tier = weak ? 1 : 0, tierFps = 0;
const TIERS = 4;

function moduleWorkers(){
  let ok = false;
  try { new Worker('data:text/javascript,', { get type(){ ok = true; return 'module'; } }).terminate(); } catch (e) {}
  return ok;
}
function chipImage(){
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#ff6a2c'; g.lineWidth = 6; g.strokeRect(26, 26, 204, 204);
  g.fillStyle = '#ff7a3c'; g.font = '800 120px "Inter Tight Variable",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('AI', 128, 134);
  return createImageBitmap(c);
}
async function makeDriver(t){
  const size = () => [stage.clientWidth, stage.clientHeight, window.devicePixelRatio || 1];
  const useWorker = !/[?&]main\b/.test(location.search) && cv.transferControlToOffscreen && typeof OffscreenCanvas !== 'undefined' && moduleWorkers();
  if (useWorker) {
    const w = new Worker(`js/ai-worker.js?v=${V}`, { type: 'module' });
    const off = cv.transferControlToOffscreen();
    const wait = new Map(); let id = 0;
    const call = (msg, transfer) => new Promise(res => { msg.id = ++id; wait.set(id, res); w.postMessage(msg, transfer || []); });
    let fail;
    const ready = new Promise((res, rej) => { wait.set(0, res); fail = rej; w.onerror = e => rej(e); });
    w.onmessage = ({ data: m }) => {
      if (m.type === 'fail') return fail(new Error(m.error));
      const f = wait.get(m.type === 'ready' ? 0 : m.id); if (!f) return;
      wait.delete(m.type === 'ready' ? 0 : m.id); f(m.type === 'tier' ? m.fps : m.type === 'bench' ? m : m.r);
    };
    const [W, H, dpr] = size();
    w.postMessage({ type: 'init', canvas: off, w: W, h: H, dpr, tier, t }, [off]);
    const r0 = await ready;
    document.fonts.ready.then(chipImage).then(img => w.postMessage({ type: 'chip', img }, [img]), () => {});
    return {
      mode: 'worker', first: r0,
      frame: t => call({ type: 'frame', t }),
      resize: t => { const [W, H, dpr] = size(); return call({ type: 'resize', w: W, h: H, dpr, t }); },
      tier: n => call({ type: 'tier', tier: n }),
      bench: (t, n) => call({ type: 'bench', t, n })
    };
  }
  const { createFilm } = await import(`./ai-scene.js?v=${V}`);
  const film = await createFilm(cv, { tier });
  film.resize(...size());
  const r0 = film.render(t);
  document.fonts.ready.then(chipImage).then(img => film.setChip(img), () => {});
  setTimeout(() => film.buildRest(), 0);
  return {
    mode: 'main', first: r0,
    frame: async t => film.render(t),
    resize: async t => { film.resize(...size()); return film.render(t); },
    tier: async n => { film.setTier(n); return film.tierFps(); },
    bench: async (t, n) => ({ ms: film.bench(t, n), info: film.info() })
  };
}

/* ============ playback ============ */
let cur = 0, playing = false, t0 = null, drv = null, busy = false, drawn = 0, last = null;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* DOM трогаем только когда что-то изменилось: на каждом кадре меняется лишь ползунок. */
const capT = caps.map(c => c.getAttribute('data-t').split(',').map(Number));
let shown = '';
function ui(r){
  scrub.value = cur;
  const f = cur >= FIN, showK = cur > 7.3 && cur < 18, showA = cur > 24.4 && cur < FIN;
  const cap = capT.findIndex(([a, b]) => cur >= a && cur < b);
  const k = r ? (showK ? 'K' + r.sp : showA ? 'A' + r.km : '') : null;
  const key = [cap, f, playing, k, r && r.night].join('|');
  if (key === shown) return;
  shown = key;
  caps.forEach((c, i) => c.classList.toggle('on', i === cap));
  fin.classList.toggle('on', f);
  f ? fin.removeAttribute('inert') : fin.setAttribute('inert', '');
  stage.classList.toggle('is-playing', playing);
  if (!r) return;
  last = r;
  hud.classList.toggle('on', showK || showA);
  if (showK) { hudK.textContent = 'THROUGHPUT'; hudV.textContent = '×' + r.sp; }
  else if (showA) { hudK.textContent = r.km > 55 ? 'ORBIT' : r.km > 12 ? 'STRATOSPHERE' : 'ALTITUDE'; hudV.textContent = r.km + ' km'; }
  stage.classList.toggle('is-night', r.night);
}
/* Медленные кадры подряд — ступень качества вниз (только вниз, чтобы не мигать).
   На нижних ступенях кадр рисуется через раз: ровные 30 fps лучше рваных 40. */
let lastTick = 0, lastDraw = 0, slow = 0, seen = 0;
function adapt(now){
  const dt = now - lastTick; lastTick = now;
  if (dt > 200 || tier >= TIERS - 1) return;
  seen++; if (dt > (tierFps ? 40 : 21)) slow++;
  if (seen < 40) return;
  if (slow > 16) { tier++; drv.tier(tier).then(f => { tierFps = f; }); }
  seen = slow = 0;
}
function draw(t){
  busy = true;
  return drv.frame(t).then(r => { busy = false; drawn++; ui(r); });
}
function frame(now){
  if (!playing) return;
  requestAnimationFrame(frame);
  if (busy) return;
  if (tierFps && now - lastDraw < 1000 / tierFps - 4) return;
  lastDraw = now;
  adapt(now);
  if (t0 === null) t0 = now - cur * 1000;
  cur = Math.min(END, (now - t0) / 1000);
  if (cur >= END) playing = false;
  draw(cur);
}
const play = () => { if (!drv) return; if (cur >= END) cur = 0; playing = true; t0 = null; ui(); requestAnimationFrame(frame); };
const pause = () => { playing = false; ui(); };
const seek = t => { cur = t; t0 = null; ui(); if (drv && !busy) draw(cur); };
playB.addEventListener('click', () => !drv ? start(0) : playing ? pause() : play());
document.getElementById('again').addEventListener('click', () => { if (!drv) return start(0); cur = 0; play(); });
document.getElementById('skip').addEventListener('click', () => { pause(); seek(END); });
scrub.addEventListener('input', () => seek(+scrub.value));
let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => drv && drv.resize(cur).then(ui), 120); });
/* Ушёл со ролика вниз по странице — не жжём CPU/GPU; вернулся — продолжаем. */
let autoPaused = false;
new IntersectionObserver(([e]) => {
  if (!e.isIntersecting && playing) { autoPaused = true; pause(); }
  else if (e.isIntersecting && autoPaused) { autoPaused = false; play(); }
}, { threshold: .15 }).observe(stage);
scrub.max = END;

/* Экономия трафика (Save-Data) или 2G: 3D не грузим сами — постер и финальная
   карточка уже на месте, ролик запускается кнопкой «Смотреть ещё раз» / ▶. */
const conn = navigator.connection;
const lite = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
let starting = false;
async function start(startT){
  if (starting) return; starting = true;
  stage.classList.remove('is-failed');
  try { drv = await makeDriver(startT); }
  catch (e) { stage.classList.add('is-failed'); return; }   /* нет WebGL — остаются постер и финальная карточка */
  cur = startT;
  /* финальная карточка была видна до старта — гасим её без перехода, чтобы не мелькнула */
  fin.style.transition = 'none'; ui(drv.first); fin.offsetWidth; fin.style.transition = '';
  stage.classList.add('is-ready');
  drawn = 1;
  if (!reduce || startT < END) play();
  /* хуки для замеров из Playwright */
  window.__film = {
    END, mode: drv.mode,
    drawn: () => drawn,
    render: async t => { pause(); cur = t; t0 = null; ui(); await draw(t); },
    playFrom: t => { cur = t; play(); },
    bench: async (t, n = 20) => { pause(); return (await drv.bench(t, n)).ms; },
    info: async () => (await drv.bench(15, 1)).info,
    tier: () => tier, setTier: n => { tier = n; return drv.tier(n).then(f => { tierFps = f; }); }
  };
}
if (lite) stage.classList.add('is-failed'); else start(reduce ? END : 0);
