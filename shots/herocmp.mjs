// The hero band with each candidate frame in it. The band is far wider than
// anything in the library is shot, so the only way to know which survives the
// crop is to put each one through it.
import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const CANDS = ['framing-desert-lot', 'framing-clouds', 'aerial-crane',
  'framing-garage', 'aerial-tearoff', 'custom-home-wide'];
await withPage('../site/index.html', { width: 1440, height: 620 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  for (const c of CANDS) {
    await page.evaluate(`(() => {
      const i = document.querySelector('.hero-shot img');
      i.src = '../assets/quest/${c}.webp';
    })()`);
    await new Promise((r) => setTimeout(r, 800));
    fs.writeFileSync(`./hc-${c}.png`, await page.screenshot());
  }
  console.log('ok');
});
