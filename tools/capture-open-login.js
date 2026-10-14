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
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');

  await page.evaluateOnNewDocument(() => {
    window.__opens = [];
    const orig = window.open;
    window.open = function (url, name, feats) {
      window.__opens.push({ url: String(url), name: String(name || ''), feats: String(feats || '') });
      return null;
    };
    try { localStorage.setItem('popup-see', '1'); } catch (e) {}
  });

  await page.goto('https://kheilisabz.com/', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => console.log(e.message));
  await new Promise(r => setTimeout(r, 3000));

  const info = await page.evaluate(() => {
    document.querySelectorAll('.MuiDialog-root,[class*=popup]').forEach(n => { if (/overlay|backdrop|dialog/i.test(String(n.className)) || n.id === 'popup-root') n.remove(); });
    const btn = document.querySelector('header a[href*=login], header button, a[href*="login"], [class*=login] a, [class*=login] button');
    const all = [...document.querySelectorAll('header *')].filter(e => (e.innerText || '').trim() === 'ورود یا ثبت‌نام' || (e.innerText || '').trim() === 'ورود');
    const cand = all[all.length - 1] || btn;
    return {
      btnHTML: cand ? cand.outerHTML.slice(0, 800) : null,
      btnTag: cand ? cand.tagName : null,
      headerLoginHTML: (document.querySelector('[class*=login]') || {}).outerHTML,
      links: [...document.querySelectorAll('header a')].map(a => ({ t: (a.innerText || '').trim().slice(0, 30), href: a.getAttribute('href'), cls: a.className })),
    };
  });

  // click the login button
  const clicked = await page.evaluate(() => {
    const all = [...document.querySelectorAll('header *')].filter(e => (e.innerText || '').trim() === 'ورود یا ثبت‌نام');
    const cand = all[all.length - 1];
    if (!cand) return 'not-found';
    (cand.closest('a') || cand).click();
    return 'clicked:' + cand.tagName + '.' + cand.className;
  });
  await new Promise(r => setTimeout(r, 4000));
  const opens = await page.evaluate(() => window.__opens);
  fs.writeFileSync(OUT + '\\open-login.json', JSON.stringify({ info, clicked, opens }, null, 1));
  await browser.close();
  console.log(JSON.stringify({ clicked, opens }, null, 1));
})();
