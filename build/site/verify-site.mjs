// The gate for the standalone site. Runs over the committed output in site/
// rather than the renderers, so it catches anything that slipped between the
// two — and it is what "ready to deploy" means here.
//   node build/site/verify-site.mjs
//
// Like the demo gate, it owns no page rules: everything it asserts about a
// single page comes from lib/page-rules.mjs. What lives here is what can only
// be judged across the whole site — uniqueness, the sitemap, the stylesheet.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { walk } from '../check-links.mjs';
import { pageList } from '../lib/pages.mjs';
import { outPath, ORIGIN } from '../lib/url.mjs';
import { siteProfile } from '../lib/profile.mjs';
import {
  allFindings, siteTarget, title, description, isIndexable,
} from '../lib/page-rules.mjs';

const OUT = 'site';
const PAGES = pageList({ hubs: true, cityServices: true, blog: true });

// The four things that would mean the chooser leaked into the standalone build.
// The placeholder-identity list is not repeated here — it lives in page-rules.
const CHOOSER_LEAKS = ['d01-site-plan', '?acc=', 'fonts.googleapis.com', 'fonts.gstatic.com'];

let fail = 0;
const say = (m) => console.log(m);
const bad = (m) => { say(`  FAIL ${m}`); fail++; };

if (!existsSync(OUT)) {
  say(`${OUT}/ does not exist — run node build/site/build-site.mjs`);
  process.exit(1);
}

const files = walk(OUT).sort();
say(`${OUT}/: ${files.length} html files`);
if (files.length !== PAGES.length + 1) {
  bad(`${files.length} html files, expected ${PAGES.length} pages + the 404`);
}

// Every page key has a file, and nothing extra is there — a stale file from a
// renamed slug is a duplicate-content problem.
const expected = new Set([...PAGES.map((p) => outPath(p.key)), '404.html']);
const actual = new Set(files.map((f) => relative(OUT, f).split(sep).join('/')));
for (const e of expected) if (!actual.has(e)) bad(`missing page: ${e}`);
for (const a of actual) if (!expected.has(a)) bad(`unexpected page: ${a}`);

const resolve = siteTarget(OUT);
const assetOnDisk = (url) => existsSync(join(OUT, url.replace(`${ORIGIN}/`, '')));

const titles = new Map();
const descriptions = new Map();
let indexable = 0;

// The stylesheet's name carries a hash of its contents, so ask rather than
// assume. The name is the cache key the host is told to hold `immutable` for a
// year, so two things have to be true of every build and neither is obvious
// from reading a page: that the file shipped under the name the pages point
// at, and that no stylesheet from an earlier build is still lying in assets/
// for a stale page to reach.
const STYLESHEET = siteProfile.stylesheet();

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(OUT, file).split(sep).join('/');
  const where = (m) => bad(`${rel}: ${m}`);

  const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  if (sheets.length !== 1) where(`links ${sheets.length} stylesheets, expected 1`);
  for (const href of sheets) {
    if (!href.endsWith(STYLESHEET)) where(`links ${href}, but the build shipped ${STYLESHEET}`);
  }

  for (const leak of CHOOSER_LEAKS) {
    if (html.includes(leak)) where(`contains ${JSON.stringify(leak)}`);
  }

  // The 404 is deliberately noindex and carries no canonical, so it is judged
  // on the structural rules and its links, not on the head or the graph.
  const isFourOhFour = rel === '404.html';
  const url = isFourOhFour ? null : `${ORIGIN}/${rel.replace(/index\.html$/, '')}`;
  for (const f of allFindings(html, { file, resolve, url, assetOnDisk })) where(f.message);

  if (isFourOhFour) {
    if (!/content="noindex/.test(html)) where('the 404 must be noindex');
    continue;
  }

  if (isIndexable(html)) indexable++;

  const t = title(html);
  const d = description(html);
  if (t) {
    if (titles.has(t)) where(`title duplicates ${titles.get(t)}`);
    titles.set(t, rel);
  }
  if (d) {
    if (descriptions.has(d)) where(`description duplicates ${descriptions.get(d)}`);
    descriptions.set(d, rel);
  }
}

if (indexable !== PAGES.length) {
  bad(`${indexable} indexable pages, expected ${PAGES.length}`);
}

// --- the root files
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest',
  'favicon.svg', 'apple-touch-icon.png', STYLESHEET, '_headers', 'vercel.json']) {
  if (!existsSync(join(OUT, f))) bad(`missing root file: ${f}`);
}

const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length !== PAGES.length) {
  bad(`sitemap lists ${locs.length} urls, expected ${PAGES.length}`);
}
for (const p of PAGES) {
  const url = `${ORIGIN}/${outPath(p.key).replace(/index\.html$/, '')}`;
  if (!locs.includes(url)) bad(`sitemap is missing ${url}`);
}
for (const img of [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1])) {
  if (!assetOnDisk(img)) bad(`sitemap names an image that is not on disk: ${img}`);
}
if (!readFileSync(join(OUT, 'robots.txt'), 'utf8').includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  bad('robots.txt does not point at the sitemap');
}

// --- the accent actually landed, and the fonts are first-party
const stale = readdirSync(join(OUT, 'assets'))
  .filter((f) => f.endsWith('.css') && f !== STYLESHEET.replace('assets/', ''));
if (stale.length) bad(`stylesheets from an earlier build are still in assets/: ${stale}`);

const css = readFileSync(join(OUT, STYLESHEET), 'utf8');
if (!css.includes('--acc:#D07C42')) bad('the stylesheet is not Burnt Orange');
if (/#D9A93C|255,\s*198,\s*41|224,\s*168,\s*0/i.test(css)) bad('ochre survives in the stylesheet');
if ((css.match(/@font-face/g) || []).length !== 2) bad('the two self-hosted faces are not both there');
if (css.includes('http')) bad('the stylesheet still reaches off-origin');

say(`\n${files.length} files checked, ${indexable} indexable, ` +
  `${fail} problem${fail === 1 ? '' : 's'}`);
process.exit(fail ? 1 : 0);
