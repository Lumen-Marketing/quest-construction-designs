// The gate before this is called done. Runs over the committed output rather
// than the renderers, so it catches anything that slipped between the two.
//   node build/verify.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkDir } from './check-links.mjs';

const SLUGS = readdirSync('.', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^d\d\d-/.test(e.name)).map((e) => e.name).sort();

// Anything here means placeholder identity data or an invented figure reached a
// committed page. Every one is a real-world liability, not a nit.
const BANNED = ['555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp',
  'est. 2010', '{{city}}', 'href="#"', 'undefined', 'NaN', '[object Object]'];

function walk(d, o = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, o); else if (e.name.endsWith('.html')) o.push(p);
  }
  return o;
}

let fail = 0;
let pages = 0;
let indexable = 0;
const say = (m) => console.log(m);

say(`directions: ${SLUGS.length}`);
if (SLUGS.length !== 10) { say('  EXPECTED 10 DIRECTIONS'); fail++; }

for (const slug of SLUGS) {
  const { checked, broken, anchors } = checkDir(slug);
  pages += checked;
  if (checked !== 31) { say(`${slug}: ${checked} pages, expected 31`); fail++; }
  if (broken.length || anchors.length) {
    say(`${slug}: ${broken.length} broken links, ${anchors.length} dead anchors`);
    for (const b of [...broken, ...anchors].slice(0, 10)) say(`   ${b.file} -> ${b.href}`);
    fail++;
  }

  for (const f of walk(slug)) {
    const html = readFileSync(f, 'utf8');
    for (const b of BANNED) {
      if (html.includes(b)) { say(`${f}: contains ${JSON.stringify(b)}`); fail++; }
    }
    if (/content="index,follow/.test(html)) indexable++;
    if (!/<main id="main" tabindex="-1">/.test(html)) { say(`${f}: no main landmark`); fail++; }
    if ((html.match(/<h1[ >]/g) || []).length !== 1) { say(`${f}: not exactly one h1`); fail++; }
  }
}

if (indexable !== 31) { say(`indexable pages: ${indexable}, expected 31`); fail++; }

const sitemap = readFileSync('sitemap.xml', 'utf8');
const locs = (sitemap.match(/<url>/g) || []).length;
if (locs !== 31) { say(`sitemap lists ${locs} urls, expected 31`); fail++; }
for (const s of SLUGS.slice(1)) {
  if (sitemap.includes(s)) { say(`sitemap must not list the noindex direction ${s}`); fail++; }
}

const chooser = readFileSync('index.html', 'utf8');
for (const s of SLUGS) {
  if (!chooser.includes(`${s}/index.html`)) { say(`chooser missing ${s}`); fail++; }
}

say(`\n${pages} pages checked, ${indexable} indexable, ${fail} problem${fail === 1 ? '' : 's'}`);
process.exit(fail ? 1 : 0);
