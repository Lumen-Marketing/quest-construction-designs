// Does the page actually scroll sideways? Tries to scroll and reads it back.
//   node sideways.mjs ../d03-split-bay/index.html [width]
// This is the one that settles arguments: documentElement.scrollWidth
// over-reports, because body{overflow-x:hidden} propagates to the viewport and
// leaves body's own used value visible. Scrolling and reading back does not.
import { withPage, report } from './cdp.mjs';

const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  const r = await page.evaluate(`(() => {
    window.scrollTo(99999, 0);
    const x = Math.round(window.scrollX);
    window.scrollTo(0, 0);
    return {
      clientW: document.documentElement.clientWidth,
      scrollW: document.documentElement.scrollWidth,
      maxScrollX: x,
    };
  })()`);
  report({ file, width, ...r, sideways: r.maxScrollX > 0 });
});
