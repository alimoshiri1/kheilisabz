const puppeteer = require('puppeteer-core');
const SITE = 'http://localhost:8080/index.html';
const PHONE = '0912' + String(Date.now()).slice(-7);
const PHONE_FA = PHONE.replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });

const log = (...a) => console.log(...a);
let failed = 0;
function ok(cond, msg) {
  if (cond) log('  PASS ' + msg);
  else { failed++; log('  FAIL ' + msg); }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,1000'],
    defaultViewport: { width: 1440, height: 1000 },
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(45000);
  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('popup-see', '1'); });
  await page.goto(SITE, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.querySelectorAll('.popup-backdrop, .MuiDialog-root').forEach(n => n.remove()));
  await page.waitForFunction(() => window.__pageReady === true, { timeout: 30000 });

  log('1) open popup from header');
  const t0 = Date.now();
  const targetP = new Promise(res => browser.once('targetcreated', t => res(t)));
  await page.click('.login-button');
  const target = await targetP;
  const popup = await target.page();
  await popup.waitForSelector('#PhoneNumber', { timeout: 15000 });
  await popup.setViewport({ width: 500, height: 500 });
  await new Promise(r => setTimeout(r, 400));
  ok(Date.now() - t0 < 6000, 'popup opened quickly');
  ok(/login-popup\.html/.test(popup.url()), 'popup url = ' + popup.url());
  ok((await popup.title()) === 'Kheilisabz Login', 'popup title = ' + JSON.stringify(await popup.title()));

  log('2) design checks');
  const design = await popup.evaluate(() => {
    const cs = sel => { const e = document.querySelector(sel); return e ? getComputedStyle(e) : null; };
    const g = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    return {
      dir: getComputedStyle(document.body).direction,
      font: getComputedStyle(document.body).fontFamily,
      header: document.querySelector('.page-header h5').innerText.trim(),
      logoW: document.querySelector('.header-login img').getAttribute('width'),
      btn: document.querySelector('#getCode').innerText,
      btnBg: cs('#getCode').backgroundColor,
      btnRadius: cs('#getCode').borderRadius,
      btnDisabled: document.querySelector('#getCode').disabled,
      ph: document.querySelector('#PhoneNumber').placeholder,
      geo: { form: g('form'), input: g('#PhoneNumber'), btn: g('#getCode'), label: g('label') },
      link: document.querySelector('#login-sub a').textContent,
    };
  });
  ok(design.dir === 'rtl', 'body direction rtl');
  ok(/Vazir/.test(design.font), 'Vazir font: ' + design.font);
  ok(design.header === 'ورود به سایت', 'header text: ' + design.header);
  ok(design.logoW === '55', 'logo width 55');
  ok(design.btn === 'دریافت کد اعتبارسنجی', 'button text: ' + design.btn);
  ok(design.btnBg === 'rgb(33, 150, 243)', 'button color #2196f3: ' + design.btnBg);
  ok(design.btnRadius === '8px', 'button radius 8px: ' + design.btnRadius);
  ok(design.btnDisabled === true, 'button disabled while phone empty');
  ok(design.ph === '۰۹۱۲۳۴۵۶۷۸۹', 'placeholder fa digits: ' + design.ph);
  ok(design.link === 'kheilisabz.com', 'site link text: ' + design.link);
  ok(JSON.stringify(design.geo.form) === '[30,74,440,336]', 'form geo ' + JSON.stringify(design.geo.form));

  log('3) type phone (persian digits)');
  await popup.click('#PhoneNumber');
  await popup.keyboard.type(PHONE_FA);
  const st = await popup.evaluate(() => ({ v: document.querySelector('#PhoneNumber').value, dis: document.querySelector('#getCode').disabled }));
  ok(st.v === PHONE, 'phone normalized: ' + JSON.stringify(st.v));
  ok(st.dis === false, 'button enabled at 11 digits');

  log('4) request code');
  await popup.click('#getCode');
  await popup.waitForSelector('#Code', { timeout: 15000 });
  const s2 = await popup.evaluate(() => ({
    label: document.querySelector('#login-label').textContent,
    sub: document.querySelector('#login-sub').textContent,
    timer: (document.querySelector('#timer-text') || {}).textContent,
    nameField: !!document.querySelector('#Name'),
    btn: document.querySelector('#login').innerText,
  }));
  ok(s2.label === 'کد تایید', 'step2 label: ' + s2.label);
  ok(s2.sub.indexOf(PHONE_FA) >= 0, 'step2 shows phone: ' + s2.sub);
  ok(/^\d{2}:\d{2}$/.test(s2.timer.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))), 'timer running: ' + s2.timer);
  ok(s2.nameField === true, 'name field for new user');
  ok(s2.btn === 'ورود', 'step2 button: ' + s2.btn);

  log('5) wrong code');
  await popup.click('#Code');
  await popup.keyboard.type('۹۹۹۹');
  await popup.click('#login');
  const err1 = await popup.evaluate(() => ({ hidden: document.querySelector('#login-error').classList.contains('hidden'), text: document.querySelector('#login-error-text').textContent }));
  ok(!err1.hidden && /اشتباه/.test(err1.text), 'wrong code error: ' + err1.text);

  log('6) correct code + name');
  await popup.evaluate(() => { document.querySelector('#Code').value = ''; });
  await popup.click('#Code');
  await popup.keyboard.type('۱۲۳۴');
  await popup.click('#Name');
  await popup.keyboard.type('علی');
  const en = await popup.evaluate(() => document.querySelector('#login').disabled);
  ok(en === false, 'login button enabled');
  const closedP = new Promise(res => browser.once('targetdestroyed', t => { if (t._targetId === target._targetId) res(true); }));
  await popup.click('#login');
  const closed = await Promise.race([closedP, new Promise(r => setTimeout(() => r(false), 8000))]);
  ok(closed, 'popup closed after login');

  log('7) opener state');
  await new Promise(r => setTimeout(r, 800));
  const opener = await page.evaluate(() => ({
    label: document.querySelector('#login-label').textContent,
    user: localStorage.getItem('user'),
  }));
  ok(opener.label === 'علی', 'header shows user name: ' + opener.label);
  ok((opener.user || '').indexOf(PHONE) >= 0, 'localStorage user saved');

  const api = await (await fetch('http://127.0.0.1:3000/users')).json();
  ok(api.some(u => u.phone === PHONE && u.name === 'علی'), 'user persisted in API');

  log('8) reopen popup as logged-in user (should not open)');
  const t2 = browser.once('targetcreated', () => {});
  await page.click('.login-button');
  await new Promise(r => setTimeout(r, 1500));
  let reopened = false;
  try { await page.browser().targets(); } catch (e) {}
  const targets = browser.targets().filter(t => /login-popup/.test(t.url()));
  ok(targets.length === 0, 'popup not opened when logged in');

  log('9) logout then popup opens again');
  await page.evaluate(() => localStorage.removeItem('user'));
  await page.evaluate(() => document.querySelector('#login-label').textContent = 'ورود یا ثبت‌نام');
  const t3 = new Promise(res => browser.once('targetcreated', t => res(t)));
  await page.click('.login-button');
  const target3 = await t3;
  ok(/login-popup/.test(target3.url()), 'popup opens again after logout');

  log('10) cleanup');
  try {
    const all = await (await fetch('http://127.0.0.1:3000/users')).json();
    for (const u of all) {
      if (u.phone === PHONE) await fetch('http://127.0.0.1:3000/users/' + u.id, { method: 'DELETE' });
    }
    const left = await (await fetch('http://127.0.0.1:3000/users')).json();
    ok(!left.some(u => u.phone === PHONE), 'test user removed from API');
  } catch (e) {
    ok(false, 'cleanup failed: ' + e.message);
  }

  await browser.close();
  log(failed ? ('\n' + failed + ' FAILED') : '\nALL PASS');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
