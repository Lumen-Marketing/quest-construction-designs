// A grid container and how its children actually landed in it.
//   node gridcheck.mjs ../d04-grid-north/contact-us/index.html ".contact-form" [width]
import { withPage, report } from './cdp.mjs';

const [, , file, sel, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  report(await page.evaluate(`(() => {
    const e = document.querySelector(${JSON.stringify(sel)});
    if (!e) return 'NOT FOUND';
    const c = getComputedStyle(e);
    const kids = [...e.children].map((k) => {
      const kc = getComputedStyle(k), b = k.getBoundingClientRect();
      return {
        tag: k.tagName, cls: k.className, disp: kc.display,
        col: kc.gridColumn, x: Math.round(b.left), w: Math.round(b.width),
      };
    });
    return { display: c.display, gtc: c.gridTemplateColumns, gaf: c.gridAutoFlow, gap: c.gap, kids };
  })()`));
});
