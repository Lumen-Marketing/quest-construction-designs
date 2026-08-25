// The standalone build's own contract. verify-site.mjs checks the committed
// output; this checks the renderers, so a break shows up before anything is
// written to disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, contextFor } from '../build.mjs';
import { pageList } from '../lib/pages.mjs';
import { demoProfile, siteProfile, BUILT } from '../lib/profile.mjs';
import { resolver, ORIGIN } from '../lib/url.mjs';
import { MAIN_TAG, documentFindings } from '../lib/page-rules.mjs';
import { buildCss } from './build-site.mjs';
import { fingerprint, stylesheetName } from '../lib/site-css.mjs';
import * as mod from './module.mjs';

const PAGES = siteProfile.pages();
const render = (key) => renderPage({ mod, key, profile: siteProfile });

test('the manifest carries thirty-three pages, two more than a demo direction', () => {
  assert.equal(PAGES.length, 33);
  assert.equal(pageList().length, 31);
  assert.ok(PAGES.some((p) => p.key === 'services'));
  assert.ok(PAGES.some((p) => p.key === 'service-areas'));
});

test('every page renders with a real body and breaks no page rule', () => {
  for (const p of PAGES) {
    const html = render(p.key);
    const body = html.split(MAIN_TAG)[1].split('</main>')[0];
    assert.ok(body.length > 1200, `${p.key}: body only ${body.length} chars`);
    const findings = documentFindings(html);
    assert.deepEqual(findings, [], `${p.key}: ${findings.map((f) => f.message).join('; ')}`);
  }
});

test('canonicals sit at the origin root, not in a direction folder', () => {
  assert.match(render('home'), new RegExp(`<link rel="canonical" href="${ORIGIN}/">`));
  assert.match(render('services/adu'),
    new RegExp(`<link rel="canonical" href="${ORIGIN}/services/adu/">`));
  assert.ok(!render('home').includes('d01-site-plan'));
});

test('the chooser furniture is gone — no accent swap, no Google Fonts', () => {
  for (const key of ['home', 'services', 'contact']) {
    const html = render(key);
    assert.ok(!html.includes('?acc='), `${key}: still reads an accent off the URL`);
    assert.ok(!html.includes('fonts.googleapis.com'), `${key}: still asks Google for fonts`);
    assert.ok(!/var P=\{orange:/.test(html), `${key}: the palette map survived`);
  }
});

test('the fonts are preloaded from this origin', () => {
  const html = render('home');
  assert.match(html, /rel="preload" as="font" type="font\/woff2" href="assets\/fonts\/archivo/);
  assert.match(html, /rel="preload" as="font" type="font\/woff2" href="assets\/fonts\/jetbrains/);
});

test('the section landing pages index what they claim to', () => {
  const services = render('services');
  const areas = render('service-areas');
  for (const slug of ['adu', 'concrete', 'roofing', 'window-installation']) {
    assert.ok(services.includes(`services/${slug}/index.html`), `services hub is missing ${slug}`);
  }
  for (const slug of ['mesa-az', 'florence-az', 'phoenix-az']) {
    assert.ok(areas.includes(`service-areas/${slug}/index.html`), `areas hub is missing ${slug}`);
  }
  // Each hub says in the graph what it lists, which is the point of the page.
  const list = (html) => JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html)[1],
  )['@graph'].find((n) => n['@type'] === 'ItemList');
  assert.equal(list(services).numberOfItems, 14);
  assert.equal(list(areas).numberOfItems, 11);
});

test('breadcrumbs point at the hubs here and at the sitemap in a demo direction', () => {
  assert.match(render('services/adu'),
    /<a href="\.\.\/\.\.\/services\/index\.html">Services<\/a>/);
  const demo = renderPage({ mod, key: 'services/adu' });
  assert.match(demo, /<a href="\.\.\/\.\.\/sitemap\/index\.html">Services<\/a>/);
});

test('the richer business node is opt-in, and carries nothing invented', () => {
  const graph = (html) => JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html)[1],
  )['@graph'];

  const biz = graph(render('home')).find((n) => String(n['@id']).endsWith('#business'));
  assert.ok(biz.hasOfferCatalog, 'no offer catalogue');
  assert.equal(biz.hasOfferCatalog.itemListElement.length, 14);
  assert.ok(biz.openingHoursSpecification, 'no opening hours');
  assert.ok(!biz.address, 'invented a PostalAddress');
  assert.ok(!biz.aggregateRating, 'invented an aggregateRating');
  assert.ok(!biz.identifier, 'invented a licence identifier');

  const lean = graph(renderPage({ mod, key: 'home' }))
    .find((n) => String(n['@id']).endsWith('#business'));
  assert.ok(!lean.hasOfferCatalog, 'the demo directions should keep the lean node');
});

test('an area page narrows both the business and the service to its own city', () => {
  const g = JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/
      .exec(render('service-areas/mesa-az'))[1],
  )['@graph'];
  const biz = g.find((n) => String(n['@id']).endsWith('#business'));
  assert.deepEqual(biz.areaServed.map((a) => a.name), ['Mesa']);
  const svc = g.find((n) => n['@type'] === 'Service');
  assert.equal(svc.areaServed.name, 'Mesa');
});

test('the social card points inside assets/og/, where the cards actually are', () => {
  assert.match(render('home'),
    new RegExp(`<meta property="og:image" content="${ORIGIN}/assets/og/quest-hero\\.jpg">`));
  const page = JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(render('home'))[1],
  )['@graph'].find((n) => String(n['@id']).endsWith('#webpage'));
  assert.equal(page.primaryImageOfPage.url, `${ORIGIN}/assets/og/quest-hero.jpg`);
});

test('the absolute resolver addresses the site root, for the 404', () => {
  const res = resolver('', 'home', { hubs: true });
  assert.equal(res.url('services/adu'), 'services/adu/index.html');
  assert.equal(res.asset('quest/logo.webp'), 'assets/quest/logo.webp');
  const deep = resolver('', 'services/adu', { hubs: true });
  assert.equal(deep.asset('quest/logo.webp'), '../../assets/quest/logo.webp');
  assert.equal(deep.hub('services'), '../../services/index.html');
});

test('the stylesheet comes out Burnt Orange with no ochre left in it', () => {
  const css = buildCss();
  assert.match(css, /--acc:#D07C42/);
  assert.match(css, /--on-acc:#1C1208/);
  assert.match(css, /--acc-dim:#9A4E1E/);
  assert.ok(!/#D9A93C|255,\s*198,\s*41|224,\s*168,\s*0/i.test(css), 'ochre survived');
  assert.equal((css.match(/@font-face/g) || []).length, 2);
  // The faces have to come before any rule that names the family.
  assert.ok(css.indexOf('@font-face') < css.indexOf("font:400 16px/1.62 'Archivo'"));
  assert.ok(!css.includes('http'), 'the stylesheet reaches off-origin');
});

test('the two profiles differ in exactly four ways, all of them named', () => {
  assert.equal(demoProfile.hubs, false);
  assert.equal(siteProfile.hubs, true);
  assert.equal(demoProfile.pages().length, 31);
  assert.equal(siteProfile.pages().length, 33);
  assert.deepEqual(demoProfile.schemaOpts(), { rich: false, built: null });
  assert.deepEqual(siteProfile.schemaOpts(), { rich: true, built: BUILT });
  // The fourth: only the standalone is served behind an immutable cache, so
  // only the standalone has to change its stylesheet's name to bust it.
  assert.equal(demoProfile.stylesheet(), 'assets/styles.css');
  assert.notEqual(siteProfile.stylesheet(), 'assets/styles.css');
});

test('a profile builds its manifest once, not on every question', () => {
  assert.equal(siteProfile.pages(), siteProfile.pages());
});

test('the profile decides how a page addresses things', () => {
  const rel = siteProfile.resolverFor('', 'services/adu');
  assert.equal(rel.url('home'), '../../index.html');
  const abs = siteProfile.resolverFor('', 'services/adu', { absolute: true });
  assert.equal(abs.url('home'), '/');
  assert.equal(abs.asset('quest/logo.webp'), '/assets/quest/logo.webp');
});

test('a render context can be had without rendering a page', () => {
  const c = contextFor({ mod, key: 'home', profile: siteProfile });
  assert.equal(c.page.key, 'home');
  assert.equal(c.hubs, true);
  assert.equal(c.site.name, 'Quest Construction');
  assert.equal(c.url('services/adu'), 'services/adu/index.html');

  // The 404 asks for the same thing addressed root-absolutely.
  const four = contextFor({ mod, key: 'home', profile: siteProfile, absolute: true });
  assert.equal(four.url('services/adu'), '/services/adu/');
  assert.equal(four.local('assets/styles.css'), '/assets/styles.css');
});

test('an unknown page key throws rather than rendering something empty', () => {
  assert.throws(() => contextFor({ mod, key: 'no-such-page', profile: siteProfile }),
    /no such page/);
});


// ------------------------------------------------------- the stylesheet's name
// The host is told /assets/* is `immutable` for a year, which tells a browser
// never to revalidate — not even on a reload. That was shipped against
// `assets/styles.css`, a name that never changed, so a returning visitor kept
// the stylesheet they first downloaded and no CSS fix ever reached them. The
// name carries a hash of the contents now, and these hold it to that.

test('the standalone fingerprints its stylesheet, and the demo directions do not', () => {
  assert.match(siteProfile.stylesheet(), /^assets\/styles\.[0-9a-f]{10}\.css$/);
  // Hashing the demo directions would rewrite all 310 pages on any colour change,
  // and nothing serves them with a long cache to justify it.
  assert.equal(demoProfile.stylesheet(), 'assets/styles.css');
});

test('the fingerprint follows the contents, or the cache is never busted', () => {
  const css = buildCss();
  assert.equal(fingerprint(css), fingerprint(css), 'the same bytes must hash the same');
  assert.notEqual(fingerprint(css), fingerprint(`${css}
.x{color:red}`),
    'a changed stylesheet must ship under a changed name');
  assert.ok(stylesheetName().includes(fingerprint(css)),
    'the shipped name does not carry the hash of what was built');
});

test('the stylesheet keeps its folder, because the font urls are relative to it', () => {
  // @font-face in build/css/site.css says url(fonts/…), resolved against the
  // stylesheet — so the name may move but the folder may not.
  assert.match(siteProfile.stylesheet(), /^assets\//);
  assert.match(buildCss(), /url\(fonts\/archivo-latin-var\.woff2\)/);
});
