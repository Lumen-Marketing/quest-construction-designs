// The accents had three sources of truth and the README warned that changing a
// colour meant editing two of them by hand. The chooser is a hand-written file
// rather than a generated one, so it cannot import the module — these tests are
// what keep it from drifting instead.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PALETTES, KEYS, AUTHORED_KEY, CHOSEN_KEY, palette, scriptMap, accentDeclarations, contrast,
} from './palette.mjs';

test("the chooser's dots are the palette, and say so in the same words", () => {
  const chooser = readFileSync('index.html', 'utf8');
  for (const key of KEYS) {
    const p = palette(key);
    assert.ok(
      chooser.includes(`style="--c:${p.acc}" data-acc="${key}" data-name="${p.name}"`),
      `the chooser's ${key} dot has drifted from the palette`,
    );
  }
});

test('the demo stylesheets are authored in the accent they claim', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  const p = palette(AUTHORED_KEY);
  assert.ok(css.includes(`--acc:${p.acc}`), 'd01 is not authored in the authored accent');
  assert.ok(css.includes(`--on-acc:${p.onAcc}`));
  assert.ok(css.includes(`--acc-dim:${p.dim}`));
});

test('no accent hex is hardcoded outside its token', () => {
  const css = readFileSync('d01-site-plan/assets/styles.css', 'utf8');
  // The five literal washes were leftovers from a brighter, pre-muted palette.
  assert.ok(!/rgba\((?:255,\s*198,\s*41|224,\s*168,\s*0)/.test(css),
    'a literal wash from the old palette is back');
  for (const key of KEYS) {
    if (key === AUTHORED_KEY) continue;
    assert.ok(!css.includes(palette(key).acc), `${key} should not appear in d01's stylesheet`);
  }
});

test('the script map carries every accent, and the fourth value only on request', () => {
  const lean = scriptMap();
  const lifted = scriptMap({ lift: true });
  for (const key of KEYS) {
    assert.ok(lean.includes(`${key}:[`), `${key} missing from the map`);
  }
  assert.equal((lean.match(/'#/g) || []).length, 9, 'three values per accent');
  assert.equal((lifted.match(/'#/g) || []).length, 12, 'four values per accent when lifted');
  assert.ok(lifted.includes(palette('orange').lift));
  assert.ok(!lean.includes(palette('orange').lift));
});

test('accentDeclarations produce the block a :root carries', () => {
  const block = accentDeclarations(CHOSEN_KEY);
  assert.match(block, /--acc:#D07C42;/);
  assert.match(block, /--on-acc:#1C1208;/);
  assert.match(block, /--acc-dim:#9A4E1E;/);
  assert.ok(!block.includes('--acc-lift'));
  assert.match(accentDeclarations(CHOSEN_KEY, { lift: true }), /--acc-lift:#EFA372;/);
});

test('an unknown accent throws rather than silently rendering nothing', () => {
  assert.throws(() => palette('chartreuse'), /no such accent/);
});

// The contrast pairings were being checked by screenshotting a page and
// sampling pixels — which is how both contrast bugs found so far were caught.
// Every accent has to hold up on all three grounds it is used on.
const CREAM = '#FAF6EC';
const DARK = '#141413';

test('text on the accent clears 4.5:1, for every accent', () => {
  for (const key of KEYS) {
    const p = palette(key);
    const r = contrast(p.onAcc, p.acc);
    assert.ok(r >= 4.5, `${p.name}: on-accent text is only ${r}:1`);
  }
});

test('the dim tint clears 4.5:1 as text on cream, for every accent', () => {
  for (const key of KEYS) {
    const p = palette(key);
    const r = contrast(p.dim, CREAM);
    assert.ok(r >= 4.5, `${p.name}: dim on cream is only ${r}:1`);
  }
});

test('the SHIPPED accent clears 4.5:1 on all three of its grounds', () => {
  const p = palette(CHOSEN_KEY);
  assert.ok(contrast(p.onAcc, p.acc) >= 4.5, 'text on the accent plane');
  assert.ok(contrast(p.dim, CREAM) >= 4.5, 'the dim tint on cream');
  assert.ok(contrast(p.acc, DARK) >= 4.5, 'the accent as text on the dark ground');
});

test('every accent clears 3:1 on the dark ground, and clay only just', () => {
  // Clay is 3.51:1 there — fine for large text and for a focus ring, short of
  // the 4.5 body-text bar. Picking it would mean using its lift value for the
  // small mono labels on the dark bands, which is exactly what 05 already does
  // on its coloured ground.
  for (const key of KEYS) {
    const p = palette(key);
    const r = contrast(p.acc, DARK);
    assert.ok(r >= 3, `${p.name}: accent on dark is only ${r}:1`);
  }
  assert.ok(contrast(palette('clay').acc, DARK) < 4.5, 'clay used to need its lift here');
  assert.ok(contrast(palette('clay').lift, DARK) >= 4.5, 'and its lift covers it');
});

test('the focus ring clears 3:1 against each of its three grounds', () => {
  // One ring colour cannot clear 3:1 against cream, near-black AND the accent
  // plane at once, which is why the ring takes its colour from the ground.
  for (const key of KEYS) {
    const p = palette(key);
    assert.ok(contrast(p.dim, CREAM) >= 3, `${p.name}: ring on cream`);
    assert.ok(contrast(p.acc, DARK) >= 3, `${p.name}: ring on dark`);
    assert.ok(contrast(p.onAcc, p.acc) >= 3, `${p.name}: ring on the accent plane`);
  }
});

test('contrast agrees with the values measured by hand during the audit', () => {
  assert.equal(contrast('#9A4E1E', CREAM), 5.59);
  assert.equal(contrast('#1C1208', '#D07C42'), 5.83);
  assert.equal(contrast('#D07C42', DARK), 5.83);
  assert.equal(contrast('#ffffff', '#000000'), 21);
});
