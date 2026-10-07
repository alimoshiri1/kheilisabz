const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = process.env.TEMP + '\\opencode\\render';
const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

(async () => {
  const br = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const pg = await br.newPage();
  const files = process.argv.slice(2);
  const imgs = files.map((f, i) => '<img id="i' + i + '" src="' + b64(f) + '">').join('');
  await pg.setContent('<html><body style="margin:0">' + imgs + '</body></html>', { waitUntil: 'load' });
  const res = await pg.evaluate((n) => {
    const px = (img, x, y) => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]].join('/');
    };
    // band diff helper: pct of differing pixels in row band [y0,y1) at dx=dy=0
    const band = (A, B, y0, y1, th) => {
      const w = Math.min(A.naturalWidth, B.naturalWidth);
      const ca = document.createElement('canvas'); ca.width = w; ca.height = A.naturalHeight;
      const ga = ca.getContext('2d'); ga.drawImage(A, 0, 0);
      const cb = document.createElement('canvas'); cb.width = w; cb.height = B.naturalHeight;
      const gb = cb.getContext('2d'); gb.drawImage(B, 0, 0);
      const d1 = ga.getImageData(0, y0, w, y1 - y0).data;
      const d2 = gb.getImageData(0, y0, w, y1 - y0).data;
      let diff = 0, n = 0;
      for (let i = 0; i < d1.length; i += 4) {
        const m = Math.max(Math.abs(d1[i] - d2[i]), Math.abs(d1[i + 1] - d2[i + 1]), Math.abs(d1[i + 2] - d2[i + 2]));
        n++; if (m > th) diff++;
      }
      return +(100 * diff / n).toFixed(2);
    };
    const out = {};
    const pts = [[168, 10], [168, 30], [168, 45], [168, 60], [700, 10], [700, 30], [700, 50], [1300, 15], [1300, 45]];
    for (let i = 0; i < n; i++) {
      const img = document.getElementById('i' + i);
      out['i' + i] = { px: pts.map((p) => p.join(',') + '=' + px(img, p[0], p[1])) };
    }
    if (n >= 2) {
      const A = document.getElementById('i0'), B = document.getElementById('i1');
      out.band0_40 = band(A, B, 0, 41, 24);
      out.band41_79 = band(A, B, 41, 80, 24);
    }
    return out;
  }, files.length);
  console.log(JSON.stringify(res, null, 1));
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
