// True 390px phone render. Chrome will not open a window narrower than ~500px,
// so the page goes inside a 390px iframe and we shoot that.
//   node mob.mjs ../site/index.html ./m.png [height]
import fs from 'node:fs';
import { join } from 'node:path';
import { withPage, REPO, report } from './cdp.mjs';

const [, , file, out, heightArg] = process.argv;
const height = Number(heightArg) || 6000;

const wrapper = join(REPO, 'shots', `.mob-${process.pid}.html`);
fs.writeFileSync(wrapper, `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#2a2a28}
iframe{width:390px;height:${height}px;border:0;display:block;margin:0}</style>
<iframe src="${file.replace(/^\.\.\//, '../')}"></iframe>`);

try {
  await withPage(`.mob-${process.pid}.html`, {
    width: 390,
    height: 1000,
    wait: 3000,
    scroll: false,
    // Without this the wrapper cannot script into the iframe, so reveals never
    // fire and the shot comes back blank below the fold.
    flags: ['--allow-file-access-from-files'],
  }, async (page) => {
    // Reveals inside the iframe fire on the IFRAME's own scroll position, so
    // drive that document directly rather than the wrapper's.
    const diag = await page.evaluate(`(async () => {
      try {
        const w = document.querySelector('iframe').contentWindow, d = w.document;
        d.querySelectorAll('.rv').forEach((e) => e.classList.add('is-in'));
        // nothing scrolls inside a tall iframe, so lazy images would never fire
        [...d.images].forEach((i) => { i.loading = 'eager'; });
        await Promise.all([...d.images].map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
        await new Promise((r) => setTimeout(r, 400));
        const label = (e) => e.tagName.toLowerCase()
          + '.' + String(e.className || '').trim().split(/\s+/).join('.');
        return {
          pageH: d.body.scrollHeight,
          scrollW: d.documentElement.scrollWidth,
          vw: w.innerWidth,
          sideways: d.documentElement.scrollWidth > w.innerWidth + 1,
          broken: [...d.images].filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.getAttribute('src')),
          wide: [...d.querySelectorAll('body *')].filter((e) => {
            const b = e.getBoundingClientRect();
            return b.width > 0 && (b.right > w.innerWidth + 2 || b.left < -2)
              && w.getComputedStyle(e).position !== 'fixed';
          }).slice(0, 12).map((e) => {
            const b = e.getBoundingClientRect();
            return label(e) + ' [' + Math.round(b.left) + '..' + Math.round(b.right) + ']';
          }),
        };
      } catch (e) { return { error: e.message }; }
    })()`, { awaitPromise: true });
    console.log(file, '->', JSON.stringify(diag));

    // captureBeyondViewport does not reliably paint content far below the fold,
    // so walk the OUTER window down the whole surface first to force it.
    await page.evaluate(`(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    })()`, { awaitPromise: true });

    fs.writeFileSync(out, await page.screenshot({ captureBeyondViewport: true }));
    console.log('wrote', out);
  });
} finally {
  fs.unlinkSync(wrapper);
}
