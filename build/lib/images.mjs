// One image renderer for all ten directions. Every <img> gets true intrinsic
// width/height from content/images.json, so nothing shifts while loading, and
// an unknown file throws at build time rather than 404ing in the browser.
import { readFileSync } from 'node:fs';

const SIZES = JSON.parse(readFileSync('content/images.json', 'utf8'));

// Photographs that must never ship. The last entry was stock with a visible
// third-party logo on it; the stock library is gone now, so the set is empty
// and the guard stands ready for the next one.
const FORBIDDEN = new Set();

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
 * @param opts { eager } for the LCP hero, { cls } for a class,
 *             { load:'eager' } for something above the fold that is NOT the
 *             LCP element — the masthead logo. It wants the early fetch but
 *             not fetchpriority="high", which would make it compete with the
 *             hero photograph for the same bandwidth.
 *             { decorative } for an image that carries no information: it
 *             takes an empty alt and is hidden from the accessibility tree.
 *             Without this the renderer had no way to express a decorative
 *             image at all, so three of them were hand-written instead —
 *             which is how the logos ended up hand-written too.
 */
export function img(c, file, alt, opts = {}) {
  if (FORBIDDEN.has(file)) throw new Error(`${file} must never be referenced`);
  if (opts.decorative) {
    if (alt) throw new Error(`decorative image ${file} must not carry alt text`);
  } else if (!alt || alt.length < 4) {
    throw new Error(`image ${file} needs real alt text`);
  }
  const [w, h] = size(file);
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  let load = ' loading="lazy" decoding="async"';
  if (opts.eager) load = ' loading="eager" fetchpriority="high" decoding="async"';
  else if (opts.load === 'eager') load = ' loading="eager" decoding="async"';
  const a = opts.decorative ? ' alt="" aria-hidden="true"' : ` alt="${esc(alt)}"`;
  return `<img${cls} src="${c.asset(file)}"${a} width="${w}" height="${h}"${load}>`;
}

/** <link rel="preload"> for a direction's LCP hero image. */
export function preloadImage(c, file) {
  return `<link rel="preload" as="image" href="${c.asset(file)}" fetchpriority="high">\n`;
}
