// The one to reach for first: lists broken images and names every element
// sticking out past the viewport, which is far quicker than eyeballing a
// screenshot of a page that scrolls sideways.
//   node probe.mjs ../site/index.html [width]
//
// It no longer reports below-the-fold lazy images as broken — the harness
// walks the page and waits for every image to decode before this runs.
import { withPage, report } from './cdp.mjs';

const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => report(await page.diagnose()));
