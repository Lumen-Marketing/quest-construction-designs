// The phone probe: a real mobile viewport, by device emulation.
//
//   node phone.mjs http://localhost:8099/ ...more urls    # diagnose
//   node phone.mjs --shot ./out http://localhost:8099/    # and slice it
//   node phone.mjs --width 320 http://localhost:8099/
//
// mob.mjs renders the page inside a 390px iframe, because Chrome will not open
// a window narrower than about 500px. That works but costs three things this
// does not: the iframe is same-origin only, so an http target throws; the page
// still believes it is on a desktop, so `pointer:coarse` and `hover:none` never
// match and every :hover rule stays live; and the 404 cannot be exercised at
// all, since it addresses everything root-absolutely.
//
// Emulation.setDeviceMetricsOverride has none of those limits. Serve the tree
// and point this at it:
//
//   npx http-server site -p 8099 -s
//
// What it reports, all of which were real defects on this site at 390px:
//   sideways — the page scrolls horizontally
//   wide     — elements past the viewport edge (some are meant to bleed)
//   small    — tap targets under WCAG 2.2's 24px floor
//   tiny     — text under 11.5px, which is a desktop labelling size
//   broken   — images that never decoded
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return fallback;
  return argv.splice(i, 2)[1];
};
const shot = opt('shot', null);
const width = Number(opt('width', 390));
const height = Number(opt('height', 844));
const urls = argv.filter((a) => !a.startsWith('--'));

if (!urls.length) {
  console.error('usage: node phone.mjs [--width 390] [--shot ./prefix] <url>...');
  process.exit(1);
}

const PROBE = `(() => {
  const vw = innerWidth;
  const label = (e) => e.tagName.toLowerCase()
    + (e.className ? '.' + String(e.className).trim().split(/\s+/).join('.') : '');
  const all = [...document.querySelectorAll('body *')];
  const uniq = (a) => [...new Set(a)];
  return {
    vw, h: document.body.scrollHeight,
    sideways: document.documentElement.scrollWidth > vw + 1,
    broken: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.getAttribute('src')),
    wide: uniq(all.filter((e) => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && (b.right > vw + 2 || b.left < -2)
        && getComputedStyle(e).position !== 'fixed';
    }).map(label)).slice(0, 10),
    small: uniq([...document.querySelectorAll('a,button,summary,input,select,textarea')]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && (b.width < 24 || b.height < 24);
      })
      .map((e) => {
        const b = e.getBoundingClientRect();
        return label(e) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height)
          + ' "' + (e.textContent || '').trim().slice(0, 22) + '"';
      })).slice(0, 10),
    tiny: uniq(all.filter((e) => e.children.length === 0
        && (e.textContent || '').trim().length > 2
        && parseFloat(getComputedStyle(e).fontSize) < 11.5)
      .map((e) => label(e) + ' @' + getComputedStyle(e).fontSize)).slice(0, 8),
  };
})()`;

for (const [n, url] of urls.entries()) {
  // The window is opened wide and then overridden: the override is what the
  // page measures, and Chrome refuses to open the window at phone width.
  // eslint-disable-next-line no-await-in-loop
  await withPage(url, { width: 900, height: 900, wait: 900, scroll: false }, async (page) => {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: true,
    });
    await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await new Promise((r) => setTimeout(r, 400));
    await page.settle();

    console.log(`\n### ${url}`);
    console.log(JSON.stringify(await page.evaluate(PROBE), null, 1));
    if (!shot) return;

    // Reveals fire on intersection; a slice caught mid-fade reads as a bug.
    const h = await page.evaluate(`(() => {
      document.querySelectorAll('.rv').forEach((e) => e.classList.add('in'));
      return document.body.scrollHeight;
    })()`);
    const stem = urls.length > 1 ? `${shot}-${String(n + 1).padStart(2, '0')}` : shot;
    for (let i = 0, y = 0; y < h; y += height, i++) {
      // eslint-disable-next-line no-await-in-loop
      await page.evaluate(`scrollTo(0, ${y})`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 260));
      const out = `${stem}-${String(i + 1).padStart(2, '0')}.png`;
      // eslint-disable-next-line no-await-in-loop
      fs.writeFileSync(out, await page.screenshot());
      console.log('wrote', out, `(y=${y})`);
    }
  });
}
