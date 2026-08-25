// What makes a generated page valid.
//
// This used to live in seven places at once — two verifiers, a link checker
// and four test files — each with its own copy of the banned-strings list and
// its own literal of the <main> tag. Adding one attribute to that tag meant
// seven edits for one decision, so the rules moved here and the callers became
// thin: the verifiers print findings and exit non-zero, the tests assert the
// list is empty.
//
// The markup constants below are the same ones build.mjs emits, so a check can
// never drift from what is written.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';

/** The exact landmark markup every page carries. Emitted AND checked from here. */
export const MAIN_TAG = '<main id="main" tabindex="-1">';
export const SKIP_LINK = '<a class="skip-link" href="#main">Skip to content</a>';
export const HTML_TAG = '<html lang="en">';

// Placeholder identity data and invented figures. Every one of these reaching a
// committed page is a real-world liability, not a nit.
export const BANNED = [
  '555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp',
  'est. 2010', '{{city}}', 'href="#"', 'undefined', 'NaN', '[object Object]',
];

// Titles and descriptions are measured as they RENDER, not as they are escaped:
// "&amp;" is one character in a search result, not five.
const ENTITIES = [
  [/&quot;/g, '"'], [/&#39;/g, "'"], [/&lt;/g, '<'], [/&gt;/g, '>'],
  [/&mdash;/g, '—'], [/&ndash;/g, '–'], [/&middot;/g, '·'],
  [/&nbsp;/g, ' '], [/&amp;/g, '&'],
];
export const decode = (s) => ENTITIES.reduce((acc, [re, ch]) => acc.replace(re, ch), String(s));

const one = (re, html) => re.exec(html)?.[1];

export const title = (html) => {
  const t = one(/<title>([^<]*)<\/title>/, html);
  return t == null ? null : decode(t);
};
export const description = (html) => {
  const d = one(/<meta name="description" content="([^"]*)">/, html);
  return d == null ? null : decode(d);
};
export const canonical = (html) => one(/<link rel="canonical" href="([^"]*)">/, html) ?? null;
export const ogImage = (html) => one(/<meta property="og:image" content="([^"]*)">/, html) ?? null;
export const isIndexable = (html) => /content="index,follow/.test(html);

const finding = (rule, message) => ({ rule, message });

// ---------------------------------------------------------------- document

/**
 * Structural rules every generated page must satisfy, whichever build made it
 * and whether or not it is meant to be indexed.
 */
export function documentFindings(html) {
  const out = [];

  for (const b of BANNED) {
    if (html.includes(b)) out.push(finding('banned', `contains ${JSON.stringify(b)}`));
  }
  if (!html.includes(MAIN_TAG)) out.push(finding('landmark', 'no main landmark'));
  if (!html.includes(SKIP_LINK)) out.push(finding('skip-link', 'no skip link'));
  if (!html.includes(HTML_TAG)) out.push(finding('lang', 'no lang on <html>'));

  const h1s = (html.match(/<h1[ >]/g) || []).length;
  if (h1s !== 1) out.push(finding('one-h1', `${h1s} h1 elements, expected exactly 1`));

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const where = tag.slice(0, 88);
    // alt="" is how a decorative image is correctly marked, and two directions
    // use it that way. A MISSING alt, or one too short to say anything, is not.
    const alt = /\balt="([^"]*)"/.exec(tag);
    if (!alt) out.push(finding('img-alt', `image with no alt attribute: ${where}`));
    else if (alt[1].length > 0 && alt[1].trim().length < 4) {
      out.push(finding('img-alt', `image without real alt text: ${where}`));
    }
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) {
      out.push(finding('img-size', `image without intrinsic size: ${where}`));
    }
    if (!/\bloading="(lazy|eager)"/.test(tag)) {
      out.push(finding('img-loading', `image without a loading hint: ${where}`));
    }
  }
  return out;
}

// -------------------------------------------------------------------- links

/**
 * At three directory depths across hundreds of pages, a wrong relative path is
 * the defect class most likely to ship unnoticed.
 *
 * @param resolve  the adapter: (path, fromFile) -> an existing file path, or
 *                 null when nothing is there. The two builds differ only here —
 *                 a direction folder resolves relatively, the standalone site
 *                 also understands a leading slash and directory form.
 */
export function linkFindings(html, { file, resolve }) {
  const out = [];
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|tel:|mailto:|data:|\/\/)/.test(href)) continue;

    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (!id || !ids.has(id)) out.push(finding('anchor', `dead anchor ${href}`));
      continue;
    }

    const [path, hash] = href.split('#');
    const target = resolve(path, file);
    if (!target) { out.push(finding('link', `broken link ${href}`)); continue; }
    if (hash) {
      const targetIds = new Set(
        [...readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]),
      );
      if (!targetIds.has(hash)) out.push(finding('anchor', `dead anchor ${href}`));
    }
  }
  return out;
}

// The two link-resolution adapters. They sit together because the difference
// between them IS the difference between the two builds, and one adapter is a
// hypothetical seam where two is a real one.

/** A direction folder: every link resolves relative to the file it appears in. */
export const relativeTarget = (path, fromFile) => {
  const t = resolvePath(dirname(fromFile), path);
  return existsSync(t) && !statSync(t).isDirectory() ? t : null;
};

/**
 * The standalone site: a leading slash means the site root, and directory form
 * serves the index inside it — which is how the 404 has to address everything,
 * since it is served in place of whatever URL was requested.
 */
export const siteTarget = (root) => (path, fromFile) => {
  let t = path.startsWith('/')
    ? resolvePath(root, `.${path}`)
    : resolvePath(dirname(fromFile), path);
  if (existsSync(t) && statSync(t).isDirectory()) t = join(t, 'index.html');
  return existsSync(t) && !statSync(t).isDirectory() ? t : null;
};

// --------------------------------------------------------------------- head

/**
 * Rules that only mean something for a page meant to be found. The demo
 * directions are noindex, so only the standalone build runs these.
 *
 * @param url       the page's own absolute URL — canonical must equal it
 * @param assetOnDisk  (absoluteUrl) -> boolean, for the social card
 */
export function headFindings(html, { url, assetOnDisk }) {
  const out = [];
  const t = title(html);
  const d = description(html);
  const c = canonical(html);

  if (!t) out.push(finding('title', 'no title'));
  else if (t.length > 60) out.push(finding('title', `title is ${t.length} chars, over 60`));

  if (!d) out.push(finding('description', 'no meta description'));
  else if (d.length > 155) {
    out.push(finding('description', `description is ${d.length} chars, over 155`));
  }

  if (c !== url) out.push(finding('canonical', `canonical is ${c}, expected ${url}`));
  if (!isIndexable(html)) out.push(finding('robots', 'not indexable'));

  const og = ogImage(html);
  if (!og) out.push(finding('og', 'no og:image'));
  else if (assetOnDisk && !assetOnDisk(og)) {
    out.push(finding('og', `og:image is not on disk: ${og}`));
  }
  return out;
}

// -------------------------------------------------------------------- graph

/** The structured data parses, and says which page it is describing. */
export function graphFindings(html, { url }) {
  const out = [];
  const raw = one(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/, html);
  if (!raw) return [finding('graph', 'no JSON-LD')];

  let graph;
  try {
    graph = JSON.parse(raw)['@graph'];
  } catch (e) {
    return [finding('graph', `JSON-LD does not parse: ${e.message}`)];
  }
  if (!Array.isArray(graph)) return [finding('graph', 'JSON-LD carries no @graph array')];

  const page = graph.find((n) => String(n['@id']).endsWith('#webpage'));
  if (!page) out.push(finding('graph', 'graph has no WebPage node'));
  else if (page.url !== url) {
    out.push(finding('graph', `graph url is ${page.url}, expected ${url}`));
  }
  if (!graph.some((n) => n['@type'] === 'BreadcrumbList')) {
    out.push(finding('graph', 'graph has no breadcrumb'));
  }
  return out;
}

/** Everything a single page can be judged on, for callers that want the lot. */
export function allFindings(html, { file, resolve, url, assetOnDisk }) {
  return [
    ...documentFindings(html),
    ...(resolve ? linkFindings(html, { file, resolve }) : []),
    ...(url ? headFindings(html, { url, assetOnDisk }) : []),
    ...(url ? graphFindings(html, { url }) : []),
  ];
}
