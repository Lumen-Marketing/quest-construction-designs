import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage, allPagesFor } from '../build.mjs';
import * as d01 from './d01.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;

test('direction 01 is the one indexable direction', () => {
  assert.equal(d01.meta.slug, 'd01-site-plan');
  assert.equal(d01.meta.indexable, true);
});

test('the navbar links every service and every area, from any depth', () => {
  const html = renderPage({ mod: d01, key: 'services/adu' });
  for (const s of services) {
    assert.ok(html.includes(`../../services/${s.slug}/index.html`), `nav missing service ${s.slug}`);
  }
  for (const a of areas) {
    assert.ok(html.includes(`../../service-areas/${a.slug}/index.html`), `nav missing area ${a.slug}`);
  }
});

test('the navbar carries the real phone number as a tel link', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.ok(html.includes('(602) 399-6455'));
});

test('the footer states the real founding year and no invented figures', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Since 2005'));
  assert.doesNotMatch(html, /est\.\s*2010|340\+|\b96%|4\.9\b|87 reviews/);
});

test('the mobile nav toggle and dropdowns are present and labelled', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /class="navtoggle"[^>]*aria-label="Toggle navigation"/);
  assert.equal((html.match(/class="dropmenu/g) || []).length, 2);
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 3);
});

test('the home page carries all fourteen service cards with icons', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  for (const s of services) assert.ok(html.includes(`<h3>${esc(s.name)}</h3>`), `card ${s.slug}`);
  const cards = html.match(/<article class="svc[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, 14);
  for (const card of cards) {
    assert.match(card, /<span class="ic"><svg viewBox="0 0 24 24"/, 'card without an icon');
    assert.match(card, /class="go" href="[^"]*services\//, 'card without a link');
  }
});

test('the home page carries both real offers with their codes', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('data-copy="WELCOME10"'));
  assert.ok(html.includes('data-copy="REFER100"'));
});

test('the home page shows the three real projects', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Residential Framing'));
  assert.ok(html.includes('Home Construction'));
  assert.ok(html.includes('Concrete Work'));
  assert.equal((html.match(/class="pj /g) || []).length, 3);
});

test('the hero states only facts drawn from the real content', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<b>2005<\/b><span>Building since<\/span>/);
  assert.match(html, /<b>14<\/b><span>Services<\/span>/);
  assert.match(html, /<b>11<\/b><span>Arizona cities<\/span>/);
});

test('the LCP hero image is eager and preloaded, and only on the home page', () => {
  const home = renderPage({ mod: d01, key: 'home' });
  assert.match(home, /fetchpriority="high"/);
  assert.match(home, /<link rel="preload" as="image"/);
  const inner = renderPage({ mod: d01, key: 'about' });
  assert.doesNotMatch(inner, /<link rel="preload" as="image"/);
});

test('the marquee is fed the real service names', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('"Window Installation"'), 'marquee missing real service names');
});

test('every rendered image carries alt text and intrinsic dimensions', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: d01, key });
    for (const tag of html.match(/<img[^>]+>/g) || []) {
      assert.match(tag, /alt="[^"]*"/, `${key}: image without alt: ${tag}`);
      assert.match(tag, /width="\d+"/, `${key}: image without width: ${tag}`);
      assert.match(tag, /height="\d+"/, `${key}: image without height: ${tag}`);
    }
  }
});
