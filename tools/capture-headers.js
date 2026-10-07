const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(process.env.TEMP || '', 'opencode', 'render');
fs.mkdirSync(OUT, { recursive: true });

const SITES = {
  ref: 'https://kheilisabz.com',
  mine: 'http://localhost:8080',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ready(page) {
  try { await page.waitForFunction('window.__pageReady === true', { timeout: 15000 }); } catch (e) {}
  try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
  try {
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images).map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
    });
  } catch (e) {}
  await page.evaluate(() => {
    try { localStorage.setItem('popup-see', '1'); } catch (e) {}
    document.querySelectorAll('.MuiDialog-root, .popup-backdrop, [class*=popup]').forEach((n) => {
      if (n.id === 'popup-root' || /overlay|backdrop|dialog/i.test(String(n.className))) n.remove();
    });
  });
  await sleep(900);
}

function dump(page, tag) {
  return page.evaluate((t) => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) };
    };
    const hdr = document.querySelector('.bigheader, header, [class*=sticky]');
    const out = { tag: t, scrollY: Math.round(window.scrollY), header: r(hdr), items: [] };
    if (hdr) {
      hdr.querySelectorAll('li, a, img').forEach((el) => {
        const b = r(el);
        if (b && b.w > 8 && b.h > 8 && b.y > -5 && b.y < 120) out.items.push({
          s: el.tagName + '.' + String(el.className).split(/\s+/).slice(0, 2).join('.') + '|' + (el.textContent || '').trim().slice(0, 14),
          ...b,
        });
      });
    }
    return out;
  }, tag);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const geo = {};

  for (const [tag, url] of Object.entries(SITES)) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (e) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await ready(page);
    geo[tag + '-top'] = await dump(page, tag + '-top');
    await page.screenshot({ path: path.join(OUT, `hd2-${tag}.png`), clip: { x: 0, y: 0, width: 1440, height: 80 } });
    await page.screenshot({ path: path.join(OUT, `hd2-${tag}-full.png`) });

    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(1000);
    geo[tag + '-scroll'] = await dump(page, tag + '-scroll');
    await page.screenshot({ path: path.join(OUT, `hd2-${tag}-scroll.png`), clip: { x: 0, y: 0, width: 1440, height: 80 } });

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    geo[tag + '-top2'] = await dump(page, tag + '-top2');

    // hover first nav li (کتاب‌ها) with real mouse
    const target = await page.evaluate(() => {
      const lis = Array.from(document.querySelectorAll('li, .nav-item, [class*=menu] a'));
      for (const li of lis) {
        const b = li.getBoundingClientRect();
        if (b.y > 5 && b.y < 60 && b.width > 50 && /کتاب/.test(li.textContent)) return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      }
      return null;
    });
    if (target) {
      await page.mouse.move(target.x, target.y);
      await sleep(900);
    }
    await page.screenshot({ path: path.join(OUT, `hd2-${tag}-mega.png`) });
    geo[tag + '-mega'] = await page.evaluate(() => {
      const ovs = Array.from(document.querySelectorAll('div, section')).filter((d) => {
        const s = getComputedStyle(d);
        return s.position === 'fixed' && (s.backdropFilter || s.webkitBackdropFilter || '').includes('blur') && d.getBoundingClientRect().width > 800;
      }).map((d) => {
        const s = getComputedStyle(d);
        return { bg: s.backgroundColor, blur: s.backdropFilter || s.webkitBackdropFilter, z: s.zIndex, op: s.opacity, cls: String(d.className).slice(0, 60) };
      });
      return ovs;
    });
    await page.mouse.move(720, 700);
    await sleep(400);
    await page.close();
  }

  fs.writeFileSync(path.join(OUT, 'hd2-geo.json'), JSON.stringify(geo, null, 1));
  console.log('written:', Object.keys(geo).join(', '));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
