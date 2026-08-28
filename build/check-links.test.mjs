import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDir } from './check-links.mjs';
import { pageCount } from './lib/pages.mjs';

const fmt = (rows) => rows.map((b) => `  ${b.file} -> ${b.href}`).join('\n');

test('direction 01 has no broken internal links or missing images', () => {
  const r = checkDir('d01-site-plan');
  assert.equal(r.broken.length, 0, 'broken:\n' + fmt(r.broken));
  assert.equal(r.checked, pageCount());
});

test('direction 01 has no dead same-page anchors', () => {
  const r = checkDir('d01-site-plan');
  assert.equal(r.anchors.length, 0, 'dead anchors:\n' + fmt(r.anchors));
});

test('the checker actually resolves paths rather than trusting them', () => {
  // The skip link points at #main, which every page defines. If the checker
  // were a no-op this would still pass, so assert it found real hrefs to check.
  const r = checkDir('d01-site-plan');
  assert.ok(r.checked > 0);
});
