// Every place the accent is used as TEXT, and what it is sitting on.
//   node shots/acctext.mjs ../d06-red-iron/index.html clay
//
// The palette module can assert a pairing, but only the page knows which
// pairings actually occur: whether a given `color:var(--acc)` lands on cream,
// on the near-black band, or on the accent plane itself. Clay is 3.51:1 on the
// dark ground — fine for a rule or a focus ring, short of the body-text bar —
// so "where is the accent small text on a dark ground" has to be answered by
// walking the rendered page, not by reading the stylesheet.
//
// It reports EVERY accent-coloured run of text, not only the failing ones,
// because the fix is per-rule: a rule may only be switched to the lifted
// on-dark value if every ground it ever lands on is dark. One row per element:
// the authored rule, the glyph size, the ground's luminance, and the measured
// ratio against it.
import { withPage, report } from './cdp.mjs';

const [, , target, acc = 'clay'] = process.argv;
if (!target) {
  console.error('usage: node shots/acctext.mjs <page> [acc]');
  process.exit(1);
}

const SCAN = `(() => {
  const chan = (v) => { const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  const parse = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 4).map(Number);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  // The first ancestor that actually paints something is the ground the glyph
  // is read against; a chain of transparent boxes paints nothing.
  const ground = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const p = parse(getComputedStyle(n).backgroundColor);
      if (p.length === 3 || p[3] > 0.5) return p.slice(0, 3);
    }
    return [255, 255, 255];
  };
  const label = (e) => e.tagName.toLowerCase()
    + (e.id ? '#' + e.id : '')
    + '.' + String(e.className || '').trim().split(/\\s+/).filter(Boolean).join('.');

  const hex = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim();
  const rgb = hex.startsWith('#')
    ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    : parse(hex);

  // Which authored rule painted this glyph. Knowing the finding is not the
  // same as knowing what to edit: the same eyebrow is set by a different
  // selector in every direction, and several are set twice.
  //
  // A plain style rule also carries an (empty) .cssRules now that Chrome
  // supports nested CSS, so the style check has to come first or every rule
  // recurses into nothing and the list comes back empty.
  const rules = [];
  for (const sheet of document.styleSheets) {
    let list; try { list = sheet.cssRules; } catch { continue; }
    const walk = (l) => { for (const r of l) {
      if (r.selectorText && r.style && r.style.getPropertyValue('color')) rules.push(r);
      if (r.cssRules && r.cssRules.length) walk(r.cssRules);
    } };
    walk(list);
  }
  const painter = (el) => {
    const hit = rules.filter((r) => {
      try { return el.matches(r.selectorText); } catch { return false; }
    });
    // The last matching rule is not necessarily the winning one — a broad
    // \`a { color:inherit }\` matches too. The rule that names the accent is
    // the one worth reporting, and the last of those is the one in force.
    const acc = hit.filter((r) => /--acc/.test(r.style.getPropertyValue('color')));
    const last = (acc.length ? acc : hit)[(acc.length ? acc : hit).length - 1];
    return last ? last.selectorText : '?';
  };

  const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 2);
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    // Only elements holding their own text — a wrapper inherits the colour but
    // paints no glyphs, and would multiply-count every finding.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim()).length;
    if (!own) continue;
    const cs = getComputedStyle(el);
    const col = parse(cs.color).slice(0, 3);
    if (!near(col, rgb)) continue;
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight) || 400;
    // WCAG large text: 24px, or 18.66px at 700+. Those clear at 3:1.
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const g = ground(el);
    const rule = painter(el);
    const key = rule + '|' + Math.round(size) + '|' + g.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      rule, el: label(el).slice(0, 60),
      text: el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 30),
      px: Math.round(size * 10) / 10, weight, large,
      groundLum: Math.round(lum(g) * 1000) / 1000,
      ratio: ratio(col, g), needs: large ? 3 : 4.5,
    });
  }
  return { accent: hex, findings: out };
})()`;

// Under file:// every document gets an opaque origin, so reading .cssRules off
// a linked stylesheet throws SecurityError and every finding reports its rule
// as '?'. This flag is what makes the stylesheet readable to the page.
await withPage(target, { acc, flags: ['--allow-file-access-from-files'] }, async (page) => {
  report({ url: page.url, ...await page.evaluate(SCAN) });
});
