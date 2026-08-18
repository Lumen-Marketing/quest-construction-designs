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

export const PAGE_KEYS = [
  ...Object.keys(FIXED),
  ...services.map((s) => `services/${s.slug}`),
  ...areas.map((a) => `service-areas/${a.slug}`),
];

const KEYS = new Set(PAGE_KEYS);

const dirFor = (key) => {
  if (!KEYS.has(key)) throw new Error(`unknown page key: ${key}`);
  return key in FIXED ? FIXED[key] : key;
};

/** Page key -> file path relative to the direction folder. */
export function outPath(key) {
  const dir = dirFor(key);
  return dir ? `${dir}/index.html` : 'index.html';
}

/** Page key -> directory form, for canonical URLs. */
function dirForm(key) {
  const dir = dirFor(key);
  return dir ? `${dir}/` : '';
}

export function resolver(dirSlug, pageKey) {
  const depth = outPath(pageKey).split('/').length - 1;
  const up = depth === 0 ? '' : '../'.repeat(depth);

  return {
    depth,
    /** Link to another page in this same direction. */
    url(key) { return up + outPath(key); },
    /** A file inside this direction folder, e.g. assets/styles.css. */
    local(path) { return up + path; },
    /** A shared photo at repo-root assets/, one level above the direction folder. */
    asset(path) { return '../'.repeat(depth + 1) + 'assets/' + path; },
    /** A repo-root file sitting beside the direction folders, e.g. favicon.svg. */
    root(path) { return '../'.repeat(depth + 1) + path; },
    /** Absolute URL of a page, for canonical / OG / schema @id. */
    abs(key = pageKey) { return `${ORIGIN}/${dirSlug}/${dirForm(key)}`; },
    get canonical() { return `${ORIGIN}/${dirSlug}/${dirForm(pageKey)}`; },
    /** Absolute URL of a shared asset, for OG images and schema. */
    absAsset(path) { return `${ORIGIN}/assets/${path}`; },
  };
}
