// Computed styles for one selector.
//   node inspect.mjs ../d07-bid-desk/index.html ".deskbar" [width]
import { withPage, report } from './cdp.mjs';

const [, , file, sel, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  report(await page.evaluate(`(() => {
    const e = document.querySelector(${JSON.stringify(sel)});
    if (!e) return 'NOT FOUND';
    const c = getComputedStyle(e), b = e.getBoundingClientRect();
    return {
      cls: e.className, pos: c.position, left: c.left, width: c.width,
      transform: c.transform, translate: c.translate,
      rect: [Math.round(b.left), Math.round(b.right)],
    };
  })()`));
});
