const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 1000 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));

  const sel = [
    ['header', 'header'],
    ['searchSeg', '.search-segment'],
    ['bread', '.bread_crumbs'],
    ['main', 'main.main-container'],
    ['card', '.login-card'],
    ['title', '.login-title'],
    ['footer', 'footer.footer'],
    ['flogo', '.footer__logo'],
    ['ftitle', '.footer__content-title'],
    ['social', '.social_media'],
    ['divider', '.footer-end-divider'],
  ];
  const grab = async () => page.evaluate((sels) => {
    const out = { doc: document.documentElement.scrollHeight };
    for (const [name, sel] of sels) {
      const el = document.querySelector(sel);
      if (!el) { out[name] = null; continue; }
      const r = el.getBoundingClientRect();
      out[name] = { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }
    return out;
  }, sel);

  const desktop = await grab();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 1500));
  const mobile = await grab();

  fs.writeFileSync(OUT + '\\mine-login-dom.json', JSON.stringify({ desktop, mobile }, null, 1));
  console.log(JSON.stringify({ desktop, mobile }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
