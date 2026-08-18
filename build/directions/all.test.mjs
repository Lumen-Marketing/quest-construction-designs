// Conformance suite. Every direction module that exists on disk is held to the
// same contract, so a new direction cannot ship without meeting it and the
// guarantees do not have to be restated nine times.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { renderPage, allPagesFor } from '../build.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;
const site = JSON.parse(readFileSync('content/site.json', 'utf8'));

const NAMES = readdirSync(new URL('.', import.meta.url))
  .filter((f) => /^d\d\d\.mjs$/.test(f)).sort();

const mods = await Promise.all(NAMES.map((f) => import(`./${f}`)));

// Anything here means placeholder identity data or invented figures leaked into
// a generated page. Every one of these is a real-world liability, not a nit.
const BANNED = [
  '555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp',
  'est. 2010', '{{city}}', 'href="#"', 'undefined', 'NaN', '[object Object]',
];

test('at least one direction module exists', () => {
  assert.ok(mods.length > 0, 'no direction modules found');
});

for (const mod of mods) {
  const d = mod.meta.slug;

  test(`${d}: renders all thirty-one pages with one h1 and a real body`, () => {
    for (const key of allPagesFor()) {
      const html = renderPage({ mod, key });
      const body = /<main id="main">([\s\S]*?)<\/main>/.exec(html)[1];
      assert.ok(body.length > 1200, `${d} ${key}: body only ${body.length} chars`);
      assert.equal((body.match(/<h1[ >]/g) || []).length, 1, `${d} ${key}: not exactly one h1`);
    }
  });

  test(`${d}: is a complete document with the accessibility landmarks`, () => {
    const html = renderPage({ mod, key: 'home' });
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<\/html>\s*$/);
  });

  test(`${d}: leaks no placeholder identity data on any page`, () => {
    for (const key of allPagesFor()) {
      const html = renderPage({ mod, key });
      for (const bad of BANNED) {
        assert.ok(!html.includes(bad), `${d} ${key}: leaked ${JSON.stringify(bad)}`);
      }
    }
  });

  test(`${d}: carries the real NAP and never the placeholder one`, () => {
    const html = renderPage({ mod, key: 'home' });
    assert.ok(html.includes(site.phoneHref), `${d}: no tel link`);
    assert.ok(html.includes(site.phoneDisplay), `${d}: phone not shown`);
    assert.ok(html.includes(site.foundingYear), `${d}: founding year not shown`);
  });

  test(`${d}: navigation reaches every service and every area from depth two`, () => {
    const html = renderPage({ mod, key: 'services/adu' });
    for (const s of services) {
      assert.ok(html.includes(`../../services/${s.slug}/index.html`),
        `${d}: nav missing service ${s.slug}`);
    }
    for (const a of areas) {
      assert.ok(html.includes(`../../service-areas/${a.slug}/index.html`),
        `${d}: nav missing area ${a.slug}`);
    }
  });

  test(`${d}: every image has alt text and intrinsic dimensions`, () => {
    for (const key of allPagesFor()) {
      const html = renderPage({ mod, key });
      for (const tag of html.match(/<img[^>]+>/g) || []) {
        assert.match(tag, /alt="[^"]*"/, `${d} ${key}: img without alt`);
        assert.match(tag, /width="\d+"/, `${d} ${key}: img without width`);
        assert.match(tag, /height="\d+"/, `${d} ${key}: img without height`);
      }
    }
  });

  test(`${d}: only d01 is indexable, and robots agrees`, () => {
    const html = renderPage({ mod, key: 'home' });
    if (d === 'd01-site-plan') {
      assert.equal(mod.meta.indexable, true);
      assert.match(html, /content="index,follow/);
    } else {
      assert.equal(mod.meta.indexable, false, `${d} must not be indexable`);
      assert.match(html, /content="noindex,follow"/);
    }
  });

  test(`${d}: every service page renders its own content`, () => {
    for (const s of services) {
      const html = renderPage({ mod, key: `services/${s.slug}` });
      assert.ok(html.includes(esc(s.intro[0])), `${d} ${s.slug}: intro missing`);
      for (const p of s.process) {
        assert.ok(html.includes(esc(p.title)), `${d} ${s.slug}: step ${p.n} missing`);
      }
      for (const w of s.whyChoose) {
        assert.ok(html.includes(esc(w)), `${d} ${s.slug}: why-choose bullet missing`);
      }
    }
  });

  test(`${d}: concrete alone renders the FAQ content`, () => {
    const concrete = services.find((s) => s.slug === 'concrete');
    const html = renderPage({ mod, key: 'services/concrete' });
    for (const f of concrete.faqs) {
      assert.ok(html.includes(esc(f.q)), `${d}: concrete FAQ question missing`);
    }
    const roofing = renderPage({ mod, key: 'services/roofing' });
    assert.ok(!roofing.includes(esc(concrete.faqs[0].q)), `${d}: FAQ leaked onto roofing`);
  });

  test(`${d}: every area page names its own city and resolves the token`, () => {
    for (const a of areas) {
      const html = renderPage({ mod, key: `service-areas/${a.slug}` });
      assert.ok(html.includes(esc(a.city)), `${d} ${a.slug}: city not named`);
      assert.doesNotMatch(html, /\{\{/, `${d} ${a.slug}: unresolved token`);
    }
  });

  test(`${d}: the contact page renders a complete form`, () => {
    const html = renderPage({ mod, key: 'contact' });
    assert.match(html, /<form[^>]*class="contact-form/, `${d}: no contact form`);
    for (const n of ['name', 'email', 'phone', 'message']) {
      assert.ok(html.includes(`name="${n}"`), `${d}: contact form missing ${n}`);
    }
    assert.match(html, /type="submit"/, `${d}: no submit button`);
  });

  test(`${d}: the sitemap links every service and area`, () => {
    const html = renderPage({ mod, key: 'sitemap' });
    for (const s of services) {
      assert.ok(html.includes(`../services/${s.slug}/index.html`), `${d}: sitemap missing ${s.slug}`);
    }
    for (const a of areas) {
      assert.ok(html.includes(`../service-areas/${a.slug}/index.html`), `${d}: sitemap missing ${a.slug}`);
    }
  });

  test(`${d}: the home page shows all fourteen services and both real offers`, () => {
    const html = renderPage({ mod, key: 'home' });
    for (const s of services) {
      assert.ok(html.includes(esc(s.name)), `${d}: home missing service ${s.name}`);
    }
    for (const o of site.offers) {
      assert.ok(html.includes(o.code), `${d}: home missing offer ${o.code}`);
    }
  });
}
