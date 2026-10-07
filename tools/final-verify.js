const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = process.env.TEMP + '\\opencode\\render';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const hasOverlay = () => {
  const ov = Array.from(document.querySelectorAll('div')).find((d) => {
    const s = getComputedStyle(d);
    return (s.backdropFilter || s.webkitBackdropFilter || '').includes('blur') && d.getBoundingClientRect().width > 1000 && d.getBoundingClientRect().height > 500 && s.visibility !== 'hidden' && +s.opacity > 0.5;
  });
  return ov ? { bg: getComputedStyle(ov).backgroundColor, z: getComputedStyle(ov).zIndex, op: getComputedStyle(ov).opacity } : null;
};

(async () => {
  const br = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const results = {};

  // ---- OUR SITE ----
  {
    const p = await br.newPage();
    const errs = [];
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    await p.goto('http://localhost:8080', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);
    await p.evaluate(() => { try { localStorage.setItem('popup-see', '1'); } catch (e) {} document.querySelectorAll('#popup-root').forEach((n) => (n.innerHTML = '')); });

    // grow-back test
    await p.evaluate(() => window.scrollTo(0, 500)); await sleep(900);
    const down = await p.evaluate(() => { const h = document.querySelector('.bigheader'); return { cls: h.className, h: +h.getBoundingClientRect().height.toFixed(1) }; });
    await p.evaluate(() => window.scrollTo(0, 100)); await sleep(900);
    const mid = await p.evaluate(() => { const h = document.querySelector('.bigheader'); return { cls: h.className, h: +h.getBoundingClientRect().height.toFixed(1) }; });
    await p.evaluate(() => window.scrollTo(0, 0)); await sleep(900);
    const top = await p.evaluate(() => { const h = document.querySelector('.bigheader'); return { cls: h.className, h: +h.getBoundingClientRect().height.toFixed(1) }; });
    results.mine_shrink = { down, mid, top };

    // dropdown blur
    const dt = await p.evaluate(() => { const el = document.querySelector('.nav-dropdown'); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    if (dt) { await p.mouse.move(dt.x, dt.y); await sleep(700); }
    results.mine_dropdown = { overlay: await p.evaluate(hasOverlay), menuVisible: await p.evaluate(() => { const m = document.querySelector('.nav-dropdown-menu'); return m ? getComputedStyle(m).display : 'none'; }) };
    await p.screenshot({ path: OUT + '\\drop-mine.png' });
    await p.mouse.move(700, 700); await sleep(700);
    results.mine_dropdown_after = { overlay: await p.evaluate(hasOverlay) };

    // mega while scrolled
    await p.evaluate(() => window.scrollTo(0, 500)); await sleep(900);
    const mt = await p.evaluate(() => { const el = document.getElementById('mega-trigger'); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    if (mt) { await p.mouse.move(mt.x, mt.y); await sleep(900); }
    results.mine_mega_scrolled = await p.evaluate(() => {
      const panel = document.querySelector('.megainner.open');
      const r = panel ? panel.getBoundingClientRect() : null;
      return { panelY: r ? +r.y.toFixed(1) : null, panelH: r ? +r.height.toFixed(1) : null, overlay: (function () {
        const ov = Array.from(document.querySelectorAll('div')).find((d) => { const s = getComputedStyle(d); return (s.backdropFilter || '').includes('blur') && d.getBoundingClientRect().width > 1000 && s.visibility !== 'hidden' && +s.opacity > 0.5; });
        return ov ? true : false;
      })() };
    });
    await p.screenshot({ path: OUT + '\\mega-scrolled-mine.png' });
    results.mine_errors = errs;
    await p.close();
  }

  // ---- REF SITE: dropdown blur ----
  {
    const p = await br.newPage();
    try { await p.goto('https://kheilisabz.com', { waitUntil: 'networkidle2', timeout: 60000 }); }
    catch (e) { await p.goto('https://kheilisabz.com', { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    await sleep(1300);
    await p.evaluate(() => { try { localStorage.setItem('popup-see', '1'); } catch (e) {} document.querySelectorAll('.MuiDialog-root,[class*=popup]').forEach((n) => { if (/overlay|backdrop|dialog/i.test(String(n.className)) || n.id === 'popup-root') n.remove(); }); });
    const dt = await p.evaluate(() => {
      const els = Array.from(document.querySelectorAll('li,div,span'));
      for (const e of els) { const b = e.getBoundingClientRect(); if (b.y > 5 && b.y < 60 && b.width > 60 && b.width < 140 && /همکاری/.test(e.textContent) && e.children.length < 4 && b.x > 400 && b.x < 700) return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
      return null;
    });
    if (dt) { await p.mouse.move(dt.x, dt.y); await sleep(800); }
    results.ref_dropdown = { target: dt, overlay: await p.evaluate(hasOverlay) };
    await p.screenshot({ path: OUT + '\\drop-ref.png' });
    await p.close();
  }

  console.log(JSON.stringify(results, null, 1));
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
