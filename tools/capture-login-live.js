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
  await page.goto('https://kheilisabz.com/login', { waitUntil: 'networkidle2', timeout: 60000 });

  let loaded = false;
  try {
    await page.waitForFunction(() => {
      const m = document.querySelector('main');
      if (!m) return false;
      const spin = m.querySelector('img[src*="Ripple"]');
      if (spin) return false;
      return m.innerText.trim().length > 5;
    }, { timeout: 45000 });
    loaded = true;
  } catch (e) { loaded = false; }

  await new Promise(r => setTimeout(r, 3000));

  const probe = await page.evaluate(() => {
    const out = { doc: document.documentElement.scrollHeight, loadedMain: false };
    const m = document.querySelector('main');
    if (m) {
      out.loadedMain = !m.querySelector('img[src*="Ripple"]');
      out.mainHTML = m.outerHTML.slice(0, 6000);
      const r = m.getBoundingClientRect();
      out.mainRect = { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }
    const grab = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    };
    out.sels = {};
    for (const sel of ['header', '.searchinputDesktop', 'nav[aria-label=breadcrumb]', 'main', 'footer', 'input[type=tel]', 'button[type=submit]', 'form', 'h1', 'h2', 'h4', '.footer__logo', '.footer-end-divider']) {
      out.sels[sel] = grab(sel);
    }
    out.inputs = [...document.querySelectorAll('input')].map(i => {
      const r = i.getBoundingClientRect();
      return { type: i.type, ph: i.placeholder || '', x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    });
    out.buttons = [...document.querySelectorAll('button')].map(b => {
      const r = b.getBoundingClientRect();
      return { t: (b.innerText || '').slice(0, 30), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(b => b.w > 0 && b.h > 0);
    return out;
  });
  fs.writeFileSync(OUT + '\\ref-login-live-geo.json', JSON.stringify({ loaded, probe }, null, 1));

  await page.screenshot({ path: OUT + '\\login-live-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 3000));
  const docM = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: OUT + '\\login-live-mobile.png', fullPage: true });

  console.log(JSON.stringify({ loaded, docD: probe.doc, docM, sels: probe.sels, inputs: probe.inputs, buttons: probe.buttons.slice(0, 12) }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
