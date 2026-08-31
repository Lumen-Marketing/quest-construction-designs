import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage, allPagesFor } from '../build.mjs';
import * as d01 from './d01.mjs';
import { MAIN_TAG } from '../lib/page-rules.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;
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

test('the long footer lists are marked for the two-up phone layout', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  // The fourteen trades, and nothing else: the five-item Company column is
  // short enough to stay one per row, and the cities have their own block.
  assert.equal((html.match(/<div class="col2">/g) || []).length, 1);
});

test('the footer groups the cities by valley, and loses none of them', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const foot = html.slice(html.indexOf('<footer'));
  const block = foot.slice(foot.indexOf('<div class="fareas">'));
  for (const r of regions) {
    assert.ok(block.includes(`<p class="fgrp-h">${esc(r.name)}</p>`),
      `footer missing the ${r.name} block`);
  }
  // Every city reachable from the footer, and named without the state it is
  // already standing under.
  for (const a of areas) {
    assert.ok(block.includes(`service-areas/${a.slug}/index.html">${esc(a.city)}</a>`),
      `footer missing ${a.slug}`);
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

test('the home page carries all fourteen service cards with icons', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  for (const s of services) assert.ok(html.includes(`<h3>${esc(s.name)}</h3>`), `card ${s.slug}`);
  const cards = html.match(/<article class="svc[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, 14);
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
  assert.match(html, /<b>14<\/b><span>Services<\/span>/);
  assert.match(html, new RegExp(`<b>${areas.length}</b><span>Arizona cities</span>`));
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
  const shots = ['quest/hero.webp', 'quest/custom-home-wide.webp',
    'quest/slab-blockwall.webp', 'quest/deck-finished.webp'];
  assert.equal(shots.length, items.length, 'a project was added without a photograph');
  for (const f of shots) assert.ok(html.includes(f), `projects missing ${f}`);
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
