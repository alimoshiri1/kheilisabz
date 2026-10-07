const fs = require("fs");
const path = require("path");
const refDir = path.join(__dirname, "..", "_ref");
const files = ["keycss.txt", "1.css", "2.css", "keycss2.txt"];
const sels = [
  ".slider-title",
  ".special_offer",
  ".bg-spotted",
  ".slider-name",
  ".slider_one",
  ".container_slider",
  ".in-height-half",
  ".min-height-half",
  ".main-segment",
  ".header-mobile",
  ".kheilisabz-mobile-header-content",
  ".kheilisabz-mobile-logo",
  ".mb-16",
  ".slider_two",
  ".banners_tow",
  ".slider-two",
];
const out = [];
for (const f of files) {
  const p = path.join(refDir, f);
  if (!fs.existsSync(p)) continue;
  const css = fs.readFileSync(p, "utf8");
  for (const sel of sels) {
    const re = new RegExp("(^|[}\\s;])" + sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[^{};]*\\{[^{}]*\\}", "g");
    let m;
    while ((m = re.exec(css)) !== null) {
      out.push(`[${f}] ${m[0].trim()}`);
    }
  }
}
fs.writeFileSync(path.join(__dirname, "..", "_ref", "cssfind-out.txt"), out.join("\n\n"), "utf8");
console.log("matches:", out.length);
