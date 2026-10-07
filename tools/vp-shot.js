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
    await sleep(1200);
    await p.evaluate(() => { try { localStorage.setItem('popup-see', '1'); } catch (e) {} document.querySelectorAll('.MuiDialog-root,[class*=popup]').forEach((n) => { if (/overlay|backdrop|dialog/i.test(String(n.className)) || n.id === 'popup-root') n.remove(); }); });
    await p.evaluate(() => window.scrollTo(0, 500));
    await sleep(1100);
    await p.screenshot({ path: OUT + '\\vp-' + tag + '-scroll.png' }); // no clip = viewport
    const geo = await p.evaluate(() => {
      const hdr = document.querySelector('.bigheader');
      const bar = hdr ? hdr.getBoundingClientRect() : null;
      const pill = document.querySelector('.login-button');
      const pr = pill ? pill.getBoundingClientRect() : null;
      return { scrollY: Math.round(window.scrollY), hdr: bar ? { y: +bar.y.toFixed(1), h: +bar.height.toFixed(1) } : null, pill: pr ? { x: +pr.x.toFixed(1), y: +pr.y.toFixed(1), h: +pr.height.toFixed(1) } : null };
    });
    console.log(tag, JSON.stringify(geo));
    await p.close();
  }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
