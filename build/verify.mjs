// The gate before the ten demo directions are called done. Runs over the
// committed output rather than the renderers, so it catches anything that
// slipped between the two.
//   node build/verify.mjs
//
// It owns no rules. Everything it asserts about a page comes from
// lib/page-rules.mjs, which is also what the standalone gate and the test
// suites use — so a rule is written once and enforced everywhere.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { checkDir, walk } from './check-links.mjs';
import { documentFindings, isIndexable } from './lib/page-rules.mjs';
import { pageCount } from './lib/pages.mjs';

// Derived, never typed. This was a hardcoded 31 and went stale the moment the
// area list grew from eleven cities to thirty-four — the gate then failed on
// every direction for a page count that was correct.
const BUILT_PAGES = pageCount();
const EXPECTED_DIRECTIONS = 10;

const folders = readdirSync('.', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^d\d\d-/.test(e.name)).map((e) => e.name).sort();

// A direction can exist as a scaffold before it has been generated. Those are
// reported, not failed — an unbuilt direction is work in progress, and a gate
// that cannot run is worse than one that is merely strict.
const built = folders.filter((f) => existsSync(join(f, 'index.html')));
const scaffolds = folders.filter((f) => !built.includes(f));

let fail = 0;
let pages = 0;
let indexable = 0;
const say = (m) => console.log(m);
const bad = (m) => { say(`  FAIL ${m}`); fail++; };

say(`built directions: ${built.length}${scaffolds.length ? `  (scaffolded, not built: ${scaffolds.join(', ')})` : ''}`);
if (built.length !== EXPECTED_DIRECTIONS) {
  bad(`${built.length} built directions, expected ${EXPECTED_DIRECTIONS}`);
}

for (const slug of built) {
  const { checked, broken, anchors } = checkDir(slug);
  pages += checked;
  if (checked !== BUILT_PAGES) bad(`${slug}: ${checked} pages, expected ${BUILT_PAGES}`);
  for (const b of [...broken, ...anchors].slice(0, 10)) bad(`${b.file} -> ${b.href}`);

  for (const f of walk(slug)) {
    const html = readFileSync(f, 'utf8');
    const rel = relative('.', f).split(sep).join('/');
    for (const finding of documentFindings(html)) bad(`${rel}: ${finding.message}`);
    if (isIndexable(html)) indexable++;
  }
}

if (indexable !== BUILT_PAGES) {
  bad(`indexable pages: ${indexable}, expected ${BUILT_PAGES}`);
}

const sitemap = readFileSync('sitemap.xml', 'utf8');
const locs = (sitemap.match(/<url>/g) || []).length;
if (locs !== BUILT_PAGES) bad(`sitemap lists ${locs} urls, expected ${BUILT_PAGES}`);
for (const s of built.slice(1)) {
  if (sitemap.includes(s)) bad(`sitemap must not list the noindex direction ${s}`);
}

const chooser = readFileSync('index.html', 'utf8');
for (const s of built) {
  if (!chooser.includes(`${s}/index.html`)) bad(`chooser missing ${s}`);
}

say(`\n${pages} pages checked, ${indexable} indexable, ${fail} problem${fail === 1 ? '' : 's'}`);
process.exit(fail ? 1 : 0);
