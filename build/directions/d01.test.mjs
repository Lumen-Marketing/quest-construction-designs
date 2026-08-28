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
  assert.ok(html.includes('Since 2005'));
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
  assert.match(html, /class="navtel-num">\(602\) 399-6455</);
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // It used to be display:none'd at exactly the width where tapping a number
  // is the easiest thing a visitor can do.
  assert.doesNotMatch(css, /\.navtel\{display:none\}/);
});

test('the drawer ends with the number, and the wide nav does not repeat it', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<div class="navcall">[\s\S]*?tel:16023996455/);
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  assert.match(css, /\.navcall\{display:none\}/);
});

test('the long footer lists are marked for the two-up phone layout', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  // The fourteen trades and the eleven cities, and nothing else: the five-item
  // Company column is short enough to stay one per row.
  assert.equal((html.match(/<div class="col2">/g) || []).length, 2);
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

test('the hero object is lit rather than pasted, and clears the copy at every width', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');

  // Quest asked for the materials back after the hero was rebuilt, and they are
  // back on the new construction rather than the old one. On the accent plane
  // the object and its ground were one flat thing on another flat thing, both
  // the same distance from the eye — there was nothing behind it to be behind
  // it, so no amount of shadow made it read as forward. That is what "flat"
  // meant, and it is a property of the stack, not of the shadow.
  //
  // So the stack is what this pins. Four planes: the photograph, the scrim,
  // the pool of light, the object.
  const kit = html.match(/<img[^>]*class="hero-kit"[^>]*>/g) || [];
  assert.equal(kit.length, 1, `expected one hero object, found ${kit.length}`);
  assert.ok(html.includes('class="hero-glow"'), 'the object has no light to stand in');
  assert.match(css, /\.hero-shot::before\{[^}]*radial-gradient/,
    'the frame has no vignette, so the corners do not go back');

  // The shadows have to be drop-shadow filters. This element's rectangle is
  // 70% transparent, so a box-shadow draws a box around thin air.
  const rule = /\.hero-kit\{[^}]*\}/.exec(css);
  assert.ok(rule, 'no rule for the hero object');
  assert.doesNotMatch(rule[0], /box-shadow/, 'the object casts a rectangular shadow');
  const drops = (rule[0].match(/drop-shadow\(/g) || []).length;
  assert.ok(drops >= 3,
    `the object casts ${drops} shadow(s); it needs contact, cast and a warm rim`);
  // And the warm one is the light wrapping the edge — without it the cut-out
  // reads as a hole punched in the picture rather than an object in front of it.
  assert.match(rule[0], /drop-shadow\([^)]*var\(--acc\)/,
    'nothing lights the object from the side the pool is on');

  // It must not stand on the words, and that cannot be arranged by picking an
  // offset that looks right. The copy column is capped BOTH in pixels and as a
  // percentage, so which cap is winning changes with the width — and the
  // percentage is of .wrap's content box, which stops growing at --maxw and
  // starts insetting instead. A hand-picked offset was wrong twice for exactly
  // those two reasons: the gloves sat under "REACH US" at 3.09:1 between 1080
  // and 1300 while passing at 1440, and then the object crossed the copy again
  // above 1400 where the wrap's inset appears.
  //
  // So the offset is DERIVED from the copy's own cap, and this is the test that
  // they cannot drift apart: change the column's width without changing the
  // offset built on it and the numbers stop matching here.
  const cap = /\.hero-copy\{max-width:min\((\d+)px,(\d+)%\)\}/.exec(css);
  assert.ok(cap, 'the hero copy column has no width cap to derive an offset from');
  const [, capPx, capPct] = cap;
  const kitLeft = /--kit-left:calc\(([\s\S]*?)\)\}/.exec(css);
  assert.ok(kitLeft, 'the object is not positioned off the copy column');
  assert.ok(kitLeft[1].includes(`${capPx}px`),
    `the copy caps at ${capPx}px and the object's offset does not use that number`);
  assert.ok(kitLeft[1].includes(`0.${capPct}`),
    `the copy caps at ${capPct}% and the object's offset does not use that number`);
  // and the percentage has to be taken off the wrap, not off the band
  assert.match(css, /--wrap-w:min\(100%,var\(--maxw\)\)/,
    'the offset does not account for the wrap being capped and centred');
  assert.match(rule[0], /left:var\(--kit-left\)/,
    'the object does not use the derived offset');
});

test('the floating badge is anchored to the hero corner, clear of the copy', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const badge = /\.badge-float\{[^}]*\}/.exec(css);
  assert.ok(badge, 'no rule for the floating badge');

  // It used to float ON the hero object and was measured off that object's own
  // right edge and width, so it would not slide away once the object hit its
  // width cap. There is no object any more, and the arithmetic must not be
  // left behind half-wired: a left:calc() reading a width nothing tracks is
  // the same bug in a quieter form.
  assert.match(badge[0], /right:[\d.]+%/, 'the badge is not anchored from the right');
  assert.match(badge[0], /bottom:[\d.]+%/, 'the badge is not anchored from the bottom');
  assert.match(badge[0], /left:auto/, 'the badge still carries a left offset as well');
  assert.doesNotMatch(badge[0], /calc\(/, 'the badge still measures itself off something');

  // Bottom right, not top right: the masthead already carries a phone button in
  // the top-right corner and a second one under it reads as the same control
  // twice. This pins that reasoning rather than the exact offsets.
  assert.doesNotMatch(badge[0], /top:/, 'the badge has moved under the masthead phone button');

  // And it stays above every layer the hero stacks under it — the frame, the
  // scrim, the beam, the grid and the copy.
  const z = Number(/z-index:(\d+)/.exec(badge[0])[1]);
  for (const sel of ['.hero-shot', '.hero-beam', '.hero-copy,.hero-trust']) {
    const rule = new RegExp(`\\${sel.replace(/,/g, ',\\.').replace(/^\./, '\\.')}\\{[^}]*z-index:(\\d+)`)
      .exec(css);
    if (!rule) continue;
    assert.ok(z > Number(rule[1]),
      `the badge is at z-index ${z}, under ${sel} at ${rule[1]}`);
  }
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

test('the home page shows the three real projects', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Residential Framing'));
  assert.ok(html.includes('Home Construction'));
  assert.ok(html.includes('Concrete Work'));
  assert.equal((html.match(/class="pj /g) || []).length, 3);
});

test('the hero states only facts drawn from the real content', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<b>2005<\/b><span>Building since<\/span>/);
  assert.match(html, /<b>14<\/b><span>Services<\/span>/);
  assert.match(html, /<b>11<\/b><span>Arizona cities<\/span>/);
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

test('only the concrete page renders an FAQ block and a scope list', () => {
  const concrete = renderPage({ mod: d01, key: 'services/concrete' });
  assert.match(concrete, /class="faqlist"/);
  assert.equal((concrete.match(/<details class="rv">/g) || []).length, 6);
  assert.match(concrete, /class="scope"/);
  assert.match(concrete, /Quality Assurance/);
  const roofing = renderPage({ mod: d01, key: 'services/roofing' });
  assert.doesNotMatch(roofing, /class="faqlist"/);
  assert.doesNotMatch(roofing, /class="scope"/);
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

test('the local copy carries its unverified warning for Quest to review', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  assert.match(local._README, /UNVERIFIED/);
  assert.match(local._README, /review this file before launch/);
});

test('area pages resolve the city token everywhere and name their own city', () => {
  for (const a of areas) {
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    assert.doesNotMatch(html, /\{\{city\}\}/, `${a.slug} has an unresolved token`);
    assert.ok(html.includes(esc(a.city)), `${a.slug} never names its city`);
  }
});

test('each area page links the other ten areas', () => {
  const html = renderPage({ mod: d01, key: 'service-areas/mesa-az' });
  const cloud = /<div class="arealinks rv">([\s\S]*?)<\/div>/.exec(html)[1];
  assert.equal((cloud.match(/<a /g) || []).length, 10);
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
  assert.match(html, /<form class="contact-form rv" novalidate>/);
  assert.match(html, /checkValidity\(\)/, 'no constraint validation in the page');
  assert.match(html, /addEventListener\('blur'/, 'nothing validates when a field is left');
  assert.match(html, /aria-invalid/, 'invalid fields are never marked as such');
  assert.match(html, /still needs? attention/, 'a failed submit reports nothing');
  assert.match(html, /\.focus\(\)/, 'a failed submit does not move to the first bad field');
  // The dead end has an exit: the form is not wired to a mailbox, and the
  // notice that says so hands over the number instead.
  assert.match(html, /not connected yet[\s\S]{0,120}tel:16023996455/);
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
    assert.match(file, /^quest\/card\//, `${s.slug} points outside the card crops`);
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

test('the projects page shows the three real projects with their real photographs', () => {
  const html = renderPage({ mod: d01, key: 'projects' });
  for (const t of ['Residential Framing', 'Home Construction', 'Concrete Work']) {
    assert.ok(html.includes(t), `projects missing ${t}`);
  }
  assert.equal((html.match(/class="pjcard rv"/g) || []).length, 3);
  // Framing, home construction, concrete — one Quest photograph each, in order.
  assert.ok(html.includes('quest/hero.webp'));
  assert.ok(html.includes('quest/custom-home-wide.webp'));
  assert.ok(html.includes('quest/slab-blockwall.webp'));
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
