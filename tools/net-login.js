const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox'],
    defaultViewport: { width: 1440, height: 1000 },
  });
  const page = await browser.newPage();
  const reqs = [];
  page.on('request', r => reqs.push(r.url()));
  page.on('requestfailed', r => console.log('FAILED:', r.url(), '|', (r.failure() || {}).errorText));
  page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
  await page.goto('https://kheilisabz.com/login', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => console.log('nav:', e.message));
  await new Promise(r => setTimeout(r, 15000));
  console.log('--- AUTH-ISH REQUESTS ---');
  for (const u of reqs) {
    if (/auth|ids|sso|oauth|oidc|identity|well-known|authorize|connect/i.test(u)) console.log(u);
  }
  console.log('total requests:', reqs.length);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
