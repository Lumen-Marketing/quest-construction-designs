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

test('the floating badge is measured from the machine, not the hero middle', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const machine = css.match(/\.machine\{[^}]*right:(-?[\d.]+)%[^}]*width:min\(([\d.]+)%,(\d+)px\)/);
  assert.ok(machine, 'the machine no longer anchors right with a capped width');
  const badge = css.match(/\.badge-float\{left:calc\(([\d.]+)% - ([\d.]+) \* min\(([\d.]+)%, ?(\d+)px\)\)/);
  assert.ok(badge, 'the badge is not measured off the machine');

  const [, mRight, mPct, mCap] = machine;
  const [, bBase, bFactor, bPct, bCap] = badge;
  // Both must read the same width, or they drift apart once the machine caps.
  assert.equal(bPct, mPct, 'the badge reads a different width percentage than the machine');
  assert.equal(bCap, mCap, 'the badge reads a different width cap than the machine');
  // The badge's base is the machine's right edge: 100% plus its overhang.
  assert.equal(Number(bBase), 100 - Number(mRight), 'the badge does not start at the machine edge');
  // And it lands inside the machine rather than off either end of it.
  const across = 1 - Number(bFactor);
  assert.ok(across > 0.15 && across < 0.8, `the badge sits at ${across * 100}% across the machine`);
});

// ------------------------------------------------------------- the dropdowns
// Both of these were reported from the live site: the menu vanished on the way
// down to click an item, and the longest trade printed over the item beside it.

test('the dropdown bridges the gap it floats above the button by', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const offset = css.match(/\.dropmenu\{[^}]*top:calc\(100% \+ (\d+)px\)/);
  assert.ok(offset, 'the panel no longer floats clear of the button');
  const bridge = css.match(/\.dropmenu::before\{[^}]*top:-(\d+)px;height:(\d+)px/);
  assert.ok(bridge, 'nothing bridges the gap; hover dies crossing it');
  // The bridge has to reach the button, or the pointer still leaves `.drop`
  // partway down and `:hover` goes false before the panel is reached.
  assert.ok(Number(bridge[1]) >= Number(offset[1]),
    `the bridge starts ${bridge[1]}px up but the panel floats ${offset[1]}px clear`);
  assert.ok(Number(bridge[2]) >= Number(offset[1]),
    `the bridge is ${bridge[2]}px tall over a ${offset[1]}px gap`);
});

test('dropdown labels wrap rather than printing over the next column', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const link = css.match(/\.dropmenu a\{[^}]*\}/);
  assert.ok(link, 'no rule for the dropdown links');
  // With a fixed track and nowrap the box stayed 215px while the full-remodel
  // trade rendered 422px of text straight out of it.
  assert.doesNotMatch(link[0], /white-space:nowrap/);
});

test('form fields are 16px, or iOS zooms the page in and does not zoom back', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const field = css.match(/\.contact-form input,\.contact-form textarea\{[^}]*\}/);
  assert.ok(field, 'no rule for the contact fields');
  const size = Number(field[0].match(/font-size:([\d.]+)px/)[1]);
  assert.ok(size >= 16, `contact fields are ${size}px, under the 16px iOS floor`);
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
  assert.match(html, /<textarea name="message"/);
  assert.match(html, /<button class="btn acc" type="submit">/);
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.match(html, /aria-live="polite"/);
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
