// The three accents, in one place.
//
// They used to be defined three incompatible ways at once: as :root custom
// properties in a hand-maintained stylesheet, as a literal P map inside each of
// eleven direction scripts, and as three data-acc buttons in the chooser. The
// README warned that changing a colour meant editing two of them by hand, and
// the standalone build reconciled them by running literal string replacements
// over someone else's CSS text.
//
// Each accent carries four values because that is what the designs need:
//
//   acc    the accent itself, for whole surfaces and large shapes
//   onAcc  text and marks ON that accent — near-black, or white for clay
//   dim    the same accent as TEXT on cream or white, where even the muted
//          tints fail contrast at body size
//   lift   a lightened tint for text on a dark COLOURED ground; only 05 uses
//          it, because clay on its excavated green is about 3:1
//
// All three are deliberately muted. An earlier pass used fully saturated safety
// colours (#FFC629, #FF7A1C) which are punishing across a full-width hero band.

export const PALETTES = {
  hivis: {
    key: 'hivis', name: 'Ochre', acc: '#D9A93C', onAcc: '#191307', dim: '#8A6712', lift: '#EFC96B',
  },
  orange: {
    key: 'orange', name: 'Burnt Orange', acc: '#D07C42', onAcc: '#1C1208', dim: '#9A4E1E', lift: '#EFA372',
  },
  clay: {
    key: 'clay', name: 'Clay', acc: '#A8543A', onAcc: '#ffffff', dim: '#7C3A24', lift: '#D98A6A',
  },
};

/** What the demo stylesheets are authored in. */
export const AUTHORED_KEY = 'hivis';
/** What the team picked, and what the standalone site ships. */
export const CHOSEN_KEY = 'orange';

export const palette = (key) => {
  const p = PALETTES[key];
  if (!p) throw new Error(`no such accent: ${key}`);
  return p;
};

/** The order the chooser's dots are in, and the order the P map is written in. */
export const KEYS = ['orange', 'clay', 'hivis'];

/**
 * The three accent declarations, exactly as a direction's :root carries them.
 * The standalone build swaps this block rather than replacing loose hexes.
 */
export function accentDeclarations(key, { lift = false } = {}) {
  const p = palette(key);
  return [
    `  --acc:${p.acc};`,
    `  --on-acc:${p.onAcc};`,
    `  --acc-dim:${p.dim};`,
    ...(lift ? [`  --acc-lift:${p.lift};`] : []),
  ].join('\n');
}

/**
 * The map every direction's inline script embeds so the chooser can swap the
 * accent live. `lift` adds the fourth value, which only 05 reads.
 */
export function scriptMap({ lift = false } = {}) {
  const row = (k) => {
    const p = palette(k);
    const vals = [p.acc, p.onAcc, p.dim, ...(lift ? [p.lift] : [])];
    return `${k}:[${vals.map((v) => `'${v}'`).join(',')}]`;
  };
  return `var P={${KEYS.map(row).join(',')}};`;
}

// ---------------------------------------------------------------- contrast
// Colour pairings were being checked by screenshotting a page and sampling
// pixels, which is how both of the contrast bugs found so far were caught.
// These make a pairing assertable at build time instead.

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two opaque colours, rounded to two places. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
