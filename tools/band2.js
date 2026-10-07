const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = process.env.TEMP + '\\opencode\\render';
const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

const A = process.argv[2];
const B = process.argv[3];
const bands = [];
for (let i = 4; i < process.argv.length; i += 2) {
  bands.push([+process.argv[i], +process.argv[i + 1]]);
}
const TH = +process.argv[4 + bands.length * 2 - 2] || 24; // not used; keep simple

(async () => {
  const br = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const pg = await br.newPage();
  await pg.setContent('<html><body style="margin:0"><img id="a" src="' + b64(A) + '"><img id="b" src="' + b64(B) + '"></body></html>', { waitUntil: 'load' });
  const res = await pg.evaluate((bands) => {
    const A = document.getElementById('a'), B = document.getElementById('b');
    const w = Math.min(A.naturalWidth, B.naturalWidth);
    const h = Math.min(A.naturalHeight, B.naturalHeight);
    const ca = document.createElement('canvas'); ca.width = w; ca.height = h;
    const ga = ca.getContext('2d'); ga.drawImage(A, 0, 0);
    const cb = document.createElement('canvas'); cb.width = w; cb.height = h;
    const gb = cb.getContext('2d'); gb.drawImage(B, 0, 0);
    const d1 = ga.getImageData(0, 0, w, h).data, d2 = gb.getImageData(0, 0, w, h).data;
    const band = (y0, y1) => {
      let diff = 0, n = 0;
      for (let y = y0; y < Math.min(y1, h); y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const m = Math.max(Math.abs(d1[i] - d2[i]), Math.abs(d1[i + 1] - d2[i + 1]), Math.abs(d1[i + 2] - d2[i + 2]));
          n++; if (m > 24) diff++;
        }
      }
      return +(100 * diff / n).toFixed(2);
    };
    const out = {};
    bands.forEach((b, i) => { out['y' + b[0] + '_' + b[1]] = band(b[0], b[1]); });
    return out;
  }, bands);
  console.log(JSON.stringify(res, null, 1));
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
