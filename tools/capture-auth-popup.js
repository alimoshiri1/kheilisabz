const puppeteer = require('puppeteer-core');
const fs = require('fs');
const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';

const AUTH = 'https://auth.kheilisabz.com/Account/RequestCode?returnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3D';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 600, height: 700 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
  await page.goto(AUTH, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => console.log('nav:', e.message));
  await new Promise(r => setTimeout(r, 3000));

  const data = await page.evaluate(() => {
    const out = {};
    out.url = location.href;
    out.title = document.title;
    out.html = document.documentElement.outerHTML;
    out.bodyText = document.body.innerText;
    out.stylesheets = [...document.styleSheets].map(s => {
      try { return { href: s.href, rules: [...s.cssRules].map(r => r.cssText).join('\n') }; }
      catch (e) { return { href: s.href, rules: 'CORS' }; }
    });
    const geo = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    out.geo = {};
    for (const sel of ['header', 'main', 'form', 'input', 'button', 'h1', 'h2', 'h3', 'h4', 'label', 'img', 'a', 'p']) {
      out.geo[sel] = [...document.querySelectorAll(sel)].map(el => ({
        tag: el.tagName, cls: el.className, text: (el.innerText || el.value || '').slice(0, 80), geo: geo(el)
      }));
    }
    // computed styles of key elements
    out.computed = {};
    const keys = ['body', 'main', 'form', 'input', 'button', 'h1', 'h2', 'h3', 'h4', 'label', 'p', 'a', 'img', 'header', 'div'];
    for (const k of keys) {
      const el = document.querySelector(k);
      if (!el) continue;
      const c = getComputedStyle(el);
      const o = {};
      for (const p of ['backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight','textAlign','direction','padding','margin','border','borderRadius','width','height','maxWidth','display','boxShadow','letterSpacing','position','top','left','right','bottom','opacity','outline','textDecoration','justifyContent','alignItems','gap','borderBottom','borderTop','minHeight','boxSizing','appearance','webkitAppearance','transform','zIndex','overflow'])
        o[p] = c.getPropertyValue(p);
      out.computed[k] = { cls: el.className, style: o, html: el.outerHTML.slice(0, 1500) };
    }
    return out;
  });
  fs.writeFileSync(OUT + '\\auth-popup.json', JSON.stringify(data, null, 1));
  await page.screenshot({ path: OUT + '\\auth-popup.png' });
  await browser.close();
  console.log('done', data.url, data.title);
})();
