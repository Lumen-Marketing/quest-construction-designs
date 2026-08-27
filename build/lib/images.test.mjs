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

test('every photograph Quest did not take is accounted for in writing', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  const out = JSON.parse(readFileSync('content/outsourced.json', 'utf8'));
  const strays = Object.keys(sizes)
    .filter((f) => !f.startsWith('quest/') && !f.startsWith('og/'));

  // Three kinds of non-Quest image are allowed in the tree and no others: the
  // two documented cut-outs d10 draws with, the CC0 images sourced here, and
  // the files Quest supplied directly. Anything else is stock that crept in
  // with nobody able to say where from.
  const CUTOUTS = ['excavator.webp', 'loader.webp'];
  const sourced = out.images.map((i) => i.file);
  const allowed = new Set([...CUTOUTS, ...sourced]);
  for (const f of strays) {
    assert.ok(allowed.has(f),
      `${f} is not Quest's and is not in content/outsourced.json — where did it come from?`);
  }
  for (const f of sourced) {
    assert.ok(sizes[f], `content/outsourced.json lists ${f}, which is not in the tree`);
  }

  // What WE went and found has to be CC0 — public domain, commercial use, no
  // attribution — because this site carries no credit line. A CC-BY image
  // would need one, and adding a credit line is a product decision.
  for (const i of out.images) {
    assert.equal(i.license, 'cc0', `${i.file} is ${i.license}, not cc0`);
    assert.equal(i.commercial_use, true, `${i.file} is not cleared for commercial use`);
    assert.equal(i.attribution_required, false, `${i.file} requires attribution`);
    for (const k of ['source', 'source_url', 'landing_page', 'alt']) {
      assert.ok(i[k], `${i.file} has no ${k} recorded`);
    }
  }

  // The retired list is the inverse: files that must stay OUT. Quest supplied
  // mat/kit.webp as a Downloads file with no licence metadata, it looked like
  // commercial stock, and its rights were never verified — it was the one
  // open commercial risk in the tree. Rebuilding the hero on Quest's own
  // photography removed the need for it, so it was deleted rather than left
  // lying around unreferenced. Putting it back would reopen the question.
  assert.ok(Array.isArray(out.retired?.images) && out.retired.images.length,
    'the retired-images record is gone');
  assert.match(out.retired.rule, /NOT VERIFIED/,
    'the retired block no longer says why mat/kit.webp must stay out');
  for (const i of out.retired.images) {
    assert.ok(!sizes[i.file], `${i.file} was retired and is back in the tree`);
    assert.ok(!existsSync(`assets/${i.file}`), `${i.file} was retired and is back on disk`);
    for (const k of ['alt', 'was_used_for', 'rights']) {
      assert.ok(i[k], `retired ${i.file} has no ${k} recorded`);
    }
  }

  // Alt text that describes the picture, not a Quest job. None of these show
  // Quest's own work and none of them may imply otherwise.
  for (const i of [...out.images, ...out.retired.images]) {
    assert.doesNotMatch(i.alt, /Quest/i, `${i.file} alt implies it is a Quest job`);
  }
});

test('the front page is Quest photography, and the machines are off it', async () => {
  const { CUTOUTS, HERO, ALT, LANDSCAPE } = await import('./photos.mjs');

  // The hero has been an outsourced cut-out, an outsourced material study and
  // an outsourced texture at various points, always because Quest had no
  // photograph that fitted the composition. The composition changed instead:
  // it is a full-bleed frame now, which is the one shape Quest's library is
  // full of. So the front page shows Quest's own work, and the standard is the
  // path, not a promise — 'quest/' or it did not come from Quest.
  assert.ok(!CUTOUTS.includes(HERO), 'the hero is one of the machine cut-outs again');
  assert.match(HERO, /^quest\//, `the hero ${HERO} is not one of Quest's own photographs`);
  assert.ok(ALT[HERO], 'the hero photograph has no alt text in the library');

  // It runs edge to edge across a band far wider than anything in the library
  // is shot, so it has to be one of the frames cleared for a wide slot — a
  // portrait phone frame loses its subject to the crop.
  assert.ok(LANDSCAPE.includes(HERO), `the hero ${HERO} is not a landscape frame`);

  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  assert.ok(sizes[HERO], 'the hero image is not measured');

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
