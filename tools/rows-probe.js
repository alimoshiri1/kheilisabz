const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SITES = { ref: 'https://kheilisabz.com', mine: 'http://localhost:8080' };
(async () => {
  const br = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: 'new', args: ['--no-sandbox'], defaultViewport: { width: 1440, height: 900 } });
  for (const [tag, url] of Object.entries(SITES)) {
    const p = await br.newPage();
    try { await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    await sleep(1300);
    await p.evaluate(() => { try { localStorage.setItem('popup-see','1'); } catch(e){} document.querySelectorAll('.MuiDialog-root,[class*=popup]').forEach(n=>{ if(/overlay|backdrop|dialog/i.test(String(n.className))||n.id==='popup-root') n.remove(); }); });
    await sleep(300);
    const t = await p.evaluate(() => {
      const lis = Array.from(document.querySelectorAll('li,div,span'));
      for (const li of lis) { const b = li.getBoundingClientRect(); if (b.y > 5 && b.y < 60 && b.width > 50 && b.width < 130 && /کتاب/.test(li.textContent) && li.children.length < 3) return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
      return null;
    });
    if (t) { await p.mouse.move(t.x, t.y); await sleep(900); }
    const g = await p.evaluate(() => {
      const panel = Array.from(document.querySelectorAll('div')).find((e) => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 1200 && b.height > 250 && b.height < 400 && b.y >= 35 && b.y < 90 && c.display !== 'none' && c.backgroundColor === 'rgb(255, 255, 255)'; });
      if (!panel) return { err: 'no panel' };
      const cols = panel.querySelectorAll('.submenubar, ul.list-none, [class*=submenu]');
      const first = cols[0];
      const links = first ? Array.from(first.children).slice(0, 12).map((a) => ({ t: (a.textContent || '').trim().slice(0, 14), h: +a.getBoundingClientRect().height.toFixed(1), y: +a.getBoundingClientRect().y.toFixed(1), cls: String(a.className).slice(0, 25) })) : [];
      const menubar = panel.querySelector('ul');
      return {
        panel: { y: +panel.getBoundingClientRect().y.toFixed(1), h: +panel.getBoundingClientRect().height.toFixed(1) },
        colCount: cols.length,
        firstCol: first ? { h: +first.getBoundingClientRect().height.toFixed(1), y: +first.getBoundingClientRect().y.toFixed(1) } : null,
        links,
        menubarItems: menubar ? Array.from(menubar.children).slice(0, 6).map((li) => ({ t: (li.textContent || '').trim().slice(0, 14), h: +li.getBoundingClientRect().height.toFixed(1) })) : [],
      };
    });
    console.log('=== ' + tag, JSON.stringify(g, null, 1));
    await p.close();
  }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });

