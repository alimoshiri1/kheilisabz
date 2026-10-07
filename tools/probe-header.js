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
  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  try { await page.waitForFunction('window.__pageReady === true', { timeout: 20000 }); } catch (e) {}
  await page.evaluate(() => {
    try { localStorage.setItem('popup-see', '1'); } catch (e) {}
    ['.MuiDialog-root', '.popup-backdrop'].forEach((s) => document.querySelectorAll(s).forEach((n) => n.remove()));
  });
  await new Promise((r) => setTimeout(r, 1500));

  const snap = (label) => page.evaluate((label) => {
    const els = Array.prototype.slice.call(document.querySelectorAll('header, [class*=header], [class*=Header]'))
      .filter((e) => { const b = e.getBoundingClientRect(); return b.height > 0 && b.width > 200 && getComputedStyle(e).display !== 'none'; })
      .slice(0, 8);
    return {
      label,
      scrollY: Math.round(window.scrollY),
      items: els.map((e) => {
        const b = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return {
          tag: e.tagName.toLowerCase(),
          cls: String(e.className).slice(0, 80),
          pos: cs.position,
          y: Math.round(b.y), h: +b.height.toFixed(1), w: Math.round(b.width),
          bg: cs.backgroundColor, bgi: cs.backgroundImage.slice(0, 60),
          bf: cs.backdropFilter || cs.webkitBackdropFilter, bs: cs.boxShadow.slice(0, 60),
          pad: cs.padding, transform: cs.transform, transition: cs.transition.slice(0, 90),
          opacity: cs.opacity, z: cs.zIndex,
        };
      }),
    };
  }, label);

  const out = [];
  out.push(await snap('top'));
  await page.evaluate(() => window.scrollTo(0, 250));
  await new Promise((r) => setTimeout(r, 900));
  out.push(await snap('down250'));
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise((r) => setTimeout(r, 900));
  out.push(await snap('down800'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 900));
  out.push(await snap('back-top'));

  // hover probe with REAL mouse (CSS :hover needs trusted events)
  const target = await page.evaluate(() => {
    const cands = [];
    document.querySelectorAll('header a, header button, header li, header [class*=nav] a, header [class*=menu] a, header [class*=action] a, header [class*=login], header [class*=cart], .bigheader a, .bigheader li').forEach((e) => {
      const b = e.getBoundingClientRect();
      if (b.width > 20 && b.height > 15 && b.y >= 0 && b.y < 200) cands.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, d: (e.tagName + '.' + String(e.className)).slice(0, 70) });
    });
    return cands.slice(0, 6);
  });
  const hdrStyles = () => page.evaluate(() => {
    const res = [];
    document.querySelectorAll('header, [class*=header], [class*=Header], .bigheader, .menu-segment, .megainner').forEach((e) => {
      const b = e.getBoundingClientRect();
      if (b.height < 10 || b.width < 100) return;
      const cs = getComputedStyle(e);
      res.push({ cls: String(e.className).slice(0, 60), y: Math.round(b.y), h: +b.height.toFixed(1), bg: cs.backgroundColor, bf: cs.backdropFilter || cs.webkitBackdropFilter, shadow: cs.boxShadow.slice(0, 60), op: cs.opacity, clsNow: e.className });
    });
    return res;
  });
  const hoverInfo = { targets: target, before: await hdrStyles(), steps: [] };
  for (const t of target.slice(0, 3)) {
    await page.mouse.move(t.x, t.y);
    await new Promise((r) => setTimeout(r, 800));
    hoverInfo.steps.push({ target: t.d, styles: await hdrStyles() });
  }
  await page.mouse.move(700, 600);
  await new Promise((r) => setTimeout(r, 600));
  hoverInfo.afterMoveAway = await hdrStyles();
  out.push({ label: 'hover', hoverInfo });

  fs.writeFileSync(OUT + '\\header-' + TAG + '.json', JSON.stringify(out, null, 1), 'utf8');
  console.log(JSON.stringify(out, null, 1).slice(0, 9000));

  // screenshots of header zone at top + after hover
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: OUT + '\\header-' + TAG + '-top.png', clip: { x: 0, y: 0, width: 1440, height: 240 } });
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
