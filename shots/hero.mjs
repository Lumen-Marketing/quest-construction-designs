import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const [, , w, out] = process.argv;
await withPage('../site/index.html', { width: Number(w) || 1440, height: 820 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  await new Promise((r) => setTimeout(r, 900));
  fs.writeFileSync(out, await page.screenshot());
});
