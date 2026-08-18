// Splice build/css/dNN.css onto the end of a direction's extracted stylesheet.
//   node build/apply-css.mjs d05
// Idempotent: everything from the MULTI-PAGE FURNITURE marker down is replaced,
// so this can be rerun after every edit instead of appending a second copy.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MARKER = '/* ================================================================\n   MULTI-PAGE FURNITURE';

export function applyCss(dNN) {
  const slug = readdirSync('.', { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(`${dNN}-`))
    .map((e) => e.name)[0];
  if (!slug) throw new Error(`no direction folder for ${dNN}`);

  const target = `${slug}/assets/styles.css`;
  const add = readFileSync(`build/css/${dNN}.css`, 'utf8');
  let base = readFileSync(target, 'utf8');

  const i = base.indexOf(MARKER);
  if (i >= 0) base = base.slice(0, i).replace(/\n+$/, '\n');
  writeFileSync(target, base + add);
  return { target, bytes: base.length + add.length };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const dNN = process.argv[2];
  if (!dNN) { console.error('usage: node build/apply-css.mjs d05'); process.exit(1); }
  const { target, bytes } = applyCss(dNN);
  console.log(`${target}: ${bytes} bytes`);
}
