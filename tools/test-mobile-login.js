const puppeteer = require('puppeteer-core');

const log = (...a) => console.log(...a);
let failed = 0;
const ok = (c, m) => { if (c) log('  PASS ' + m); else { failed++; log('  FAIL ' + m); } };

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(45000);
  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('popup-see', '1'); });
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__pageReady === true, { timeout: 30000 });

  const btn = await page.evaluate(() => {
    const a = document.querySelector('#bottom-nav a[href="login-popup.html"]');
    if (!a) return null;
    const r = a.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], hit: el ? el.tagName + '.' + el.className : null };
  });
  ok(!!btn, 'bottom nav login link exists: ' + JSON.stringify(btn));

  const tP = new Promise(res => browser.once('targetcreated', t => res(t)));
  await page.click('#bottom-nav a[href="login-popup.html"]');
  const t = await Promise.race([tP, new Promise(r => setTimeout(() => r(null), 6000))]);
  ok(!!t && /login-popup\.html/.test(t.url()), 'bottom nav opens popup: ' + (t ? t.url() : 'none'));

  const headerHref = await page.evaluate(() => document.querySelector('.login-button').getAttribute('href'));
  ok(headerHref === 'login-popup.html', 'header href: ' + headerHref);

  const vis = await page.evaluate(() => {
    const a = document.querySelector('.login-button');
    const big = document.querySelector('.bigheader');
    const shown = el => !!el && el.getClientRects().length > 0;
    return { buttonVisible: shown(a), bigheaderVisible: shown(big) };
  });
  if (vis.buttonVisible) {
    const hit = await page.evaluate(() => {
      const a = document.querySelector('.login-button');
      const r = a.getBoundingClientRect();
      const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return el ? el.closest('.login-button') !== null : false;
    });
    ok(hit, 'header login button hittable on mobile');
  } else {
    ok(!vis.bigheaderVisible, 'desktop header hidden on mobile (bottom nav is the entry): bigheader visible=' + vis.bigheaderVisible);
  }

  await browser.close();
  log(failed ? '\n' + failed + ' FAILED' : '\nALL PASS');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
