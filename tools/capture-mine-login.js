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
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('popup-see', '1');
      localStorage.setItem('drawer-seen', '1');
    } catch (e) {}
  });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
  await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  const geoD = await page.evaluate(() => ({ doc: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth }));
  await page.screenshot({ path: OUT + '\\mine-login-desktop.png', fullPage: true });

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 2000));
  const geoM = await page.evaluate(() => ({ doc: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth }));
  await page.screenshot({ path: OUT + '\\mine-login-mobile.png', fullPage: true });

  console.log(JSON.stringify({ desktop: geoD, mobile: geoM }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
