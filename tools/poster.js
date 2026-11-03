// Regenerates img/car-poster*.webp (the assembled car as an image, shown while 3D loads).
// Run after changing the car or the camera: serve the repo (python3 -m http.server 8000), then from a
// scratch dir with playwright installed: cp <repo>/tools/poster.js . && OUT=<repo>/img node poster.js

const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  // wide: the whole stage at 1600×900; tall: the square stage of a 720 px wide layout
  for (const [name, w, h, sel] of [['car-poster', 1600, 968, '#view'], ['car-poster-tall', 720, 1400, '#view']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(process.env.URL || 'http://127.0.0.1:8000/ai.html');
    await p.waitForFunction(() => window.__car?.ready);
    await p.addStyleTag({ content: '.car-ctl,.car-txt,.car-parts{visibility:hidden!important}' });
    await p.evaluate(() => { window.__car.explode(0); }); await p.waitForTimeout(600);
    await p.evaluate(() => window.__car.render());
    const png = await p.locator(sel).screenshot();
    const webp = await p.evaluate(async b64 => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', .6).split(',')[1];
    }, png.toString('base64'));
    fs.writeFileSync(`${process.env.OUT || 'img'}/${name}.webp`, Buffer.from(webp, 'base64'));
    console.log(name, await p.locator(sel).boundingBox(), Buffer.from(webp, 'base64').length);
    await p.close();
  }
  await b.close();
})();
