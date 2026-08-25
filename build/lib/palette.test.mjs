// The accents had three sources of truth and the README warned that changing a
// colour meant editing two of them by hand. The chooser is a hand-written file
// rather than a generated one, so it cannot import the module — these tests are
// what keep it from drifting instead.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  PALETTES, KEYS, ORDER, CSS_PROP, AUTHORED_KEY, CHOSEN_KEY,
  palette, scriptMap, accentDeclarations, contrast,
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
  assert.ok(css.includes(`--acc-on-dark:${p.onDark}`));
});

// Two separate faults produced the same symptom — a colour that does not move
// when the accent does. Either the value was a leftover from a palette the
// project had already abandoned, or it was the right colour written out by
// hand, which is just as stuck. Both forms have to stay out.
const directionSheets = () => readdirSync('.')
  .filter((d) => /^d\d\d-/.test(d))
  .map((d) => [d, `${d}/assets/styles.css`])
  .filter(([, f]) => { try { readFileSync(f); return true; } catch { return false; } });

test('no accent value is written out by hand, in any direction', () => {
  const rgba = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
  const declared = new RegExp(`(${Object.values(CSS_PROP).join('|')}):`);
  for (const [name, file] of directionSheets()) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (declared.test(line)) return;
      for (const p of Object.values(PALETTES)) {
        for (const field of [...ORDER, 'lift']) {
          const v = p[field];
          if (v === '#ffffff') continue; // white is white, not clay's on-accent
          assert.ok(
            !line.toLowerCase().includes(v.toLowerCase()),
            `${name}:${i + 1} writes ${p.key}.${field} out by hand: ${line.trim().slice(0, 70)}`,
          );
          assert.ok(
            !line.replace(/\s+/g, '').includes(`(${rgba(v)},`),
            `${name}:${i + 1} writes ${p.key}.${field} as rgba: ${line.trim().slice(0, 70)}`,
          );
        }
      }
    });
  }
});

test('the abandoned safety palette stays abandoned', () => {
  // #FFC629 and #E0A800 are from the fully saturated pass the module's own
  // header says was dropped. They were still sitting in 02 next to a token
  // that had moved on, so the wash and the shape it lit were different colours.
  for (const [name, file] of directionSheets()) {
    const css = readFileSync(file, 'utf8');
    for (const old of ['#FFC629', '#E0A800', '#FF7A1C', '255,198,41', '224,168,0']) {
      assert.ok(!css.toLowerCase().includes(old.toLowerCase()),
        `${name} still carries ${old} from the abandoned palette`);
    }
  }
});

test('every direction stylesheet carries exactly one furniture block', () => {
  // apply-css.mjs matched its marker as a literal containing "\n". Three of
  // 06's blocks had been written with CRLF, so the marker never matched them
  // and every rerun appended another copy: 06 shipped four identical copies,
  // 53KB of dead CSS on each of its thirty-one pages.
  for (const [name, file] of directionSheets()) {
    const n = (readFileSync(file, 'utf8').match(/MULTI-PAGE FURNITURE/g) || []).length;
    assert.equal(n, 1, `${name} has ${n} furniture blocks`);
  }
});

test('every direction declares the on-dark accent it uses', () => {
  for (const [name, file] of directionSheets()) {
    const css = readFileSync(file, 'utf8');
    assert.match(css, /--acc-on-dark:#[0-9A-Fa-f]{6}/, `${name} declares no --acc-on-dark`);
  }
});

test('the script map carries every accent, and the lift only on request', () => {
  const lean = scriptMap();
  const lifted = scriptMap({ lift: true });
  for (const key of KEYS) {
    assert.ok(lean.includes(`${key}:[`), `${key} missing from the map`);
  }
  const n = ORDER.length;
  assert.equal((lean.match(/'#/g) || []).length, n * 3, `${n} values per accent`);
  assert.equal((lifted.match(/'#/g) || []).length, (n + 1) * 3, 'one more per accent when lifted');
  assert.ok(lifted.includes(palette('orange').lift));
  assert.ok(!lean.includes(palette('orange').lift));
});

test('every setter reads the map in the order the map is written', () => {
  // 06 set --acc-on-dark from p[3] while the map it was given held three
  // values, so the property was set to undefined and silently ignored: its
  // dark bands kept a clay-derived tint whichever accent you picked.
  const width = (src) => {
    const m = /var P=\{[^}]*?\[([^\]]*)\]/.exec(src);
    return m ? m[1].split(',').length : 0;
  };
  for (const f of readdirSync('build/directions').filter((x) => /^d\d\d\.mjs$/.test(x))) {
    const src = readFileSync(`build/directions/${f}`, 'utf8');
    const lifted = /scriptMap\(\{\s*lift:\s*true/.test(src);
    const n = ORDER.length + (lifted ? 1 : 0);
    for (const m of src.matchAll(/setProperty\('(--[a-z-]+)',p\[(\d)\]\)/g)) {
      const [, prop, idx] = m;
      assert.ok(Number(idx) < n, `${f} reads p[${idx}] from a map of ${n}`);
      const field = lifted && Number(idx) === ORDER.length ? 'lift' : ORDER[Number(idx)];
      assert.equal(prop, CSS_PROP[field], `${f} puts slot ${idx} in ${prop}`);
    }
  }
});

test('accentDeclarations produce the block a :root carries', () => {
  const block = accentDeclarations(CHOSEN_KEY);
  assert.match(block, /--acc:#D07C42;/);
  assert.match(block, /--on-acc:#1C1208;/);
  assert.match(block, /--acc-dim:#9A4E1E;/);
  assert.match(block, /--acc-on-dark:#D07C42;/);
  assert.ok(!block.includes('--acc-lift'));
  assert.match(accentDeclarations(CHOSEN_KEY, { lift: true }), /--acc-lift:#EFA372;/);
});

test('an unknown accent throws rather than silently rendering nothing', () => {
  assert.throws(() => palette('chartreuse'), /no such accent/);
});

// The contrast pairings were being checked by screenshotting a page and
// sampling pixels — which is how both contrast bugs found so far were caught.
// Every accent has to hold up on all the grounds it is used on.
const CREAM = '#FAF6EC';
const DARK = '#141413';
/** The lightest near-black band in the set — 08's panel ground. */
const DARKEST_GROUND = '#1D1D1B';

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

test('the on-dark value clears 4.5:1 on the lightest dark band in the set', () => {
  // Clay's accent is 3.51:1 on the near-black band and 3.21:1 on the lightest
  // of them — fine for a rule or a focus ring, short of the body-text bar.
  // Seven of the ten directions set small mono labels in the accent there, so
  // clay needed a lifted value rather than a note in a test.
  for (const key of KEYS) {
    const p = palette(key);
    for (const ground of [DARK, DARKEST_GROUND]) {
      const r = contrast(p.onDark, ground);
      assert.ok(r >= 4.5, `${p.name}: on-dark is only ${r}:1 against ${ground}`);
    }
  }
  assert.ok(contrast(palette('clay').acc, DARK) < 4.5, 'clay is why this value exists');
  assert.notEqual(palette('clay').onDark, palette('clay').acc);
});

test('the SHIPPED accent clears 4.5:1 on all three of its grounds', () => {
  const p = palette(CHOSEN_KEY);
  assert.ok(contrast(p.onAcc, p.acc) >= 4.5, 'text on the accent plane');
  assert.ok(contrast(p.dim, CREAM) >= 4.5, 'the dim tint on cream');
  assert.ok(contrast(p.acc, DARK) >= 4.5, 'the accent as text on the dark ground');
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
  assert.equal(contrast('#A8543A', DARK), 3.51);
  assert.equal(contrast('#ffffff', '#000000'), 21);
});
