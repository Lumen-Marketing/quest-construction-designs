// Does the accent bar still carry its text after the depth treatment?
//
// The CSS was written so the middle of the bar stays exactly --acc, but "was
// written so" is not evidence: inset shadows, a ghosted grid and a beam all
// composite, and the only honest answer is the pixels that came out. This
// takes the three bar-*.png screenshots, finds the worst (lowest-contrast)
// pixel anywhere in the horizontal band the type sits in, and reports the
// ratio against that palette's --on-acc.
//   node ctabar.mjs && node barcontrast.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ON = { orange: '#1C1208', gold: '#191307', clay: '#ffffff' };
// Where the bar sits inside each PNG, written by ctabar.mjs. Not assumed: the
// screenshot clip clamps at the document edge, so the margin around the bar is
// not always the one that was asked for, and a scan that guesses it walks off
// onto the dark plate behind and reports a failure that is not one.
const BOX = JSON.parse(fs.readFileSync('./bar-boxes.json', 'utf8'));

const lin = (c) => (c <= 10.0164 ? c / 3294.6 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hexLum = (h) => {
  const n = h.replace('#', '');
  return lum(parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16));
};

let worstAll = Infinity;
for (const [name, on] of Object.entries(ON)) {
  const png = `./bar-${name}-bare.png`;
  if (!fs.existsSync(png)) throw new Error(`${png} missing — run ctabar.mjs first`);
  const target = hexLum(on);
  let worst = Infinity; let scanned = 0; let where = '';
  for (const t of BOX[name].type) {
    const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', png,
      '-vf', `crop=${t.w}:${t.h}:${t.x}:${t.y}`,
      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
    scanned += raw.length / 3;
    for (let i = 0; i < raw.length; i += 3) {
      const r = ratio(target, lum(raw[i], raw[i + 1], raw[i + 2]));
      if (r < worst) { worst = r; where = `${t.x},${t.y} ${t.w}x${t.h}`; }
    }
  }
  worstAll = Math.min(worstAll, worst);
  const flag = worst >= 4.5 ? 'AA ' : 'FAIL';
  console.log(`${flag} ${name.padEnd(7)} worst field under any glyph box: ${worst.toFixed(2)}:1`
    + `  (${scanned} px over ${BOX[name].type.length} boxes, worst in ${where})`);
}
console.log(worstAll >= 4.5
  ? `\nPASS — every palette clears 4.5:1 across the whole band (worst ${worstAll.toFixed(2)}:1).`
  : `\nFAIL — ${worstAll.toFixed(2)}:1 is under the 4.5:1 floor.`);
process.exit(worstAll >= 4.5 ? 0 : 1);
