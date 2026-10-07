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
  const imgs = files.map((f, i) => '<img id="i' + i + '" src="' + b64(OUT + '\\' + f) + '">').join('');
  await pg.setContent('<html><body style="margin:0">' + imgs + '</body></html>', { waitUntil: 'load' });
  const out = await pg.evaluate((files) => {
    const res = {};
    for (let i = 0; i < files.length; i++) {
      const img = document.getElementById('i' + i);
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const rows = [];
      for (let y = 0; y < 45; y += 3) {
        let s = '';
        for (let x = 100; x < 240; x += 4) {
          const d = g.getImageData(x, y, 1, 1).data;
          const lum = (d[0] + d[1] + d[2]) / 3;
          s += lum > 250 ? '.' : lum > 230 ? '-' : lum > 180 ? '+' : '#';
        }
        rows.push((y < 10 ? '0' : '') + y + ' ' + s);
      }
      res['img' + i + ':' + files[i]] = rows;
    }
    return res;
  }, files);
  for (const k in out) { console.log('===' + k); out[k].forEach((r) => console.log(r)); }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
