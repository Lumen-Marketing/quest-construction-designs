// Size and box metrics for the first few matches of a selector.
//   node boxes.mjs ../d05-ground-break/index.html ".plant" [width]
import { withPage, report } from './cdp.mjs';

const [, , file, sel, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  report(await page.evaluate(`(() => {
    const out = [];
    document.querySelectorAll(${JSON.stringify(sel)}).forEach((e, i) => {
      if (i > 3) return;
      const b = e.getBoundingClientRect(), c = getComputedStyle(e);
      out.push({
        sel: ${JSON.stringify(sel)}, i,
        w: Math.round(b.width), h: Math.round(b.height),
        disp: c.display, ar: c.aspectRatio, ht: c.height, pos: c.position,
      });
    });
    return out;
  })()`));
});
