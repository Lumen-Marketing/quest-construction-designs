import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolver } from './url.mjs';
import { loadContent, pageList } from './pages.mjs';
import { buildHead } from './head.mjs';
import { graphFor } from './schema.mjs';

const content = loadContent();
const pages = pageList();
const find = (k) => pages.find((p) => p.key === k);
const dirIndexable = { slug: 'd01-site-plan', indexable: true };
const dirHidden = { slug: 'd05-ground-break', indexable: false };

test('the indexable direction opts in, the others opt out', () => {
  const a = buildHead({
    page: find('home'), res: resolver('d01-site-plan', 'home'),
    dir: dirIndexable, content,
  });
  assert.match(a, /content="index,follow,max-image-preview:large/);
  const b = buildHead({
    page: find('home'), res: resolver('d05-ground-break', 'home'),
    dir: dirHidden, content,
  });
  assert.match(b, /content="noindex,follow"/);
});

test('canonical, og:url and title agree', () => {
  const p = find('services/roofing');
  const h = buildHead({ page: p, res: resolver('d01-site-plan', p.key), dir: dirIndexable, content });
  assert.match(h, /<link rel="canonical" href="https:\/\/questconstruction\.com\/d01-site-plan\/services\/roofing\/">/);
  assert.match(h, /<meta property="og:url" content="https:\/\/questconstruction\.com\/d01-site-plan\/services\/roofing\/">/);
  assert.ok(h.includes(`<title>${p.title}</title>`));
  assert.ok(h.includes(`<meta property="og:title" content="${p.title}">`));
});

test('the stylesheet and favicon resolve for the page depth', () => {
  const deep = buildHead({
    page: find('services/roofing'), res: resolver('d01-site-plan', 'services/roofing'),
    dir: dirIndexable, content,
  });
  assert.ok(deep.includes('href="../../assets/styles.css"'));
  assert.ok(deep.includes('href="../../../favicon.svg"'));
  const shallow = buildHead({
    page: find('home'), res: resolver('d01-site-plan', 'home'), dir: dirIndexable, content,
  });
  assert.ok(shallow.includes('href="assets/styles.css"'));
  assert.ok(shallow.includes('href="../favicon.svg"'));
});

test('no head ever leaks placeholder identity data', () => {
  for (const p of pages) {
    const h = buildHead({ page: p, res: resolver('d01-site-plan', p.key), dir: dirIndexable, content });
    for (const banned of ['555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp']) {
      assert.ok(!h.includes(banned), `${p.key} head leaked ${banned}`);
    }
  }
});

test('the business node carries the real NAP and no address or rating', () => {
  const g = graphFor({ page: find('home'), res: resolver('d01-site-plan', 'home'), content });
  const biz = g['@graph'].find((n) => String(n['@type']).includes('GeneralContractor'));
  assert.equal(biz.telephone, '+1-602-399-6455');
  assert.equal(biz.foundingDate, '2018');
  assert.equal(biz.address, undefined);
  assert.equal(biz.aggregateRating, undefined);
  assert.equal(biz.areaServed.length, content.areas.areas.length);
});

test('a service page emits a Service node and a breadcrumb trail', () => {
  const p = find('services/roofing');
  const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
  const svc = g['@graph'].find((n) => n['@type'] === 'Service');
  assert.equal(svc.name, 'Roofing');
  const crumbs = g['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[2].name, 'Roofing');
});

test('only the concrete page emits FAQPage, with six entries', () => {
  const withFaq = pages.filter((p) => {
    const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
    return g['@graph'].some((n) => n['@type'] === 'FAQPage');
  });
  assert.deepEqual(withFaq.map((p) => p.key), ['services/concrete']);
  const g = graphFor({
    page: find('services/concrete'),
    res: resolver('d01-site-plan', 'services/concrete'), content,
  });
  assert.equal(g['@graph'].find((n) => n['@type'] === 'FAQPage').mainEntity.length, 6);
});

test('an area page scopes areaServed to its own city', () => {
  const p = find('service-areas/mesa-az');
  const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
  const biz = g['@graph'].find((n) => String(n['@type']).includes('GeneralContractor'));
  assert.equal(biz.areaServed.length, 1);
  assert.equal(biz.areaServed[0].name, 'Mesa');
});

test('the contact page is typed ContactPage', () => {
  const g = graphFor({ page: find('contact'), res: resolver('d01-site-plan', 'contact'), content });
  assert.ok(g['@graph'].some((n) => n['@type'] === 'ContactPage'));
});

test('every page produces valid serialisable JSON-LD', () => {
  for (const p of pages) {
    const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(g)), p.key);
    assert.equal(g['@context'], 'https://schema.org');
    assert.ok(g['@graph'].length >= 4, `${p.key} graph too thin`);
  }
});

test('the JSON-LD embedded in the head parses', () => {
  for (const p of pages) {
    const h = buildHead({ page: p, res: resolver('d01-site-plan', p.key), dir: dirIndexable, content });
    const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(h);
    assert.ok(m, `${p.key} has no JSON-LD block`);
    assert.doesNotThrow(() => JSON.parse(m[1]), `${p.key} JSON-LD does not parse`);
  }
});
