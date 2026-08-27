// Every piece of type on the hero's accent plane, against the field it landed
// on, on each palette.
//
// The plane has a photograph under it now. That makes this the same trap the
// accent bar was, one size up: --on-acc is near-black on the gold and orange
// palettes and WHITE on clay, so an overlay light enough to let the picture
// show is an overlay that moves the field toward one ink or the other. The
// only way to know which is to hide the type and walk the pixels behind it.
//   node herotext.mjs [width]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const width = Number(process.argv[2]) || 1440;
const PALETTES = {
  orange: ['#D07C42', '#1C1208', '#8A6712', '#D9A93C'],
  gold: ['#D9A93C', '#191307', '#8A6712', '#D9A93C'],
  clay: ['#A8543A', '#ffffff', '#8A4A32', '#C8785C'],
};
// Everything on the plane that carries ink. The buttons bring their own
// backgrounds and are covered by btncheck.mjs.
// .h1-name and .hl set their own colour inside the h1, so measuring the h1
// alone measured neither: the harness reads the colour off the element it is
// measuring, and the parent's is not what those two are painted in. The hero
// carries one word of the headline in the accent now, on a photograph rather
// than on a flat band, which is exactly the case that needs watching.
const SEL = '.hero-copy .eyebrow, .hero-copy h1, .hero-copy .h1-name, '
  + '.hero-copy h1 .hl, .hero-copy .lede, .hero-trust b, .hero-trust span';

const lin = (c) => (c <= 10.0164 ? c / 3294.6 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const rows = [];
await withPage('../site/index.html', { width, height: 1000 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  for (const [pal, [acc, onAcc, dim, onDark]] of Object.entries(PALETTES)) {
    await page.evaluate(`(() => {
      const r = document.documentElement.style;
      r.setProperty('--acc', ${JSON.stringify(acc)});
      r.setProperty('--on-acc', ${JSON.stringify(onAcc)});
      r.setProperty('--acc-dim', ${JSON.stringify(dim)});
      r.setProperty('--acc-on-dark', ${JSON.stringify(onDark)});
    })()`);
    await new Promise((r) => setTimeout(r, 600));

    // A Range over the text nodes gives the glyph lines, not the padded boxes.
    const boxes = JSON.parse(await page.evaluate(`(() => {
      const out = [...document.querySelectorAll(${JSON.stringify(SEL)})].map((e) => {
        const rg = document.createRange(); rg.selectNodeContents(e);
        const r = rg.getBoundingClientRect();
        const cs = getComputedStyle(e);
        const px = parseFloat(cs.fontSize);
        const wt = Number(cs.fontWeight) || 400;
        // WCAG's own definition of large text: 24px, or 18.66px when bold.
        // Large text clears at 3:1; everything else needs 4.5:1. Holding the
        // 66px headline to the small-text bar is stricter than the standard
        // and buys the wash strength that hides the photograph.
        const large = px >= 24 || (px >= 18.66 && wt >= 700);
        return { tag: e.tagName + (e.className ? '.' + e.className.split(' ')[0] : ''),
          text: e.textContent.trim().slice(0, 18),
          px: Math.round(px), wt, need: large ? 3 : 4.5,
          colour: cs.color.match(/[0-9.]+/g).slice(0, 3).map(Number),
          x: Math.round(r.left) - 2, y: Math.round(r.top) - 2,
          w: Math.round(r.width) + 4, h: Math.round(r.height) + 4 };
      }).filter((b) => b.w > 6 && b.h > 6);
      return JSON.stringify(out);
    })()`));

    await page.evaluate(`document.querySelectorAll(${JSON.stringify(SEL)})
      .forEach(e => { e.style.color = 'transparent';
        // Descendants that set their own colour survive a colour set on the
        // parent, and then get measured against themselves at 1:1. Blank the
        // subtree, not the element.
        e.querySelectorAll('*').forEach(k => { k.style.color = 'transparent'; }); })`);
    await new Promise((r) => setTimeout(r, 350));
    fs.writeFileSync('./herotext.png', await page.screenshot());
    await page.evaluate(`document.querySelectorAll(${JSON.stringify(SEL)})
      .forEach(e => { e.style.color = ''; })`);

    for (const b of boxes) {
      const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', './herotext.png',
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
fs.rmSync('./herotext.png', { force: true });

// Each line against its OWN threshold. Holding the 66px headline to the
// small-text bar is stricter than WCAG asks and the difference is paid for in
// wash strength — which is exactly what was hiding the photograph.
let bad = 0;
let tight = Infinity;
for (const r of rows.sort((a, b) => (a.worst / a.need) - (b.worst / b.need))) {
  const ok = r.worst >= r.need;
  if (!ok) bad++;
  tight = Math.min(tight, r.worst / r.need);
  console.log(`${ok ? 'AA  ' : 'FAIL'} ${r.worst.toFixed(2).padStart(6)}:1 `
    + `(needs ${r.need}, ${String(r.px).padStart(2)}px)  ${r.pal.padEnd(7)} `
    + `${r.tag.padEnd(16)} ${r.text}`);
}
console.log(bad === 0
  ? `\nPASS — every line clears its own threshold on every palette; the tightest `
    + `sits at ${tight.toFixed(2)}x what it needs.`
  : `\nFAIL — ${bad} line(s) under threshold.`);
process.exit(bad === 0 ? 0 : 1);
