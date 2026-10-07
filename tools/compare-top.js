const puppeteer = require('puppeteer-core');
const fs = require('fs');

const OUT = 'C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render';
fs.mkdirSync(OUT, { recursive: true });
const URL = process.argv[2];
const TAG = process.argv[3];

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
  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  try { await page.waitForFunction('window.__pageReady === true', { timeout: 20000 }); } catch (e) {}
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
    localStorage.setItem('popup-see', '1');
    const d = document.querySelector('.MuiDialog-container');
    if (d) d.remove();
  });
  await new Promise((r) => setTimeout(r, 2000));

  const data = await page.evaluate(() => {
    function info(el, depth) {
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const o = {
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 70),
        id: el.id || '',
        y: +(b.y + scrollY).toFixed(1),
        h: +b.height.toFixed(1),
        w: +b.width.toFixed(1),
        d: cs.display,
        m: cs.margin,
        pad: cs.padding,
      };
      if (depth > 0) {
        const kids = Array.prototype.filter.call(el.children, (k) => {
          const kb = k.getBoundingClientRect();
          return getComputedStyle(k).display !== 'none' && kb.height > 0;
        });
        if (kids.length && kids.length <= 14) o.kids = kids.map((k) => info(k, depth - 1));
        else if (kids.length) o.kids = kids.slice(0, 3).map((k) => info(k, depth - 1)).concat([{ note: '...' + (kids.length - 3) + ' more' }]);
      }
      return o;
    }
    const bodyKids = Array.prototype.filter.call(document.body.children, (k) => {
      const kb = k.getBoundingClientRect();
      return getComputedStyle(k).display !== 'none' && kb.height > 0;
    });
    return {
      bodyPad: getComputedStyle(document.body).paddingTop,
      bodyKids: bodyKids.map((k) => info(k, 2)),
    };
  });

  fs.writeFileSync(OUT + '\\top-' + TAG + '.json', JSON.stringify(data, null, 1), 'utf8');
  console.log(JSON.stringify(data, null, 1).slice(0, 12000));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
