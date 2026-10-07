process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('https').globalAgent.options.rejectUnauthorized = false;
const https = require('https');
const fs = require('fs');
const urls = [
  ['https://Trustseal.eNamad.ir/logo.aspx?id=11515&Code=kDwAsUdEycMi8VE9vkkk', 'images/trust-enamad-1.png'],
  ['https://Trustseal.eNamad.ir/logo.aspx?id=343477&Code=J9BUfyNhmgU82LiMpmL7', 'images/trust-enamad-2.png'],
  ['https://logo.samandehi.ir/logo.aspx?id=318137&p=qftinbpdaqgwnbpdqftiyndt', 'images/trust-samandehi.png'],
];
let done = 0;
const t = setTimeout(() => {
  console.log('GLOBAL TIMEOUT after 60s');
  process.exit(1);
}, 60000);
for (const [u, f] of urls) {
  const req = https.get(
    u,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Referer: 'https://kheilisabz.com/',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    },
    (r) => {
      console.log(f, r.statusCode, r.headers['content-type']);
      if (r.statusCode !== 200) {
        r.resume();
        if (++done === urls.length) { clearTimeout(t); console.log('end'); }
        return;
      }
      const c = [];
      r.on('data', (d) => c.push(d));
      r.on('end', () => {
        fs.writeFileSync(f, Buffer.concat(c));
        console.log('saved', f, Buffer.concat(c).length);
        if (++done === urls.length) { clearTimeout(t); console.log('done'); }
      });
    }
  );
  req.on('error', (e) => {
    console.log(f, 'ERR', e.message);
    if (++done === urls.length) { clearTimeout(t); console.log('end'); }
  });
  req.setTimeout(15000, () => req.destroy(new Error('timeout')));
}
