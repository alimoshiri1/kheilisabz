const puppeteer = require('puppeteer-core');
const path = require('path');
const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';
const POP = 'file:///' + path.resolve(__dirname, '..', 'login-popup.html').replace(/\\/g, '/');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 500, height: 500 },
  });
  const page = await browser.newPage();
  await page.goto(POP, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.fonts.ready);
  await page.click('#PhoneNumber');
  await page.keyboard.type('۰۹۱۲۳۴۵۶۷۸۹');
  await page.click('#getCode');
  await page.waitForSelector('#Code');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT + '\\step2.png' });

  await page.click('#Code');
  await page.keyboard.type('۹۹۹');
  await page.click('#login');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: OUT + '\\step2-error.png' });

  const geo = await page.evaluate(() => {
    const g = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      bodyH: Math.round(document.body.getBoundingClientRect().height),
      label: g('#login-label'), sub: g('#login-sub'), code: g('#Code'),
      timer: g('#timer'), btn: g('#login'), hint: g('.otp-login'), change: g('.change-number'),
      err: g('#login-error'), scrollH: document.documentElement.scrollHeight,
    };
  });
  console.log(JSON.stringify(geo, null, 1));
  await browser.close();
})();
