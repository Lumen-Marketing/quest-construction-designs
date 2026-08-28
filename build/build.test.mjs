import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, allPagesFor } from './build.mjs';
import { HTML_TAG, SKIP_LINK, MAIN_TAG } from './lib/page-rules.mjs';
import * as stub from './directions/_stub.mjs';
import { pageCount } from './lib/pages.mjs';

test('a direction renders all thirty-one pages', () => {
  assert.equal(allPagesFor().length, pageCount());
});

test('a rendered page is a complete document with the landmarks', () => {
  const html = renderPage({ mod: stub, key: 'services/roofing' });
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<\/html>\s*$/);
  for (const tag of [HTML_TAG, SKIP_LINK, MAIN_TAG]) assert.ok(html.includes(tag), tag);
});

test('rendered links resolve relative to the page depth', () => {
  const html = renderPage({ mod: stub, key: 'services/roofing' });
  assert.ok(html.includes('href="../../contact-us/index.html"'));
  assert.ok(html.includes('href="../../assets/styles.css"'));
  assert.ok(html.includes('href="../../../favicon.svg"'));
});

test('the home page renders links without any climb', () => {
  const html = renderPage({ mod: stub, key: 'home' });
  assert.ok(html.includes('href="contact-us/index.html"'));
  assert.ok(html.includes('href="assets/styles.css"'));
});

test('every page kind renders through its own hook', () => {
  const seen = new Set();
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: stub, key });
    assert.ok(html.includes(`${MAIN_TAG}
<h1>`), `${key} rendered no h1`);
    seen.add(key);
  }
  assert.equal(seen.size, pageCount());
});

test('no rendered page contains an unresolved template token or a dead anchor', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: stub, key });
    assert.doesNotMatch(html, /\{\{/, `${key} has an unresolved token`);
    assert.doesNotMatch(html, /href="#"/, `${key} has a dead anchor`);
  }
});

test('no rendered page leaks placeholder identity data', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: stub, key });
    for (const banned of ['555-0100', 'Buchanan', 'ROC #', '4.9', 'plans.webp', 'est. 2010']) {
      assert.ok(!html.includes(banned), `${key} leaked ${banned}`);
    }
  }
});

test('an unknown page key throws', () => {
  assert.throws(() => renderPage({ mod: stub, key: 'nope' }), /no such page/);
});
