const fs = require("fs");
const path = require("path");
const base = "C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render";
const file = path.join(base, process.argv[2] || "home-mobile.html");
const html = fs.readFileSync(file, "utf8");
const pats = ["slider-name", "slider-title", "special_offer", "container_slider_one", "slider-section", "book-slider"];
const out = [];
for (const p of pats) {
  let idx = 0, n = 0;
  while ((idx = html.indexOf(p, idx)) !== -1 && n < 8) {
    out.push(`=== ${p} @${idx} ===\n` + html.slice(Math.max(0, idx - 250), idx + 350).replace(/\n/g, "\\n") + "\n");
    idx += p.length;
    n++;
  }
  if (n === 0) out.push(`=== ${p} : NOT FOUND ===`);
}
fs.writeFileSync(path.join(base, "titles-extract.txt"), out.join("\n"), "utf8");
console.log("done, matches:", out.length);
