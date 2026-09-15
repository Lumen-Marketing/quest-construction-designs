// One 24x24 stroke icon per service, shared by every direction that draws an
// icon chip. Stroke-only and currentColor-free: each direction's CSS sets
// stroke and width on `.ic svg`, so the same path works on cream, dark or accent.
const P = {
  'residential-development': 'M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6',
  casita: 'M4 20h16M6 20v-8l6-4 6 4v8M10 20v-4h4v4M3 12l9-6 9 6',
  adu: 'M3 21h18M6 21V10h6v11M12 14h6v7M8 13h2M8 17h2',
  framing: 'M4 21V4h16v17M4 21h16M4 12h16M12 4v17M4 8h16M4 16h16',
  // A mixer truck. The slab-and-stakes drawing this replaces read as a lump on
  // a box: nothing in it said concrete, and it sat in a row of icons that draw
  // a recognisable thing. A drum on a chassis is what a customer pictures.
  concrete: 'M3 17h16M3 17v-4h3l2 4M9.5 13.5 11.5 8h5.5l2 3.5-2 3.5h-5.5z'
    + 'M19 15l2.5 2.5M5.3 19a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 1 0-3.4 0'
    + 'M14.3 19a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 1 0-3.4 0',
  // A plasterer's trowel, blade flat to the wall, with two strokes of render
  // above it. The square of scattered dots this replaces was texture with no
  // subject, and at chip size the dots read as specks of dirt. Drawn flat
  // rather than angled: angled, the blade and its grip read as a pencil.
  stucco: 'M3.5 15h13.5l2.5 3H6zM11.5 12.9v-1.5M9.6 11.4h3.8'
    + 'M5 8.5h9',
  'dry-wall': 'M3 5h18v14H3zM3 12h18M12 5v7M8 12v7M17 12v7',
  siding: 'M3 5h18v3H3zM3 8h18v3H3zM3 11h18v3H3zM3 14h18v3H3zM3 17h18v2H3z',
  roofing: 'M2 12 12 4l10 8M5 12v8h14v-8M9 20v-5h6v5',
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops':
    'M4 3h16v18H4zM4 9h16M12 3v6M7 13h2M7 17h2M14 13h3v4h-3z',
  'custom-home-building': 'M3 11 12 3l9 8M6 11v9h12v-9M10 20v-5h4v5M17 6V3h2v5',
  painting: 'M5 3h11v6H5zM10 9v3M8 12h4v9H8zM16 4h3v4h-3z',
  'deck-building-uses-trex-system': 'M3 8h18M3 12h18M3 16h18M6 8v12M18 8v12M3 8l3-4h12l3 4',
  'window-installation': 'M4 3h16v18H4zM12 3v18M4 12h16M2 21h20',
  // A ball on a chain over a wall with its far half already gone. Every other
  // icon here draws the thing that gets built; this one has to draw the thing
  // that gets removed, and a wall alone reads as masonry.
  demolition: 'M3 21h18M5 21V9h3v3h3v3h2v6M18 6.5V3h3'
    + 'M15.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
};

const FALLBACK = 'M3 20h18M5 20V9l7-5 7 5v11';

/** Inline SVG for a service slug. Each direction styles `.ic svg` itself. */
export function icon(slug) {
  const d = P[slug] || FALLBACK;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    d.split('M').filter(Boolean).map((seg) => `<path d="M${seg.trim()}"/>`).join('') +
    `</svg>`;
}

export const SLUGS = Object.keys(P);

// The social marks are filled rather than stroked, unlike every icon above.
// A brand glyph is a shape, not a line drawing, and outlining Facebook's "f"
// to match the trade icons would produce something that is recognisably not
// the mark. It carries its own fill so the `.ic svg` rules do not reach it.
const SOCIAL = {
  facebook: 'M13.4 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.45 1.55-1.45h1.65V3.68'
    + 'A22 22 0 0 0 14.2 3.56c-2.38 0-4 1.45-4 4.11v2.23H7.5V13h2.7v8z',
};

/** Inline SVG for a social platform, filled, sized by its container. */
export function socialIcon(name) {
  const d = SOCIAL[name];
  if (!d) throw new Error(`no social icon for ${name}`);
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" `
    + `fill="currentColor" stroke="none"><path d="${d}"/></svg>`;
}
