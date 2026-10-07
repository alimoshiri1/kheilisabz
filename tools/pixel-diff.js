const puppeteer = require('puppeteer-core');
const fs = require('fs');

const A = process.argv[2];
const B = process.argv[3];
const TH = parseInt(process.argv[4] || '24', 10);

const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const html = '<html><body style="margin:0"><img id="a" src="' + b64(A) + '"><img id="b" src="' + b64(B) + '"></body></html>';
  await page.setContent(html, { waitUntil: 'load' });
  const res = await page.evaluate((th) => {
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    if (Math.abs(a.naturalWidth - b.naturalWidth) > 2 || Math.abs(a.naturalHeight - b.naturalHeight) > 2) {
      return { sizeA: a.naturalWidth + 'x' + a.naturalHeight, sizeB: b.naturalWidth + 'x' + b.naturalHeight, err: 'size mismatch' };
    }
    const w = Math.min(a.naturalWidth, b.naturalWidth), h = Math.min(a.naturalHeight, b.naturalHeight);
    const c1 = document.createElement('canvas'); c1.width = w; c1.height = h;
    c1.getContext('2d').drawImage(a, 0, 0);
    const d1 = c1.getContext('2d').getImageData(0, 0, w, h).data;
    let best = null;
    const table = [];
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
        const g2 = c2.getContext('2d');
        g2.drawImage(b, dx, dy);
        const d2 = g2.getImageData(0, 0, w, h).data;
        let diff = 0, maxd = 0, minX = w, minY = h, maxX = -1, maxY = -1, n = 0;
        for (let y = Math.max(0, dy); y < Math.min(h, h + dy); y++) {
          for (let x = Math.max(0, dx); x < Math.min(w, w + dx); x++) {
            const i = (y * w + x) * 4;
            const m = Math.max(Math.abs(d1[i] - d2[i]), Math.abs(d1[i + 1] - d2[i + 1]), Math.abs(d1[i + 2] - d2[i + 2]));
            n++;
            if (m > th) {
              diff++;
              if (m > maxd) maxd = m;
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
        const pct = +(100 * diff / n).toFixed(3);
        table.push({ dx, dy, pct });
        if (!best || pct < best.pct) best = { dx, dy, pct, diffPixels: diff, compared: n, maxChannelDelta: maxd, bbox: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } };
      }
    }
    return { size: w + 'x' + h, best, table: table.filter(function (t) { return t.dx === 0 || t.dy === 0; }), diffData: (function () {
      const dx = best.dx, dy = best.dy;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.drawImage(a, 0, 0);
      const base = g.getImageData(0, 0, w, h);
      const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
      const g2 = c2.getContext('2d');
      g2.drawImage(b, dx, dy);
      const d2 = g2.getImageData(0, 0, w, h).data;
      const dd = base.data;
      for (let i = 0; i < dd.length; i += 4) {
        const m = Math.max(Math.abs(dd[i] - d2[i]), Math.abs(dd[i + 1] - d2[i + 1]), Math.abs(dd[i + 2] - d2[i + 2]));
        if (m > th) { dd[i] = 255; dd[i + 1] = 0; dd[i + 2] = 0; }
        else { dd[i] = Math.round(dd[i] * 0.35 + 90); dd[i + 1] = Math.round(dd[i + 1] * 0.35 + 90); dd[i + 2] = Math.round(dd[i + 2] * 0.35 + 90); }
      }
      g.putImageData(base, 0, 0);
      return c.toDataURL('image/png');
    })() };
  }, TH);
  if (res.diffData) {
    fs.writeFileSync(process.env.DIFF_OUT || (require('path').dirname(A) + '\\diff.png'), Buffer.from(res.diffData.split(',')[1], 'base64'));
    delete res.diffData;
  }
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
