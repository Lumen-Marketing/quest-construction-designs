// Every line of type on the offer vouchers, against the field it landed on, on
// each palette.
//
// Nothing was measuring these until the stub got a ground under it, and the
// stub is exactly the kind of place that needs it: three layers now sit behind
// the content — a bloom, a hatch and a 220px ghost numeral — and the last time
// this card carried a glow it took the amount from 4.84:1 to 3.32:1 because the
// bright core landed under the number. Same trap, so the same instrument.
//   node offers.mjs [width]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const width = Number(process.argv[2]) || 1440;
const PALETTES = {
  orange: ['#D07C42', '#1C1208', '#8A6712', '#D9A93C'],
  gold: ['#D9A93C', '#191307', '#8A6712', '#D9A93C'],
  clay: ['#A8543A', '#ffffff', '#8A4A32', '#C8785C'],
};
// The amount, the heading and the terms. The button brings its own background
// and is covered by btncheck.mjs.
const SEL = '.offer b, .offer h3, .offer p';

const lin = (c) => (c <= 10.0164 ? c / 3294.6 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const rows = [];
await withPage('../site/index.html', { width, height: 1000 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  await page.evaluate(`document.querySelector('#offers').scrollIntoView()`);
  await new Promise((r) => setTimeout(r, 500));

  for (const [pal, [acc, onAcc, dim, onDark]] of Object.entries(PALETTES)) {
    await page.evaluate(`(() => {
      const r = document.documentElement.style;
      r.setProperty('--acc', ${JSON.stringify(acc)});
      r.setProperty('--on-acc', ${JSON.stringify(onAcc)});
      r.setProperty('--acc-dim', ${JSON.stringify(dim)});
      r.setProperty('--acc-on-dark', ${JSON.stringify(onDark)});
    })()`);
    await new Promise((r) => setTimeout(r, 500));

    const boxes = JSON.parse(await page.evaluate(`(() => {
      const out = [...document.querySelectorAll(${JSON.stringify(SEL)})].map((e) => {
        const rg = document.createRange(); rg.selectNodeContents(e);
        const r = rg.getBoundingClientRect();
        const cs = getComputedStyle(e);
        const px = parseFloat(cs.fontSize);
        const wt = Number(cs.fontWeight) || 400;
        const large = px >= 24 || (px >= 18.66 && wt >= 700);
        return { tag: e.tagName, text: e.textContent.trim().slice(0, 20),
          px: Math.round(px), need: large ? 3 : 4.5,
          colour: cs.color.match(/[0-9.]+/g).slice(0, 3).map(Number),
          x: Math.round(r.left) - 2, y: Math.round(r.top) - 2,
          w: Math.round(r.width) + 4, h: Math.round(r.height) + 4 };
      }).filter((b) => b.w > 6 && b.h > 6 && b.y > 0 && b.y + b.h < innerHeight);
      return JSON.stringify(out);
    })()`));

    // Blank the subtree, not the element: the ghost numeral sets its own colour
    // and would otherwise be measured against itself.
    await page.evaluate(`document.querySelectorAll(${JSON.stringify(SEL)})
      .forEach(e => { e.style.color = 'transparent'; e.style.textShadow = 'none';
        e.querySelectorAll('*').forEach(k => { k.style.color = 'transparent'; }); })`);
    await new Promise((r) => setTimeout(r, 300));
    fs.writeFileSync('./offers.png', await page.screenshot());
    await page.evaluate(`document.querySelectorAll(${JSON.stringify(SEL)})
      .forEach(e => { e.style.color = ''; e.style.textShadow = ''; })`);

    for (const b of boxes) {
      const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', './offers.png',
        '-vf', `crop=${b.w}:${b.h}:${b.x}:${b.y}`,
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
      const tgt = lum(...b.colour);
      let worst = Infinity;
      for (let i = 0; i < raw.length; i += 3) {
        const r = ratio(tgt, lum(raw[i], raw[i + 1], raw[i + 2]));
        if (r < worst) worst = r;
      }
      rows.push({ pal, tag: b.tag, text: b.text, worst, need: b.need, px: b.px });
    }
  }
});
fs.rmSync('./offers.png', { force: true });

let bad = 0;
let tight = Infinity;
for (const r of rows.sort((a, b) => (a.worst / a.need) - (b.worst / b.need))) {
  const ok = r.worst >= r.need;
  if (!ok) bad++;
  tight = Math.min(tight, r.worst / r.need);
  console.log(`${ok ? 'AA  ' : 'FAIL'} ${r.worst.toFixed(2).padStart(6)}:1 `
    + `(needs ${r.need}, ${String(r.px).padStart(2)}px)  ${r.pal.padEnd(7)} `
    + `${r.tag.padEnd(3)} ${r.text}`);
}
console.log(bad === 0
  ? `\nPASS — every line clears its own threshold on every palette; the tightest `
    + `sits at ${tight.toFixed(2)}x what it needs.`
  : `\nFAIL — ${bad} line(s) under threshold.`);
process.exit(bad === 0 ? 0 : 1);
