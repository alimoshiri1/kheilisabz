const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';
const W = parseInt(process.argv[2] || '600', 10);
const H = parseInt(process.argv[3] || '700', 10);
const NAME = process.argv[4] || 'mine-popup';
const URL = process.argv[5] || ('file:///' + path.resolve(__dirname, '..', 'login-popup.html').replace(/\\/g, '/'));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none'],
    defaultViewport: { width: W, height: H },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1200));
  const geo = await page.evaluate(() => {
    const g = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const out = { bodyH: Math.round(document.body.getBoundingClientRect().height), els: {} };
    for (const sel of ['form', 'input[id=PhoneNumber]', '#getCode', 'label', '.header-login img', '.page-header', '.page-header h5', '.panel-body', 'p', '.mb-5']) out.els[sel] = g(document.querySelector(sel));
    return out;
  });
  await page.screenshot({ path: OUT + '\\' + NAME + '.png' });
  fs.writeFileSync(OUT + '\\' + NAME + '-geo.json', JSON.stringify(geo, null, 1));
  console.log(JSON.stringify(geo, null, 1));
  await browser.close();
})();
