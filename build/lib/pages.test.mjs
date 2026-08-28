import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, pageList, pageCount } from './pages.mjs';

test('the page list is home, every trade, every city and the five standalones', () => {
  assert.equal(pageList().length, pageCount());
});

test('page kinds are distributed as expected', () => {
  const { services, areas } = loadContent();
  const by = {};
  for (const p of pageList()) by[p.kind] = (by[p.kind] || 0) + 1;
  assert.deepEqual(by, {
    home: 1, service: services.length, area: areas.areas.length,
    about: 1, gallery: 1, projects: 1, contact: 1, sitemap: 1,
  });
});

test('every title is at most sixty characters and every description at most 155', () => {
  for (const p of pageList()) {
    assert.ok(p.title.length <= 60, `title too long (${p.title.length}): ${p.title}`);
    assert.ok(p.description.length <= 155,
      `description too long (${p.description.length}) on ${p.key}`);
  }
});

test('every title and description is non-trivial', () => {
  for (const p of pageList()) {
    assert.ok(p.title.length > 15, `title too short on ${p.key}: ${p.title}`);
    assert.ok(p.description.length > 60, `description too short on ${p.key}`);
  }
});

test('every title and description is unique across the site', () => {
  const t = new Set(), d = new Set();
  for (const p of pageList()) {
    assert.ok(!t.has(p.title), `duplicate title: ${p.title}`);
    assert.ok(!d.has(p.description), `duplicate description on ${p.key}`);
    t.add(p.title); d.add(p.description);
  }
});

test('no page references the forbidden plans asset', () => {
  assert.ok(pageList().every((p) => !String(p.ogImage).includes('plans')));
});

test('every page names an og image and alt text', () => {
  for (const p of pageList()) {
    assert.match(p.ogImage, /\.jpg$/, `${p.key} og image`);
    assert.ok(p.ogAlt.length > 10, `${p.key} og alt`);
  }
});

test('service and area pages carry their content item', () => {
  const svc = pageList().find((p) => p.key === 'services/roofing');
  assert.equal(svc.item.slug, 'roofing');
  assert.equal(svc.item.name, 'Roofing');
  const area = pageList().find((p) => p.key === 'service-areas/mesa-az');
  assert.equal(area.item.city, 'Mesa');
});

test('loadContent returns all four content files', () => {
  const c = loadContent();
  assert.equal(c.services.length, 14);
  assert.ok(c.areas.areas.length > 0, 'the render context carries the cities');
  assert.equal(c.site.phoneDisplay, '(602) 399-6455');
  assert.ok(c.pages.home.heroTitle);
});
