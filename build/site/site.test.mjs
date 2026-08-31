// The standalone build's own contract. verify-site.mjs checks the committed
// output; this checks the renderers, so a break shows up before anything is
// written to disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, contextFor } from '../build.mjs';
import { pageList, pageCount, loadContent, loadServiceAreas } from '../lib/pages.mjs';
import { demoProfile, siteProfile, BUILT } from '../lib/profile.mjs';
import { resolver, ORIGIN } from '../lib/url.mjs';
import { MAIN_TAG, documentFindings } from '../lib/page-rules.mjs';
import { buildCss, buildSitemap } from './build-site.mjs';
import { fingerprint, stylesheetName } from '../lib/site-css.mjs';
import * as mod from './module.mjs';

// Same escaping the renderers apply, so authored copy can be matched in output.
const esc = (x) => String(x)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PAGES = siteProfile.pages();
const render = (key) => renderPage({ mod, key, profile: siteProfile });

test('the manifest carries the hubs and the blog a demo direction does not', () => {
  assert.equal(PAGES.length, pageCount({ hubs: true, cityServices: true, blog: true }));
  assert.equal(pageList().length, pageCount());
  assert.ok(PAGES.some((p) => p.key === 'services'));
  assert.ok(PAGES.some((p) => p.key === 'service-areas'));
  assert.ok(PAGES.some((p) => p.key === 'blog'));
  assert.ok(PAGES.some((p) => p.kind === 'post'));
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
  for (const slug of ['mesa-az', 'sun-city-az', 'phoenix-az']) {
    assert.ok(areas.includes(`service-areas/${slug}/index.html`), `areas hub is missing ${slug}`);
  }
  // Each hub says in the graph what it lists, which is the point of the page.
  const list = (html) => JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html)[1],
  )['@graph'].find((n) => n['@type'] === 'ItemList');
  assert.equal(list(services).numberOfItems, 14);
  assert.equal(list(areas).numberOfItems, loadContent().areas.areas.length);
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

test('the two profiles differ in exactly five ways, all of them named', () => {
  assert.equal(demoProfile.hubs, false);
  assert.equal(siteProfile.hubs, true);
  // The fifth: the blog exists in one product and not the other.
  assert.equal(demoProfile.blog, false);
  assert.equal(siteProfile.blog, true);
  assert.equal(demoProfile.pages().length, pageCount());
  assert.equal(siteProfile.pages().length,
    pageCount({ hubs: true, cityServices: true, blog: true }));
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

// ---------------------------------------------------------------- trade × city

test('a trade-by-city page leads with copy written for that pairing', () => {
  const cross = loadServiceAreas();
  const list = pageList({ hubs: true, cityServices: true })
    .filter((p) => p.kind === 'serviceArea');
  assert.ok(list.length > 0, 'no trade-by-city pages in the manifest');

  for (const p of list) {
    const html = render(p.key);
    const { copy, area, service: svc } = p.item;
    // The pairing copy has to be on the page. If it is not, the page is the
    // trade page with a place name dropped in, which is the doorway pattern
    // these exist to avoid.
    assert.ok(html.includes(esc(copy.lede)), `${p.key} is missing its lede`);
    for (const para of copy.paras) {
      assert.ok(html.includes(esc(para)), `${p.key} is missing a paragraph`);
    }
    assert.ok(html.includes(`${svc.name} in ${area.city}`)
      || html.includes(`in <span class="hl">${area.city}</span>`), `${p.key} h1`);
    // Both parents reachable, so the page is not an orphan.
    assert.ok(html.includes(`services/${svc.slug}/index.html`), `${p.key} -> trade page`);
    assert.ok(html.includes(`service-areas/${area.slug}/index.html`), `${p.key} -> city page`);
  }

  // No two pairings share a lede — that would mean copy was duplicated rather
  // than written.
  const ledes = list.map((p) => p.item.copy.lede);
  assert.equal(new Set(ledes).size, ledes.length, 'two pairings share a lede');
  void cross;
});

test('every trade-by-city page is titled, described and unique', () => {
  const list = pageList({ hubs: true, cityServices: true })
    .filter((p) => p.kind === 'serviceArea');
  const titles = new Set();
  for (const p of list) {
    assert.ok(p.title.length <= 60, `${p.key} title is ${p.title.length} chars`);
    assert.ok(p.description.length <= 155, `${p.key} description is ${p.description.length}`);
    assert.ok(!titles.has(p.title), `${p.key} repeats a title`);
    titles.add(p.title);
  }
});

test('a trade-by-city title never truncates the city out of itself', () => {
  // "Residential Development in Queen Creek, AZ" clipped to the title budget
  // was "Residential Development in Queen", which is a different place and
  // reads as a typo. The state abbreviation is what gives way first.
  const list = pageList({ hubs: true, cityServices: true })
    .filter((p) => p.kind === 'serviceArea');
  for (const p of list) {
    assert.ok(p.title.includes(`in ${p.item.area.city}`),
      `${p.key} lost its city: ${p.title}`);
  }
});

// ----------------------------------------------------------------------- blog

test('every post renders its own body, its date and its reading time', () => {
  const posts = PAGES.filter((p) => p.kind === 'post');
  assert.ok(posts.length > 0, 'no posts in the manifest');
  for (const p of posts) {
    const html = render(p.key);
    const b = p.item;
    assert.ok(html.includes(esc(b.title)), `${p.key} is missing its headline`);
    assert.ok(html.includes(esc(b.standfirst)), `${p.key} is missing its standfirst`);
    for (const sec of b.sections) {
      assert.ok(html.includes(esc(sec.heading)), `${p.key} is missing a heading`);
      for (const para of sec.paras) {
        assert.ok(html.includes(esc(para)), `${p.key} is missing a paragraph`);
      }
    }
    assert.ok(html.includes(esc(b.takeaway)), `${p.key} is missing its takeaway`);
    // A dated page has to say so in a form a machine can read as well as a
    // person: the printed date is the human half, datetime is the other.
    assert.ok(html.includes(`<time datetime="${b.date}">`), `${p.key} has no machine date`);
    assert.ok(html.includes(`${b.minutes} min read`), `${p.key} has no reading time`);
    // Both parents, so no post is an orphan reachable only from a sitemap.
    assert.ok(html.includes('blog/index.html'), `${p.key} -> blog index`);
  }
  // Reading time is derived, so it cannot be wrong in the way a typed number is.
  const monsoon = posts.find((p) => p.key.endsWith('what-a-monsoon-does-to-an-arizona-roof'));
  assert.ok(monsoon.item.minutes >= 2, 'a 700-word post came out under two minutes');
});

test('the blog index lists every post, newest first', () => {
  const html = render('blog');
  const posts = PAGES.filter((p) => p.kind === 'post');
  for (const p of posts) {
    assert.ok(html.includes(`blog/${p.item.slug}/index.html`), `index missing ${p.item.slug}`);
    assert.ok(html.includes(esc(p.item.title)), `index missing ${p.item.slug} headline`);
  }
  // Sorted on the way out of the content file, so appending a post to the end
  // of posts.json still puts it at the top of the page.
  const dates = posts.map((p) => p.item.date);
  assert.deepEqual(dates, [...dates].sort().reverse(), 'posts are not newest first');
});

test('a post carries a BlogPosting node with real dates', () => {
  const p = PAGES.find((x) => x.kind === 'post');
  const graph = JSON.parse(
    /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(render(p.key))[1],
  )['@graph'];
  const node = graph.find((n) => n['@type'] === 'BlogPosting');
  assert.ok(node, 'no BlogPosting node');
  assert.equal(node.headline, p.item.title);
  assert.equal(node.datePublished, p.item.date);
  assert.equal(node.author['@id'], `${ORIGIN}/#business`);
  // The article sits beside the WebPage rather than replacing it, so the page
  // keeps its own identity and its breadcrumb.
  assert.ok(graph.some((n) => String(n['@id']).endsWith('#webpage')));
  const crumb = graph.find((n) => n['@type'] === 'BreadcrumbList');
  assert.deepEqual(crumb.itemListElement.map((i) => i.name),
    ['Home', 'Blog', p.item.title]);
});

test('a post lastmod is the day it was written, not the day of the build', () => {
  const xml = buildSitemap(new Map());
  const p = PAGES.find((x) => x.kind === 'post');
  const block = xml.split('<url>').find((u) => u.includes(`/blog/${p.item.slug}/`));
  assert.ok(block, 'the post is not in the sitemap');
  assert.ok(block.includes(`<lastmod>${p.item.date}</lastmod>`),
    `${p.key} claims it changed on the build date`);
});

test('the pages that carry authority link back into the blog', () => {
  // The blog was receiving a link from every page and giving one back only
  // from the sitemap. A post names the trades it belongs to; those trade
  // pages, and every trade-by-city page under them, print it.
  const roofing = render('services/roofing');
  for (const slug of ['what-a-monsoon-does-to-an-arizona-roof',
    'tile-roofs-and-the-underlayment-underneath']) {
    assert.ok(roofing.includes(`blog/${slug}/index.html`), `roofing does not link ${slug}`);
  }
  assert.ok(render('services/roofing/mesa-az').includes('blog/what-a-monsoon'),
    'a trade-by-city page does not link its trade posts');
  // areas: 'all' puts the permits post on every city page.
  for (const key of ['service-areas/mesa-az', 'service-areas/buckeye-az']) {
    assert.ok(render(key).includes('blog/who-issues-your-building-permit/index.html'),
      `${key} does not link the permits post`);
  }
  // And nothing renders where a page has no post to show.
  assert.ok(!render('gallery').includes('logrow'), 'the gallery page prints an empty log row');

  // The count that made this worth doing: posts should now be reachable from
  // far more than the sitemap page.
  const inbound = PAGES.filter((p) => p.kind !== 'post' && p.key !== 'blog')
    .filter((p) => /blog\/[a-z-]+\/index\.html/.test(render(p.key))).length;
  assert.ok(inbound > 200, `only ${inbound} pages link a post`);
});

test('a post declares the questions it prints, and prints the ones it declares', () => {
  for (const p of PAGES.filter((x) => x.kind === 'post')) {
    const html = render(p.key);
    const faqs = p.item.faqs || [];
    assert.ok(faqs.length >= 3, `${p.key} has ${faqs.length} questions`);
    const node = JSON.parse(
      /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html)[1],
    )['@graph'].find((n) => n['@type'] === 'FAQPage');
    assert.ok(node, `${p.key} declares no FAQPage`);
    assert.equal(node.mainEntity.length, faqs.length);
    // Every declared question is visible on the page. Schema that says more
    // than the page does is the kind of thing that gets a site penalised.
    for (const f of faqs) {
      assert.ok(html.includes(`<summary>${esc(f.q)}</summary>`), `${p.key}: ${f.q} not shown`);
      assert.ok(html.includes(esc(f.a)), `${p.key}: an answer is declared but not shown`);
    }
  }
});

test('the demo directions carry no blog at all', () => {
  // Not in the manifest, and not linked from the nav or the footer either —
  // a link to a page that was never built is a 404 in ten directions at once.
  assert.ok(!pageList().some((p) => p.key === 'blog' || p.kind === 'post'));
  const demo = renderPage({ mod, key: 'home' });
  assert.ok(!demo.includes('blog/index.html'), 'a demo direction links the blog');
});

test('the demo directions neither build nor link the trade-by-city pages', () => {
  // They are noindex, so 340 extra pages would be build time for nothing — but
  // a link to a page that was never written is a 404 in ten directions.
  assert.equal(demoProfile.cityServices, false);
  assert.equal(demoProfile.pages().filter((p) => p.kind === 'serviceArea').length, 0);
  const demo = renderPage({ mod, key: 'service-areas/mesa-az' });
  assert.doesNotMatch(demo, /services\/roofing\/mesa-az/,
    'a demo direction links a page it does not build');
});
