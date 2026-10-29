// Generates the hero illustration (isometric brick stack + crane hook) as inline SVG.
// Usage: node tools/stack.js > /tmp/stack.svg, then paste over <svg class="stack"> in index.html.
// No build step: the output is committed inline so CSS can animate .brick / .hook / .sway.
const u = 26, H = 1.2 * u;           // stud pitch, brick height (px)
const C = 0.8660254, S = 0.5;
const P = (x, y, z) => [(x - y) * C * u, (x + y) * S * u - z * H];
const f = n => +n.toFixed(1);
const pts = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');

const bricks = [
  // x, y, z, lx, ly, label, tone
  [0, 0, 0, 6, 2, 'INFRASTRUCTURE', 'light'],
  [6, 0, 0, 5, 2, 'KUBERNETES', 'dark'],
  [1, 0, 1, 5, 2, 'CI/CD', 'dark'],
  [6, 0, 1, 4, 2, 'CLOUD', 'light'],
  [2, 0, 2, 8, 2, 'AUTOMATION', 'light'],
  [2, 0, 3, 4, 2, 'MONITORING', 'dark'],
];

const tones = {
  light: { top: '#fbfaf7', front: '#efede7', side: 'url(#hd)', text: '#111' },
  dark:  { top: '#3b3a37', front: '#161615', side: '#050505', text: '#f6f4ef' },
};

function stud(cx, cy, t) {
  const r = 0.29 * u, rx = 1.2247 * r, ry = 0.7071 * r, sh = 0.24 * u;
  return `<path d="M${f(cx - rx)} ${f(cy)}V${f(cy - sh)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy - sh)}V${f(cy)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx - rx)} ${f(cy)}Z" fill="${t.front}"/>` +
    `<ellipse cx="${f(cx)}" cy="${f(cy - sh)}" rx="${f(rx)}" ry="${f(ry)}" fill="${t.top}"/>`;
}

function brick([x, y, z, lx, ly, label, tone], extra = '') {
  const t = tones[tone];
  const zt = z + 1;
  const top = [P(x, y, zt), P(x + lx, y, zt), P(x + lx, y + ly, zt), P(x, y + ly, zt)];
  const front = [P(x, y + ly, z), P(x + lx, y + ly, z), P(x + lx, y + ly, zt), P(x, y + ly, zt)];
  const side = [P(x + lx, y, z), P(x + lx, y + ly, z), P(x + lx, y + ly, zt), P(x + lx, y, zt)];
  let s = `<polygon points="${pts(front)}" fill="${t.front}"/>`;
  if (tone === 'light') s += `<polygon points="${pts(front)}" fill="url(#hl)"/>`;
  s += `<polygon points="${pts(side)}" fill="${t.side}"/>`;
  if (tone === 'dark') s += `<polygon points="${pts(side)}" fill="url(#hk)"/>`;
  s += `<polygon points="${pts(top)}" fill="${t.top}"/>`;
  const studs = [];
  for (let i = 0; i < lx; i++) for (let j = 0; j < ly; j++) studs.push([i, j]);
  studs.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  for (const [i, j] of studs) { const [cx, cy] = P(x + i + .5, y + j + .5, zt); s += stud(cx, cy, t); }
  const [ex, ey] = P(x + lx / 2, y + ly, z + .5);
  s += `<text transform="matrix(${C} ${S} 0 1 ${f(ex)} ${f(ey)})" fill="${t.text}"${extra}>${label}</text>`;
  return s;
}

let out = '';
bricks.forEach((b, i) => {
  out += `<g class="brick" style="--i:${i}">${brick(b)}</g>\n`;
  if (i === 4) out += `<polygon class="slot" points="${pts([P(6, 0, 3), P(10, 0, 3), P(10, 2, 3), P(6, 2, 3)])}"/>\n`;
});

// Hanging brick: your task, lowered by the crane hook.
const hb = [6, 0, 6.6, 4, 2, 'ВАША ЗАДАЧА', 'light'];
// Rigging, after a real lifting beam: corner clamps grip the brick's top edges,
// four vertical tie rods go up to a spreader beam, and the crane hook takes the
// shackle on top of the beam. Painter's order matters: back parts first.
function box(x, y, z, lx, ly, lz, t) {
  const top = [P(x, y, z + lz), P(x + lx, y, z + lz), P(x + lx, y + ly, z + lz), P(x, y + ly, z + lz)];
  const front = [P(x, y + ly, z), P(x + lx, y + ly, z), P(x + lx, y + ly, z + lz), P(x, y + ly, z + lz)];
  const side = [P(x + lx, y, z), P(x + lx, y + ly, z), P(x + lx, y + ly, z + lz), P(x + lx, y, z + lz)];
  return `<polygon points="${pts(front)}" fill="${t.front}"/><polygon points="${pts(side)}" fill="${t.side}"/><polygon points="${pts(top)}" fill="${t.top}"/>`;
}
const steel = { top: '#fbfaf7', front: '#e2dfd7', side: 'url(#hd)' };
const grip = { top: '#3b3a37', front: '#1b1a19', side: '#050505' };
const [x0, y0, , lx0, ly0] = hb, zt = hb[2] + 1, zb = zt + 1.9;
const cxs = [x0 + .3, x0 + lx0 - .3];             // clamp / rod x positions
const cyB = y0 + .12, cyF = y0 + ly0 - .12;         // back and front rod y
const clamp = (cx, front) => front
  ? box(cx - .22, y0 + ly0 - .3, zt - .22, .44, .38, .52, grip)
  : box(cx - .22, y0 - .08, zt, .44, .36, .3, grip);
const rod = (cx, cy, z1) => { const [ax1, ay1] = P(cx, cy, z1), [, ay2] = P(cx, cy, zb);
  return `<path class="rod" d="M${f(ax1)} ${f(ay1)}V${f(ay2)}"/>`; };

let hook = brick(hb, ' data-i18n="hero.brick" style="font-size:11px;letter-spacing:.02em"');
for (const cx of cxs) hook += clamp(cx, false) + rod(cx, cyB + .05, zt + .3);
for (const cx of cxs) hook += box(cx - .17, cyB - .14, zb, .34, cyF - cyB + .28, .26, steel);   // cross bars
hook += box(x0 + .1, y0 + ly0 / 2 - .24, zb + .26, lx0 - .2, .48, .32, steel);                  // spreader beam
for (const cx of cxs) hook += rod(cx, cyF, zt + .3) + clamp(cx, true);

// Shackle on the beam, the hook through it, the block and cable above.
const [sx, sy] = P(x0 + lx0 / 2, y0 + ly0 / 2, zb + .58);
const sTop = sy - 18, hookY = sTop - 17, ax = sx + 6;   // hook bowl bottoms out inside the ring
hook += `<path class="cable" d="M${f(ax)} -400V${f(hookY - 12)}"/>`;
hook += `<rect x="${f(ax - 7)}" y="${f(hookY - 14)}" width="14" height="16" rx="2" fill="#111"/>`;
hook += `<path d="M${f(ax)} ${f(hookY + 2)}V${f(hookY + 16)}A6 6 0 0 1 ${f(ax - 12)} ${f(hookY + 16)}v-4" fill="none" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>`;
hook += `<ellipse cx="${f(sx)}" cy="${f(sy - 9)}" rx="3.6" ry="9" fill="none" stroke-width="2.4"/>`;

// Ground: one line along the front edge and short hatch strokes under it.
const g0 = P(-1.2, 2.4, 0), g1 = P(12.5, 2.4, 0);
let ground = `M${f(g0[0])} ${f(g0[1])}L${f(g1[0])} ${f(g1[1])}`;
for (let k = 0; k < 27; k++) { const a = P(-1 + k * .5, 2.4, 0); ground += `M${f(a[0])} ${f(a[1])}l-9 5.2`; }

// Compute bounds from brick corners.
const xs = [], ys = [];
for (const b of [...bricks, hb]) for (const dx of [0, b[3]]) for (const dy of [0, b[4]]) for (const dz of [0, 1.3]) {
  const [px, py] = P(b[0] + dx, b[1] + dy, b[2] + dz); xs.push(px); ys.push(py);
}
const pad = 24;
const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
const minY = Math.min(Math.min(...ys) - 70, hookY - 70), maxY = Math.max(...ys) + pad;

const svg = `<svg class="stack" viewBox="${f(minX)} ${f(minY)} ${f(maxX - minX)} ${f(maxY - minY)}" role="img" aria-labelledby="stackT">
<title id="stackT" data-i18n="hero.artAlt">Кран опускает кирпич с вашей задачей на стопку из облака, Kubernetes, CI/CD, автоматизации и мониторинга</title>
<defs>
<pattern id="hd" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="4" height="4" fill="#d9d6ce"/><path d="M0 0v4" stroke="#111" stroke-width="1.3"/></pattern>
<pattern id="hl" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><path d="M0 0v5" stroke="#111" stroke-width=".5" opacity=".35"/></pattern>
<pattern id="hk" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><path d="M0 0v4" stroke="#fff" stroke-width=".6" opacity=".18"/></pattern>
</defs>
<g class="ink">
<path class="ground" d="${ground}"/>
${out}<g class="hook"><g class="sway">${hook}</g></g>
</g>
</svg>`;
process.stdout.write(svg);
