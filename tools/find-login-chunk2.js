const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "_ref");
const files = fs.readdirSync(dir).filter((f) => /\.js$/.test(f));
const targets = ["sendCode", "verification", "otpCode", "loginModal", "LoginModal", "phoneNumber", "PhoneNumber", "mobileNumber", "confirmCode", "\u06af\u0631\u0648\u0647 \u062a\u0627\u06cc\u06cc\u062f", "\u062b\u0628\u062a \u0646\u0627\u0645", "\u062a\u0641\u0631\u0647\u0645\u0646\u062f", "step1", "Step1", "send_sms", "resend"];
const encOf = (t) => [...t].map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const found = [];
  for (const t of targets) {
    if (s.includes(t) || (t.length > 2 && s.includes(encOf(t)))) found.push(t);
  }
  if (found.length) console.log(f, "->", found.join(", "));
}
console.log("checked", files.length);
