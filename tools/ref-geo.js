const puppeteer = require('puppeteer-core');
const fs = require('fs');

const SELECTOR_DUMP = `
(function () {
  const out = [];
  const push = (label, el) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    out.push({ label, x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) });
  };
  const first = (sel) => document.querySelector(sel);
  push('header', first('header'));
  push('segment', first('.search-segment'));
  push('hero', first('.hero-swiper, .home-slider, [class*=hero]'));
  push('searchBox', first('.search-box-outer, [class*=search-box]'));
  push('main', first('main') || first('.main-container') || first('.main-segment'));
  push('footer', first('footer'));
  // titles by text
  const wanted = ['ویژه‌ها', 'پیشنهادات', 'تازه ها', 'تازه‌ها'];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,div,span,a')) {
    const t = (el.textContent || '').trim();
    if (wanted.includes(t) && el.children.length <= 2) push('title:' + t, el);
  }
  // class-based
  const classRe = /(slider|banner|chip|series|grade|special|tile|segment|title|book|card|copy|divider|trust|social|bottom-nav|zinja)/i;
  const seen = new Set();
  for (const el of document.querySelectorAll('[class]')) {
    const cn = el.className && el.className.toString ? el.className.toString() : '';
    if (!cn || !classRe.test(cn)) continue;
    if (seen.has(cn)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    seen.add(cn);
    out.push({ label: 'cls:' + cn.slice(0, 90), x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    if (out.length > 400) break;
  }
  // footer tree
  const f = first('footer');
  if (f) {
    const walk = (el, depth, path) => {
      if (depth > 4) return;
      for (const c of el.children) {
        const cn = (c.className && c.className.toString ? c.className.toString() : c.tagName);
        const r = c.getBoundingClientRect();
        if (r.width >= 6 && r.height >= 5) {
          out.push({ label: 'foot:' + path + '/' + String(cn).slice(0, 60), x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) });
        }
        walk(c, depth + 1, path + '/' + String(cn).slice(0, 25));
      }
    };
    walk(f, 0, 'f');
  }
  return { doc: document.documentElement.scrollHeight, out };
})()
`;

(async () => {
  const width = parseInt(process.argv[2] || '1440', 10);
  const height = parseInt(process.argv[3] || '1592', 10);
  const dpr = parseFloat(process.argv[4] || '1');
  const outFile = process.argv[5] || '_ref/live-geo.json';
  const shot = process.argv[6] || '';
  const url = process.argv[7] || 'https://kheilisabz.com/';
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: 'new', args: ['--allow-running-insecure-content', '--disable-web-security'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: width < 600, hasTouch: width < 600 });
  const logs = [];
  page.on('console', (m) => { if (logs.length < 12) logs.push(m.type() + ':' + m.text().slice(0, 160)); });
  page.on('pageerror', (e) => { if (logs.length < 12) logs.push('pageerror:' + e.message.slice(0, 160)); });
  const bad = [];
  page.on('response', (r) => { if (r.status() >= 400 && bad.length < 15) bad.push(r.status() + ' ' + r.url().slice(0, 140)); });
  if (url.includes('web.archive.org')) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (u.startsWith('https://kheilisabz.com/') || u.startsWith('http://kheilisabz.com/')) {
        const target = 'https://web.archive.org/web/20260101202350/' + u;
        req.continue({ url: target }).catch(() => req.abort());
      } else {
        req.continue();
      }
    });
  }
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  try {
    await page.waitForSelector('footer', { timeout: 45000 });
    console.log('footer found');
  } catch (e) { console.log('footer NOT found'); }
  await new Promise((r) => setTimeout(r, 6000));
  console.log('bodyLen:', await page.evaluate(() => document.body.innerText.length));
  console.log('logs:', logs.slice(0, 8).join(' || '));
  console.log('bad:', bad.join(' || '));
  // close popup if present
  try {
    const closed = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button, [role=button], .close, [class*=close], [class*=Close]')];
      for (const b of btns) {
        const t = (b.textContent || '').trim();
        if (t.includes('متوجه') || t.includes('باشه') || t.includes('بستن') || t === '×' || t === 'X') { b.click(); return t; }
      }
      const bd = document.querySelector('[class*=backdrop], [class*=popup]');
      if (bd && bd.parentElement) { const c = bd.parentElement.querySelector('[class*=close]'); if (c) { c.click(); return 'cls'; } }
      return null;
    });
    console.log('popup closed:', closed);
  } catch (e) { console.log('popup err', e.message); }
  await new Promise((r) => setTimeout(r, 1500));
  const data = await page.evaluate(SELECTOR_DUMP);
  fs.writeFileSync(outFile, JSON.stringify(data, null, 1), 'utf8');
  if (shot) { await page.screenshot({ path: shot, fullPage: true }); console.log('shot saved', shot); }
  console.log('doc:', data.doc, 'items:', data.out.length);
  await browser.close();
})();
