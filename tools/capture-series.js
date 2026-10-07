const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';
fs.mkdirSync(OUT, { recursive: true });

const URL = process.argv[2] || 'https://kheilisabz.com/';
const TAG = process.argv[3] || 'ref';
const SEL = process.argv[4] || '.tile-series';

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
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('popup-see', '1'); } catch (e) {} });
  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.log('networkidle2 timeout, falling back to domcontentloaded');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  try {
    await page.waitForSelector(SEL + ' a img', { timeout: 30000 });
  } catch (e) { console.log('selector timeout: ' + SEL + ' a img'); }
  try {
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForFunction((sel) => {
      const imgs = Array.prototype.slice.call(document.querySelectorAll(sel + ' img'));
      return imgs.length >= 24 && imgs.every(function (i) { return i.complete && i.naturalWidth > 0; });
    }, { timeout: 30000 }, SEL);
  } catch (e) { console.log('fonts/images wait issue: ' + e.message); }
  try {
    await page.waitForFunction('window.__pageReady === true', { timeout: 30000 });
  } catch (e) { console.log('pageReady timeout (ref site may not define it)'); }
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
    localStorage.setItem('popup-see', '1');
    ['.MuiDialog-root', '.MuiDialog-container', '.popup-backdrop', '[role=dialog]'].forEach(function (s) {
      document.querySelectorAll(s).forEach(function (n) { n.remove(); });
    });
  });
  await new Promise((r) => setTimeout(r, 2500));

  const data = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return { error: 'not found: ' + sel };
    const rr = root.getBoundingClientRect();
    const parent = root.parentElement;
    const pr = parent.getBoundingClientRect();
    const pcs = getComputedStyle(parent);
    const cs = getComputedStyle(root);
    const links = Array.prototype.slice.call(root.children);
    const items = links.map((a) => {
      const b = a.getBoundingClientRect();
      const img = a.querySelector('img');
      const ib = img ? img.getBoundingClientRect() : null;
      const ics = img ? getComputedStyle(img) : null;
      const acs = getComputedStyle(a);
      return {
        href: a.getAttribute('href'),
        cls: a.className,
        txt: (a.textContent || '').trim().slice(0, 40),
        imgSrc: img ? img.getAttribute('src') : null,
        imgComplete: img ? img.complete && img.naturalWidth > 0 : null,
        natural: img ? img.naturalWidth + 'x' + img.naturalHeight : null,
        a: { x: Math.round(b.x), y: Math.round(b.y + scrollY), w: +b.width.toFixed(2), h: +b.height.toFixed(2), m: acs.margin },
        raw: { x: b.x, y: b.y + scrollY, w: b.width, h: b.height },
        i: ib ? { x: Math.round(ib.x), y: Math.round(ib.y + scrollY), w: +ib.width.toFixed(2), h: +ib.height.toFixed(2) } : null,
        border: ics ? ics.border : null,
        bg: ics ? ics.backgroundColor : null,
        aComputed: { d: acs.display, lh: acs.lineHeight, fs: acs.fontSize, pad: acs.padding, ta: acs.textAlign },
        iComputed: ics ? { d: ics.display, w: ics.width, h: ics.height, va: ics.verticalAlign, lh: ics.lineHeight } : null,
      };
    });
    // rows by y
    const rows = {};
    items.forEach((it) => { const k = it.a.y; (rows[k] = rows[k] || []).push(it); });
    return {
      count: items.length,
      rawRoot: { x: rr.x, y: rr.y + scrollY, w: rr.width, h: rr.height },
      root: { x: Math.round(rr.x), y: Math.round(rr.y + scrollY), w: +rr.width.toFixed(2), h: +rr.height.toFixed(2), margin: cs.margin, display: cs.display, justify: cs.justifyContent, fs: cs.fontSize, lh: cs.lineHeight },
      parent: { cls: parent.className, x: Math.round(pr.x), y: Math.round(pr.y + scrollY), w: +pr.width.toFixed(2), h: +pr.height.toFixed(2), padding: pcs.padding, maxW: pcs.maxWidth },
      grand: (function () { const g = parent.parentElement; if (!g) return null; const gr = g.getBoundingClientRect(); const gcs = getComputedStyle(g); return { cls: g.className, x: Math.round(gr.x), y: Math.round(gr.y + scrollY), w: +gr.width.toFixed(2), h: +gr.height.toFixed(2), pad: gcs.padding, d: gcs.display }; })(),
      base: { htmlLh: getComputedStyle(document.documentElement).lineHeight, htmlFs: getComputedStyle(document.documentElement).fontSize, bodyLh: getComputedStyle(document.body).lineHeight, bodyFs: getComputedStyle(document.body).fontSize, font: getComputedStyle(document.body).fontFamily },
      rows: Object.keys(rows).map((k) => ({ y: k, n: rows[k].length, xs: rows[k].map((r) => r.a.x) })),
      items,
      html: root.outerHTML.slice(0, 3000),
    };
  }, SEL);

  fs.writeFileSync(path.join(OUT, 'series-' + TAG + '.json'), JSON.stringify(data, null, 1), 'utf8');
  const el = await page.$(SEL);
  if (el) await el.screenshot({ path: path.join(OUT, 'series-' + TAG + '.png') });
  if (data.rawRoot) {
    const c = data.rawRoot;
    await page.screenshot({
      path: path.join(OUT, 'series-' + TAG + '-doc.png'),
      clip: { x: c.x, y: c.y, width: c.w, height: c.h },
      captureBeyondViewport: true,
    });
  }
  await page.screenshot({ path: path.join(OUT, 'page-' + TAG + '.png'), fullPage: true });

  console.log(JSON.stringify({ count: data.count, root: data.root, parent: data.parent, grand: data.grand, base: data.base, rows: data.rows, first: data.items && data.items[0] }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
