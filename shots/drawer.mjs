// Open the phone drawer at a range of scroll offsets and check it actually
// lands in the viewport, with the close button reachable and the page not
// jumping underneath. The lock breaks sticky, so this is the regression that
// let the menu open thousands of pixels above the fold.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const shot = process.argv[3];
let bad = 0;
await withPage('../site/index.html', { width: 390, height: 780 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  for (const y of [0, 900, 2400, 6000, 11000]) {
    await page.evaluate(`(() => {
      const n = document.querySelector('.nav nav');
      if (n.classList.contains('open')) document.querySelector('.navtoggle').click();
      window.scrollTo(0, ${y});
    })()`);
    await new Promise((r) => setTimeout(r, 400));
    const before = JSON.parse(await page.evaluate(
      `JSON.stringify({y:window.scrollY, top:document.elementFromPoint(200,400)?.className||''})`));
    await page.evaluate(`document.querySelector('.navtoggle').click()`);
    await new Promise((r) => setTimeout(r, 450));
    const m = JSON.parse(await page.evaluate(`(() => {
      const nav = document.querySelector('.nav').getBoundingClientRect();
      const sheet = document.querySelector('.nav nav').getBoundingClientRect();
      const t = document.querySelector('.navtoggle').getBoundingClientRect();
      // what is actually under the middle of the screen: the sheet, or the page?
      const hit = document.elementFromPoint(200, 400);
      return JSON.stringify({
        navTop: Math.round(nav.top), sheetTop: Math.round(sheet.top),
        sheetBottom: Math.round(sheet.bottom),
        closeVisible: t.top >= 0 && t.bottom <= innerHeight,
        hitInSheet: !!hit && !!hit.closest('.nav nav'),
        shift: Math.round(document.querySelector('.hero').getBoundingClientRect().top) });
    })()`));
    const ok = m.navTop === 0 && m.sheetTop > 0 && m.sheetTop < 100
      && m.closeVisible && m.hitInSheet;
    if (!ok) bad++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} y=${String(before.y).padStart(5)}  nav@${m.navTop}`
      + `  sheet ${m.sheetTop}..${m.sheetBottom}  close=${m.closeVisible}`
      + `  centre-in-sheet=${m.hitInSheet}  heroTop=${m.shift}`);
    if (shot && y === 2400) fs.writeFileSync(shot, await page.screenshot());
  }
});
console.log(bad === 0 ? '\nPASS — the drawer opens in the viewport at every offset.'
  : `\nFAIL — ${bad} offset(s) open the drawer off-screen.`);
process.exit(bad ? 1 : 0);
