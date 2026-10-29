// Regenerates img/ai-poster*.webp (the film's first frame, shown while 3D loads).
// Run after changing the opening shot: serve the repo (python3 -m http.server 8000), then from a
// scratch dir with playwright installed: OUT=<repo>/img node <repo>/tools/poster.js

const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  for (const [name, w, h, q] of [['ai-poster', 1600, 900, .62], ['ai-poster-tall', 720, 900, .62]]) {
    const p = await b.newPage({ viewport: { width: w, height: h + 68 }, deviceScaleFactor: 1 });
    await p.goto((process.env.URL || 'http://127.0.0.1:8000/ai.html') + '?main');
    await p.waitForFunction(() => window.__film);
    await p.addStyleTag({ content: '.caps,.ctl,.hud,.fin{display:none!important}' });
    await p.evaluate(() => window.__film.render(0)); await p.waitForTimeout(800);
    const png = await p.locator('#film').screenshot();
    const webp = await p.evaluate(async b64 => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', +new URLSearchParams(location.search).get('q') || .62).split(',')[1];
    }, png.toString('base64'));
    fs.writeFileSync(`${process.env.OUT || 'img'}/${name}.webp`, Buffer.from(webp, 'base64'));
    console.log(name, (await p.locator('#film').boundingBox()), Buffer.from(webp, 'base64').length);
    await p.close();
  }
  await b.close();
})();
