import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const [, , w, out] = process.argv;
await withPage('../site/index.html', { width: +w || 1440, height: 800 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  await page.evaluate(`(() => {
    const y = document.querySelector('#offers').getBoundingClientRect().top + scrollY;
    window.scrollTo(0, y + 120);
  })()`);
  await new Promise((r) => setTimeout(r, 800));
  fs.writeFileSync(out, await page.screenshot());
});
