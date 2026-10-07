const puppeteer = require('puppeteer-core');
const fs = require('fs');
const URL = process.argv[2];
const TAG = process.argv[3];
const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
  try { await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 }); }
  catch (e) { await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
  try { await page.waitForFunction('window.__pageReady === true', { timeout: 20000 }); } catch (e) {}
  await page.evaluate(() => {
    try { localStorage.setItem('popup-see', '1'); } catch (e) {}
    ['.MuiDialog-root', '.popup-backdrop'].forEach((s) => document.querySelectorAll(s).forEach((n) => n.remove()));
  });
  await new Promise((r) => setTimeout(r, 1500));

  const scan = () => page.evaluate(() => {
    const out = [];
    document.querySelectorAll('body *').forEach((e) => {
      const cs = getComputedStyle(e);
      const bf = cs.backdropFilter || cs.webkitBackdropFilter;
      const fl = cs.filter;
      const b = e.getBoundingClientRect();
      const vis = b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0;
      if (!vis) return;
      if ((bf && bf !== 'none') || (fl && fl !== 'none' && !/url\(/.test(fl))) {
        out.push({
          tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 90),
          rect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
          bf, filter: fl, bg: cs.backgroundColor, pos: cs.position, z: cs.zIndex, op: cs.opacity,
        });
      }
    });
    return out;
  });

  const result = { idle: await scan() };

  // hover first nav list item that opens mega
  const t = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('header li, .bigheader li, [class*=header] li').forEach((e) => {
      const b = e.getBoundingClientRect();
      if (b.width > 30 && b.height > 15 && b.y >= 0 && b.y < 120) els.push({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    });
    return els[0] || null;
  });
  if (t) {
    await page.mouse.move(t.x, t.y);
    await new Promise((r) => setTimeout(r, 1000));
    result.hoverNav = await scan();
    result.hoverNavShot = true;
    await page.screenshot({ path: OUT + '\\hover-' + TAG + '-nav.png', clip: { x: 0, y: 0, width: 1440, height: 500 } });
  }

  // hover login / cart buttons
  const t2 = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('header a, header button, .bigheader a').forEach((e) => {
      const b = e.getBoundingClientRect();
      const txt = (e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('href') || '');
      if (b.width > 20 && b.height > 15 && b.y >= 0 && b.y < 120 && /login|cart|ورود|سبد|account/i.test(txt)) els.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, txt: txt.slice(0, 40) });
    });
    return els;
  });
  result.buttonTargets = t2;
  if (t2 && t2.length) {
    await page.mouse.move(t2[0].x, t2[0].y);
    await new Promise((r) => setTimeout(r, 1000));
    result.hoverButton = await scan();
    result.hoverButtonTarget = t2[0].txt;
    await page.screenshot({ path: OUT + '\\hover-' + TAG + '-btn.png', clip: { x: 0, y: 0, width: 1440, height: 500 } });
  }

  fs.writeFileSync(OUT + '\\hover-' + TAG + '.json', JSON.stringify(result, null, 1), 'utf8');
  console.log(JSON.stringify(result, null, 1).slice(0, 8000));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
