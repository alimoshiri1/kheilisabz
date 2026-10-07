const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const R = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const RENDER = path.join(process.env.TEMP, 'opencode/render');
const extract = JSON.parse(fs.readFileSync(path.join(RENDER, 'extract.json'), 'utf8'));
const menu = R('_ref/api/menu.json');
const groups = R('_ref/api/groups.json');

// ---- series chips (24) ----
const seriesChips = [
  ['تست', '/books?k4=تست'],
  ['جمع بندی', '/books?k4=جمع-بندی'],
  ['نردبام', '/books?k4=نردبام'],
  ['موضوعی', '/books?k4=موضوعی'],
  ['چندکنکور', '/books?k4=چند-کنکور'],
  ['فصل آزمون', '/books?k4=فصل-آزمون'],
  ['جی‌بی', '/books?k4=جیبی'],
  ['کتاب کار', '/books?k4=کتاب-کار'],
  ['شب امتحان', '/books?k4=شب-امتحان'],
  ['درک متن', '/books?k4=درک-متن'],
  ['آموزش شگفت‌انگیز', '/books?k4=آموزش-شگفت-انگیز'],
  ['تیزهوشان', '/books?k4=تیزهوشان'],
  ['ماجراهای من و درسام', '/books?k4=ماجراهای-من-و-درسام'],
  ['آزمون تیزهوشان', '/books?k4=آزمون-تیزهوشان'],
  ['پیشتاز', '/books?k4=پیشتاز'],
  ['پیک هفتگی', '/books?k4=پیک-آدینه'],
  ['تربچه', '/books?k4=تربچه'],
  ['خوش خطی', '/books?k4=خوش-خطی'],
  ['مامان باباها', '/books?k4=مامان-باباها'],
  ['گام به گام', '/books?k4=گام-به-گام'],
  ['بانک نهایی', '/books?k4=بانک-نهایی'],
  ['شبیه ساز', '/books?k4=شبیه-ساز'],
  ['ماجرای بیست', '/books?k4=ماجرای-بیست'],
  ['BEAST-MODE-ON', '/books?k4=BEAST-MODE-ON'],
].map(([label, href]) => ({ label, href }));

// ---- grade chips (17) ----
const gradeChips = [
  ['کنکور', '/books?k5=جامع,پایه,دوازدهم&k4=تست,جمع-بندی,چند-کنکور,فصل-آزمون,موضوعی,نردبام,آموزش-شگفت-انگیز,جیبی'],
  ['جامع', '/books?k5=جامع'],
  ['دوازدهم', '/books?k5=دوازدهم'],
  ['پایه', '/books?k5=پایه'],
  ['یازدهم', '/books?k5=یازدهم'],
  ['دهم', '/books?k5=دهم'],
  ['نهم', '/books?k5=نهم'],
  ['هشتم', '/books?k5=هشتم'],
  ['هفتم', '/books?k5=هفتم'],
  ['ششم', '/books?k5=ششم'],
  ['پنجم', '/books?k5=پنجم'],
  ['چهارم', '/books?k5=چهارم'],
  ['سوم', '/books?k5=سوم'],
  ['دوم', '/books?k5=دوم'],
  ['اول', '/books?k5=اول'],
  ['پیش‌دبستانی', '/books?k5=پیش-دبستانی'],
  ['مهدکودک', '/books?k5=مهد-کودک'],
].map(([label, href]) => ({ label, href }));

// ---- hero sliders ----
const sliders = [
  { href: '', image: 'images/slider/slide-1.png', target: '_self' },
  { href: 'https://kheilisabz.com/books?k4=360', image: 'images/slider/slide-2.png', target: '_blank' },
  { href: 'https://kheilisabz.com/books?k4=BEAST-MODE-ON', image: 'images/slider/slide-3.png', target: '_blank' },
  { href: 'https://kheilisabz.com/books?k4=تست&k5=جامع', image: 'images/slider/slide-4.png', target: '_blank' },
  { href: 'https://kheilisabz.com/books?k4=تست&k2=زیستستان', image: 'images/slider/slide-5.png', target: '_blank' },
];

// ---- sections / products ----
function pickProduct(p) {
  const imgs = {};
  (p.Images || []).forEach(im => { if (im.ImageSizeText === '240x320') imgs.d = im.FileName; if (im.ImageSizeText === '144x192') imgs.m = im.FileName; });
  return {
    id: p.Id,
    title: p.Title,
    price: p.Price,
    salePrice: p.SalePrice,
    discountPresent: p.DiscountPresent,
    imgDesktop: imgs.d ? 'images/products/' + imgs.d + '-240x320.png' : '',
    imgMobile: imgs.m ? 'images/products/' + imgs.m + '-144x192.png' : (imgs.d ? 'images/products/' + imgs.d + '-240x320.png' : ''),
    href: '/books/' + (p.Slug || p.Id),
    inStock: p.InStock,
  };
}
const sections = groups.Data.map((g, idx) => ({
  id: idx + 1,
  title: g.Title,
  products: (g.Products || []).map(pickProduct),
}));

// ---- nav ----
const nav = [
  { label: 'کتاب‌ها', type: 'mega' },
  { label: 'وبلاگ', href: '/blog' },
  { label: 'آزمون', href: 'https://azmoonkheilisabz.com', external: true },
  { label: 'باشگاه مشتریان', href: 'https://club.kheilisabz.com', external: true },
  { label: 'درباره ما', href: '/page/about-us' },
  {
    label: 'همکاری با ما', type: 'dropdown',
    items: [
      { label: 'فرصت‌های شغلی', href: 'https://jobs.kheilisabz.com/', external: true },
      { label: 'واحد محتوایی خیلی‌سبز', href: 'https://kheilisabz360.com/talents/landing?id=5Z2R2BXS&token=VjEuMTc0ODQzMTEzNS41WjJSMkJYUy5LaGVpbGlzYWJ6MzYwLmNvbS45NTU%3D', external: true },
    ],
  },
  { label: 'تماس با ما', href: '/page/contact-us' },
];

// ---- banners ----
const banners = [
  { image: 'images/banner-1.jpg', href: '/books?k4=تربچه', alt: 'تربچه' },
  { image: 'images/banner-2.jpg', href: '/books?k4=کتاب-کار&k5=اول,هفتم,هشتم,نهم,دهم,یازدهم,دوازدهم', alt: 'کتاب کار' },
  { image: 'images/banner-3.jpg', href: '/books?k5=دوم,سوم,چهارم,پنجم,ششم,هفتم,هشتم,نهم&k4=تیزهوشان', alt: 'تیزهوشان' },
];

// ---- footer ----
const footer = {
  logo: 'images/logo-footer.svg',
  aboutTitle: 'درس خوندن با خیلی سبز فرق داره',
  about:
    'انجام کارها به شیوه‌ای معمولی، هیچ تحولی در هیچ کجای دنیا ایجاد نمی‌کند؛ برای همین به دانش‌آموزان می‌گوییم «متفاوت یاد بگیر» و به خودمان می‌گوییم «ناشری کاملاً متفاوت»!<br>' +
    'ما همیشه دوست داریم به هر محصول، خدمت یا روشی از نو نگاه کنیم و آن را متفاوت‌تر از آنچه هست بسازیم یا ارائه دهیم. دوست داریم با کارهایمان مخاطبان را تحت تأثیر قرار دهیم، بخندانیم، خوشحال کنیم و غافلگیرشان کنیم. همیشه می‌کوشیم بهترین باشیم؛ حتی اگر الان نیستیم، آن‌قدر تلاش می‌کنیم تا به آن نقطه برسیم.',
  cols: [
    {
      title: 'خیلی سبز',
      items: [
        { txt: 'درباره ما', href: '/page/about-us' },
        { txt: 'تماس با ما', href: '/page/contact-us' },
        { txt: 'فرصت‌های شغلی', href: 'https://jobs.kheilisabz.com' },
        { txt: 'سوالات متداول', href: '/faq' },
      ],
    },
    {
      title: 'خدمات مشتریان',
      items: [
        { txt: 'نحوه خرید', href: '/page/نحوه-خرید' },
        { txt: 'قوانین و مقررات', href: '/page/قوانین-و-مقررات' },
        { txt: 'نمایندگان فروش', href: '/page/agency' },
        { txt: 'طرح حکمت (باقرالعلوم)', href: 'https://fanavaran.tbao.ir/Company?company=112' },
      ],
    },
  ],
  socials: extract.socials.map(s => ({
    href: s.href,
    image: 'images/social/' + path.basename(s.img).replace(/\.[0-9a-f]{8}(?=\.)/, ''),
    alt: s.alt,
  })),
  trust: [
    {
      image: 'images/trust-badge.png',
      href: 'https://logo.samandehi.ir/Verify.aspx?id=318137&p=xlaorfthmcsirfthxlaojyoe',
      alt: 'ساماندهی',
    },
  ],
  copyright:
    'تمامی حقوق این وب‌سایت متعلق به انتشارات خیلی سبز است و هرگونه استفاده از مطالب آن بدون ذکر منبع پیگرد قانونی دارد.',
};

const db = {
  settings: {
    placeholder: extract.placeholder || 'جستجو در خیلی سبز',
    loginLabel: 'ورود یا ثبت‌نام',
    popupImage: 'images/popup.svg',
    popupImageMobile: 'images/popup-mobile.svg',
    popupHref: 'https://club.kheilisabz.com',
    popupActive: true,
  },
  nav,
  menu: menu.Data,
  sliders,
  sections,
  seriesChips,
  gradeChips,
  banners,
  footer,
  users: [],
};

fs.writeFileSync(path.join(ROOT, 'db.json'), JSON.stringify(db, null, 2), 'utf8');
console.log('db.json written:', {
  sections: db.sections.map(s => s.title + ':' + s.products.length),
  series: seriesChips.length, grade: gradeChips.length, sliders: sliders.length,
});
