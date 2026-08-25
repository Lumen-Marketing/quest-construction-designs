// A long page as a series of viewport-height screenshots.
//   node slices.mjs ../site/index.html ./s 1440 1500
// This exists because a full-page shot of a 7,000px page can hang the renderer
// or blow past a tool timeout.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const [, , file, prefix, widthArg, stepArg] = process.argv;
const width = Number(widthArg) || 1440;
const step = Number(stepArg) || 1200;

await withPage(file, { width, height: step }, async (page) => {
  // Fire every reveal up front so no slice catches a half-faded element.
  const h = await page.evaluate(`(() => {
    document.querySelectorAll('.rv').forEach((e) => e.classList.add('is-in'));
    return document.body.scrollHeight;
  })()`);

  for (let i = 0, y = 0; y < h; y += step, i++) {
    await page.evaluate(`window.scrollTo(0, ${y})`);
    await new Promise((r) => setTimeout(r, 700));
    const out = `${prefix}-${i + 1}.png`;
    fs.writeFileSync(out, await page.screenshot());
    console.log('wrote', out, `(y=${y})`);
  }
});
