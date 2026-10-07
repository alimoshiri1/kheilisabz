const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
https.globalAgent.options.rejectUnauthorized = false;

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'images', 'series');
fs.mkdirSync(OUT, { recursive: true });

// [local name, source file on assets.zinja.ir/global/]
const series = [
  ['test.svg', 'test.svg'],
  ['jambandi.svg', 'jambandi.svg'],
  ['nardebam.svg', 'nardebam.svg'],
  ['mozooei.svg', 'mozooei.svg'],
  ['chandkonkoor.svg', 'chandkonkoor.svg'],
  ['faslazmoon.svg', 'faslazmoon.svg'],
  ['gb.svg', 'gb.svg'],
  ['ketab-kar.svg', 'ketab kar.svg'],
  ['shabe-emtehan.svg', 'shabe emtehan.svg'],
  ['darkematn.svg', 'darkematn.svg'],
  ['amoozeshe-shegeftangiz.svg', 'amoozeshe shegeftangiz.svg'],
  ['tizhooshan.svg', 'tizhooshan.svg'],
  ['majarahaye-manodarsam.svg', 'majarahaye manodarsam.svg'],
  ['azmoone-tizhooshan.svg', 'azmoone tizhooshan.svg'],
  ['pishtaz.svg', 'pishtaz.svg'],
  ['peyke-haftegi.svg', 'peyke haftegi.svg'],
  ['torobche.svg', 'torobche.svg'],
  ['khoshkhati.svg', 'khoshkhati.svg'],
  ['maman-babaha.svg', 'maman babaha.svg'],
  ['gam-be-gam.svg', 'gam be gam.svg'],
  ['banke-nahaei.svg', 'banke%20nahaei.svg'],
  ['shabihsaz.svg', 'shabihsaz.svg'],
  ['20.svg', '20.svg'],
  ['beast-mode.svg', 'BEAST-MODE.svg'],
];

function dl(url, dest) {
  return new Promise((resolve) => {
    const file = path.join(OUT, dest);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://kheilisabz.com/' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return dl(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) { res.resume(); return resolve('ERR ' + res.statusCode + ' ' + dest); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (body.length === 0) return resolve('EMPTY ' + dest);
        if (body.toString('utf8', 0, 400).indexOf('<svg') < 0 && body.toString('utf8', 0, 400).indexOf('<?xml') < 0) {
          return resolve('NOTSVG ' + dest);
        }
        fs.writeFileSync(file, body);
        resolve('ok ' + dest + ' ' + body.length);
      });
    });
    req.on('error', (e) => resolve('NETERR ' + dest + ' ' + e.message));
    req.setTimeout(30000, () => { req.destroy(); resolve('TIMEOUT ' + dest); });
  });
}

(async () => {
  let ok = 0, fail = 0;
  for (const [local, src] of series) {
    const url = 'https://assets.zinja.ir/global/' + src.split('/').map((p) => encodeURIComponent(decodeURIComponent(p))).join('/');
    const r = await dl(url, local);
    if (r.indexOf('ok ') === 0 || fs.existsSync(path.join(OUT, local))) ok++;
    else { fail++; console.log(r); }
  }
  const files = fs.readdirSync(OUT);
  console.log('done. ok:', ok, 'fail:', fail, 'files:', files.length);
  const sizes = files.map((f) => f + ':' + fs.statSync(path.join(OUT, f)).size);
  console.log(sizes.join('  '));
})();
