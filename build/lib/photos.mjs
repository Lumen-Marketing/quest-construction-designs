// The photograph library. Every image on every page comes from here.
//
// Quest supplied two shoots: an addition in progress on a Phoenix-area lot
// (slab, framing, sheathing, deck joists) and a finished custom home in the
// desert (roof, gables, windows, dusk exteriors). There is no stock
// photography left in the tree, so nothing on the site shows work Quest did
// not do — which also means the alt text below has to describe what is
// actually in the frame and no more. If a trade has no photograph of its own
// (drywall, stucco, paint, cabinetry), it borrows the closest honest one and
// the alt text says what that picture really shows.
//
// Filenames live under assets/quest/. The alt text lives here and only here,
// so the ten directions cannot drift apart on what a photograph depicts.

/** file -> alt. The single source of truth for what each photograph shows. */
export const ALT = {
  // ---- the addition: slab, framing, sheathing
  'quest/slab-poured.webp': 'A freshly poured and floated concrete slab on a Quest Construction build',
  'quest/slab-blockwall.webp': 'A finished slab and block wall at the start of a Quest Construction build',
  'quest/slab-walls.webp': 'A poured slab with the first framed walls standing along one edge',
  'quest/slab-lumber.webp': 'Framing lumber laid out across a finished slab',
  'quest/sheathing-panel.webp': 'A sheathed exterior wall panel braced upright on a new slab',
  'quest/sheathing-curve.webp': 'A curved sheathed wall braced over a finished slab',
  'quest/framing-slab.webp': 'Exterior walls framed and braced on a finished slab',
  'quest/framing-walls.webp': 'Framed and sheathed exterior walls on a Quest Construction addition',
  'quest/framing-ladder.webp': 'A framed wall and stepladder partway through a framing day',
  'quest/framing-roof.webp': 'Roof framing seen from inside the walls',
  'quest/framing-openings.webp': 'Window and door openings framed out in a new wall',
  'quest/framing-corner.webp': 'A framed corner and window opening on a Quest Construction build',
  'quest/framing-wide.webp': 'Framed walls across the full footprint of a Quest Construction addition',
  'quest/framing-palms.webp': 'Framed walls rising between the palms on an Arizona lot',
  'quest/framing-hose.webp': 'An air hose run through the framed walls of a Quest Construction build',
  'quest/framing-court.webp': 'New framing meeting the existing block wall on a Quest Construction build',
  'quest/framing-lumber.webp': 'Framing lumber stacked on the slab beside finished walls',
  'quest/framing-block.webp': 'New framing tied in alongside an existing block wall',
  'quest/framing-shade.webp': 'Afternoon shadows across framed walls and a finished slab',
  'quest/framing-progress.webp': 'Framing progress across a Quest Construction addition',
  'quest/framing-clouds.webp': 'Framed walls and a header under an Arizona sky',
  'quest/framing-curve.webp': 'A curved framed wall braced on the slab',
  'quest/framing-sky.webp': 'Framed walls against a clear Arizona sky',
  'quest/framing-sun.webp': 'Sun over the framed walls of a Quest Construction build',
  'quest/framing-long-wall.webp': 'A long framed wall running the length of a new slab',
  'quest/framing-inside.webp': 'Standing inside the framed walls of a Quest Construction addition',
  'quest/framing-header.webp': 'A framed opening and header on a Quest Construction build',
  'quest/deck-joists.webp': 'Deck framing and joists laid out on grade beside a pool',

  // ---- the custom home: roof, gables, windows, exteriors
  'quest/custom-home-shell.webp': 'The sheathed shell of a custom home built by Quest Construction',
  'quest/custom-home-wide.webp': 'A Quest Construction custom home under construction on an open Arizona lot',
  'quest/custom-home-gables.webp': 'Gables, windows and wall sheathing on a Quest Construction custom home',
  'quest/home-side.webp': 'A custom home shell from the side at the end of the day',
  'quest/home-trusses.webp': 'Roof trusses and sheathing on a custom home under construction',
  'quest/home-windows.webp': 'Windows set into the sheathed walls of a custom home',
  'quest/home-dusk.webp': 'A Quest Construction custom home at dusk with the porch framing complete',
  'quest/porch-dusk.webp': 'The front porch and timber posts of a custom home at dusk',
  'quest/gable-window.webp': 'A gable window framed and set on a custom home',
  'quest/gables-underlayment.webp': 'Gables, windows and roof underlayment on a custom home',
  'quest/roof-eave.webp': 'The eave and roof edge detailed before the shingles go down',
  'quest/roof-underlayment.webp': 'Roof underlayment down and gables framed on a custom home',
  'quest/roof-deck.webp': 'The roof deck and underlayment across a custom home',
  'quest/roof-shingles.webp': 'Architectural shingles laid across a new roof',
  'quest/roof-ridge.webp': 'The ridge line of a newly shingled roof',
  'quest/roof-valley.webp': 'A shingled roof valley with the desert beyond',
  'quest/roof-field.webp': 'A field of new architectural shingles across a finished roof',
  'quest/roof-desert.webp': 'A newly shingled hip roof with the Arizona mountains beyond',

  // ---- the three Quest already had
  'quest/hero.webp': 'Wall and roof framing across a Quest Construction home',
  'quest/story.webp': 'Framing and structural work on a Quest Construction project',
  'quest/spare.webp': 'A finished interior with new windows on a Quest Construction project',
};

/** [file, alt] for one photograph. Throws rather than shipping a silent typo. */
export function shot(file) {
  const alt = ALT[file];
  if (!alt) throw new Error(`no alt text for ${file} — add it to build/lib/photos.mjs`);
  return [file, alt];
}

/** [file, alt] for each of the named photographs, in order. */
export const shots = (...files) => files.map(shot);

/** Every photograph in the library, newest shoot last. */
export const ALL = Object.keys(ALT);

// The landscape frames. Anything dropped into a fixed wide slot — a hero, a
// 4:3 story shot, a 16:10 card — has to come from here, or object-fit crops
// the middle out of a portrait phone photograph and the subject goes with it.
export const LANDSCAPE = [
  'quest/hero.webp',
  'quest/story.webp',
  'quest/framing-clouds.webp',
  'quest/custom-home-wide.webp',
  'quest/home-dusk.webp',
  'quest/custom-home-gables.webp',
  'quest/slab-lumber.webp',
  'quest/deck-joists.webp',
  'quest/framing-slab.webp',
  'quest/slab-blockwall.webp',
  'quest/sheathing-panel.webp',
  'quest/framing-roof.webp',
];

/** The home hero. Landscape, and the one photograph worth a preload. */
export const HERO = 'quest/home-dusk.webp';
/** The 4:3 shot beside the story copy on the home and about pages. */
export const STORY = 'quest/story.webp';
/** The 16:10 shot in the contact page's help card. */
export const CONTACT = 'quest/custom-home-gables.webp';

/** The three project showcase cards, in the order content/pages.json lists them. */
export const PROJECT_SHOTS = [
  'quest/hero.webp',            // Residential Framing
  'quest/custom-home-wide.webp',// Home Construction
  'quest/slab-blockwall.webp',  // Concrete Work
];

/** A fourteen-shot sampler across both shoots — one per trade card, marquee,
    tile strip, whatever a direction needs a spread of work for. */
export const SAMPLER = [
  'quest/slab-poured.webp',
  'quest/framing-clouds.webp',
  'quest/framing-roof.webp',
  'quest/sheathing-panel.webp',
  'quest/framing-openings.webp',
  'quest/deck-joists.webp',
  'quest/roof-shingles.webp',
  'quest/roof-ridge.webp',
  'quest/custom-home-gables.webp',
  'quest/home-windows.webp',
  'quest/custom-home-wide.webp',
  'quest/porch-dusk.webp',
  'quest/spare.webp',
  'quest/home-dusk.webp',
];

/** The five-tile trade strip some directions run: [file, label, blurb]. */
export const TRADES = [
  ['quest/slab-poured.webp', 'Concrete', 'Slabs and foundations'],
  ['quest/framing-clouds.webp', 'Framing', 'Structure and roof'],
  ['quest/roof-shingles.webp', 'Roofing', 'Underlayment to shingle'],
  ['quest/home-windows.webp', 'Exteriors', 'Sheathing, windows, siding'],
  ['quest/spare.webp', 'Interiors', 'Drywall through finish'],
];

// The gallery, ordered as a walk through a job rather than as a dump of the
// camera roll: ground and slab, framing going up, sheathing and openings, the
// roof, then the finished exteriors.
export const GALLERY = [
  'quest/slab-blockwall.webp',
  'quest/slab-lumber.webp',
  'quest/slab-walls.webp',
  'quest/sheathing-panel.webp',
  'quest/slab-poured.webp',
  'quest/framing-slab.webp',
  'quest/framing-walls.webp',
  'quest/framing-long-wall.webp',
  'quest/framing-palms.webp',
  'quest/framing-block.webp',
  'quest/framing-court.webp',
  'quest/framing-progress.webp',
  'quest/framing-wide.webp',
  'quest/framing-clouds.webp',
  'quest/framing-sky.webp',
  'quest/framing-sun.webp',
  'quest/framing-shade.webp',
  'quest/framing-ladder.webp',
  'quest/framing-lumber.webp',
  'quest/framing-hose.webp',
  'quest/framing-corner.webp',
  'quest/framing-openings.webp',
  'quest/framing-header.webp',
  'quest/framing-inside.webp',
  'quest/framing-roof.webp',
  'quest/framing-curve.webp',
  'quest/sheathing-curve.webp',
  'quest/deck-joists.webp',
  'quest/story.webp',
  'quest/hero.webp',
  'quest/custom-home-wide.webp',
  'quest/custom-home-shell.webp',
  'quest/custom-home-gables.webp',
  'quest/home-trusses.webp',
  'quest/home-windows.webp',
  'quest/gable-window.webp',
  'quest/gables-underlayment.webp',
  'quest/roof-underlayment.webp',
  'quest/roof-deck.webp',
  'quest/roof-eave.webp',
  'quest/roof-shingles.webp',
  'quest/roof-ridge.webp',
  'quest/roof-valley.webp',
  'quest/roof-field.webp',
  'quest/roof-desert.webp',
  'quest/home-side.webp',
  'quest/porch-dusk.webp',
  'quest/home-dusk.webp',
  'quest/spare.webp',
];

// Four photographs per trade. Where Quest has no photograph of the trade
// itself — drywall, stucco, paint, cabinetry, windows as a standalone job —
// the nearest stage of the same work stands in and the alt text above still
// describes the frame honestly rather than the trade it sits under.
const SERVICE_SHOTS = {
  'residential-development': [
    'quest/framing-clouds.webp', 'quest/slab-lumber.webp',
    'quest/custom-home-wide.webp', 'quest/home-dusk.webp'],
  casita: [
    'quest/framing-walls.webp', 'quest/slab-poured.webp',
    'quest/framing-palms.webp', 'quest/framing-progress.webp'],
  adu: [
    'quest/framing-slab.webp', 'quest/sheathing-panel.webp',
    'quest/framing-long-wall.webp', 'quest/framing-block.webp'],
  framing: [
    'quest/framing-clouds.webp', 'quest/framing-roof.webp',
    'quest/framing-header.webp', 'quest/home-trusses.webp'],
  concrete: [
    'quest/slab-poured.webp', 'quest/slab-blockwall.webp',
    'quest/slab-walls.webp', 'quest/slab-lumber.webp'],
  stucco: [
    'quest/custom-home-shell.webp', 'quest/custom-home-gables.webp',
    'quest/home-side.webp', 'quest/framing-walls.webp'],
  'dry-wall': [
    'quest/spare.webp', 'quest/framing-inside.webp',
    'quest/framing-openings.webp', 'quest/framing-hose.webp'],
  siding: [
    'quest/home-side.webp', 'quest/home-trusses.webp',
    'quest/custom-home-shell.webp', 'quest/sheathing-panel.webp'],
  roofing: [
    'quest/roof-shingles.webp', 'quest/roof-ridge.webp',
    'quest/roof-desert.webp', 'quest/roof-eave.webp'],
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': [
    'quest/spare.webp', 'quest/framing-inside.webp',
    'quest/framing-corner.webp', 'quest/slab-walls.webp'],
  'custom-home-building': [
    'quest/custom-home-wide.webp', 'quest/porch-dusk.webp',
    'quest/home-dusk.webp', 'quest/custom-home-gables.webp'],
  painting: [
    'quest/spare.webp', 'quest/custom-home-gables.webp',
    'quest/home-windows.webp', 'quest/gables-underlayment.webp'],
  'deck-building-uses-trex-system': [
    'quest/deck-joists.webp', 'quest/framing-lumber.webp',
    'quest/slab-lumber.webp', 'quest/porch-dusk.webp'],
  'window-installation': [
    'quest/gable-window.webp', 'quest/home-windows.webp',
    'quest/framing-openings.webp', 'quest/spare.webp'],
};

// One photograph per trade for the service card — the dark tile that repeats
// fourteen times on the home page, on every area page and on the services hub.
// All fourteen are different frames on purpose: three cards showing the same
// interior reads as a company with three photographs, not fourteen jobs.
//
// These live under assets/quest/card/ rather than pointing at the full-size
// library. The card slot is a fixed 3:2 crop about 430px wide, and forty-two
// tiles a page pulling 1500px originals is four megabytes to show one and a
// half. The crop is pre-baked at 900x600 — 816KB for the whole set — and it is
// taken a little above centre on the portrait frames, because the roof, the
// gable and the header are the half of a phone photograph worth keeping.
const CARD_SHOTS = {
  'residential-development': 'framing-clouds',
  casita: 'framing-walls',
  adu: 'framing-slab',
  framing: 'home-trusses',
  concrete: 'slab-poured',
  stucco: 'custom-home-shell',
  'dry-wall': 'spare',
  siding: 'home-side',
  roofing: 'roof-shingles',
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'framing-inside',
  'custom-home-building': 'custom-home-wide',
  painting: 'custom-home-gables',
  'deck-building-uses-trex-system': 'deck-joists',
  'window-installation': 'gable-window',
};

/** [file, alt] for a service card's photograph — the card crop, not the original. */
export function cardShot(slug) {
  const name = CARD_SHOTS[slug];
  if (!name) throw new Error(`no card photograph mapped for service ${slug}`);
  // The alt belongs to the photograph, not to the crop of it.
  return [`quest/card/${name}.webp`, shot(`quest/${name}.webp`)[1]];
}

/** The photographs that belong on a service page, as [file, alt] pairs. */
export function serviceShots(slug, n = 4) {
  const files = SERVICE_SHOTS[slug];
  if (!files) throw new Error(`no photographs mapped for service ${slug}`);
  return files.slice(0, n).map(shot);
}

// Quest photographs jobs, not cities, so an area page cannot show its own
// town. Each city gets a stable slice of the library instead — stable so the
// page does not reshuffle between builds, and offset per city so eleven pages
// do not all open on the same photograph.
const AREA_DECK = [
  'quest/framing-clouds.webp', 'quest/slab-poured.webp', 'quest/custom-home-wide.webp',
  'quest/roof-shingles.webp', 'quest/framing-palms.webp', 'quest/home-dusk.webp',
  'quest/deck-joists.webp', 'quest/framing-walls.webp', 'quest/porch-dusk.webp',
  'quest/roof-desert.webp', 'quest/slab-lumber.webp', 'quest/home-windows.webp',
  'quest/framing-roof.webp', 'quest/custom-home-gables.webp', 'quest/framing-openings.webp',
  'quest/roof-ridge.webp', 'quest/framing-long-wall.webp', 'quest/story.webp',
  'quest/framing-progress.webp', 'quest/hero.webp', 'quest/spare.webp',
  'quest/sheathing-panel.webp',
];

/** The photographs that belong on the service-area page at index `i`. */
export function areaShots(i, n = 3) {
  const out = [];
  for (let k = 0; k < n; k += 1) out.push(AREA_DECK[(i * n + k) % AREA_DECK.length]);
  return out.map(shot);
}
