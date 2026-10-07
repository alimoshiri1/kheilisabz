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
    defaultViewport: { width: 1440, height: 1592 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  const errors = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => failed.push(r.url() + " :: " + (r.failure() || {}).errorText));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url() + " :: HTTP " + r.status());
  });

  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForFunction("window.__pageReady === true", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(() => {
    const el = document.querySelector("#hero-swiper");
    if (el && el.swiper && el.swiper.autoplay) el.swiper.autoplay.stop();
  });
  await new Promise((r) => setTimeout(r, 300));

  const geo = await page.evaluate(() => {
    const R = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        x: Math.round(b.x),
        y: Math.round(b.y + window.scrollY),
        w: Math.round(b.width),
        h: Math.round(b.height),
      };
    };
    return {
      doc: document.documentElement.scrollHeight,
      header: R(".bigheader"),
      logo: R(".bigheader .logo img"),
      navFirst: R("#nav-ul li"),
      hero: R("#hero-swiper"),
      box: R(".searchinputDesktop"),
      segment: R(".search-segment"),
      title1: R("#title-1"),
      books1: R("#books-1"),
      card0: R("#books-1 .slider-item"),
      tileSeries: R("#tile-series"),
      title3: R("#title-3"),
      banners: R("#banners"),
      footer: R("#site-footer"),
      footerLogo: R(".footer__logo img"),
      footerDesc: R(".footer-desc"),
      copy: R(".copy-write"),
      popup: R(".popup-dialog"),
    };
  });

  fs.writeFileSync(path.join(OUT, "mine-geo.json"), JSON.stringify(geo, null, 1), "utf8");
  await page.evaluate(() => {
    const pd = document.querySelector(".popup-backdrop");
    if (pd) pd.remove();
  });
  await page.screenshot({ path: path.join(OUT, "mine-desktop.png"), fullPage: true });

  // mobile: fresh page (setViewport on a loaded page re-navigates in this
  // headless build, which aborts in-flight fetches and pollutes the log)
  const mp = await browser.newPage();
  mp.setDefaultNavigationTimeout(60000);
  mp.on("console", (m) => {
    if (m.type() === "error") errors.push("[m] " + m.text());
  });
  mp.on("pageerror", (e) => errors.push("[m] pageerror: " + e.message));
  mp.on("requestfailed", (r) => failed.push("[m] " + r.url() + " :: " + (r.failure() || {}).errorText));
  mp.on("response", (r) => {
    if (r.status() >= 400) failed.push("[m] " + r.url() + " :: HTTP " + r.status());
  });
  await mp.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mp.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("popup-see", "1");
      localStorage.setItem("drawer-seen", "1");
    } catch (e) {}
  });
  await mp.goto(URL, { waitUntil: "networkidle2" });
  await mp.waitForFunction("window.__pageReady === true", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await mp.evaluate(() => {
    const el = document.querySelector("#hero-swiper");
    if (el && el.swiper && el.swiper.autoplay) el.swiper.autoplay.stop();
  });
  const geoM = await mp.evaluate(() => {
    const R = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        x: Math.round(b.x),
        y: Math.round(b.y + window.scrollY),
        w: Math.round(b.width),
        h: Math.round(b.height),
      };
    };
    return {
      doc: document.documentElement.scrollHeight,
      header: R(".mobile-header"),
      hero: R("#hero-swiper"),
      title1: R("#title-1"),
      books1: R("#books-1"),
      chips: R("#series-chips"),
      footer: R("#site-footer"),
      bottomNav: R("#bottom-nav"),
    };
  });
  fs.writeFileSync(path.join(OUT, "mine-geo-mobile.json"), JSON.stringify(geoM, null, 1), "utf8");
  await mp.screenshot({ path: path.join(OUT, "mine-mobile.png"), fullPage: true });
  await mp.close();

  console.log("ERRORS:", JSON.stringify(errors, null, 1));
  console.log("FAILED:", JSON.stringify(failed, null, 1));
  console.log("GEO:", JSON.stringify(geo, null, 1));
  console.log("GEO-M:", JSON.stringify(geoM, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
