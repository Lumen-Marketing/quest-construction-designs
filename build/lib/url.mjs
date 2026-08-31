// Every internal link in every generated page goes through here. Nothing
// hand-writes a relative path: at three directory depths across 310 pages,
// hand-written paths are the defect class that would actually bite.
import { readFileSync } from 'node:fs';

export const ORIGIN = 'https://questconstruction.com';

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;

const FIXED = {
  home: '', about: 'about-us', gallery: 'gallery',
  projects: 'projects', contact: 'contact-us', sitemap: 'sitemap',
};

// Section landing pages. The ten demo directions do not carry them — they
// would break the thirty-one page contract every direction is held to — so
// they live outside PAGE_KEYS and only the standalone build asks for them.
export const HUB_KEYS = ['services', 'service-areas'];

// Trade-by-city landing pages, /services/<trade>/<city>/. Standalone only, for
// the same reason as the hubs, and driven off content/service-areas.json so a
// key exists exactly where authored copy does.
const cross = JSON.parse(readFileSync('content/service-areas.json', 'utf8'));
export const CITY_SERVICE_KEYS = Object.entries(cross)
  .filter(([trade]) => trade !== '_README')
  .flatMap(([trade, byCity]) => Object.keys(byCity).map((city) => `services/${trade}/${city}`));

// The blog: an index at /blog/ and one page per post. Standalone only, like
// the hubs and the trade-by-city pages — a demo direction has no posts and
// the fifty-four page contract has no room for them. Driven off
// content/posts.json so a key exists exactly where a post does.
const posts = JSON.parse(readFileSync('content/posts.json', 'utf8')).posts;
export const BLOG_KEYS = ['blog', ...posts.map((b) => `blog/${b.slug}`)];

export const PAGE_KEYS = [
  ...Object.keys(FIXED),
  ...services.map((s) => `services/${s.slug}`),
  ...areas.map((a) => `service-areas/${a.slug}`),
];

const KEYS = new Set([...PAGE_KEYS, ...HUB_KEYS, ...CITY_SERVICE_KEYS, ...BLOG_KEYS]);

const dirFor = (key) => {
  if (!KEYS.has(key)) throw new Error(`unknown page key: ${key}`);
  return key in FIXED ? FIXED[key] : key;
};

/** Page key -> file path relative to the site root. */
export function outPath(key) {
  const dir = dirFor(key);
  return dir ? `${dir}/index.html` : 'index.html';
}

/** Page key -> directory form, for canonical URLs. */
function dirForm(key) {
  const dir = dirFor(key);
  return dir ? `${dir}/` : '';
}

/**
 * @param dirSlug  the direction folder, or '' for the standalone site at the
 *                 origin root — which also moves assets/ inside the tree.
 * @param opts     { hubs } — whether the section landing pages exist. When
 *                 they do not, anything pointing at one falls back to the
 *                 sitemap page, which lists the same links.
 */
export function resolver(dirSlug, pageKey, opts = {}) {
  const standalone = dirSlug === '';
  const depth = outPath(pageKey).split('/').length - 1;
  const up = depth === 0 ? '' : '../'.repeat(depth);
  // In a direction folder the shared assets sit one level further up; in the
  // standalone tree they sit inside it.
  const outward = standalone ? up : '../'.repeat(depth + 1);
  const base = standalone ? `${ORIGIN}/` : `${ORIGIN}/${dirSlug}/`;

  const url = (key) => up + outPath(key);
  const abs = (key = pageKey) => base + dirForm(key);
  const hubKey = (key) => (opts.hubs ? key : 'sitemap');

  return {
    depth,
    /** Link to another page in this same site. */
    url,
    /** Link to a section landing page, or the sitemap where none exists. */
    hubKey,
    hub: (key) => url(hubKey(key)),
    absHub: (key) => abs(hubKey(key)),
    /** A file inside this site folder, e.g. assets/styles.css. */
    local(path) { return up + path; },
    /** A shared photo under assets/. */
    asset(path) { return `${outward}assets/${path}`; },
    /** A file sitting at the site root, e.g. favicon.svg. */
    root(path) { return outward + path; },
    /** Absolute URL of a page, for canonical / OG / schema @id. */
    abs,
    get canonical() { return abs(pageKey); },
    /** Absolute URL of a shared asset, for OG images and schema. */
    absAsset(path) { return `${ORIGIN}/assets/${path}`; },
  };
}

/**
 * Root-absolute paths, for a document that can be served from any depth —
 * the 404, which the host returns in place of whatever URL was requested.
 * Relative asset paths on that page resolve against the missing URL.
 */
export function absoluteResolver(opts = {}) {
  const hubKey = (key) => (opts.hubs ? key : 'sitemap');
  const url = (key) => `/${dirForm(key)}`;
  return {
    depth: 0,
    url,
    hubKey,
    hub: (key) => url(hubKey(key)),
    absHub: (key) => ORIGIN + url(hubKey(key)),
    local(path) { return `/${path}`; },
    asset(path) { return `/assets/${path}`; },
    root(path) { return `/${path}`; },
    abs(key = 'home') { return ORIGIN + url(key); },
    get canonical() { return `${ORIGIN}/`; },
    absAsset(path) { return `${ORIGIN}/assets/${path}`; },
  };
}
