const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "..", "_ref", "phone-ctx.txt"), "utf8");
const dec = s.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
const blocks = dec.split(/=== @\d+ ===/).slice(1);
const keep = [];
blocks.forEach((b, i) => {
  if (/[\u0600-\u06FF]/.test(b)) keep.push(b.trim().slice(0, 700));
});
fs.writeFileSync(path.join(__dirname, "..", "_ref", "phone-ctx-dec.txt"), keep.join("\n\n----\n\n"), "utf8");
console.log("kept", keep.length);
