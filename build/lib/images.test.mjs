import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync, readFileSync, readdirSync, statSync,
} from 'node:fs';
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

test('every photograph Quest did not take is accounted for in writing', async () => {
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
  const supplied = out.supplied.images.map((i) => i.file);
  const placeholders = out.placeholders.images.map((i) => i.file);
  const allowed = new Set([...CUTOUTS, ...sourced, ...supplied, ...placeholders]);
  for (const f of strays) {
    assert.ok(allowed.has(f),
      `${f} is not Quest's and is not in content/outsourced.json — where did it come from?`);
  }
  for (const f of [...sourced, ...supplied, ...placeholders]) {
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

  // What Quest handed over is used as given, and the one thing that must not
  // happen is quietly implying it was checked. mat/kit.webp has no licence
  // metadata and looks like commercial stock; it was removed with the old hero
  // and Quest asked for it back, which is Quest's call to make — but it comes
  // back with the warning attached, not laundered by the round trip. This
  // keeps that sentence from being deleted by accident.
  assert.match(out.supplied.rights, /NOT VERIFIED/,
    'the supplied-images block no longer says its rights are unverified');
  for (const i of out.supplied.images) {
    for (const k of ['supplied_as', 'alt', 'used_for']) {
      assert.ok(i[k], `${i.file} has no ${k} recorded`);
    }
  }

  // The retired list is the inverse: files that must stay OUT of the tree.
  assert.ok(Array.isArray(out.retired?.images) && out.retired.images.length,
    'the retired-images record is gone');
  for (const i of out.retired.images) {
    assert.ok(!sizes[i.file], `${i.file} was retired and is back in the tree`);
    assert.ok(!existsSync(`assets/${i.file}`), `${i.file} was retired and is back on disk`);
    for (const k of ['alt', 'was_used_for', 'rights']) {
      assert.ok(i[k], `retired ${i.file} has no ${k} recorded`);
    }
  }

  // The placeholders are the one block that is allowed to need attribution, so
  // it has to say so loudly and keep saying so. They stand in for photographs
  // Quest has not taken; the moment that sentence goes quiet, the credit line
  // owed on sixteen of them goes quiet with it.
  assert.match(out.placeholders.status, /TO BE REPLACED/,
    'the placeholder block no longer says these are to be replaced');
  assert.match(out.placeholders.rule, /NOT attribution-free/,
    'the placeholder block no longer warns that these need crediting');
  for (const i of out.placeholders.images) {
    assert.ok(i.file.startsWith('stock/'),
      `${i.file} is a placeholder but does not live under assets/stock/`);
    assert.equal(typeof i.attribution_required, 'boolean',
      `${i.file} does not say whether it needs attribution`);
    for (const k of ['license', 'credit_line', 'landing_page', 'alt', 'service']) {
      assert.ok(i[k], `${i.file} has no ${k} recorded`);
    }
  }

  // A placeholder is not Quest's work, so it must never reach the gallery —
  // that page is captioned as Quest's own completed jobs.
  const { GALLERY } = await import('./photos.mjs');
  for (const f of placeholders) {
    assert.ok(!GALLERY.includes(f), `${f} is stock and is in the project gallery`);
  }

  // Alt text that describes the picture, not a Quest job. None of these show
  // Quest's own work and none of them may imply otherwise.
  for (const i of [...out.images, ...out.supplied.images, ...out.retired.images,
                   ...out.placeholders.images]) {
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
    // The full path, not the bare filename: the cut-outs sit at assets/<name>,
    // and a bare `excavator.webp` also matches the demolition card's
    // footings-excavator.webp, which is Quest's own photograph.
    assert.ok(!d01.includes(`assets/${c}`),
      `the home page still references the machine cut-out ${c}`);
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

// ----------------------------------------------------------- smaller copies
// A 190px gallery thumbnail was downloading a 1125x1500 original, and a phone
// was fetching the same master as a 1440px desktop. Each photograph now ships
// with copies 480 and 960 pixels wide under assets/w480/ and assets/w960/,
// generated by tools/responsive-images.py and listed in
// content/image-variants.json.

const webpWidth = (b) => {
  const tag = b.toString('ascii', 12, 16);
  if (tag === 'VP8X') return 1 + b.readUIntLE(24, 3);
  if (tag === 'VP8 ') return b.readUInt16LE(26) & 0x3fff;
  if (tag === 'VP8L') return (b.readUInt32LE(21) & 0x3fff) + 1;
  return null;
};

test('img lists the smaller copies of a photograph when told how wide it is shown', async () => {
  const { VARIANT_WIDTHS } = await import('./images.mjs');
  assert.deepEqual(VARIANT_WIDTHS, [480, 960]);
  // An 1800px wide frame, so both copies are worth shipping. A 1125px portrait
  // carries only the 480: see the size rule in tools/responsive-images.py.
  const html = img(ctx('home'), 'quest/hero.webp', 'Framing on a Quest home', { sizes: '190px' });
  assert.match(html, /srcset="\.\.\/assets\/w480\/quest\/hero\.webp 480w, \.\.\/assets\/w960\/quest\/hero\.webp 960w, \.\.\/assets\/quest\/hero\.webp 1800w"/);
  assert.match(html, /sizes="190px"/);
  // The original stays the src: a browser without srcset, and every script
  // that reads the src, still gets the full photograph.
  assert.match(html, /src="\.\.\/assets\/quest\/hero\.webp"/);
  assert.match(html, /width="1800" height="1013"/);
});

test('img offers no srcset without a size, because a browser would assume full width', () => {
  assert.doesNotMatch(img(ctx('home'), 'quest/hero.webp', 'Framing on a Quest home'), /srcset/);
});

test('every photograph has its smaller copies, at the widths they claim', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  const variants = JSON.parse(readFileSync('content/image-variants.json', 'utf8'));
  const photos = Object.keys(sizes)
    .filter((f) => /^(quest|stock)\/[^/]+\.webp$/.test(f) && f !== 'quest/logo.webp');
  assert.ok(photos.length > 100, 'the photograph filter matched almost nothing');
  let listed = 0;
  for (const f of photos) {
    const widths = variants[f] || [];
    const bytes = statSync(`assets/${f}`).size;
    for (const w of [480, 960]) {
      const path = `assets/w${w}/${f}`;
      if (!widths.includes(w)) {
        // Either it would not have been smaller than the original, or it would
        // not have been smaller by enough to be worth a second file.
        assert.ok(!existsSync(path), `${path} is on disk but not listed`);
        continue;
      }
      listed++;
      assert.ok(w <= sizes[f][0] * 0.9, `${f}: a ${w}px copy of a ${sizes[f][0]}px photograph`);
      assert.ok(existsSync(path), `${path} is listed but missing`);
      assert.equal(webpWidth(readFileSync(path)), w, `${path} is not ${w} pixels wide`);
      assert.ok(statSync(path).size < bytes * 0.85,
        `${path} is not meaningfully smaller than the original`);
    }
  }
  assert.ok(listed > 100, `only ${listed} smaller copies in the whole library`);
  for (const f of Object.keys(variants)) {
    assert.ok(sizes[f], `content/image-variants.json lists ${f}, which is not a photograph`);
  }
  // The copies are not photographs in their own right: the measured library
  // stays the originals, or every stock copy reads as unaccounted-for stock.
  assert.ok(!Object.keys(sizes).some((f) => /^w\d+\//.test(f)), 'a smaller copy was measured');
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
