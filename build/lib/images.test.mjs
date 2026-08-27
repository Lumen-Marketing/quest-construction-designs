import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { img, size } from './images.mjs';
import { resolver } from './url.mjs';

const ctx = (key) => {
  const r = resolver('d01-site-plan', key);
  return { asset: r.asset };
};

test('every measured image actually exists on disk', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  for (const f of Object.keys(sizes)) {
    assert.ok(existsSync(`assets/${f}`), `assets/${f} is measured but missing`);
  }
});

test('every photograph in the library is present and measured', async () => {
  const { ALT } = await import('./photos.mjs');
  for (const f of Object.keys(ALT)) {
    const [w, h] = size(f);
    assert.ok(w > 100 && h > 100, `${f} has implausible size ${w}x${h}`);
  }
  assert.ok(Object.keys(ALT).length >= 45, 'the library shrank unexpectedly');
});

test('every photograph Quest did not take is licensed, and says so in writing', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  const out = JSON.parse(readFileSync('content/outsourced.json', 'utf8'));
  const strays = Object.keys(sizes)
    .filter((f) => !f.startsWith('quest/') && !f.startsWith('og/'));

  // Two kinds of non-Quest image are allowed in the tree and no others: the
  // two documented cut-outs d10 draws with, and the outsourced materials on
  // the front page. Anything else is stock that crept in.
  const CUTOUTS = ['excavator.webp', 'loader.webp'];
  const licensed = out.images.map((i) => i.file);
  const allowed = new Set([...CUTOUTS, ...licensed]);
  for (const f of strays) {
    assert.ok(allowed.has(f),
      `${f} is not Quest's and is not in content/outsourced.json — where did it come from?`);
  }
  // And the other way round: a record with no file is a licence for something
  // that is not here, which means the record has gone stale.
  for (const f of licensed) {
    assert.ok(sizes[f], `content/outsourced.json lists ${f}, which is not in the tree`);
  }

  // The licence itself. CC0 only — public domain, commercial use, no
  // attribution — because this is a contractor's commercial site and nothing
  // here carries a credit line. A CC-BY image would need one, and adding one
  // is a product decision rather than a quiet edit to this file.
  for (const i of out.images) {
    assert.equal(i.license, 'cc0', `${i.file} is ${i.license}, not cc0`);
    assert.equal(i.commercial_use, true, `${i.file} is not cleared for commercial use`);
    assert.equal(i.attribution_required, false, `${i.file} requires attribution`);
    for (const k of ['source', 'source_url', 'landing_page', 'alt']) {
      assert.ok(i[k], `${i.file} has no ${k} recorded`);
    }
    // Alt text that describes the material, not a Quest job. These are the
    // only pictures on the site that are not of Quest's own work, and none of
    // them may imply otherwise.
    assert.doesNotMatch(i.alt, /Quest/i, `${i.file} alt implies it is a Quest job`);
  }
});

test('the hero is an outsourced cut-out, and the machines are off the front page', async () => {
  const { CUTOUTS, HERO } = await import('./photos.mjs');
  const out = JSON.parse(readFileSync('content/outsourced.json', 'utf8'));
  // Quest asked for the plant off the front page. What replaced it has to be
  // outsourced — Quest photographs jobs, and a job photograph in this slot is
  // a rectangle — and it has to be licensed like everything else here.
  assert.ok(!CUTOUTS.includes(HERO), 'the hero is one of the machine cut-outs again');
  assert.match(HERO, /^mat\//, `the hero is not one of the outsourced images: ${HERO}`);
  const rec = out.images.find((i) => i.file === HERO);
  assert.ok(rec, `the hero ${HERO} has no licence record`);
  assert.equal(rec.license, 'cc0');
  // It was matted rather than shot that way, and how is worth recording: the
  // next person to swap this slot needs to know it is not a plain photograph.
  assert.match(rec.processing || '', /cutout\.py|rembg/,
    'the hero cut-out does not say how its background was removed');

  // The two machine cut-outs stay in the tree because d10 still draws with
  // them; what matters is that the indexable direction does not.
  const d01 = readFileSync('d01-site-plan/index.html', 'utf8');
  for (const c of CUTOUTS) {
    assert.ok(!d01.includes(c), `the home page still references the machine cut-out ${c}`);
  }
});

test('every social card is exactly 1200x630', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  for (const [f, [w, h]] of Object.entries(sizes)) {
    if (!f.startsWith('og/')) continue;
    assert.deepEqual([w, h], [1200, 630], `${f} is ${w}x${h}`);
  }
});

test('img emits intrinsic dimensions and lazy loading by default', () => {
  const html = img(ctx('home'), 'quest/hero.webp', 'A Quest Construction project');
  assert.match(html, /width="1800"/);
  assert.match(html, /height="1013"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /src="\.\.\/assets\/quest\/hero\.webp"/);
});

test('img marks the LCP hero eager with fetchpriority', () => {
  const html = img(ctx('home'), 'quest/hero.webp', 'A Quest Construction project', { eager: true });
  assert.match(html, /loading="eager"/);
  assert.match(html, /fetchpriority="high"/);
  assert.doesNotMatch(html, /loading="lazy"/);
});

test('img resolves depth correctly from a two-deep page', () => {
  const html = img(ctx('services/adu'), 'quest/framing-clouds.webp', 'Framed walls on site');
  assert.match(html, /src="\.\.\/\.\.\/\.\.\/assets\/quest\/framing-clouds\.webp"/);
});

test('img refuses unknown files and missing alt text', () => {
  assert.throws(() => img(ctx('home'), 'nope.webp', 'anything'), /unknown image/);
  assert.throws(() => img(ctx('home'), 'quest/framing-clouds.webp', ''), /needs real alt text/);
});

test('img can mark an image decorative, and insists it carry no alt text', () => {
  const html = img(ctx('home'), 'quest/slab-poured.webp', '', { decorative: true });
  assert.match(html, /alt="" aria-hidden="true"/);
  assert.match(html, /width="1125"/);
  assert.throws(
    () => img(ctx('home'), 'quest/slab-poured.webp', 'A slab', { decorative: true }),
    /must not carry alt text/,
  );
});

test('img can load eagerly without claiming to be the LCP element', () => {
  const html = img(ctx('home'), 'quest/logo.webp', 'Quest Construction', { load: 'eager' });
  assert.match(html, /loading="eager"/);
  assert.doesNotMatch(html, /fetchpriority/);
});

test('no direction writes an <img> by hand', () => {
  // The masthead and footer logos were hand-written in all eleven directions,
  // repeating an intrinsic size content/images.json already knows and skipping
  // the alt and forbidden-file checks entirely. Three decorative images were
  // hand-written for a different reason: the renderer could not express one,
  // because it required alt text. Both holes are closed; this keeps them shut.
  for (const f of readdirSync('build/directions').filter((x) => /^d\d\d\.mjs$/.test(x))) {
    const src = readFileSync(`build/directions/${f}`, 'utf8');
    assert.ok(!src.includes('<img'), `${f} writes an <img> by hand instead of calling img()`);
  }
  assert.ok(!readFileSync('build/site/module.mjs', 'utf8').includes('<img'));
});
