import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSitemap } from './sitemap.mjs';

test('the sitemap lists exactly the thirty-one indexable pages', () => {
  const xml = buildSitemap();
  assert.equal((xml.match(/<url>/g) || []).length, 31);
  assert.ok(xml.includes('https://questconstruction.com/d01-site-plan/'));
});

test('the sitemap excludes every noindex direction', () => {
  const xml = buildSitemap();
  for (const s of ['d02-heavy-plant', 'd05-ground-break', 'd10-cross-cut']) {
    assert.ok(!xml.includes(s), `sitemap must not list ${s}`);
  }
});

test('the sitemap declares the right namespace and is well formed', () => {
  const xml = buildSitemap();
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.equal((xml.match(/<loc>/g) || []).length, (xml.match(/<\/loc>/g) || []).length);
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
});

test('the committed sitemap.xml matches what the generator produces', () => {
  assert.equal(readFileSync('sitemap.xml', 'utf8'), buildSitemap());
});

test('robots.txt still welcomes the AI crawlers and points at the sitemap', () => {
  const r = readFileSync('robots.txt', 'utf8');
  for (const bot of ['GPTBot', 'PerplexityBot', 'ClaudeBot']) assert.ok(r.includes(bot));
  assert.match(r, /Sitemap:\s*https:\/\/questconstruction\.com\/sitemap\.xml/);
});
