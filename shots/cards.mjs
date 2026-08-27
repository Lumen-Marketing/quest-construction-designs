// The fourteen service tiles alone, as one shot. Nine of them changed
// photograph at once and the crop is pre-baked, so this is the only way to see
// whether any of them lost its subject to the 3:2 window.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

await withPage('../site/services/index.html', { width: 1440, height: 1400 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  const y = await page.evaluate(`(() => {
    const g = document.querySelector('.svcshot').closest('section, .wrap, div');
    return Math.max(0, g.getBoundingClientRect().top + window.scrollY - 40);
  })()`);
  await page.evaluate(`window.scrollTo(0, ${y})`);
  await new Promise((r) => setTimeout(r, 800));
  fs.writeFileSync('./cards-1.png', await page.screenshot());
  await page.evaluate(`window.scrollTo(0, ${y + 1300})`);
  await new Promise((r) => setTimeout(r, 800));
  fs.writeFileSync('./cards-2.png', await page.screenshot());
  console.log('ok', y);
});
