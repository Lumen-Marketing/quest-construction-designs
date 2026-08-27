// Every button label on the site, on every palette, against the field it
// actually landed on.
//
// The accent bar taught this the hard way: --on-acc is near-black on the gold
// and orange palettes and WHITE on clay, so a highlight that makes a pill look
// lit on the live palette can quietly take another one under AA. Buttons are
// worse than the bar, because the same .btn is drawn on cream, on white, on a
// dark band, on a photograph and on the accent itself, and only one of those
// is ever on screen while the CSS is being written.
//
// Nothing here is assumed. Each button reports its own computed label colour
// and its own box; the labels are then made transparent and the page shot
// again, so what is measured is the field a glyph sits on and not the glyph.
//   node btncheck.mjs [width]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const width = Number(process.argv[2]) || 1440;
const PALETTES = {
  orange: ['#D07C42', '#1C1208', '#8A6712', '#D9A93C'],
  gold: ['#D9A93C', '#191307', '#8A6712', '#D9A93C'],
  clay: ['#A8543A', '#ffffff', '#8A4A32', '#C8785C'],
};
// One page per ground the pills are drawn on: cream and dark (home), white
// inside a plate (contact), and a photograph (a service banner).
const PAGES = ['../site/index.html', '../site/contact-us/index.html',
  '../site/services/roofing/index.html'];

const lin = (c) => (c <= 10.0164 ? c / 3294.6 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const rows = [];
const skipped = [];
for (const target of PAGES) {
  await withPage(target, { width, height: 1000 }, async (page) => {
    await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);

    for (const [pal, [acc, onAcc, dim, onDark]] of Object.entries(PALETTES)) {
      await page.evaluate(`(() => {
        const r = document.documentElement.style;
        r.setProperty('--acc', ${JSON.stringify(acc)});
        r.setProperty('--on-acc', ${JSON.stringify(onAcc)});
        r.setProperty('--acc-dim', ${JSON.stringify(dim)});
        r.setProperty('--acc-on-dark', ${JSON.stringify(onDark)});
      })()`);
      await new Promise((r) => setTimeout(r, 250));

      // Each button's own label colour, resolved, plus the box the label sits
      // in — the padding box minus the pip, which is not text.
      const found = JSON.parse(await page.evaluate(`(() => {
        return JSON.stringify([...document.querySelectorAll('.btn')].map((b, i) => {
          const r = b.getBoundingClientRect();
          const pip = b.querySelector('.pip');
          const p = pip ? pip.getBoundingClientRect() : null;
          const c = getComputedStyle(b).color.match(/[\\d.]+/g).map(Number);
          // Start after the pip so the scan is over the pill's own fill.
          const left = p ? p.right + 4 : r.left + 10;
          return {
            i, cls: b.className, colour: c.slice(0, 3),
            x: Math.round(left + scrollX), y: Math.round(r.top + scrollY) + 8,
            w: Math.max(1, Math.round(r.right - left) - 12),
            h: Math.max(1, Math.round(r.height) - 16),
            vis: r.width > 0 && r.height > 0,
          };
        }).filter((b) => b.vis && b.w > 8));
      })()`));
      if (!found.length) continue;

      // Labels out, backgrounds kept: colour:transparent leaves the fill, the
      // border, the shadows and the pip exactly where they were.
      await page.evaluate(`document.querySelectorAll('.btn')
        .forEach(b=>{b.style.color='transparent'})`);

      for (const b of found) {
        // Shoot the viewport and crop in viewport coordinates. Not a clipped
        // capture in document coordinates: the masthead's phone button is
        // sticky, so where it sits in the document is not where it is painted,
        // and a document-space clip aimed at it comes back empty.
        const box = JSON.parse(await page.evaluate(`(() => {
          const el = document.querySelectorAll('.btn')[${b.i}];
          el.scrollIntoView({block:'center'});
          const r = el.getBoundingClientRect();
          const p = el.querySelector('.pip');
          const q = p ? p.getBoundingClientRect() : null;
          const left = q ? q.right + 4 : r.left + 10;
          return JSON.stringify({
            x: Math.round(left), y: Math.round(r.top) + 8,
            w: Math.round(r.right - left) - 12, h: Math.round(r.height) - 16,
            inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
          });
        })()`));
        // A pill the layout has folded away at this width has nothing to
        // measure; skipping it is right, and silence about it is not.
        if (!box.inView || box.w < 8 || box.h < 4) {
          skipped.push(`${b.cls} on ${target.split('/').slice(-2)[0]}`);
          continue;
        }
        await new Promise((r) => setTimeout(r, 400));
        fs.writeFileSync('./btn-scan.png', await page.screenshot());
        const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', './btn-scan.png',
          '-vf', `crop=${box.w}:${box.h}:${box.x}:${box.y}`,
          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 24 });
        const tgt = lum(...b.colour);
        let worst = Infinity;
        for (let i = 0; i < raw.length; i += 3) {
          const r = ratio(tgt, lum(raw[i], raw[i + 1], raw[i + 2]));
          if (r < worst) worst = r;
        }
        rows.push({ page: target.split('/').slice(-2)[0], pal, cls: b.cls, worst });
      }
      await page.evaluate(`document.querySelectorAll('.btn')
        .forEach(b=>{b.style.color=''})`);
    }
  });
}
fs.rmSync('./btn-scan.png', { force: true });

// Report the worst reading for each variant-on-page, not every instance.
const seen = new Map();
for (const r of rows) {
  const k = `${r.page}  ${r.cls.padEnd(24)}`;
  if (!seen.has(k) || seen.get(k).worst > r.worst) seen.set(k, r);
}
let floor = Infinity;
for (const [k, r] of [...seen].sort((a, b) => a[1].worst - b[1].worst)) {
  floor = Math.min(floor, r.worst);
  console.log(`${r.worst >= 4.5 ? 'AA  ' : 'FAIL'} ${r.worst.toFixed(2).padStart(5)}:1  `
    + `${r.pal.padEnd(7)} ${k}`);
}
if (skipped.length) {
  console.log(`\nnot measured (folded away at ${width}px): `
    + `${[...new Set(skipped)].join(', ')}`);
}
console.log(floor >= 4.5
  ? `\nPASS — every button label clears 4.5:1 on every palette (worst ${floor.toFixed(2)}:1).`
  : `\nFAIL — ${floor.toFixed(2)}:1 is under the 4.5:1 floor.`);
process.exit(floor >= 4.5 ? 0 : 1);
