const fs = require('fs');
const css = fs.readFileSync('_ref/2.css', 'utf8');
const KEYS = ['footer', 'copy-write', 'end-divider', 'sm-divider', 'social_media', 'main-segment', 'slider-two', 'banners', 'trust', 'footer-col', 'footer-about', 'footer-title'];
let media = null;
const out = [];
// tokenize: find @media blocks by brace matching
let i = 0;
function walk(text, mediaCtx) {
  let buf = '';
  let depth = 0;
  let start = 0;
  for (let p = 0; p < text.length; p++) {
    const ch = text[p];
    if (ch === '{') {
      const sel = buf.trim(); buf = '';
      if (sel.startsWith('@media') || sel.startsWith('@supports')) {
        let d = 1; let q = p + 1;
        while (q < text.length && d > 0) { if (text[q] === '{') d++; else if (text[q] === '}') d--; q++; }
        walk(text.slice(p + 1, q - 1), sel);
        p = q - 1;
      } else {
        depth++;
        start = p + 1;
        // find matching close for this rule
        let d = 1; let q = p + 1;
        while (q < text.length && d > 0) { if (text[q] === '{') d++; else if (text[q] === '}') d--; q++; }
        const body = text.slice(start, q - 1);
        const sels = sel.split(',');
        if (sels.some(s => KEYS.some(k => s.includes(k)))) {
          out.push(`/* media: ${mediaCtx || 'TOP'} */\n${sel}{${body.replace(/\s+/g, ' ').slice(0, 500)}}`);
        }
        p = q - 1;
        depth--;
      }
    } else {
      buf += ch;
    }
  }
}
walk(css, null);
fs.writeFileSync('_ref/mobile-footer-rules.txt', out.join('\n\n'), 'utf8');
console.log('rules found:', out.length);
