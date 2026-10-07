const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "_ref");
const files = fs.readdirSync(dir).filter((f) => /^chunk\d+\.js$/.test(f));
const targets = ["شماره موبایل", "کد تایید", "رمز عبور", "ورود با", "ثبت شماره", "همراه", "کد امنیتی", "ارسال کد"];
const encOf = (t) => [...t].map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
let hits = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const found = [];
  for (const t of targets) {
    if (s.includes(t) || s.includes(encOf(t))) found.push(t);
  }
  if (found.length) {
    console.log(f, "->", found.join(", "));
    hits++;
  }
}
console.log("checked", files.length, "hits", hits);
