const fs = require("fs");
const path = require("path");
const src = process.argv[2] || "2.js";
const s = fs.readFileSync(path.join(__dirname, "..", "_ref", src), "utf8");
const out = [];
let i = 0, n = 0;
while ((i = s.indexOf("honeNumber", i)) !== -1 && n < 12) {
  out.push("=== @" + i + " ===\n" + s.slice(Math.max(0, i - 400), i + 500));
  i += 10;
  n++;
}
fs.writeFileSync(path.join(__dirname, "..", "_ref", "phone-ctx.txt"), out.join("\n\n"), "utf8");
console.log("ctx:", n);
