// The standalone build's own contract. verify-site.mjs checks the committed
// output; this checks the renderers, so a break shows up before anything is
// written to disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../build.mjs';
import { pageList } from '../lib/pages.mjs';
import { resolver, ORIGIN } from '../lib/url.mjs';
import { buildCss } from './build-site.mjs';
import * as mod from './module.mjs';

const PAGES = pageList({ hubs: true });
const OPTS = { hubs: true, rich: true, built: '2026-08-22' };
const render = (key, extra = {}) =>
  renderPage({ mod, key, pages: PAGES, opts: { ...OPTS, ...extra } });

test('the manifest carries thirty-three pages, two more than a demo direction', () => {
  assert.equal(PAGES.length, 33);
  assert.equal(pageList().length, 31);
  assert.ok(PAGES.some((p) => p.key === 'services'));
  assert.ok(PAGES.some((p) => p.key === 'service-areas'));
});

test('every page renders with one h1 and a real body', () => {
  for (const p of PAGES) {
    const html = render(p.key);
    const body = /<main id="main"[^>]*>([\s\S]*?)<\/main>/.exec(html)[1];
    assert.ok(body.length > 1200, `${p.key}: body only ${body.length} chars`);
    assert.equal((body.match(/<h1[ >]/g) || []).length, 1, `${p.key}: not exactly one h1`);
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
