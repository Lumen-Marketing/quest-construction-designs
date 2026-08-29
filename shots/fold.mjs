// What sits above the fold at a given viewport, and by how much does a band miss it?
// The hero is sized to leave the trade strip visible on landing, and that is a
// claim only a real render at a real window height can settle.
//   node fold.mjs ../site/index.html 1900 900 [selector]
//
// The viewport is pinned with setDeviceMetricsOverride rather than --window-size,
// because the latter is the OS window: Chrome's own chrome comes off the top and
// innerHeight lands ~96px short of what was asked for.
import { withPage, report } from './cdp.mjs';

const [, , file, w, h, selArg] = process.argv;
const width = Number(w) || 1440;
const height = Number(h) || 900;
const sel = selArg || '.strip';

await withPage(file, { width, height: height + 200 }, async (page) => {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: false,
  });
  await page.evaluate('window.scrollTo(0,0)');
  report(await page.evaluate(`(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return null;
      const b = e.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) }; };
    const target = box(${JSON.stringify(sel)});
    const vh = window.innerHeight;
    return {
      vh, nav: box('.nav'), hero: box('.hero'), target,
      fullyAboveFold: target ? target.bottom <= vh : null,
      pxBelowFold: target ? Math.max(0, target.bottom - vh) : null,
      slackPx: target ? vh - target.bottom : null,
    };
  })()`));
});
