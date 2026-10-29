/* Поток рендера ролика: вся работа Three.js идёт здесь, на OffscreenCanvas.
   Главный поток страницы только присылает время кадра и показывает подписи —
   прокрутка и кнопки не ждут, пока досчитается сцена. */
import { createFilm } from './ai-scene.js?v=2026-10-30g';

let film = null;
const queue = [];
onmessage = async ({ data: m }) => {
  if (m.type === 'init') {
    /* без WebGL ошибка в async-обработчике не дошла бы до страницы — сообщаем сами */
    try { film = await createFilm(m.canvas, { tier: m.tier }); }
    catch (e) { postMessage({ type: 'fail', error: String(e) }); return; }
    film.resize(m.w, m.h, m.dpr);
    postMessage({ type: 'ready', r: film.render(m.t) });
    for (const q of queue.splice(0)) onmessage({ data: q });
    film.buildRest();
    return;
  }
  if (!film) { queue.push(m); return; }
  if (m.type === 'frame') postMessage({ type: 'frame', id: m.id, r: film.render(m.t) });
  else if (m.type === 'resize') { film.resize(m.w, m.h, m.dpr); postMessage({ type: 'frame', id: m.id, r: film.render(m.t) }); }
  else if (m.type === 'tier') { film.setTier(m.tier); postMessage({ type: 'tier', id: m.id, fps: film.tierFps() }); }
  else if (m.type === 'chip') film.setChip(m.img);
  else if (m.type === 'bench') postMessage({ type: 'bench', id: m.id, ms: film.bench(m.t, m.n), info: film.info() });
};
