import fs from 'node:fs';
import { withPage } from './cdp.mjs';
const [, , w, h, out] = process.argv;
await withPage('../site/index.html', { width: +w, height: +h }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);
  await new Promise((r) => setTimeout(r, 900));
  const m = await page.evaluate(`(() => {
    const q = s => document.querySelector(s).getBoundingClientRect();
    const k = q('.hero-kit'), hr = q('.hero'), b = q('.badge-float'), t = q('.hero-trust');
    return JSON.stringify({ hero:[hr.top,hr.bottom].map(Math.round),
      kit:[k.left,k.top,k.right,k.bottom].map(Math.round),
      footCut: k.bottom > hr.bottom, headCut: k.top < hr.top,
      badge:[b.left,b.top,b.right,b.bottom].map(Math.round),
      badgeOverKit: b.left < k.right && b.top < k.bottom && b.bottom > k.top,
      kitOverTrust: k.left < t.right && k.top < t.bottom && k.bottom > t.top });
  })()`);
  console.log(m);
  fs.writeFileSync(out, await page.screenshot());
});
