const fs = require("fs");
const path = require("path");
const base = "C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render";
const html = fs.readFileSync(path.join(base, "login.html"), "utf8");
const start = html.indexOf("<main");
const mainEnd = html.indexOf("</main>", start);
const main = html.slice(start, mainEnd + 7);
fs.writeFileSync(path.join(base, "login-main.html"), main, "utf8");
const fStart = html.indexOf("<footer");
if (fStart !== -1) {
  const fEnd = html.indexOf("</footer>", fStart);
  fs.writeFileSync(path.join(base, "login-footer.html"), html.slice(fStart, fEnd + 9), "utf8");
}
console.log("main len:", main.length, "footer:", fStart !== -1);
