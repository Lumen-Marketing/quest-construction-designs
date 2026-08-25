// Drive a real click on the chooser's palette dots and read the accent back
// from inside each preview iframe — the only real proof the swap landed rather
// than the src merely changing.
//   node click.mjs palHivis ./out.png        (palOrange | palClay | palHivis)
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const target = process.argv[2] || 'palHivis';
const out = process.argv[3] || './click-out.png';

await withPage('../index.html', {
  width: 1440,
  height: 1400,
  // The gallery lays its own deck out first; scrolling before that means
  // scrollHeight is still short and the lower cards never intersect.
  wait: 3000,
  scroll: false,
  flags: ['--allow-file-access-from-files'],
}, async (page) => {
  // Previews are lazy, so walk the whole deck to spawn all seven iframes.
  await page.evaluate(`(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  })()`, { awaitPromise: true });
  await new Promise((r) => setTimeout(r, 7000));

  console.log('previews loaded:', await page.evaluate("document.querySelectorAll('.dcard iframe').length"));

  console.log('CLICK ->', await page.evaluate(`(() => {
    const b = document.getElementById(${JSON.stringify(target)});
    if (!b) return 'NO BUTTON';
    b.click();
    return document.getElementById('palLabel').textContent;
  })()`));

  await new Promise((r) => setTimeout(r, 8000));

  console.log('live --acc per preview ->', JSON.stringify(await page.evaluate(`(() => {
    try {
      return [...document.querySelectorAll('.dcard')].map((c) => {
        const f = c.querySelector('iframe');
        if (!f) return c.querySelector('h2').textContent + ': NO FRAME';
        const d = f.contentDocument;
        const acc = d ? getComputedStyle(d.documentElement).getPropertyValue('--acc').trim() : '?';
        return c.querySelector('h2').textContent + ': ' + acc;
      });
    } catch (e) { return 'ERROR: ' + e.message; }
  })()`), null, 1));

  fs.writeFileSync(out, await page.screenshot());
  console.log('wrote', out);
});
