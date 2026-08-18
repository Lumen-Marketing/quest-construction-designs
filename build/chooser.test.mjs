import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const SLUGS = ['d01-site-plan', 'd02-heavy-plant', 'd03-split-bay', 'd04-grid-north',
  'd05-ground-break', 'd06-red-iron', 'd07-bid-desk', 'd08-machine-age',
  'd09-site-notice', 'd10-cross-cut'];

test('the chooser points at every built direction and no legacy path', () => {
  const html = readFileSync('index.html', 'utf8');
  for (const s of SLUGS) assert.ok(html.includes(`${s}/index.html`), `chooser missing ${s}`);
  assert.doesNotMatch(html, /direction-\d+-[a-z-]+\.html/, 'chooser still references a legacy path');
});

test('the legacy mockup files are gone and every target exists', () => {
  assert.ok(!existsSync('direction-1-site-plan.html'));
  for (const s of SLUGS) assert.ok(existsSync(`${s}/index.html`), `${s} not built`);
});
