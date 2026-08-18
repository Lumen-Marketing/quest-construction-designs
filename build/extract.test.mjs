import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractServices, extractAreas } from './extract.mjs';

test('extracts all fourteen services', () => {
  const s = extractServices();
  assert.equal(s.length, 14);
  assert.deepEqual(
    s.map((x) => x.slug).sort(),
    ['adu', 'casita', 'concrete', 'custom-home-building',
     'deck-building-uses-trex-system', 'dry-wall', 'framing',
     'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops',
     'painting', 'residential-development', 'roofing', 'siding',
     'stucco', 'window-installation'].sort(),
  );
});

test('every service carries the boilerplate four-step process and four why-choose bullets', () => {
  for (const s of extractServices()) {
    assert.equal(s.process.length, 4, `${s.slug} process`);
    assert.equal(s.whyChoose.length, 4, `${s.slug} whyChoose`);
    assert.deepEqual(s.process.map((p) => p.n), [1, 2, 3, 4]);
  }
});

test('every service has a non-empty unique intro and no leftover entities', () => {
  const seen = new Set();
  for (const s of extractServices()) {
    assert.ok(s.intro.length >= 1, `${s.slug} has intro`);
    assert.ok(s.intro[0].length > 40, `${s.slug} intro is substantive`);
    assert.doesNotMatch(s.intro.join(' '), /&[a-z#0-9]+;/i, `${s.slug} decoded`);
    assert.ok(!seen.has(s.intro[0]), `${s.slug} intro is unique`);
    seen.add(s.intro[0]);
  }
});

test('concrete is the one service carrying FAQs and a scope list', () => {
  const s = extractServices();
  const withFaqs = s.filter((x) => x.faqs && x.faqs.length);
  assert.equal(withFaqs.length, 1);
  assert.equal(withFaqs[0].slug, 'concrete');
  assert.equal(withFaqs[0].faqs.length, 6);
  assert.ok(withFaqs[0].scope.length >= 4);
});

test('every service carries a name, short description and CTA', () => {
  for (const s of extractServices()) {
    assert.ok(s.name.length > 2, `${s.slug} name`);
    assert.ok(s.shortDesc.length > 20, `${s.slug} shortDesc`);
    assert.ok(s.h1.length > 5, `${s.slug} h1`);
    assert.ok(s.ctaHeading.length > 5, `${s.slug} ctaHeading`);
    assert.ok(s.ctaBody.length > 20, `${s.slug} ctaBody`);
  }
});

test('extracts eleven areas with a shared template', () => {
  const a = extractAreas();
  assert.equal(a.areas.length, 11);
  assert.ok(a.areas.every((x) => x.name.endsWith(', AZ')));
  assert.ok(a.template.community.includes('{{city}}'),
    'city is tokenised so the template is provably shared');
});
