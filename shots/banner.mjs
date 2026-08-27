// The top of a page: the accent plane and the plate cut into it. The banner
// slot is landscape and about 500x340, which is why a portrait frame can never
// go in it — this is the check that nothing portrait slipped through.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const [, , file, out] = process.argv;
await withPage(file, { width: 1440, height: 760 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  await new Promise((r) => setTimeout(r, 600));
  fs.writeFileSync(out, await page.screenshot());
  console.log('wrote', out);
});
