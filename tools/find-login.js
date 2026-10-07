const fs = require("fs");
const path = require("path");
const base = "C:\\Users\\GASCAN~1\\AppData\\Local\\Temp\\opencode\\render";
const h = fs.readFileSync(path.join(base, "login.html"), "utf8");
const pats = ["<form", "type=\"tel\"", "input", "verification", "کد", "btn", "Modal", "dialog", "otp", "phone"];
const out = [];
for (const p of pats) {
  let i = 0, c = 0;
  while ((i = h.indexOf(p, i)) !== -1 && c < 4) {
    out.push(`=== ${p} @${i} ===\n` + h.slice(Math.max(0, i - 200), i + 300).replace(/\n/g, "\\n"));
    i += p.length;
    c++;
  }
  if (!c) out.push(`=== ${p} : none ===`);
}
fs.writeFileSync(path.join(base, "login-find.txt"), out.join("\n\n"), "utf8");
console.log("done");
