const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
https.globalAgent.options.rejectUnauthorized = false;

const ROOT = path.resolve(__dirname, '..');
const folders = ['images', 'images/slider', 'images/products', 'images/social', 'fonts', 'vendor'];
folders.forEach(f => fs.mkdirSync(path.join(ROOT, f), { recursive: true }));

const downloads = [
  // logos & icons
  ['https://kheilisabz.com/static/media/logo-desktop-kheilisabz.34e089de.svg', 'images/logo-desktop.svg'],
  ['https://kheilisabz.com/static/media/logo-mobile-kheilisabz.3ab650b0.svg', 'images/logo-mobile.svg'],
  ['https://kheilisabz.com/static/media/logo.9ca33c64.svg', 'images/logo-footer.svg'],
  ['https://kheilisabz.com/static/media/mega-menu.56a25361.svg', 'images/icon-menu.svg'],
  ['https://kheilisabz.com/static/media/icon.cart.cfab81a7.svg', 'images/icon-cart.svg'],
  ['https://kheilisabz.com/static/media/icon.user.b38dcc26.svg', 'images/icon-user.svg'],
  ['https://kheilisabz.com/static/media/icon.blog.4a57ecea.svg', 'images/icon-blog.svg'],
  ['https://kheilisabz.com/static/media/icon.search.82d8444f.svg', 'images/icon-search-nav.svg'],
  ['https://kheilisabz.com/static/media/icon.fill.home.0347bc1e.svg', 'images/icon-home.svg'],
  ['https://kheilisabz.com/static/media/search.9bdd4318.svg', 'images/icon-search.svg'],
  ['https://kheilisabz.com/static/media/new.35b87e7e.png', 'images/new.png'],
  ['https://kheilisabz.com/static/media/stump.715a2ac5.svg', 'images/stump.svg'],
  ['https://kheilisabz.com/static/media/popup.64174bad.svg', 'images/popup.svg'],
  ['https://kheilisabz.com/static/media/popup-mobile.0d200bf5.svg', 'images/popup-mobile.svg'],
  ['https://kheilisabz.com/static/media/Rectangle917.64fe34dd.jpg', 'images/banner-1.jpg'],
  ['https://kheilisabz.com/static/media/Rectangle916.35183757.jpg', 'images/banner-2.jpg'],
  ['https://kheilisabz.com/static/media/hoosh.a645eae2.jpg', 'images/banner-3.jpg'],
  ['https://kheilisabz.com/static/media/bg-spotted.00d86640.svg', 'images/bg-spotted.svg'],
  ['https://kheilisabz.com/static/media/Ripple-1s-100px.3dbab049.svg', 'images/spinner.svg'],
  ['https://kheilisabz.com/favicon-kheilisabz.png?v=1', 'images/favicon.png'],
  // social
  ['https://kheilisabz.com/static/media/telegram.7c6a5b14.svg', 'images/social/telegram.svg'],
  ['https://kheilisabz.com/static/media/youtube.0b0fad06.svg', 'images/social/youtube.svg'],
  ['https://kheilisabz.com/static/media/instagram.b9857dd4.svg', 'images/social/instagram.svg'],
  ['https://kheilisabz.com/static/media/aparat.8e081cf2.svg', 'images/social/aparat.svg'],
  ['https://kheilisabz.com/static/media/eitaa.87b8b8a3.svg', 'images/social/eitaa.svg'],
  ['https://kheilisabz.com/static/media/rubika.0bbd9549.svg', 'images/social/rubika.svg'],
  ['https://kheilisabz.com/static/media/bale.20e5a019.svg', 'images/social/bale.svg'],
  // fonts
  ['https://kheilisabz.com/static/media/Vazir.c353f7ef.woff2', 'fonts/Vazir.woff2'],
  ['https://kheilisabz.com/static/media/Vazir.03ed11c5.woff', 'fonts/Vazir.woff'],
  ['https://kheilisabz.com/static/media/Vazir-Bold.51bd611a.woff2', 'fonts/Vazir-Bold.woff2'],
  ['https://kheilisabz.com/static/media/Vazir-Bold.56dce27a.woff', 'fonts/Vazir-Bold.woff'],
  ['https://kheilisabz.com/static/media/Vazir-Medium.14d12966.woff2', 'fonts/Vazir-Medium.woff2'],
  ['https://kheilisabz.com/static/media/Vazir-Light.d5bcad0c.woff2', 'fonts/Vazir-Light.woff2'],
  ['https://kheilisabz.com/static/media/Lalezar-Regular.b1cbfd55.woff2', 'fonts/Lalezar-Regular.woff2'],
  ['https://kheilisabz.com/static/media/Lalezar-Regular.03526935.woff', 'fonts/Lalezar-Regular.woff'],
  // hero slider images
  ['https://assets.kheilisabz.com/images/5104ea202ac54d3fbd29a141c2e42595.png', 'images/slider/slide-1.png'],
  ['https://assets.kheilisabz.com/images/bedf7dbb6ab7482ca523dfbb986e42fd.png', 'images/slider/slide-2.png'],
  ['https://assets.kheilisabz.com/images/dd9d0970d4524a18a6b22b741f9c72f1.png', 'images/slider/slide-3.png'],
  ['https://assets.kheilisabz.com/images/d5c5af8287284edb8a2543fc083a0ecb.png', 'images/slider/slide-4.png'],
  ['https://assets.kheilisabz.com/images/44f15354de1b4bd6a621f89c0f0f00c7.png', 'images/slider/slide-5.png'],
];

// product images from groups.json
const groups = JSON.parse(fs.readFileSync(path.join(ROOT, '_ref/api/groups.json'), 'utf8'));
const seen = new Set();
groups.Data.forEach(g => (g.Products || []).forEach(p => (p.Images || []).forEach(im => {
  const size = im.ImageSizeText;
  if (size !== '240x320' && size !== '144x192') return;
  const name = im.FileName + '-' + size + '.png';
  if (seen.has(name)) return;
  seen.add(name);
  downloads.push(['https://assets.kheilisabz.com/images/' + name, 'images/products/' + name]);
})));

function dl(url, dest) {
  return new Promise((resolve) => {
    const file = path.join(ROOT, dest);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) { return resolve('skip'); }
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://kheilisabz.com/' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return dl(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) { res.resume(); return resolve('ERR ' + res.statusCode + ' ' + dest); }
      const ws = fs.createWriteStream(file);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve('ok'); });
      ws.on('error', () => resolve('WRITEERR ' + dest));
    });
    req.on('error', (e) => resolve('NETERR ' + dest + ' ' + e.message));
    req.setTimeout(30000, () => { req.destroy(); resolve('TIMEOUT ' + dest); });
  });
}

(async () => {
  let ok = 0, fail = 0;
  for (const [url, dest] of downloads) {
    const r = await dl(url, dest);
    if (r === 'ok' || r === 'skip') ok++; else { fail++; console.log(r); }
  }
  console.log('done. ok/skip:', ok, 'fail:', fail, 'total:', downloads.length);
})();
