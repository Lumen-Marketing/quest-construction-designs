// Which block is making the page scroll sideways? Hides one top-level block at
// a time and names the ones whose removal shrinks the document.
//   node secscan.mjs ../d03-split-bay/index.html [width]
import { withPage, report } from './cdp.mjs';

const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  report({ file, ...await page.evaluate(`(() => {
    const de = document.documentElement, base = de.scrollWidth, out = [];
    for (const b of [...document.body.children]) {
      const blocks = b.tagName === 'MAIN' ? [...b.children] : [b];
      for (const e of blocks) {
        const d = e.style.display;
        e.style.display = 'none';
        const w = de.scrollWidth;
        e.style.display = d;
        if (w < base) {
          const cls = typeof e.className === 'string' && e.className
            ? '.' + e.className.trim().split(/\s+/).join('.') : '';
          out.push({ sel: e.tagName.toLowerCase() + cls, drops: base - w });
        }
      }
    }
    return { clientW: de.clientWidth, scrollW: base, culprits: out };
  })()`) });
});
