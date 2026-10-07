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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
  await page.goto('https://kheilisabz.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 6000));

  const probe = await page.evaluate(() => {
    const out = { doc: document.documentElement.scrollHeight };
    const grab = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), disp: cs.display, color: cs.color, vis: cs.visibility, op: cs.opacity };
    };
    out.footer = grab('footer');
    out.divider = grab('.footer__container__end-divider');
    out.copy = grab('.copy-write');
    out.social = grab('.footer__container');
    return out;
  });
  fs.writeFileSync(OUT + '\\live-home-desktop-geo.json', JSON.stringify(probe, null, 1));
  await page.screenshot({ path: OUT + '\\live-home-desktop.png', fullPage: true });

  console.log(JSON.stringify(probe, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

