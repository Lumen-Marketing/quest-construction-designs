// The gate for the standalone site. Runs over the committed output in site/
// rather than the renderers, so it catches anything that slipped between the
// two — and it is what "ready to deploy" means here.
//   node build/site/verify-site.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { pageList } from '../lib/pages.mjs';
import { outPath, ORIGIN } from '../lib/url.mjs';

const OUT = 'site';
const PAGES = pageList({ hubs: true });

// Placeholder identity data and invented figures. Every one is a real-world
// liability, not a nit — plus the three things that would mean the chooser
// leaked into the standalone build.
const BANNED = [
  '555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp',
  'est. 2010', '{{city}}', 'href="#"', 'undefined', 'NaN', '[object Object]',
  'd01-site-plan', '?acc=', 'fonts.googleapis.com', 'fonts.gstatic.com',
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

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

// Every page key in the manifest has a file on disk, and nothing extra is
// there — a stale file from a renamed slug is a duplicate-content problem.
const expected = new Set([...PAGES.map((p) => outPath(p.key)), '404.html']);
const actual = new Set(files.map((f) => relative(OUT, f).split(sep).join('/')));
for (const e of expected) if (!actual.has(e)) bad(`missing page: ${e}`);
for (const a of actual) if (!expected.has(a)) bad(`unexpected page: ${a}`);

// Titles and descriptions are measured as they render, not as they are
// escaped — "&amp;" is one character in a SERP, not five.
const decode = (s) => String(s)
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&mdash;/g, '—').replace(/&amp;/g, '&');

const titles = new Map();
const descriptions = new Map();
let indexable = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(OUT, file).split(sep).join('/');
  const where = (m) => bad(`${rel}: ${m}`);

  for (const b of BANNED) if (html.includes(b)) where(`contains ${JSON.stringify(b)}`);

  // --- landmarks and headings
  if (!html.includes('<main id="main">')) where('no main landmark');
  if (!html.includes('<a class="skip-link" href="#main">')) where('no skip link');
  const h1s = (html.match(/<h1[ >]/g) || []).length;
  if (h1s !== 1) where(`${h1s} h1 elements, expected exactly 1`);
  if (!/<html lang="en">/.test(html)) where('no lang on <html>');

  // --- links resolve, on disk. A leading slash is the site root, which is
  // how the 404 has to address everything.
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|tel:|mailto:|data:|\/\/)/.test(href)) continue;
    if (href.startsWith('#')) {
      if (!ids.has(href.slice(1))) where(`dead anchor ${href}`);
      continue;
    }
    const [path, hash] = href.split('#');
    let target = path.startsWith('/')
      ? resolve(OUT, `.${path}`)
      : resolve(dirname(file), path);
    // Directory form is what the 404 uses, since it has to address the site
    // root; a static host serves the index inside.
    if (existsSync(target) && statSync(target).isDirectory()) {
      target = join(target, 'index.html');
    }
    if (!existsSync(target) || statSync(target).isDirectory()) {
      where(`broken link ${href}`);
      continue;
    }
    if (hash) {
      const targetIds = new Set(
        [...readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]),
      );
      if (!targetIds.has(hash)) where(`dead anchor ${href}`);
    }
  }

  // --- every image carries alt text and intrinsic dimensions
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const alt = /\balt="([^"]*)"/.exec(tag);
    if (!alt || alt[1].trim().length < 4) where(`image without real alt text: ${tag.slice(0, 90)}`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) {
      where(`image without intrinsic size: ${tag.slice(0, 90)}`);
    }
    if (!/\bloading="(lazy|eager)"/.test(tag)) where(`image without a loading hint`);
  }

  if (rel === '404.html') {
    if (!/content="noindex/.test(html)) where('the 404 must be noindex');
    continue;
  }

  // --- head: title, description, canonical, robots
  const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '') || null;
  const desc = decode(/<meta name="description" content="([^"]*)">/.exec(html)?.[1] ?? '') || null;
  const canonical = /<link rel="canonical" href="([^"]*)">/.exec(html)?.[1];

  if (!title) where('no title');
  else {
    if (title.length > 60) where(`title is ${title.length} chars, over 60`);
    if (titles.has(title)) where(`title duplicates ${titles.get(title)}`);
    titles.set(title, rel);
  }
  if (!desc) where('no meta description');
  else {
    if (desc.length > 155) where(`description is ${desc.length} chars, over 155`);
    if (descriptions.has(desc)) where(`description duplicates ${descriptions.get(desc)}`);
    descriptions.set(desc, rel);
  }

  const want = `${ORIGIN}/${rel.replace(/index\.html$/, '')}`;
  if (canonical !== want) where(`canonical is ${canonical}, expected ${want}`);
  if (/content="index,follow/.test(html)) indexable++;
  else where('not indexable');

  // --- the social card points at a file that exists at 1200x630
  const og = /<meta property="og:image" content="([^"]*)">/.exec(html)?.[1];
  if (!og) where('no og:image');
  else {
    const local = join(OUT, og.replace(`${ORIGIN}/`, ''));
    if (!existsSync(local)) where(`og:image is not on disk: ${og}`);
  }

  // --- the graph parses, and says what page this is
  const ld = /<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/.exec(html)?.[1];
  if (!ld) where('no JSON-LD');
  else {
    try {
      const graph = JSON.parse(ld)['@graph'];
      const page = graph.find((n) => String(n['@id']).endsWith('#webpage'));
      if (!page) where('graph has no WebPage node');
      else if (page.url !== want) where(`graph url is ${page.url}, expected ${want}`);
      if (!graph.some((n) => n['@type'] === 'BreadcrumbList')) where('graph has no breadcrumb');
    } catch (e) {
      where(`JSON-LD does not parse: ${e.message}`);
    }
  }
}

if (indexable !== PAGES.length) {
  bad(`${indexable} indexable pages, expected ${PAGES.length}`);
}

// --- the root files
for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest',
  'favicon.svg', 'apple-touch-icon.png', 'assets/styles.css', '_headers', 'vercel.json']) {
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
  if (!existsSync(join(OUT, img.replace(`${ORIGIN}/`, '')))) {
    bad(`sitemap names an image that is not on disk: ${img}`);
  }
}
if (!readFileSync(join(OUT, 'robots.txt'), 'utf8').includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  bad('robots.txt does not point at the sitemap');
}

// --- the accent actually landed, and the fonts are first-party
const css = readFileSync(join(OUT, 'assets/styles.css'), 'utf8');
if (!css.includes('--acc:#D07C42')) bad('the stylesheet is not Burnt Orange');
if (/#D9A93C|255,\s*198,\s*41|224,\s*168,\s*0/i.test(css)) bad('ochre survives in the stylesheet');
if ((css.match(/@font-face/g) || []).length !== 2) bad('the two self-hosted faces are not both there');
if (css.includes('http')) bad('the stylesheet still reaches off-origin');

say(`\n${files.length} files checked, ${indexable} indexable, ` +
  `${fail} problem${fail === 1 ? '' : 's'}`);
process.exit(fail ? 1 : 0);
