// The trade icons. What a drawing looks like cannot be asserted, so these hold
// the things that can be: every trade has one, no two trades share one, and
// none is so thin that it draws nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { icon, SLUGS } from './icons.mjs';

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));

test('every trade has an icon of its own, and none falls back', () => {
  const fallback = icon('no-such-trade');
  for (const s of services) {
    assert.ok(SLUGS.includes(s.slug), `${s.slug} has no icon`);
    assert.notEqual(icon(s.slug), fallback, `${s.slug} is drawing the fallback house`);
  }
});

test('no two trades are drawn the same', () => {
  const seen = new Map();
  for (const slug of SLUGS) {
    const d = icon(slug);
    assert.ok(!seen.has(d), `${slug} is drawn exactly like ${seen.get(d)}`);
    seen.set(d, slug);
  }
});

test('each icon is a drawing rather than a stroke or two', () => {
  for (const slug of SLUGS) {
    const parts = (icon(slug).match(/<path/g) || []).length;
    assert.ok(parts >= 3, `${slug} is ${parts} path(s), which is not a picture of anything`);
  }
});

test('every icon starts each stroke inside the 24x24 box it declares', () => {
  for (const slug of SLUGS) {
    const svg = icon(slug);
    assert.match(svg, /viewBox="0 0 24 24"/);
    // Only the absolute move that opens each stroke: everything after it is a
    // relative delta, where a negative number is how the line goes up or left.
    for (const m of svg.matchAll(/d="M\s*(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g)) {
      for (const n of [Number(m[1]), Number(m[2])]) {
        assert.ok(n >= 0 && n <= 24, `${slug} starts a stroke at ${n}, outside the box`);
      }
    }
  }
});
