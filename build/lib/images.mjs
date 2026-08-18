// One image renderer for all ten directions. Every <img> gets true intrinsic
// width/height from content/images.json, so nothing shifts while loading, and
// an unknown file throws at build time rather than 404ing in the browser.
import { readFileSync } from 'node:fs';

const SIZES = JSON.parse(readFileSync('content/images.json', 'utf8'));

// Carries a visible third-party logo on the subject's clothing. Unreferenced,
// and it must stay that way.
const FORBIDDEN = new Set(['plans.webp']);

export function size(file) {
  const s = SIZES[file];
  if (!s) throw new Error(`unknown image: ${file} (run node build/measure-images.mjs)`);
  return s;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * @param c    the render context (for c.asset)
 * @param file path under assets/, e.g. 'quest/hero.webp'
 * @param alt  alt text — required, and must be meaningful
 * @param opts { eager } for the LCP hero, { cls } for a class, { sizeAttr:false }
 */
export function img(c, file, alt, opts = {}) {
  if (FORBIDDEN.has(file)) throw new Error(`${file} must never be referenced`);
  if (!alt || alt.length < 4) throw new Error(`image ${file} needs real alt text`);
  const [w, h] = size(file);
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  const load = opts.eager
    ? ' loading="eager" fetchpriority="high" decoding="async"'
    : ' loading="lazy" decoding="async"';
  return `<img${cls} src="${c.asset(file)}" alt="${esc(alt)}" width="${w}" height="${h}"${load}>`;
}

/** <link rel="preload"> for a direction's LCP hero image. */
export function preloadImage(c, file) {
  return `<link rel="preload" as="image" href="${c.asset(file)}" fetchpriority="high">\n`;
}
