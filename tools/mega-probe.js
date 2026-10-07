const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = process.env.TEMP + '\\opencode\\render';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SITES = { ref: 'https://kheilisabz.com', mine: 'http://localhost:8080' };

(async () => {
  const br = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });
  for (const [tag, url] of Object.entries(SITES)) {
    const p = await br.newPage();
    try { await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); }
    catch (e) { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    await sleep(1300);
    await p.evaluate(() => { try { localStorage.setItem('popup-see', '1'); } catch (e) {} document.querySelectorAll('.MuiDialog-root,[class*=popup]').forEach((n) => { if (/overlay|backdrop|dialog/i.test(String(n.className)) || n.id === 'popup-root') n.remove(); }); });
    await sleep(300);

    // hover کتاب‌ها
    const t = await p.evaluate(() => {
      const lis = Array.from(document.querySelectorAll('li,div,span'));
      for (const li of lis) {
        const b = li.getBoundingClientRect();
        if (b.y > 5 && b.y < 60 && b.width > 50 && b.width < 130 && /کتاب/.test(li.textContent) && li.children.length < 3) return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }
      return null;
    });
    if (t) { await p.mouse.move(t.x, t.y); await sleep(1000); }

    const g = await p.evaluate(() => {
      const R = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
      const out = { scrollY: Math.round(window.scrollY), panels: [], bar: null };
      // bar = visible fixed/sticky white bar at top
      document.querySelectorAll('div,header').forEach((e) => {
        const c = getComputedStyle(e), b = e.getBoundingClientRect();
        if (b.width > 1300 && b.height > 30 && b.height < 80 && b.y >= -2 && b.y < 3 && c.display !== 'none' && c.backgroundColor === 'rgb(255, 255, 255)') {
          if (!out.bar || b.height < out.bar.h) out.bar = { ...R(e), pos: c.position, cls: String(e.className).slice(0, 40) };
        }
      });
      // big panel below bar
      document.querySelectorAll('div,section,ul').forEach((e) => {
        const c = getComputedStyle(e), b = e.getBoundingClientRect();
        if (b.width > 900 && b.height > 150 && b.height < 600 && b.y >= 35 && b.y < 90 && c.display !== 'none' && c.visibility !== 'hidden' && c.backgroundColor === 'rgb(255, 255, 255)') {
          out.panels.push({ ...R(e), pos: c.position, cls: String(e.className).replace(/\s+/g, ' ').slice(0, 60) });
        }
      });
      // panel sample text
      const pp = out.panels[0];
      if (pp) {
        const el = document.elementFromPoint(720, 150);
        out.at150 = el ? (el.tagName + '|' + String(el.className).slice(0, 30) + '|' + (el.textContent || '').trim().slice(0, 40)) : null;
      }
      return out;
    });
    console.log('=== ' + tag, JSON.stringify(g, null, 1));
    await p.screenshot({ path: OUT + '\\mega-' + tag + '.png' });
    await p.close();
  }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
