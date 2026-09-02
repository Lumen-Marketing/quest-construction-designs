import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage, allPagesFor } from '../build.mjs';
import * as d01 from './d01.mjs';
import { MAIN_TAG } from '../lib/page-rules.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NEWLINE = new RegExp('\r?\n');
const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;
const groups = JSON.parse(readFileSync('content/service-groups.json', 'utf8')).groups;
const regions = JSON.parse(readFileSync('content/areas.json', 'utf8')).regions;
const site = JSON.parse(readFileSync('content/site.json', 'utf8'));

test('direction 01 is the one indexable direction', () => {
  assert.equal(d01.meta.slug, 'd01-site-plan');
  assert.equal(d01.meta.indexable, true);
});

test('the navbar links every service and every area, from any depth', () => {
  const html = renderPage({ mod: d01, key: 'services/adu' });
  for (const s of services) {
    assert.ok(html.includes(`../../services/${s.slug}/index.html`), `nav missing service ${s.slug}`);
  }
  for (const a of areas) {
    assert.ok(html.includes(`../../service-areas/${a.slug}/index.html`), `nav missing area ${a.slug}`);
  }
});

test('the navbar carries the real phone number as a tel link', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.ok(html.includes('(602) 399-6455'));
});

test('the footer states the real founding year and no invented figures', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Since 2018'));
  assert.doesNotMatch(html, /est\.\s*2010|340\+|\b96%|4\.9\b|87 reviews/);
});

test('the mobile nav toggle and dropdowns are present and labelled', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /class="navtoggle"[^>]*aria-label="Toggle navigation"/);
  assert.equal((html.match(/class="dropmenu/g) || []).length, 2);
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 3);
});

// ---------------------------------------------------------------- the phone
// The drawer shipped broken: `.nav .wrap` is a hard `height`, the open menu
// wrapped onto a second flex line inside it, and so it overflowed the header
// box — twenty-six items rendered transparent over the hero. These pin the
// shape of the fix rather than the pixels.

test('the phone drawer is positioned against the header, not the viewport', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const drawer = css.match(/\.nav nav\.open\{[\s\S]*?\}/);
  assert.ok(drawer, 'no rule for the open drawer');
  // `.nav` sets a backdrop-filter, which makes it the containing block for
  // any fixed descendant — a fixed drawer collapses to the header's height.
  assert.match(drawer[0], /position:absolute/);
  assert.doesNotMatch(drawer[0], /position:fixed/);
  // Transparent is what it was; an opaque ground is the whole repair.
  assert.match(drawer[0], /background:var\(--cream\)/);
});

test('the header height is one token, and the anchor offset is derived from it', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  assert.match(css, /--navh:82px/);
  assert.match(css, /\.nav \.wrap\{[^}]*height:var\(--navh\)/);
  assert.match(css, /scroll-margin-top:calc\(var\(--navh\)/);
});

test('the call button survives the phone breakpoint, and carries a glyph there', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /class="btn acc navtel"[\s\S]*?aria-label="Call \(602\) 399-6455"/);
  assert.match(html, /class="navtel-num telnum">\(602\) 399-6455</);
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // It used to be display:none'd at exactly the width where tapping a number
  // is the easiest thing a visitor can do.
  assert.doesNotMatch(css, /\.navtel\{display:none\}/);
});

test('every rendered phone number is set in the mono face, and none is tracked tight', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // The treatment lives in one rule rather than smeared across six layout
  // selectors, so there is one place to change it again.
  const rule = /\.telnum\{[^}]*\}/.exec(css);
  assert.ok(rule, 'no rule for the phone number');
  assert.match(rule[0], /font-variant-numeric:tabular-nums/,
    'the digits do not share an advance width');
  assert.match(rule[0], /letter-spacing:\.0[1-9]/,
    'the digits are not given room');

  // Not a monospace face. JetBrains Mono's zero is dotted — a code convention
  // for telling 0 from a capital O — and at the sizes this renders it reads as
  // an 8. A phone number has no letters in it, so that trade is all cost.
  assert.doesNotMatch(rule[0], /monospace|JetBrains/,
    'the number is back on a face whose zero carries a dot');

  // Wherever the number renders as digits a visitor reads and dials, it carries
  // the class. Prose links keep the body face on purpose — a mono run inside a
  // sentence is worse, not better — so only standalone renders are checked.
  for (const key of ['home', 'contact', 'service-areas/mesa-az']) {
    const html = renderPage({ mod: d01, key });
    const tags = html.match(/<(?:a|b|span)[^>]*>\(602\) 399-6455</g) || [];
    assert.ok(tags.length > 0, `${key} shows the number at least once`);
    for (const tag of tags) {
      assert.match(tag, /class="[^"]*\btelnum\b/,
        `${key}: a standalone number without .telnum — ${tag}`);
    }
  }

  // Negative tracking on a phone number is the bug this fixes: it closes up
  // 3/9/6/8 exactly where they need to stay apart. It must not creep back.
  for (const rule of [/\.help-card \.phone\{[^}]*\}/, /\.localcall b\{[^}]*\}/,
    /\.badge b\{[^}]*\}/, /\.navcall>a\{[^}]*\}/]) {
    const m = rule.exec(css);
    assert.ok(m, `${rule} still matches a rule`);
    assert.doesNotMatch(m[0], /letter-spacing:-/,
      `the digits must not be tracked tight — ${m[0]}`);
  }
});

test('the drawer ends with the number, and the wide nav does not repeat it', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<div class="navcall">[\s\S]*?tel:16023996455/);
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  assert.match(css, /\.navcall\{display:none\}/);
});

test('the footer groups the trades, and loses none of them', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const foot = html.slice(html.indexOf('<footer'));
  const block = foot.slice(foot.indexOf('<div class="fareas ftrades">'));
  // Four headed blocks rather than one two-up column of fourteen. col2 is
  // gone with it: the Company list is short enough to stay one per row and
  // both long lists have their own grouped block now.
  assert.ok(!html.includes('class="col2"'), 'the two-up trade column survived');
  for (const g of groups) {
    assert.ok(block.includes(`<p class="fgrp-h">${esc(g.name)}</p>`),
      `footer missing the ${g.name} block`);
  }
  for (const s of services) {
    assert.ok(block.includes(`services/${s.slug}/index.html">${esc(s.name)}</a>`),
      `footer missing ${s.slug}`);
  }
});

test('every trade sits in exactly one menu group, and none is left out', () => {
  const placed = groups.flatMap((g) => g.services);
  assert.deepEqual([...placed].sort(), services.map((s) => s.slug).sort(),
    'the groups and the trades have drifted apart');
  assert.equal(new Set(placed).size, placed.length, 'a trade is in two groups');
});

test('no trade name carries a parenthetical, in the menu or anywhere else', () => {
  // "Full Remodel (kitchen, bathroom,cabinets, flooring, counter tops)" was the
  // longest label in the site and the reason SHORT_NAME existed. The detail is
  // prose on the page now, not a bracket in a menu.
  for (const s of services) {
    assert.ok(!s.name.includes('('), `${s.slug} name still has a parenthetical`);
    assert.ok(!s.h1.includes('('), `${s.slug} h1 still has a parenthetical`);
    assert.ok(!s.ctaHeading.includes('('), `${s.slug} CTA still has a parenthetical`);
  }
});

test('the footer lists the principal cities, not all thirty-four', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const foot = html.slice(html.indexOf('<footer'));
  const block = foot.slice(foot.indexOf('<div class="fareas fcities">'));
  const listed = [...block.matchAll(/service-areas\/([a-z0-9-]+)\/index\.html/g)]
    .map((m) => m[1]);
  assert.ok(listed.length <= 12, `the footer lists ${listed.length} cities`);
  assert.ok(listed.length >= 8, `the footer lists only ${listed.length} cities`);
  // Named without the state they are already standing under.
  for (const slug of listed) {
    const a = areas.find((x) => x.slug === slug);
    assert.ok(block.includes(`${slug}/index.html">${esc(a.city)}</a>`), `${slug} label`);
  }
  // No valley headings: five of them over a partial list would read as the
  // whole coverage.
  for (const r of regions) {
    assert.ok(!block.includes(`<p class="fgrp-h">${esc(r.name)}</p>`),
      `the footer still heads a partial list with ${r.name}`);
  }
});

test('the footer loses no crawl path, because the nav already carries them all', () => {
  // The thirty-four cities and fourteen trades were in the footer AND in the
  // nav panel on every page. Cutting the footer list is only safe while that
  // stays true, so this asserts it rather than trusting it.
  const html = renderPage({ mod: d01, key: 'home' });
  const nav = html.slice(html.indexOf('<header class="nav">'), html.indexOf('</header>'));
  for (const a of areas) {
    assert.ok(nav.includes(`service-areas/${a.slug}/index.html`),
      `the nav does not reach ${a.slug}`);
  }
  for (const svc of services) {
    assert.ok(nav.includes(`services/${svc.slug}/index.html`),
      `the nav does not reach ${svc.slug}`);
  }
});

test('a slow navigation gets a skeleton and a fast one never sees it', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  // The delay is the whole design. Every navigation on this site is a full
  // document load, and most of them are done in well under a fifth of a
  // second — a skeleton that appears and vanishes inside that reads as a
  // flicker and costs confidence rather than buying it.
  assert.match(html, /DELAY=450/);
  // Armed on links that actually replace the document, and on nothing else:
  // another origin, a tel: or mailto:, or an anchor inside this page.
  assert.match(html, /u\.origin!==location\.origin\) return/);
  assert.match(html, /u\.pathname===location\.pathname&&u\.search===location\.search\) return/);
  // A restored bfcache page brings the DOM back exactly as it was left, so
  // without this the skeleton comes back with it and never leaves.
  assert.match(html, /addEventListener\('pageshow',hide\)/);
  assert.match(html, /addEventListener\('pagehide',hide\)/);
  // And a load that never lands has to give the page back.
  assert.match(html, /FAILSAFE=12000/);
});

test('the skeleton sits below the header and holds still for reduced motion', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const skel = css.match(/\.skel\{[\s\S]*?\}/);
  assert.ok(skel, 'no rule for the skeleton overlay');
  // Below the header rather than over it: the page being loaded carries the
  // same header, and leaving it in place is what makes the wait read as a
  // navigation rather than as a crash.
  assert.match(skel[0], /inset:var\(--navh\) 0 0/);
  // Above the dropdown panels, or an open menu floats over the skeleton.
  assert.match(skel[0], /z-index:240/);
  assert.ok(css.includes('.sk{animation:none}'), 'the shimmer ignores reduced motion');
});

test('the phone drawer survives its own scroll lock', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // The drawer locks the document scroll so the page behind the sheet cannot
  // move. `overflow:hidden` on the document also stops `position:sticky` from
  // sticking: the header dropped back to its static position at the top of the
  // DOCUMENT, and the sheet — absolutely positioned against the header's
  // bottom edge — went with it. Opening the menu 2,400px down opened it 2,400px
  // above the viewport, and since the close button lives in the header there
  // was no way back out of it.
  //
  // Anything that locks the scroll has to stop leaning on sticky. This pins
  // the pair rather than the offsets: lock the document, fix the header.
  const lock = /html\.nav-open[^{]*\{[^}]*overflow:\s*hidden/.test(css);
  if (!lock) return;
  assert.match(css, /html\.nav-open\s+\.nav\{[^}]*position:fixed/,
    'the drawer locks the document scroll while the header is still sticky');

  // And a fixed header is out of the flow, so the page rides up by its full
  // height — border included — the instant the menu opens. That shift is
  // hidden behind the sheet but shows on the way back out.
  assert.match(css, /html\.nav-open\s+body\{[^}]*padding-top:/,
    'the header leaves the flow while open and nothing replaces the space');
});

test('the voucher stub has a ground, and none of it lands on the amount', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // Above the seam the voucher has a photograph, a torn edge and holes punched
  // through it. Below it was flat colour with four things sitting on top, and
  // that is the half Quest called flat. Three layers go under the content now.
  const before = /\.offer-body::before\{[^}]*\}/.exec(css);
  const after = /\.offer-body::after\{[^}]*\}/.exec(css);
  assert.ok(before, 'the stub has no light on it');
  assert.ok(after, 'the stub has no material on it');
  assert.equal((html.match(/class="offer-ghost"/g) || []).length,
    2, 'the amount is not printed behind itself');
  // It is the amount again, so a screen reader must not read it twice.
  assert.match(html, /<span class="offer-ghost" aria-hidden="true">/);

  // And now the constraint that shapes all three. The amount is set in --acc —
  // the RAW accent, not --acc-on-dark — and on the clay palette the raw accent
  // is a dark terracotta. On the bare card, before any of this existed, it
  // measured 3.21:1 against a 3:1 bar. That seven percent is the entire budget
  // for lighting this surface, and lifting the field toward a dark numeral's
  // own hue spends it: a four percent white wash across the head alone took it
  // to 2.88.
  //
  // So the head is in shadow and the light comes from beyond the right edge.
  // Both halves are load-bearing and either one alone is a regression.
  assert.match(css, /\.offer b\{[^}]*color:var\(--acc\)/,
    'the amount no longer uses the raw accent, so this reasoning needs rechecking');
  assert.match(before[0], /linear-gradient\(180deg,rgba\(0,0,0,\.\d+\) 0%/,
    'nothing shadows the head of the stub, where the amount sits');
  const bloom = /radial-gradient\(([^)]*)at (\d+)% (\d+)%,\s*color-mix\(in srgb,var\(--acc\)/
    .exec(before[0]);
  assert.ok(bloom, 'the accent light on the stub is gone or has moved');
  assert.ok(Number(bloom[2]) > 100,
    `the light is thrown from ${bloom[2]}% — it has to come from beyond the right edge, `
    + 'or its core lands on the amount');

  // The numeral's own shadow is black for the same reason. A glow in its own
  // hue lifts the field immediately around it toward its colour, which is a
  // contrast ratio running backwards.
  const amount = /\.offer b\{[^}]*\}/.exec(css)[0];
  assert.match(amount, /text-shadow:[^;]*rgba\(0,0,0/, 'the amount casts no shadow');
  assert.doesNotMatch(amount, /text-shadow:[^;}]*var\(--acc\)/,
    'the amount glows in its own colour, which lowers its own contrast');
});

test('the hero is the photograph, with nothing standing in front of it', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // Quest asked the materials cut-out out of the hero. It was also the one
  // image in the tree with no licence metadata behind it, so this is a rights
  // improvement as well as a design one — see content/outsourced.json.
  assert.doesNotMatch(html, /class="hero-kit"/, 'the hero object is back');
  assert.doesNotMatch(html, /mat\/kit\.webp/, 'the materials cut-out is back');

  // Everything that existed only to make that object read as forward has to go
  // with it. A pool of warm light with nothing standing in it is an orange
  // blob on a photograph, and an offset derived from a column for an element
  // that no longer exists is arithmetic nobody can explain later.
  for (const dead of [/class="hero-glow"/, /\.hero-kit\{/, /--kit-left:/, /@keyframes settle/]) {
    assert.doesNotMatch(css, dead, `${dead} outlived the object it was for`);
    assert.doesNotMatch(html, dead, `${dead} outlived the object it was for`);
  }

  // What remains is the photograph and the scrim that keeps type legible on it.
  assert.match(html, /class="hero-shot"/, 'the hero has no photograph');
  assert.match(css, /\.hero-shot::before\{[^}]*radial-gradient/,
    'the frame has no vignette, so the corners do not go back');
  assert.match(css, /\.hero-shot::after\{[^}]*linear-gradient/,
    'the frame has no scrim, so the copy sits on bare photograph');
});

test('the hero photograph is the aerial, eager and preloaded', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  // It is the LCP element. Lazy or unpreloaded costs real Core Web Vitals.
  const hero = /<div class="hero-shot">(<img[^>]*>)/.exec(html);
  assert.ok(hero, 'no hero photograph');
  assert.match(hero[1], /aerial-crane\.webp/, 'the hero is not the aerial');
  assert.doesNotMatch(hero[1], /loading="lazy"/, 'the LCP image is lazy');
  assert.match(hero[1], /width="\d+" height="\d+"/, 'the hero has no intrinsic size');
});

test('the phone badge sits level with the figures, not at an offset of its own', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // It was absolutely positioned at bottom:6%, then 13% — numbers picked to
  // look right at one viewport, tracking nothing. Quest asked for it level
  // with the founding year, and the only way that stays true at every width is
  // for the two to share a row.
  assert.match(html, /<div class="hero-foot">[\s\S]*?class="hero-trust"[\s\S]*?class="badge badge-float"[\s\S]*?<\/div>\s*<\/div>/,
    'the badge and the figures are not in the same row');

  const foot = /\.hero-foot\{[^}]*\}/.exec(css);
  assert.ok(foot, 'no rule for the hero foot row');
  assert.match(foot[0], /display:flex/, 'the row is not a flex row');
  assert.match(foot[0], /align-items:center/, 'the two are not centred against each other');

  const badge = /\.badge-float\{[^}]*\}/.exec(css);
  assert.ok(badge, 'no rule for the badge');
  // No offsets left behind. A stale bottom:% on an in-flow element does
  // nothing, which is worse than doing something wrong — it reads as intent.
  for (const dead of [/bottom:/, /right:/, /left:/, /top:/, /position:absolute/]) {
    assert.doesNotMatch(badge[0], dead, `the badge still carries ${dead}`);
  }
  // The gap above the row belongs to the row. On the figures alone, centring
  // measures their margin box and the badge rides high of the numbers.
  assert.doesNotMatch(/\.hero-trust\{[^}]*\}/.exec(css)[0], /margin-top:/,
    'the figures carry the row gap, so the badge cannot centre against them');
  assert.match(foot[0], /margin-top:/, 'the row has no gap above it');

  // Still above every layer the hero stacks under it.
  const z = Number(/z-index:(\d+)/.exec(badge[0])[1]);
  assert.ok(z >= 4, `the badge sits at z-index ${z}, under the hero's own layers`);
});

test('the hero is one full-bleed photograph, read off a scrim', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // The hero used to be a frameless cut-out standing on an accent plane. It is
  // the banner construction now — the frame edge to edge, a directional scrim
  // over it, the type read off the dark — which is what every other page on
  // the site already opened on. One frame in the slot, not a stack of plates.
  const objs = html.match(/<div class="hero-shot">\s*<img[^>]*>/g) || [];
  assert.equal(objs.length, 1, `expected one hero frame, found ${objs.length}`);
  assert.equal((html.match(/class="mat m\d"/g) || []).length, 0, 'the plate stack is back');
  assert.equal((html.match(/class="machine"/g) || []).length, 0,
    'the old accent-plane object is back under its old class');

  // It is the LCP image: eager, prioritised, and the one thing preloaded.
  assert.match(objs[0], /loading="eager" fetchpriority="high"/);
  assert.equal((html.match(/rel="preload"[^>]*as="image"/g) || []).length, 1);
  // Real alt, not decorative. The banners' plates are aria-hidden because the
  // page's own H1 names what they show; "From Concept to Creation" does not.
  assert.match(objs[0], /alt="[^"]{20,}"/, 'the hero frame carries no real alt text');

  // The type is legible because of the scrim, so the scrim is the load-bearing
  // part: a frame with no scrim over it is white text on a photograph.
  assert.match(css, /\.hero-shot::after\{[^}]*linear-gradient\([^)]*var\(--dark\)/,
    'the hero frame has no scrim over it');
  // And the copy column has to sit inside the heavy end of it. The scrim runs
  // 96deg — left to right — so the column cannot be wider than the dark half.
  const copy = /\.hero-copy\{max-width:min\((\d+)px,(\d+)%\)/.exec(css);
  assert.ok(copy, 'the hero copy column has no width cap');
  assert.ok(Number(copy[2]) <= 55,
    `the copy column runs to ${copy[2]}% and the scrim lets go before that`);

  // The old hero drew its ghost pill filled with the accent, because it stood
  // on an orange plane. This ground is a photograph on near-black — the same
  // ground the banner's ghost was drawn for — and filling it with the accent
  // put cream on orange at 1.89:1.
  assert.doesNotMatch(css, /\.hero \.btn\.ghost\{background:var\(--acc\)\}/,
    'the hero ghost button is still filled for the accent plane it no longer stands on');
});

test('the accent bar is textured in ink and never in the ink it carries', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // The whole trap in one test. --on-acc is near-black on the gold and orange
  // palettes and WHITE on clay, so a decoration tinted with it moves the field
  // TOWARD the type on clay and eats the contrast: measured, the grid and
  // hatch drawn that way cost clay 5.26:1 down to 3.60:1. Drawn in --ink they
  // move away from the type on all three at once. Anyone reaching for a white
  // sheen here to make the bar glossier will pass a visual check on the live
  // palette and fail one nobody looks at.
  for (const layer of ['::before', '::after']) {
    const m = new RegExp(`\\.cta-bar${layer}\\{[^}]*\\}`).exec(css);
    assert.ok(m, `no .cta-bar${layer} rule`);
    const rule = m[0];
    assert.ok(!/var\(--on-acc\)/.test(rule),
      `.cta-bar${layer} tints with --on-acc, which is white on the clay palette`);
    // #fff appears legitimately inside mask-image, where it is a mask channel
    // and not a colour. Only the paint is checked.
    const paint = rule.split(/mask-image/)[0];
    assert.ok(!/#fff|#ffffff|\bwhite\b/i.test(paint),
      `.cta-bar${layer} paints with white, which the clay palette cannot afford`);
    assert.match(paint, /var\(--ink\)/, `.cta-bar${layer} is not tinted with --ink`);
    // And the masks hold their clearance in pixels. In percentages the words
    // stay where the padding puts them while the texture marches in to meet
    // them as the bar narrows — orange fell to 4.44:1 at 700px that way.
    const mask = rule.slice(rule.indexOf('mask-image'));
    assert.ok(/px/.test(mask),
      `.cta-bar${layer} masks in percentages, which creep into the type as the bar narrows`);
    // calc(100% - 350px) is fine and is the point: the 100% is only the anchor
    // the right-hand clearance is measured back from, and the clearance itself
    // is the px. A bare percentage stop is the thing that creeps.
    assert.ok(!/\d+%/.test(mask.replace(/calc\([^)]*\)/g, '')),
      `.cta-bar${layer} still has a bare percentage stop in its mask`);
  }
  // The lifted edge is what says the bar sits ON the plate rather than in it,
  // and it is the one part of this that costs no contrast at all.
  const bar = /\.cta-bar\{[^}]*\}/.exec(css)[0];
  assert.match(bar, /box-shadow:[\s\S]*inset 0 1px 0/, 'the bar has no lit top edge');
  assert.match(bar, /0 22px 44px -16px rgba\(0,0,0/, 'the bar casts no shadow on the plate');
});

test('the home page carries a card, with an icon, for every trade', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  for (const s of services) assert.ok(html.includes(`<h3>${esc(s.name)}</h3>`), `card ${s.slug}`);
  const cards = html.match(/<article class="svc[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, services.length);
  for (const card of cards) {
    assert.match(card, /<span class="ic"><svg viewBox="0 0 24 24"/, 'card without an icon');
    assert.match(card, /class="go" href="[^"]*services\//, 'card without a link');
  }
});

test('the home page carries both real offers with their codes', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('data-copy="WELCOME10"'));
  assert.ok(html.includes('data-copy="REFER100"'));
});

test('the home page teases three projects, each with a layout slot', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const items = JSON.parse(readFileSync('content/pages.json', 'utf8')).projects.items;
  const slots = [...html.matchAll(/class="pj ([a-z]*) rv"/g)].map((m) => m[1]);
  // Three, not all of them: the home grid is a teaser and the fourth card has
  // no photograph that is not already spent on this page. The projects page
  // below is where every item has to appear.
  assert.deepEqual(slots, ['a', 'b', 'c']);
  for (const it of items.slice(0, 3)) {
    assert.ok(html.includes(it.title), `${it.title} is on the home page`);
  }
  // The letter classes drive the grid spans. One short and a tile renders
  // class="pj undefined", which is how a fourth card first came out.
  assert.doesNotMatch(html, /class="pj undefined/);
});

test('the hero states only facts drawn from the real content', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<b>2018<\/b><span>Building since<\/span>/);
  // The count is the number of service pages, not the number of trades Quest
  // works in, so the figure is a floor and says so.
  assert.match(html,
    new RegExp(`<b>${services.length}<i>\\+</i></b><span>Services</span>`));
  // The city count came out: thirty-four is a coverage fact, and standing in
  // a row of trust figures it was the smallest claim of the three it sat with.
  assert.doesNotMatch(html, /Arizona cities<\/span>/);
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // Three figures. The row is a grid on tablets down, and a track count that
  // does not divide the figures leaves a hole or an orphan.
  assert.doesNotMatch(css, /\.hero-trust\{grid-template-columns:repeat\(4/);
});

test('the LCP hero image is eager and preloaded, and only on the home page', () => {
  const home = renderPage({ mod: d01, key: 'home' });
  assert.match(home, /fetchpriority="high"/);
  assert.match(home, /<link rel="preload" as="image"/);
  const inner = renderPage({ mod: d01, key: 'about' });
  assert.doesNotMatch(inner, /<link rel="preload" as="image"/);
});

test('the marquee is fed the real service names', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('"Window Installation"'), 'marquee missing real service names');
});

test('every service page renders its unique intro, why-choose bullets and process', () => {
  for (const s of services) {
    const html = renderPage({ mod: d01, key: `services/${s.slug}` });
    assert.ok(html.includes(esc(s.intro[0])), `${s.slug} intro missing`);
    for (const w of s.whyChoose) assert.ok(html.includes(esc(w)), `${s.slug} bullet missing`);
    for (const p of s.process) {
      assert.ok(html.includes(esc(p.title)), `${s.slug} step ${p.n} title`);
      assert.ok(html.includes(esc(p.body)), `${s.slug} step ${p.n} body`);
    }
    assert.ok(html.includes(esc(s.ctaHeading)), `${s.slug} cta`);
  }
});

test('every trade renders its FAQ block, and only concrete has a scope list', () => {
  for (const s of services) {
    const html = renderPage({ mod: d01, key: `services/${s.slug}` });
    assert.ok(s.faqs && s.faqs.length >= 5, `${s.slug} has fewer than five FAQs`);
    assert.match(html, /class="faqlist"/, `${s.slug} renders no FAQ block`);
    assert.equal((html.match(/<details class="rv">/g) || []).length, s.faqs.length,
      `${s.slug} renders the wrong number of FAQs`);
    for (const f of s.faqs) {
      assert.ok(html.includes(esc(f.q)), `${s.slug} is missing a question`);
    }
  }
  // The scope list is concrete's alone — it came from the recovered site and
  // no other trade has one written.
  const concrete = renderPage({ mod: d01, key: 'services/concrete' });
  assert.match(concrete, /class="scope"/);
  assert.match(concrete, /Quality Assurance/);
  assert.doesNotMatch(renderPage({ mod: d01, key: 'services/roofing' }), /class="scope"/);
});

test('no two trades ask the same question, and none is left unanswered', () => {
  const seen = new Map();
  for (const s of services) {
    for (const f of s.faqs) {
      assert.ok(f.q.trim().endsWith('?'), `${s.slug}: "${f.q}" is not a question`);
      assert.ok(f.a.trim().length > 80, `${s.slug}: "${f.q}" has a thin answer`);
      const prior = seen.get(f.q);
      assert.ok(!prior, `${s.slug} repeats ${prior}'s question: ${f.q}`);
      seen.set(f.q, s.slug);
    }
  }
});

test('the service tab rail marks the current service and links the rest', () => {
  const html = renderPage({ mod: d01, key: 'services/roofing' });
  assert.ok(html.includes('aria-current="page"'), 'active service is not marked');
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(html.includes('../../services/stucco/index.html'));
});

test('every service and area page carries a breadcrumb trail', () => {
  for (const key of ['services/roofing', 'service-areas/mesa-az']) {
    const html = renderPage({ mod: d01, key });
    assert.match(html, /<nav class="crumbs" aria-label="Breadcrumb">/, `${key} breadcrumb`);
  }
});

test('every area page carries authored local copy, unique per city', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  const seen = new Set();
  for (const a of areas) {
    const entry = local[a.slug];
    assert.ok(entry, `no local copy for ${a.slug}`);
    const words = entry.paras.join(' ').split(/\s+/).length;
    assert.ok(words >= 120, `${a.slug} local copy too thin (${words} words)`);
    assert.ok(entry.notes.length >= 3, `${a.slug} has too few notes`);
    for (const p of entry.paras) {
      assert.ok(!seen.has(p), `${a.slug} reuses a paragraph from another city`);
      seen.add(p);
    }
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    for (const p of entry.paras) {
      assert.ok(html.includes(esc(p)), `${a.slug} does not render its local copy`);
    }
  }
});

test('the local copy carries its warning, and points at the verification record', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  assert.match(local._README, /UNVERIFIED/);
  assert.match(local._README, /review this file before launch/);
  // Naming a permitting authority is the one claim on these pages a homeowner
  // could act on and find wrong, so the file has to say when it was last
  // checked and where the sources are.
  assert.match(local._README, /VERIFIED \d{4}-\d{2}-\d{2}/);
  assert.match(local._README, /docs\/service-area-verification\.md/);
  const record = readFileSync('docs/service-area-verification.md', 'utf8');
  for (const a of areas) {
    assert.ok(record.includes(a.city), `${a.city} has no line in the verification record`);
  }
});

test('area pages resolve the city token everywhere and name their own city', () => {
  for (const a of areas) {
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    assert.doesNotMatch(html, /\{\{city\}\}/, `${a.slug} has an unresolved token`);
    assert.ok(html.includes(esc(a.city)), `${a.slug} never names its city`);
  }
});

test('each area page links every other area and never itself', () => {
  const html = renderPage({ mod: d01, key: 'service-areas/mesa-az' });
  const cloud = /<div class="arealinks rv">([\s\S]*?)<\/div>/.exec(html)[1];
  assert.equal((cloud.match(/<a /g) || []).length, areas.length - 1);
  assert.ok(!cloud.includes('mesa-az'), 'an area links to itself in the nearby cloud');
});

test('the contact page renders the whole form and the real phone number', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  assert.match(html, /<form class="contact-form rv"/);
  for (const n of ['name', 'email', 'phone', 'message']) {
    assert.ok(html.includes(`name="${n}"`), `contact form missing field ${n}`);
  }
  assert.match(html, /<textarea id="cf-message" name="message"/);
  assert.match(html, /<button class="btn acc" type="submit">/);
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.match(html, /aria-live="polite"/);
});

test('every contact field is labelled, flagged, and wired to its own error line', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  const fields = html.match(/<div class="fld">[\s\S]*?<\/div>/g) || [];
  assert.equal(fields.length, 4, `expected four fields, found ${fields.length}`);
  for (const f of fields) {
    const id = /id="(cf-[a-z]+)"/.exec(f);
    assert.ok(id, `a field renders no control id: ${f.slice(0, 80)}`);
    // A label the control is actually associated with — not a bare <span>,
    // and not a placeholder standing in for one.
    assert.ok(f.includes(`<label for="${id[1]}">`), `${id[1]} has no label bound to it`);
    // Required or Optional, in words. A red asterisk is a convention the
    // visitor has to already know, and a colour is not information at all to
    // a visitor who cannot see it.
    assert.match(f, /class="fld-flag mono">(Required|Optional)</, `${id[1]} carries no flag`);
    // Every field has somewhere for its error to go, and says so.
    assert.ok(f.includes(`id="${id[1]}-err"`), `${id[1]} has no error line`);
    const desc = /aria-describedby="([^"]*)"/.exec(f);
    assert.ok(desc, `${id[1]} describes itself by nothing`);
    assert.ok(desc[1].split(' ').includes(`${id[1]}-err`),
      `${id[1]} does not point at its own error line`);
    for (const ref of desc[1].split(' ')) {
      assert.ok(f.includes(`id="${ref}"`), `${id[1]} points at a missing ${ref}`);
    }
  }
  // Three of the four will not submit empty, and each says why in its own
  // words rather than leaving the browser to say "Please fill out this field".
  const required = fields.filter((f) => / required/.test(f));
  assert.equal(required.length, 3, 'expected name, email and message to be required');
  for (const f of required) {
    assert.match(f, /data-missing="[^"]{20,}"/, 'a required field carries no message of its own');
  }
  // The typed fields keep their types, so the phone keypad comes up for the
  // phone and the browser can autofill all three.
  assert.match(html, /id="cf-email"[^>]* type="email"/);
  assert.match(html, /id="cf-phone"[^>]* type="tel"/);
  for (const a of ['autocomplete="name"', 'autocomplete="email"', 'autocomplete="tel"']) {
    assert.ok(html.includes(a), `contact form missing ${a}`);
  }
});

test('the contact form validates in the page, and says where to go when it cannot', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  // novalidate suppresses the browser's own bubbles, so the page has to do
  // the work itself — the attribute without the script is a form that
  // accepts an empty submission in silence.
  assert.match(html, /<form class="contact-form rv" novalidate/);
  assert.match(html, /checkValidity\(\)/, 'no constraint validation in the page');
  assert.match(html, /addEventListener\('blur'/, 'nothing validates when a field is left');
  assert.match(html, /aria-invalid/, 'invalid fields are never marked as such');
  assert.match(html, /still needs? attention/, 'a failed submit reports nothing');
  assert.match(html, /\.focus\(\)/, 'a failed submit does not move to the first bad field');
  // A valid submission goes somewhere: the form posts to the mailbox in the
  // content file rather than congratulating the visitor and dropping it.
  assert.match(html, new RegExp(`action="${site.formEndpoint}"`),
    'the form does not post to the configured endpoint');
  assert.match(html, /name="_honey"/, 'no honeypot, so the mailbox takes every bot');
  assert.match(html, /fetch\(f\.action/, 'nothing posts the form');
  // And when the post fails the dead end still has an exit — the number and
  // the address, rather than a spinner that never resolves.
  assert.match(html, /did not send[\s\S]{0,200}tel:16023996455/);
  assert.match(html, new RegExp(`mailto:${site.email}`),
    'a failed post does not hand over the email address');
});

test('the one social profile is a chip, not a footnote in the legal bar', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const foot = html.slice(html.indexOf('<footer'));
  assert.match(foot, /class="fsocial"[\s\S]{0,80}href="https:\/\/www\.facebook\.com/,
    'the footer has no social link beside the phone and the email');
  assert.ok(foot.includes('<span class="soc-ic">'), 'the social link has no mark on it');
  // Out of the bottom bar, which is where a site puts what it is obliged to
  // say rather than what it wants read.
  const bar = foot.slice(foot.indexOf('class="wrap fbar"'));
  assert.ok(!bar.includes('facebook.com'), 'the legal bar still carries the profile');
  // And on the page where somebody is choosing how to make contact.
  assert.match(renderPage({ mod: d01, key: 'contact' }),
    /class="help-social"[\s\S]{0,80}href="https:\/\/www\.facebook\.com/,
    'the contact aside has no social link');
});

test('the email address is somewhere a visitor can actually read it', () => {
  // It was in the JSON-LD and in the form's failure message and nowhere else,
  // which is an address published to crawlers and hidden from customers.
  const contact = renderPage({ mod: d01, key: 'contact' });
  assert.match(contact, new RegExp(`class="help-mail" href="mailto:${site.email}"`),
    'the contact aside does not show the email address');
  const home = renderPage({ mod: d01, key: 'home' });
  const foot = home.slice(home.indexOf('<footer'));
  assert.ok(foot.includes(`mailto:${site.email}`), 'the footer does not show the email address');
});

test('the contact aside claims nothing the content file does not already say', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  const facts = (html.match(/<ul class="help-facts mono">([\s\S]*?)<\/ul>/) || [])[1];
  assert.ok(facts, 'the aside renders no facts');
  // Each one is derived from data, so none of them can drift from the site:
  // the founding year, the number of trades, the number of cities.
  assert.ok(facts.includes(site.foundingYear), 'the founding year is not the real one');
  assert.ok(facts.includes(String(services.length)), 'the trade count is not the real one');
  assert.ok(facts.includes(String(areas.length)), 'the city count is not the real one');
  // Nothing about licensing, bonding or insurance: Quest has not said it
  // anywhere in the content, and a contractor's licence is not ours to claim.
  assert.doesNotMatch(facts, /licen[sc]|insur|bonded/i);
});

test('every service card carries its own photograph, and no two share one', async () => {
  const { cardShot } = await import('../lib/photos.mjs');
  const seen = new Set();
  for (const s of services) {
    const [file] = cardShot(s.slug);
    // A 900x600 crop where one has been cut, the full-size original where one
    // has not. What matters is that the file exists and that no two trades
    // show the same photograph, not which of the two forms it takes.
    assert.match(file, /^quest\/(card\/)?[a-z-]+\.webp$/, `${s.slug} has an odd card path`);
    assert.ok(!seen.has(file), `${s.slug} repeats a photograph already used: ${file}`);
    seen.add(file);
  }
  assert.equal(seen.size, services.length);

  // And all three pages that print the tile actually render them. The services
  // hub only exists on the standalone site, so it needs that profile.
  const { siteProfile } = await import('../lib/profile.mjs');
  const pages = [['home'], ['service-areas/mesa-az'], ['services', siteProfile]];
  for (const [key, profile] of pages) {
    const html = renderPage({ mod: d01, key, ...(profile ? { profile } : {}) });
    assert.equal((html.match(/class="svcshot"/g) || []).length, services.length,
      `${key} is missing service card photographs`);
    for (const s of services) {
      assert.ok(html.includes(cardShot(s.slug)[0]), `${key} missing the ${s.slug} photograph`);
    }
  }
});

test('no page shows the same photograph twice', async () => {
  const photos = await import('../lib/photos.mjs');
  // The gallery is the one exception and the obvious one: it prints the whole
  // library, so the banner and the closing plate necessarily appear inside it.
  const pages = [
    ['home'], ['about'], ['projects'], ['contact'], ['sitemap'],
    ...services.map((x) => [`services/${x.slug}`]),
    ...areas.map((x) => [`service-areas/${x.slug}`]),
  ];
  for (const [key] of pages) {
    const html = renderPage({ mod: d01, key });
    const srcs = (html.match(/<img[^>]+>/g) || [])
      .map((m) => /src="([^"]*)"/.exec(m)[1].replace(/^(\.\.\/)+/, ''))
      // The two logo lockups are the masthead and the footer, deliberately the same.
      .filter((f) => !f.endsWith('logo.webp'))
      // A card crop and its original are the same photograph in two sizes.
      .map((f) => f.replace('assets/quest/card/', 'assets/quest/'));
    const seen = new Set();
    for (const f of srcs) {
      assert.ok(!seen.has(f), `${key} shows ${f} twice`);
      seen.add(f);
    }
  }
  // And the banner never takes a frame its own page's band is going to use.
  for (const x of services) {
    const banner = photos.bannerShot('service', x.slug)[0];
    const band = photos.serviceShots(x.slug).map((p) => p[0]);
    assert.ok(!band.includes(banner), `${x.slug} repeats ${banner}`);
  }
  areas.forEach((x, i) => {
    const banner = photos.bannerShot('area', i)[0];
    const band = photos.areaShots(i).map((p) => p[0]);
    assert.ok(!band.includes(banner), `${x.slug} repeats ${banner}`);
  });
});

test('the gallery is Quest photography and nothing else', async () => {
  const { GALLERY } = await import('../lib/photos.mjs');
  const html = renderPage({ mod: d01, key: 'gallery' });
  const imgs = html.match(/<img[^>]+>/g) || [];
  assert.ok(imgs.length >= GALLERY.length, `gallery has only ${imgs.length} images`);
  assert.match(html, /From Quest projects/);
  // Nothing left to disclaim: the stock library is gone from the tree.
  assert.doesNotMatch(html, /Placeholder photography/);
  for (const f of GALLERY) assert.ok(html.includes(f), `gallery missing ${f}`);
  for (const m of imgs) {
    assert.match(m, /src="[^"]*assets\/(quest|og)\//, `gallery image outside the library: ${m}`);
  }
});

test('every photograph on every page comes out of the library with its own alt', async () => {
  const { ALT } = await import('../lib/photos.mjs');
  const alts = new Set(Object.values(ALT));
  const known = new Set(Object.keys(ALT).map((f) => `assets/${f}`));
  known.add('assets/quest/logo.webp');          // the two logo lockups
  for (const key of ['home', 'about', 'projects', 'gallery', 'contact',
    'services/roofing', 'service-areas/mesa-az']) {
    const html = renderPage({ mod: d01, key });
    for (const m of html.match(/<img[^>]+>/g) || []) {
      // Card tiles point at the derived crop; everything else at the original.
      const src = /src="([^"]*)"/.exec(m)[1].replace(/^(\.\.\/)+/, '')
        .replace('assets/quest/card/', 'assets/quest/');
      assert.ok(known.has(src), `${key} shows an image outside the catalogue: ${src}`);
      const alt = /alt="([^"]*)"/.exec(m)[1];
      if (!alt) continue;                        // the decorative logo lockups
      assert.ok(alts.has(alt) || alt === 'Quest Construction',
        `${key} has hand-written alt text: ${alt}`);
    }
  }
});

test('the projects page shows every showcase project with its own photograph', () => {
  const html = renderPage({ mod: d01, key: 'projects' });
  const items = JSON.parse(readFileSync('content/pages.json', 'utf8')).projects.items;
  for (const it of items) assert.ok(html.includes(it.title), `projects missing ${it.title}`);
  assert.equal((html.match(/class="pjcard rv"/g) || []).length, items.length);
  // One Quest photograph each, in order, and no two cards sharing one.
  const shots = ['quest/hero.webp', 'quest/custom-home-wide.webp', 'quest/slab-blockwall.webp'];
  assert.equal(shots.length, items.length, 'a project was added without a photograph');
  for (const f of shots) assert.ok(html.includes(f), `projects missing ${f}`);
});

test('pergolas get a section of their own on the showcase, not a fourth card', () => {
  const html = renderPage({ mod: d01, key: 'projects' });
  const g = JSON.parse(readFileSync('content/pages.json', 'utf8')).projects.pergolas;
  assert.match(html, /<section class="sec cream alt" id="pergolas">/,
    'no pergola section on the projects page');
  // Every line of it comes out of the content file, heading included.
  assert.ok(html.includes(g.heading.replace(g.accent, `<span class="hl">${g.accent}</span>`)),
    'the pergola heading does not accent its own word');
  for (const t of g.paras) assert.ok(html.includes(esc(t)), 'a pergola paragraph is missing');
  for (const n of g.notes) assert.ok(html.includes(esc(n)), 'a pergola note is missing');
  // The two post-and-beam photographs, and neither of them twice: the band
  // below subtracts them, so a duplicate here means taken() stopped covering
  // this section.
  for (const f of ['quest/deck-finished.webp', 'quest/porch-dusk.webp']) {
    assert.equal((html.match(new RegExp(f, 'g')) || []).length, 1,
      `${f} appears more than once on the projects page`);
  }
  // The section is a dead end without it: shade structures are sold on the
  // deck page, and this is the only route to it from here.
  assert.match(html, /services\/deck-building-uses-trex-system\/[\s\S]{0,120}Decks and shade/,
    'the pergola section does not link the trade that builds them');
});

test('the about page renders both real story paragraphs', () => {
  const html = renderPage({ mod: d01, key: 'about' });
  const about = JSON.parse(readFileSync('content/pages.json', 'utf8')).about;
  for (const p of about.story) assert.ok(html.includes(esc(p)), 'about story paragraph missing');
});

test('the sitemap links all thirty-one pages', () => {
  const html = renderPage({ mod: d01, key: 'sitemap' });
  for (const s of services) {
    assert.ok(html.includes(`../services/${s.slug}/index.html`), `sitemap missing ${s.slug}`);
  }
  for (const a of areas) {
    assert.ok(html.includes(`../service-areas/${a.slug}/index.html`), `sitemap missing ${a.slug}`);
  }
  for (const p of ['about-us', 'projects', 'gallery', 'contact-us']) {
    assert.ok(html.includes(`../${p}/index.html`), `sitemap missing ${p}`);
  }
});

test('every one of the thirty-one pages renders a non-trivial body', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: d01, key });
    const body = html.split(MAIN_TAG)[1].split('</main>')[0];
    assert.ok(body.length > 1500, `${key} body is only ${body.length} chars`);
    assert.match(body, /<h1>/, `${key} has no h1`);
    assert.equal((body.match(/<h1>/g) || []).length, 1, `${key} has more than one h1`);
  }
});

test('every rendered image carries alt text and intrinsic dimensions', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: d01, key });
    for (const tag of html.match(/<img[^>]+>/g) || []) {
      assert.match(tag, /alt="[^"]*"/, `${key}: image without alt: ${tag}`);
      assert.match(tag, /width="\d+"/, `${key}: image without width: ${tag}`);
      assert.match(tag, /height="\d+"/, `${key}: image without height: ${tag}`);
    }
  }
});

// The strip was decoration for a long time: aria-hidden, injected by a script
// on load, fourteen trade names in spans no crawler and no keyboard could
// reach. It is navigation now, and these pin the three things that makes true.
test('the trade strip is rendered server-side, not injected by script', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.doesNotMatch(html, /getElementById\('strip'\)/, 'strip is still built in JS');
  const strip = html.split('<nav class="strip"')[1].split('</nav>')[0];
  for (const s of services) {
    assert.ok(strip.includes(esc(s.name)), `strip missing trade ${s.slug}`);
  }
});

test('every trade in the strip links to that trade page', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const strip = html.split('<nav class="strip"')[1].split('</nav>')[0];
  for (const s of services) {
    assert.ok(strip.includes(`href="services/${s.slug}/index.html"`),
      `strip does not link ${s.slug}`);
  }
  // Two halves make the loop seamless, so every link appears twice. Exactly
  // one of each pair is reachable — the duplicate is hidden and untabbable.
  const links = strip.match(/<a class="strip-i"[^>]*>/g) || [];
  assert.equal(links.length, services.length * 2);
  const dup = links.filter((a) => a.includes('tabindex="-1"'));
  assert.equal(dup.length, services.length, 'duplicate half is reachable twice');
  for (const a of dup) assert.match(a, /aria-hidden="true"/);
  assert.ok(!links.some((a) => !a.includes('tabindex="-1"') && a.includes('aria-hidden')),
    'the real half is hidden from screen readers');
});

test('the sliding strip stops moving under a pointer or a keyboard', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  assert.match(css, /\.strip:hover \.strip-in,\.strip:focus-within \.strip-in\{animation-play-state:paused\}/);
  assert.match(css, /\.strip-i:focus-visible\{outline:/);
});

// The hero used to resolve to a flat 760px on any wide window, which put the
// trade strip just past the bottom edge of a laptop. Its height is the fold
// now — viewport less header less strip — so this pins that it is still a
// derivation and not a number someone typed.
test('the hero is sized to leave the trade strip above the fold', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const hero = css.split('.hero{')[1].split('}')[0];
  assert.match(hero, /min-height:clamp\([^)]*calc\(100svh - var\(--navh\) - 1px - var\(--striph\)\)/,
    'hero height no longer derives from the header and strip');
  assert.doesNotMatch(hero, /min-height:clamp\(540px,64vw,760px\)/, 'the flat 760px hero is back');
  // The strip must own its height for that sum to mean anything — if it goes
  // back to falling out of padding plus a line box, --striph is a guess again.
  const strip = css.split('.strip{')[1].split('}')[0];
  assert.match(strip, /height:var\(--striph\)/);
  assert.match(css, /--striph:\d+px/);
});

// Every count on this site used to be a word somebody typed. "Serving Eleven
// Arizona Cities" survived three rounds of new city pages and was wrong by
// twenty-three of them before anyone read it; "Fourteen Trades" went wrong the
// hour a fifteenth trade was added. Both are derived now, and this is the rule
// that keeps them that way.
test('a heading that counts something counts the real thing', async () => {
  const { Words } = await import('../lib/html.mjs');
  const { siteProfile } = await import('../lib/profile.mjs');
  assert.equal(Words(15), 'Fifteen');
  assert.equal(Words(34), 'Thirty-four');

  const trades = Words(services.length);
  const cities = Words(areas.length);
  const home = renderPage({ mod: d01, key: 'home' });
  const contact = renderPage({ mod: d01, key: 'contact' });
  const about = renderPage({ mod: d01, key: 'about' });
  const areaHub = renderPage({ mod: d01, key: 'service-areas', profile: siteProfile });

  assert.ok(home.includes(`${trades.toLowerCase()} trades, one contractor`)
    || home.includes(`${trades} trades, one contractor`), 'the home page miscounts the trades');
  assert.ok(contact.includes(`<span>${cities}</span> Arizona Cities`),
    'the contact page miscounts the cities');
  assert.ok(about.includes(`${trades} Trades, <span>One</span> Contractor`),
    'the about page miscounts the trades');
  assert.ok(areaHub.includes(`— ${cities} cities`), 'the areas hub miscounts the cities');
  assert.ok(areaHub.includes(`The Same <span>${trades}</span> Trades`),
    'the areas hub miscounts the trades');

  // And the source carries no typed count word at all, which is the part that
  // actually prevents the next one going stale.
  const src = readFileSync('build/directions/d01.mjs', 'utf8');
  for (const w of ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Thirty-four', 'Thirty-five']) {
    assert.ok(!src.includes(`>${w}<`) && !src.includes(`'${w} `) && !src.includes(` ${w} Trades`),
      `d01.mjs types the count "${w}" into a heading instead of deriving it`);
  }
});

// Demolition is the first trade Quest has added since the site was recovered,
// so it is also the test of whether a fifteenth trade drops in cleanly: a page,
// a card, an icon, a group in the menu, photographs that are not another
// trade's, and copy that is its own rather than the boilerplate.
test('the trade added after the recovery is a first-class page', async () => {
  const { cardShot, bannerShot } = await import('../lib/photos.mjs');
  const { siteProfile } = await import('../lib/profile.mjs');
  const demo = services.find((x) => x.slug === 'demolition');
  assert.ok(demo, 'demolition is not in content/services.json');

  const html = renderPage({ mod: d01, key: 'services/demolition', profile: siteProfile });
  assert.match(html, /<h1>[\s\S]*?Demolition[\s\S]*?<\/h1>/);
  assert.ok(html.includes(bannerShot('service', 'demolition')[0]), 'no banner photograph');

  // Its own words. Thirteen of the fourteen recovered services share a
  // byte-identical subheroTagline and closing intro; this one shares neither.
  const others = services.filter((x) => x.slug !== 'demolition');
  assert.ok(!others.some((x) => x.subheroTagline === demo.subheroTagline),
    'demolition reuses another trade’s tagline');
  assert.ok(!others.some((x) => x.intro.some((p) => demo.intro.includes(p))),
    'demolition reuses another trade’s intro paragraph');
  assert.ok(demo.faqs.length >= 4, 'demolition needs its own questions');

  // In the menu, the footer and the card grid like every other trade.
  assert.ok(groups.some((g) => g.services.includes('demolition')),
    'demolition is not in any menu group');
  const home = renderPage({ mod: d01, key: 'home' });
  assert.ok(home.includes(`<h3>${esc(demo.name)}</h3>`), 'no card on the home page');
  assert.ok(home.includes(cardShot('demolition')[0]), 'the card has no photograph');
  const { icon } = await import('../lib/icons.mjs');
  assert.notEqual(icon('demolition'), icon('__none__'), 'demolition falls back to the house icon');
});

// Quest asked for the four stages above the pitch, and the reason it is worth
// a test is the tones rather than the order: the subhero and the tab strip
// under it are both dark, so whichever block lands first has to be light, and
// a later edit that moves the sections as written blocks would put three dark
// bands in a row.
test('a service page runs the process before the pitch, and keeps alternating', () => {
  const html = renderPage({ mod: d01, key: 'services/framing' });
  const body = html.slice(html.indexOf('<main'));
  const process = body.indexOf('How it runs');
  const pitch = body.indexOf('Why choose');
  assert.ok(process > 0 && pitch > 0, 'a service page lost one of the two blocks');
  assert.ok(process < pitch, 'the pitch is back above the process');

  // The tone belongs to the position, not to the block.
  const sections = [...body.matchAll(/<section class="(sec [^"]*)"/g)].map((m) => m[1]);
  const at = (i) => sections[i];
  assert.equal(at(0), 'sec cream', 'the section under the dark subhero is dark too');
  assert.ok(body.slice(0, process).includes('sec cream'), 'the process band is not on cream');
  const darkStart = body.lastIndexOf('<section class="sec dark"', pitch);
  assert.ok(darkStart > 0 && darkStart < pitch, 'the pitch is not on the dark band');
  assert.ok(body.slice(darkStart, pitch).includes('prose-wrap'),
    'the dark band is not the prose and why-choose block');

  // .steps is drawn for cream — cream discs, an accent ring, a dark dashed
  // connector. The overrides that restated all three for a dark ground are
  // gone, so putting it back on dark would ship near-white on cream discs.
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  assert.doesNotMatch(css, /\.sec\.dark \.step/, 'a dead dark-process override came back');
  assert.match(css, /\.sec\.dark \.prose p\{color:var\(--on-dark-2\)\}/,
    'the prose has no dark-ground colour');
});

// The FAQ list carried a 940px cap and no auto margins, so on any window wide
// enough to reach the wrap's 1280px it stopped 340px short of the right edge
// while the heading above it ran the full width. Every other content block in
// this stylesheet fills the wrap; a fixed pixel cap on one of them is the bug,
// and a text measure in ch on the paragraph inside it is the fix.
test('no content block is capped in pixels inside a section that is not', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const faq = /\.faqlist\{[^}]*\}/.exec(css);
  assert.ok(faq, 'no rule for the FAQ list');
  assert.doesNotMatch(faq[0], /max-width/,
    'the FAQ list is capped again, and it has no auto margins to centre it');
  // The measure belongs on the text, not on the box around it.
  assert.match(css, /\.faqlist details p\{[^}]*max-width:\d+ch/,
    'the answer paragraph lost its measure');

  // And nothing else grew one. Every remaining fixed-pixel cap belongs to the
  // wrap itself, or to a hero/subhero column sized against the photograph it
  // shares a band with — those are deliberate and they are the whole list.
  // The breakpoints go first: `@media(max-width:940px)` is a condition, not a
  // declaration, and matching it here is how this check first read every
  // responsive rule in the file as a capped block.
  const capped = css.replace(/@media[^{]*\{/g, '').split('}')
    .filter((rule) => /max-width:(?:min\()?\d+px/.test(rule.split('{').slice(1).join('{')))
    .map((rule) => rule.split('{')[0].trim().split(/\r?\n/).pop().trim());
  // A cap is only the bug when the block does not centre itself. That was the
  // whole of the FAQ fault: 940px hard against the left edge of a 1280px wrap.
  // A capped block with auto margins is a measure, which is legitimate.
  const centred = css.replace(/@media[^{]*\{/g, '').split('}')
    .filter((rule) => /margin-inline:auto|margin:[^;]* auto/.test(rule))
    .map((rule) => rule.split('{')[0].trim().split(NEWLINE).pop().trim());
  const stray = capped.filter((sel) => !/\.wrap|hero|subhero/.test(sel)
    && !centred.includes(sel));
  assert.deepEqual(stray, [],
    `a pixel cap crept onto ${stray.join(', ')} without auto margins to centre it`);
});

// ---------------------------------------------------------------- viewports
// Every one of these came out of rendering all 17 page kinds in headless
// Chrome at 27 widths from 320 to 2560 and at 17 real device geometries,
// portrait and landscape, and reading what left the viewport. They are pinned
// here because the stylesheet is the only place they can regress and none of
// them shows up in the built HTML.

test('type that is sized to fill a band is measured against the band', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const rule = /\.bigband\{[^}]*\}/.exec(css);
  assert.ok(rule, 'no rule for the big-word band');
  // Sized off the raw viewport, it kept growing after the wrap stopped: at
  // 1920 the word ran 1374px inside a 1280px box and overflow:hidden took a
  // letter off each end. The wrap's own width is the only correct input.
  assert.match(rule[0], /min\(100vw, ?var\(--maxw\)\)/,
    'the display word is sized against the window rather than against the wrap');
  assert.doesNotMatch(rule[0], /calc\(118vw/, 'the viewport-relative sizing is back');
  // And the floor has to be low enough that the longest word still fits the
  // narrowest phone: 17 characters in the 276px a 320px screen leaves.
  const floor = Number(/clamp\((\d+)px/.exec(rule[0])[1]);
  assert.ok(floor <= 27, `a ${floor}px floor overflows a 320px screen`);
});

test('the page is pinned against the browser resizing its own text', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // iOS Safari inflates text in landscape on its own initiative. No width in
  // a Chrome sweep can catch it, so it is pinned rather than measured.
  assert.match(css, /html\{[^}]*-webkit-text-size-adjust:100%/);
  assert.match(css, /html\{[^}]*[^-]text-size-adjust:100%/);
});

test('a control is as big as the box it draws', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // A <summary> is the only part of a <details> that toggles. With the padding
  // on the details, the FAQ drew a 64px card whose middle 24px answered a tap.
  const details = /\.faqlist details\{[^}]*\}/.exec(css);
  assert.ok(details, 'no rule for the FAQ card');
  assert.doesNotMatch(details[0], /padding/,
    'the padding is back on the card instead of on the control inside it');
  assert.match(css, /\.faqlist summary\{[^}]*padding:20px 24px/);

  // The marquee row is 56px tall and its links were a 19px line box in the
  // middle of it.
  assert.match(css, /\.strip-i\{[^}]*min-height:44px/);
});

test('the small mono labels are all bumped on a phone, not just the old ones', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // Anchored on the selector list itself: there are five max-width:620px
  // blocks in the file, and matching on the breakpoint alone finds the wrong
  // one and passes for the wrong reason.
  const bump = /\.mono,\.pill,[\s\S]*?font-size:11\.5px\}/.exec(css);
  assert.ok(bump, 'no phone bump for the mono labels');
  // Both grouped-menu headings were written after this list and missed it, so
  // they stayed at 10px on a phone — the size the rule exists to fix.
  for (const sel of ['.fgrp-h', '.dropgrp-h']) {
    assert.ok(bump[0].includes(sel), `${sel} is still 10px on a phone`);
  }
});

// Quest went Areas -> a city -> a service and landed on the general trade
// page every time. The grid on a city page is headed "Construction Services in
// Mesa, AZ" and the 190 pages written for a trade in a city were reachable
// only from a text list below it, which is a route nobody takes.
test('a service card on a city page goes to the page written for that city', async () => {
  const { siteProfile } = await import('../lib/profile.mjs');
  const areasFor = JSON.parse(readFileSync('content/service-areas.json', 'utf8'));
  const local = (trade, city) => Boolean(areasFor[trade] && areasFor[trade][city]);

  for (const citySlug of ['mesa-az', 'phoenix-az', 'carefree-az']) {
    const html = renderPage({ mod: d01, key: `service-areas/${citySlug}`,
      profile: siteProfile });
    const grid = html.slice(html.indexOf('<section class="sec dark"'));
    const cards = grid.slice(0, grid.indexOf('</section>'));
    let localCards = 0;
    for (const s of services) {
      const want = local(s.slug, citySlug)
        ? `services/${s.slug}/${citySlug}/index.html`
        : `services/${s.slug}/index.html`;
      assert.ok(cards.includes(`href="../../${want}"`),
        `${citySlug}: the ${s.slug} card does not point at ${want}`);
      if (local(s.slug, citySlug)) localCards += 1;
    }
    // And the card says where it goes rather than "Learn more".
    const city = areas.find((a) => a.slug === citySlug).city;
    assert.equal((cards.match(new RegExp(`>In ${city} <i`, 'g')) || []).length,
      localCards, `${citySlug}: the local cards are not labelled with the city`);
  }

  // The home page and the services hub carry the same component with no city
  // behind it, and must still point at the general pages.
  for (const [key, profile] of [['home', null], ['services', siteProfile]]) {
    const html = renderPage({ mod: d01, key, ...(profile ? { profile } : {}) });
    assert.doesNotMatch(html, /class="go" href="[^"]*services\/[a-z-]+\/[a-z-]+-az\//,
      `${key} sends a service card to a city page`);
  }
});

test('the gallery is filed by trade, and a trade with no photograph is absent', async () => {
  const photos = await import('../lib/photos.mjs');
  const { GALLERY, GALLERY_TRADES, caption, ALT } = photos;
  const slugs = services.map((s) => s.slug);

  // Every frame is under exactly one trade, and the trades are the gallery.
  const filed = GALLERY_TRADES.flatMap((t) => t.files);
  assert.deepEqual(filed, GALLERY, 'the flat gallery is not the trades in order');
  assert.equal(new Set(filed).size, filed.length, 'a frame is filed under two trades');

  for (const t of GALLERY_TRADES) {
    assert.ok(slugs.includes(t.slug), `${t.slug} is a chapter but not a service`);
    assert.ok(t.files.length >= 1, `the ${t.slug} chapter is empty`);
    assert.ok(t.name && t.note, `the ${t.slug} chapter has no heading or no note`);
  }
  // The chapters run in the order the services do, so the gallery and the
  // services menu agree about what comes first.
  assert.deepEqual(GALLERY_TRADES.map((t) => t.slug),
    slugs.filter((s) => GALLERY_TRADES.some((t) => t.slug === s)),
    'the chapters are not in services.json order');
  // The name is the service's own, never a second copy of it.
  for (const t of GALLERY_TRADES) {
    assert.equal(t.name, services.find((s) => s.slug === t.slug).name);
  }
  // And the point of the whole exercise: a trade with nothing to show is not
  // listed with an empty chapter, it is not listed at all. The omission is
  // declared rather than inferred — a filename is not evidence of a subject,
  // and casita-stucco is a photograph of a casita.
  const { TRADES_WITHOUT_PHOTOGRAPHS: missing } = photos;
  assert.ok(missing.length > 0, 'no trade is being left out, so the rule is untested');
  assert.deepEqual([...GALLERY_TRADES.map((t) => t.slug), ...missing].sort(),
    [...slugs].sort(), 'a service is neither in a chapter nor declared missing');

  const html = renderPage({ mod: d01, key: 'gallery' });
  for (const t of GALLERY_TRADES) {
    assert.ok(html.includes(`id="trade-${t.slug}"`), `no ${t.slug} chapter`);
    assert.ok(html.includes(`href="#trade-${t.slug}"`), `no jump link to ${t.slug}`);
    // The heading is the way into that trade's own page.
    assert.ok(html.includes(`services/${t.slug}/">${esc(t.name)}</a>`)
      || html.includes(`services/${t.slug}/index.html">${esc(t.name)}</a>`),
    `the ${t.slug} chapter does not link to its service page`);
  }
  for (const s of services) {
    if (GALLERY_TRADES.some((t) => t.slug === s.slug)) continue;
    assert.ok(!html.includes(`id="trade-${s.slug}"`),
      `${s.slug} has no photographs but has a chapter`);
  }

  // Every frame is in the large viewer at full size with its caption, and on
  // the rail as a thumbnail. Both, because a viewer that swaps one <img>'s src
  // would take seventy-four photographs out of the document.
  assert.equal((html.match(/class="shotcap" aria-hidden="true"/g) || []).length,
    GALLERY.length, 'not every frame has a caption');
  assert.equal((html.match(/class="shot" id="p-/g) || []).length, GALLERY.length);

  // A trade with one photograph gets no rail — there is nothing to move
  // between — so the thumbnail count is every frame in a chapter of two or
  // more, not every frame.
  const railed = GALLERY_TRADES.filter((t) => t.files.length > 1);
  const onRails = railed.reduce((sum, t) => sum + t.files.length, 0);
  assert.equal(
    (html.match(/class="thumb"/g) || []).length
      - (html.match(/aria-hidden="true" tabindex="-1"/g) || []).length,
    onRails, 'the rail is not one labelled thumbnail per frame');
  assert.ok(railed.length < GALLERY_TRADES.length,
    'no single-frame chapter left to prove the rail is suppressed');

  for (const t of railed) {
    assert.ok(html.includes(`href="#p-${t.slug}-1"`), `no fragment link into ${t.slug}`);
  }
  assert.ok(html.includes('aria-label="Photograph 1 of'), 'the thumbnails are unlabelled');
  assert.equal((html.match(/aria-current="true"/g) || []).length, railed.length,
    'each railed chapter should open on exactly one current frame');

  // The seam. The track is translated by exactly one set, so the shift has to
  // be one over the number of copies to the pixel — and a set has to be wider
  // than the rail, or a repeat that has not arrived yet leaves a hole at the
  // end of the one that has. The rail is the full 1280 of the wrap against a
  // 190px thumbnail and its margin: seven frames fill it.
  const RAIL = /class="showcase-track" style="--shift:(-[\d.]+)%;--dur:([\d.]+)s"([\s\S]*?)<\/div>/g;
  const rails = [...html.matchAll(RAIL)];
  assert.equal(rails.length, railed.length, 'not one rail per railed chapter');
  rails.forEach(([, shift, dur, body], i) => {
    const n = railed[i].files.length;
    const copies = (body.match(/class="thumb"/g) || []).length / n;
    assert.ok(Number.isInteger(copies) && copies >= 2,
      `the ${railed[i].slug} rail holds ${copies} copies of its set`);
    assert.equal(Number(shift).toFixed(3), (-100 / copies).toFixed(3),
      `the ${railed[i].slug} rail would jump at the seam`);
    assert.ok((copies - 1) * n >= 7,
      `the ${railed[i].slug} rail can show a gap before the set comes round`);
    // Proportional to the set, so a frame crosses at one speed in all of them.
    assert.equal(Number(dur), n * 2.5,
      `the ${railed[i].slug} rail runs at its own speed`);
  });
  // The caption falls back to the alt text, so a photograph needs no note.
  assert.equal(caption('quest/hero.webp'), ALT['quest/hero.webp']);
});

test('the lens never blocks the click that opens a photograph full size', () => {
  // The lens and its panel are drawn over the picture, and the picture is a
  // link. If either one took pointer events, hovering would make the frame
  // unclickable — the enhancement would have eaten the thing it enhances.
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  // Anchored on a newline so this finds the standalone rule and not
  // ".shot.lensing .shotzi", which is a different rule about a different
  // thing and would have made this pass by accident.
  for (const cls of ['.lens', '.lenspanel', '.shotzi']) {
    const at = css.indexOf('\n' + cls + '{');
    assert.ok(at >= 0, cls + ' has no rule of its own');
    const rule = css.slice(at, css.indexOf('}', at));
    assert.ok(rule.includes('pointer-events:none'),
      cls + ' is drawn over the link and would swallow its clicks');
  }
  // And the badge has to lose to the lens, not to hovering: both selectors
  // are three classes, so only source order decides which wins.
  assert.ok(css.indexOf('.shot.lensing .shotzi') > css.indexOf('.shotzoom:hover .shotzi'),
    'the zoom badge would stay lit underneath the lens');
});

test('the zoom dialog is out of the layout until it is opened', () => {
  // This one shipped. A <dialog> is display:none until it is open and that
  // comes from the UA stylesheet, so an author rule that sets display without
  // keying it to [open] outranks it and the dialog is laid out for ever. The
  // closed one was a full-viewport black block sitting in the flow under the
  // gallery, with every z-index:3 section painting up through it.
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  let keyed = 0;
  for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(^|;)\s*display\s*:/.test(body)) continue;
    for (const one of sel.split(',')) {
      const s = one.trim();
      // .zoom itself, not .zoom-stage or .zoom-bar, which are ordinary
      // elements inside it and may have any display they like.
      if (!/\.zoom(?![-\w])/.test(s)) continue;
      assert.match(s, /\.zoom\[open\]/,
        `"${s}" gives the dialog a display without keying it to [open]`);
      keyed++;
    }
  }
  assert.ok(keyed > 0, 'no rule opens the dialog at all');

  // And it ships empty: an <img> with no src has no alt worth writing and no
  // intrinsic size, which the page rules would reject and rightly.
  const html = renderPage({ mod: d01, key: 'gallery' });
  assert.equal((html.match(/<dialog class="zoom"/g) || []).length, 1);
  assert.match(html, /<div class="zoom-stage" data-zoomstage><\/div>/);
});

test('every gallery photograph is a link to its own file, so zoom works with no script', async () => {
  const { GALLERY } = await import('../lib/photos.mjs');
  const html = renderPage({ mod: d01, key: 'gallery' });
  assert.equal((html.match(/class="shotzoom"/g) || []).length, GALLERY.length);
  // The href is the photograph itself and not a fragment or a page: that is
  // what makes the dialog an enhancement rather than the only way in. The
  // number of ../ in front of it belongs to the direction, and check-links
  // is what proves each one resolves, so only the tail is asserted here.
  // The depth of ../ belongs to the direction, so it is read once from the
  // page rather than written into the test. Searching for the filename alone
  // would find the thumbnail rail's <img src> first, which is not the link.
  const prefix = html.match(/class="shotzoom" href="([./]*)assets\//)[1];
  for (const f of GALLERY) {
    assert.ok(html.includes(`class="shotzoom" href="${prefix}assets/${f}"`),
      `${f} is not linked to its own file`);
  }
});

test('a caption Quest writes wins, and one for a photograph that is not there fails', async () => {
  const { caption, ALT } = await import('../lib/photos.mjs');
  const notes = JSON.parse(readFileSync('content/photo-notes.json', 'utf8'));
  for (const [f, note] of Object.entries(notes.notes)) {
    assert.ok(ALT[f], `photo-notes.json names ${f}, which is not a photograph`);
    assert.equal(caption(f), note, `${f} does not use the note written for it`);
  }
  // The file is where Quest edits captions, so it has to say what it is for.
  assert.ok(notes._README && notes._README.length > 200, 'photo-notes.json has no README');
});
