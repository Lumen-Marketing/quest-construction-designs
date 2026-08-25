// Full-page screenshot of one page, with a diagnosis printed alongside it.
//   node page.mjs ../site/index.html ./out.png [width] [acc]
// Chrome enforces a ~500px minimum window width, so for a true phone viewport
// render the page inside a narrow iframe instead — see mob.mjs.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const [, , file, out, widthArg, acc] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width, acc }, async (page) => {
  console.log(file, '->', JSON.stringify(await page.diagnose()));
  fs.writeFileSync(out, await page.fullPageShot());
  console.log('wrote', out);
});
