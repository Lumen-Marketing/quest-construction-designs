// The standalone site's stylesheet, and the name it ships under.
//
// This used to live in build/site/build-site.mjs. It moved here so the profile
// can ask for the name — which is a fingerprint of the contents, and so cannot
// be known without building them.
//
// Why the name has a hash in it: `vercel.json` and `_headers` both give
// /assets/* `max-age=31536000, immutable`, which tells a browser never to
// revalidate — not on a reload. That promise is only true of a file whose name
// changes when its contents do. The stylesheet shipped as `assets/styles.css`
// for every build, so a returning visitor kept the stylesheet they first
// downloaded, for a year: a CSS fix reached new visitors and nobody else. The
// photographs and the two font files really are immutable under their names
// and keep the long cache honestly; only this file is regenerated.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  palette, AUTHORED_KEY, CHOSEN_KEY, ORDER, CSS_PROP,
} from './palette.mjs';

// ------------------------------------------------------------------ stylesheet
// Direction 01's stylesheet is the source of truth for the design. Two things
// happen on the way through: the accent tokens become the chosen palette, and
// the additions in build/css/site.css are spliced on. Every substitution is
// asserted, so a rename upstream fails the build instead of silently shipping
// the old colour.
//
// This used to be literal string replacement — three exact-match swaps plus a
// regex for eight hardcoded washes that were never tokenised. The washes are
// color-mix on the token now, so the only accent values left in the stylesheet
// are the declarations themselves, and the swap walks the palette's own list
// rather than a second copy of it.
function swapAccent(css, from, to) {
  let out = css;
  for (const field of ORDER) {
    const prop = CSS_PROP[field];
    const re = new RegExp(`(${prop}:)#[0-9A-Fa-f]{3,8}`, 'g');
    if (!re.test(out)) throw new Error(`the stylesheet has no ${prop} to swap`);
    out = out.replace(re, `$1${palette(to)[field]}`);
  }
  // The authored comment says the accent is swapped live by the gallery. That
  // is true of a direction and false here: the standalone bakes one in.
  out = out.replace(
    /(--acc:#[0-9A-Fa-f]{3,8};\s*)\/\* swapped live by the gallery \*\//,
    `$1/* ${palette(to).name} — the chosen accent, baked in */`,
  );
  if (out.includes(palette(from).acc)) {
    throw new Error(`${palette(from).name} survived the accent swap`);
  }
  return out;
}

const FACE_MARKER = '/* ---------- city cards';

function splitOnMarker(text, marker) {
  const i = text.indexOf(marker);
  if (i < 0) throw new Error(`marker not found in build/css/site.css: ${marker}`);
  return [text.slice(0, i), text.slice(i)];
}

export function buildCss() {
  const css = swapAccent(
    readFileSync('d01-site-plan/assets/styles.css', 'utf8'), AUTHORED_KEY, CHOSEN_KEY,
  );
  // The @font-face rules have to precede any rule that uses the family.
  const [faces, rest] = splitOnMarker(readFileSync('build/css/site.css', 'utf8'), FACE_MARKER);
  return `${faces}
${css}
${rest}`;
}

/** Ten hex characters of the contents — enough that a collision is not a risk. */
export const fingerprint = (css) => createHash('sha256').update(css).digest('hex').slice(0, 10);

// Every page in a build asks for this, and the answer cannot change within one:
// build it once rather than hashing 52KB thirty-four times.
let cached = null;

/**
 * What the stylesheet is called in this build, e.g. `styles.4a1c9e0b72.css`.
 * Relative to the site's `assets/` folder, which is also where the two font
 * files sit — the @font-face `url()`s are relative to the stylesheet, so the
 * name may change but the folder may not.
 */
export function stylesheetName() {
  if (!cached) cached = `styles.${fingerprint(buildCss())}.css`;
  return cached;
}
