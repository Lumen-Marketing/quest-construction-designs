// Splice build/css/dNN.css onto the end of a direction's extracted stylesheet.
//   node build/apply-css.mjs d05
// Idempotent: everything from the FIRST MULTI-PAGE FURNITURE marker down is
// replaced, so this can be rerun after every edit instead of appending a
// second copy.
//
// It was not idempotent, and 06 wore the result: its stylesheet carried FOUR
// byte-identical copies of the furniture block, 52KB of dead CSS on each of
// its thirty-one pages. Two separate faults, both of which this file now
// guards against, and which applyCss reports so a regression is visible:
//
//   The marker was matched as a literal containing "\n". Three of 06's copies
//   had been written with CRLF, so the marker never matched them and every
//   rerun appended a fresh copy instead of replacing one. The marker is a
//   newline-agnostic regex now.
//
//   The cut was made at the LAST match rather than the first, so once a
//   duplicate existed nothing could ever remove it. It cuts at the first.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The furniture block's opening comment, tolerant of either line ending. */
export const MARKER = /\/\* =+\r?\n +MULTI-PAGE FURNITURE/;

export function applyCss(dNN) {
  const slug = readdirSync('.', { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(`${dNN}-`))
    .map((e) => e.name)[0];
  if (!slug) throw new Error(`no direction folder for ${dNN}`);

  const target = `${slug}/assets/styles.css`;
  const add = readFileSync(`build/css/${dNN}.css`, 'utf8');
  let base = readFileSync(target, 'utf8');

  const before = countMarkers(base);
  const m = MARKER.exec(base);
  if (m) base = base.slice(0, m.index).replace(/\n+$/, '\n');
  const out = base + add;
  writeFileSync(target, out);
  return { target, bytes: out.length, replaced: before, markers: countMarkers(out) };
}

/** How many furniture blocks a stylesheet carries. Anything but 1 is a bug. */
export function countMarkers(css) {
  return (css.match(/MULTI-PAGE FURNITURE/g) || []).length;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const dNN = process.argv[2];
  if (!dNN) { console.error('usage: node build/apply-css.mjs d05'); process.exit(1); }
  const { target, bytes, replaced, markers } = applyCss(dNN);
  console.log(`${target}: ${bytes} bytes (replaced ${replaced}, now ${markers})`);
  if (markers !== 1) { console.error(`expected one furniture block, found ${markers}`); process.exit(1); }
}
