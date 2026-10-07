const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const OUT = "C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render";
const URL = "http://localhost:8080/";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox"],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("popup-see", "1");
    localStorage.setItem("drawer-seen", "1");
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForFunction("window.__pageReady === true", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 700));
  await page.evaluate(() => {
    const el = document.querySelector("#hero-swiper");
    if (el && el.swiper && el.swiper.autoplay) el.swiper.autoplay.stop();
  });

  const geo = await page.evaluate(() => {
    const R = (sel, nth) => {
      let el = document.querySelector(sel);
      if (nth != null && el) el = el.querySelectorAll(sel.split(" ").pop())[nth] || el;
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +(b.y + window.scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    };
    const Rs = (sel) => Array.from(document.querySelectorAll(sel)).slice(0, 6).map((el) => {
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +(b.y + window.scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    });
    const lines = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = document.createRange();
      r.selectNodeContents(el);
      return Array.from(r.getClientRects()).map((b) => ({ y: +(b.y + window.scrollY).toFixed(1), h: +b.height.toFixed(1), x: +b.x.toFixed(1), w: +b.width.toFixed(1) }));
    };
    return {
      doc: document.documentElement.scrollHeight,
      header: R(".mobile-header"),
      headerContent: R(".mobile-header-content"),
      mlogo: R(".mobile-header-content .mlogo img"),
      hero: R("#hero-swiper"),
      heroSlide: R("#hero-swiper .swiper-slide"),
      seg: R(".search-segment"),
      main: R("main.main-container"),
      sliderName1: R("#title-1") && R("#title-1").parentElement,
      title1: R("#title-1"),
      books1: R("#books-1"),
      b1slide0: R("#books-1 .swiper-wrapper > *:nth-child(1)"),
      b1slide1: R("#books-1 .swiper-wrapper > *:nth-child(2)"),
      b1img0: R("#books-1 .swiper-wrapper > *:nth-child(1) img"),
      b1item0: R("#books-1 .slider-item"),
      b1item0img: R("#books-1 .slider-item .image_product img"),
      b1titles: Rs("#books-1 .slider-item-title"),
      b1prices: Rs("#books-1 .sale_price"),
      chips1: R("#series-chips"),
      chips1pill: R("#series-chips .swiper-slide"),
      title2: R("#title-2"),
      sliderName2: R("#title-2") && R("#title-2").parentElement,
      books2: R("#books-2"),
      b2item0img: R("#books-2 .slider-item .image_product img"),
      b2titles: Rs("#books-2 .slider-item-title"),
      b2prices: Rs("#books-2 .sale_price"),
      chips2: R("#grade-chips"),
      chips2pill: R("#grade-chips .swiper-slide"),
      banners: R("#banners"),
      banner0: R("#banners .banner.active"),
      banner0img: R("#banners .banner.active img"),
      title3: R("#title-3"),
      sliderName3: R("#title-3") && R("#title-3").parentElement,
      books3: R("#books-3"),
      b3item0img: R("#books-3 .slider-item .image_product img"),
      b3titles: Rs("#books-3 .slider-item-title"),
      b3prices: Rs("#books-3 .sale_price"),
      footer: R("footer.footer"),
      footerLogoBox: R(".footer__logo"),
      footerLogo: R(".footer__logo img"),
      footerTitle: R(".footer-title"),
      about: R(".footer-about"),
      aboutLines: lines(".footer-about"),
      trust: R(".footer-trust"),
      trustImg: R(".footer-trust a img"),
      colTitle1: R(".footer-col-title"),
      colLis1: Rs(".footer-col .footer-col-title + ul li a"),
      cols: Rs(".footer-col"),
      colTitles: Rs(".footer-col-title"),
      smDivider: R(".footer__container__sm-divider"),
      social: R(".social_media"),
      socialImgs: Rs(".social_media a img"),
      endDivider: R(".footer-end-divider"),
      copy: R(".copy-write"),
      copyLines: lines(".copy-write"),
      bottomNav: R("#bottom-nav"),
      popup: R(".popup-dialog"),
      cs: (() => {
        const g = (s, p) => { const e = document.querySelector(s); return e ? getComputedStyle(e)[p] : null; };
        return {
          aboutLH: g(".footer-about", "lineHeight"),
          copyLH: g(".copy-write", "lineHeight"),
          sliderNameH: g("#title-1", "height") ? g("#title-1", "lineHeight") : null,
        };
      })(),
    };
  });

  fs.writeFileSync(path.join(OUT, "mine-dom-mobile.json"), JSON.stringify(geo, null, 1), "utf8");
  console.log(JSON.stringify(geo, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
