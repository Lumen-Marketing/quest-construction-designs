// Open the nav drop and ask whether the panel is actually hit-testable, or
// clipped away by an ancestor's overflow.
//   node dropcheck.mjs ../d09-site-notice/index.html [width]
import { withPage, report } from './cdp.mjs';

const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;

await withPage(file, { width }, async (page) => {
  report({ file, ...await page.evaluate(`(() => {
    const d = document.querySelector('.drop');
    if (!d) return { error: 'NO DROP' };
    d.classList.add('open');
    const panel = d.querySelector('.mega,.panel,.menu,.zpanel,.pinned,.flyout,.dropmenu');
    if (!panel) return { error: 'NO PANEL' };
    const b = panel.getBoundingClientRect();
    const nav = document.querySelector('.nav');
    const ns = nav ? getComputedStyle(nav) : null;
    const el = document.elementFromPoint(
      Math.round(b.left + b.width / 2), Math.round(b.top + 8),
    );
    return {
      navOverflow: ns ? ns.overflowX + '/' + ns.overflowY : null,
      panel: {
        top: Math.round(b.top), h: Math.round(b.height),
        w: Math.round(b.width), links: panel.querySelectorAll('a').length,
      },
      hit: el ? el.tagName.toLowerCase() + '.'
        + (typeof el.className === 'string' ? el.className.split(' ')[0] : '') : null,
    };
  })()`) });
});
