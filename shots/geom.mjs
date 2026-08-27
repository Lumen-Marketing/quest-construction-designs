// Where the object's left edge sits against the copy column's right edge, at
// every width the wide layout covers. A negative gap is the gloves under the
// type, which is what the contrast harness reports as a failure two steps on.
import { withPage } from './cdp.mjs';
for (const w of [1081, 1120, 1200, 1240, 1280, 1320, 1360, 1440, 1600, 1920]) {
  await withPage('../site/index.html', { width: w, height: 900 }, async (page) => {
    const m = JSON.parse(await page.evaluate(`(() => {
      const q = s => document.querySelector(s).getBoundingClientRect();
      const k = q('.hero-kit'), t = q('.hero-trust'), c = q('.hero-copy'), g = q('.hero-glow');
      const edge = Math.max(t.right, c.right);
      return JSON.stringify({ copyRight: Math.round(edge),
        kitLeft: Math.round(k.left), glowLeft: Math.round(g.left) });
    })()`));
    const gapK = m.kitLeft - m.copyRight;
    const gapG = m.glowLeft - m.copyRight;
    console.log(`${String(w).padStart(5)}  copy right ${String(m.copyRight).padStart(4)}  `
      + `kit gap ${String(gapK).padStart(4)}  glow gap ${String(gapG).padStart(4)}`
      + `${gapK < 0 || gapG < 0 ? '   OVERLAP' : ''}`);
  });
}
