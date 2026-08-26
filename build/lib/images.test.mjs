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

test('nothing outside assets/quest/ and assets/og/ is shipped as photography', () => {
  const sizes = JSON.parse(readFileSync('content/images.json', 'utf8'));
  for (const f of Object.keys(sizes)) {
    assert.ok(f.startsWith('quest/') || f.startsWith('og/'),
      `${f} is not one of Quest's own photographs`);
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
