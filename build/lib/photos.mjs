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
// Two files are not Quest's, and neither is a photograph in the sense the rest
// are: they are alpha cut-outs. See CUTOUTS below for why they stay.
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

  // ---- the two alpha cut-outs; see CUTOUTS
  'excavator.webp': 'A tracked excavator on a Quest Construction site',
  'loader.webp': 'A wheel loader on a Quest Construction site',

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

// The landscape frames. Anything dropped into a fixed wide slot — a 4:3 story
// shot, a 16:10 card, a project card — has to come from here, or object-fit
// crops the middle out of a portrait phone photograph and the subject goes
// with it. The cut-outs are not on this list: they are sized by their own
// alpha rather than cropped to a box.
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

/**
 * The two images in the tree that are not Quest's own — and the reason they
 * are still here after everything else was replaced.
 *
 * They are alpha cut-outs, not rectangles, and two layouts are built around
 * that fact. Direction 01's hero has the machine straddling the accent plane's
 * hard edge with no frame, and the ghost wordmark reading straight through the
 * gaps in the boom. Direction 10's rig crosses the diagonal slash, which only
 * reads because the machine has no edges of its own.
 *
 * Quest's library is phone photographs. Put one in either slot and the
 * silhouette becomes a plate: the wordmark disappears behind it, the diagonal
 * stops crossing anything, and the composition is a different composition.
 * That is a redesign, not a photo swap. It was tried, and reverted.
 *
 * They stay until Quest has cut-outs of its own. `assets/cut/cutout.py` mattes
 * one from any machine photograph; drop the result in, repoint the constant,
 * and nothing else changes. A test pins the set at exactly these two.
 */
export const CUTOUTS = ['excavator.webp', 'loader.webp'];

/**
 * Direction 01's hero.
 *
 * It was the cut-out excavator, and Quest asked for the plant to come off the
 * front page. That is not a swap: the cut-out was the whole reason the hero
 * worked the way it did — no frame, so the machine straddled the accent plane's
 * hard edge, and gaps in the boom for the ghost wordmark to read through. A
 * rectangle dropped into that slot has edges and covers the wordmark.
 *
 * So the slot changes shape instead. Three plates of the materials Quest
 * builds with, fanned and overlapping, which is a stronger read of depth than
 * one flat object ever was — occlusion, three sizes, three shadow depths — and
 * it is the same move the banner deck already makes for the same reason. There
 * is no plant photography to fall back on anyway: the seven cut-out candidates
 * in assets/cut/ carry another contractor's name, a rental firm's branding or a
 * bad matte. Materials are what Quest photographs.
 *
 * One trade each — timber, roofing, panel — and the caption on each is the
 * material in the frame rather than the trade it belongs to. All three are
 * chosen for filling their frame with the stuff: a shot of a jobsite with
 * lumber somewhere in it is not a photograph of lumber, and at plate size the
 * difference is the whole point. The orientations are load-bearing too — the
 * portrait one is the middle plate, and swapping it for a landscape crops the
 * material out of its own picture.
 */
export const HERO_STACK = [
  ['quest/slab-lumber.webp', 'Lumber'],      // landscape
  ['quest/roof-ridge.webp', 'Shingle'],      // portrait
  ['quest/sheathing-panel.webp', 'Sheathing'], // landscape
];
/** The lead plate: the LCP image, and the only one that is preloaded. */
export const HERO = HERO_STACK[0][0];
/** The 4:3 shot beside the story copy on the home and about pages. */
export const STORY = 'quest/story.webp';
/** The 16:10 shot in the contact page's help card. */
export const CONTACT = 'quest/custom-home-gables.webp';
/** The closing plate at the foot of every page. Landscape — it fills a wide cell. */
export const CLOSING = 'quest/home-dusk.webp';

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

// ---------------------------------------------------------------- assignment
//
// Below this line is the question of which photograph goes where, and the one
// rule that governs it: **no page shows the same photograph twice.**
//
// That rule is easy to state and impossible to hold by hand. A service page
// carries a banner, a four-shot band and the closing plate. A city page carries
// a banner, a three-shot band, fourteen trade tiles and the closing plate — 19
// frames drawn from a library of 49 by four separate pieces of markup that know
// nothing about each other. Picking them all by eye means re-checking 32 pages
// every time one line changes, and the first pass got it wrong on 15 of them.
//
// So the fixed slots are declared first, each band is given a *pool* longer
// than it needs, and the band takes the first entries the page has not already
// used. Add a photograph, reorder a pool, change a banner — the bands move out
// of the way on their own. A test walks every page and fails on a repeat.
//
// The gallery is the exception, and the obvious one: it shows the whole
// library, so the banner and the closing plate necessarily appear inside it.

/** One photograph per trade for the service card. All fourteen differ. */
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
  'custom-home-building': 'porch-dusk',
  painting: 'custom-home-gables',
  'deck-building-uses-trex-system': 'deck-joists',
  'window-installation': 'gable-window',
};

// The tile repeats fourteen times on the home page, on every city page and on
// the services hub, in a fixed 3:2 slot about 430px wide. Forty-two tiles a page
// pulling 1500px originals is four megabytes to show one and a half, so the crop
// is pre-baked at 900x600 under assets/quest/card/ — 816KB for the whole set,
// taken a little above centre on the portrait frames, because the roof, the
// gable and the header are the half of a phone photograph worth keeping.
const cardFile = (name) => `quest/card/${name}.webp`;

/** [file, alt] for a service card — the crop's path with the original's alt. */
export function cardShot(slug) {
  const name = CARD_SHOTS[slug];
  if (!name) throw new Error(`no card photograph mapped for service ${slug}`);
  return [cardFile(name), shot(`quest/${name}.webp`)[1]];
}

/** Every card's underlying photograph, for the no-repeat bookkeeping below. */
const CARD_ORIGINALS = Object.values(CARD_SHOTS).map((n) => `quest/${n}.webp`);

// ------------------------------------------------------------------- banners
//
// The inner-page banner. Every page below the home page opens on the accent
// plane, and the plane only covers 62% of the band — the rest was empty cream.
// This is what goes in it: a plate on the right, cut on the same lean the plane
// is cut on, so the two interlock instead of sitting side by side.
//
// The deck leans material-forward — lumber laid out, a sheathed panel, joists,
// shingles — because the alternative for that slot was a machine, and there is
// no machine to use. The seven cut-out candidates in assets/cut/ were checked:
// six carry another contractor's name, a rental firm's branding or a bad matte,
// and the seventh is already the home hero. Quest owns no plant photography.
// Materials are what Quest photographs, so materials are what this shows.
//
// Landscape or texture-filling only: the slot is roughly 500x340, and a portrait
// phone frame cropped to that loses its subject.
//
// A service page gets a frame chosen for its trade rather than a slot in a
// rotation — a visitor reading about decks should not open on a roof. A city
// page cannot be relevant to its city, so those rotate.
const SERVICE_BANNER = {
  'residential-development': 'quest/slab-lumber.webp',
  casita: 'quest/framing-slab.webp',
  adu: 'quest/sheathing-panel.webp',
  framing: 'quest/framing-clouds.webp',
  concrete: 'quest/slab-blockwall.webp',
  stucco: 'quest/custom-home-gables.webp',
  'dry-wall': 'quest/framing-roof.webp',
  siding: 'quest/custom-home-wide.webp',
  roofing: 'quest/roof-field.webp',
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'quest/story.webp',
  'custom-home-building': 'quest/porch-dusk.webp',
  painting: 'quest/hero.webp',
  'deck-building-uses-trex-system': 'quest/deck-joists.webp',
  'window-installation': 'quest/home-windows.webp',
};

// Eleven cities, eleven frames, none of them one of the fourteen trade tiles
// that sit further down the same page.
const AREA_BANNER = [
  'quest/framing-roof.webp',
  'quest/story.webp',
  'quest/roof-field.webp',
  'quest/slab-lumber.webp',
  'quest/hero.webp',
  'quest/roof-ridge.webp',
  'quest/sheathing-panel.webp',
  'quest/roof-desert.webp',
  'quest/slab-blockwall.webp',
  'quest/framing-lumber.webp',
  'quest/roof-valley.webp',
];

const BANNER_PAGE = {
  about: 'quest/hero.webp',
  gallery: 'quest/roof-shingles.webp',
  projects: 'quest/framing-clouds.webp',
  contact: 'quest/slab-lumber.webp',
  sitemap: 'quest/sheathing-panel.webp',
  serviceIndex: 'quest/framing-clouds.webp',
  areaIndex: 'quest/custom-home-wide.webp',
};

/**
 * [file, alt] for an inner page's banner plate.
 * @param kind 'service' | 'area' | one of the BANNER_PAGE keys
 * @param key  the service slug, or the city's position in the areas list
 */
export function bannerShot(kind, key = 0) {
  if (kind === 'service') {
    const f = SERVICE_BANNER[key];
    if (!f) throw new Error(`no banner photograph mapped for service ${key}`);
    return shot(f);
  }
  if (kind === 'area') return shot(AREA_BANNER[key % AREA_BANNER.length]);
  const f = BANNER_PAGE[kind];
  if (!f) throw new Error(`no banner photograph mapped for ${kind}`);
  return shot(f);
}

// --------------------------------------------------------------------- bands

/** Everything a page of this kind already shows before its band is chosen. */
function taken(kind, key) {
  const base = [CLOSING];
  switch (kind) {
    case 'home':
      return [...base, ...HERO_STACK.map(([f]) => f), STORY,
        ...PROJECT_SHOTS, ...CARD_ORIGINALS];
    case 'service':
      return [...base, bannerShot('service', key)[0]];
    case 'area':
      return [...base, bannerShot('area', key)[0], ...CARD_ORIGINALS];
    case 'serviceIndex':
      return [...base, bannerShot('serviceIndex')[0], ...CARD_ORIGINALS];
    case 'about':
      return [...base, bannerShot('about')[0], STORY];
    case 'projects':
      return [...base, bannerShot('projects')[0], ...PROJECT_SHOTS];
    default:
      return [...base, bannerShot(kind)[0]];
  }
}

/** The first `n` frames of `pool` this page has not already used. */
function fill(pool, used, n, where) {
  const out = pool.filter((f) => !used.includes(f)).slice(0, n);
  if (out.length < n) throw new Error(`${where} needs ${n} photographs, its pool leaves ${out.length}`);
  return out.map(shot);
}

// Five to seven photographs per trade for a band that shows four. The surplus
// is what lets the band step aside when the banner, or the closing plate, has
// already taken one of them.
//
// Where Quest has no photograph of the trade itself — drywall, stucco, paint,
// cabinetry, windows as a standalone job — the nearest stage of the same work
// stands in, and the alt text above still describes the frame honestly rather
// than the trade it sits under.
const SERVICE_POOL = {
  'residential-development': [
    'quest/framing-clouds.webp', 'quest/slab-lumber.webp', 'quest/custom-home-wide.webp',
    'quest/home-dusk.webp', 'quest/framing-progress.webp', 'quest/framing-sky.webp'],
  casita: [
    'quest/framing-walls.webp', 'quest/slab-poured.webp', 'quest/framing-palms.webp',
    'quest/framing-progress.webp', 'quest/framing-corner.webp'],
  adu: [
    'quest/framing-slab.webp', 'quest/sheathing-panel.webp', 'quest/framing-long-wall.webp',
    'quest/framing-block.webp', 'quest/framing-wide.webp'],
  framing: [
    'quest/framing-clouds.webp', 'quest/framing-roof.webp', 'quest/framing-header.webp',
    'quest/home-trusses.webp', 'quest/framing-sky.webp'],
  concrete: [
    'quest/slab-poured.webp', 'quest/slab-blockwall.webp', 'quest/slab-walls.webp',
    'quest/slab-lumber.webp', 'quest/framing-shade.webp'],
  stucco: [
    'quest/custom-home-shell.webp', 'quest/custom-home-gables.webp', 'quest/home-side.webp',
    'quest/framing-walls.webp', 'quest/gables-underlayment.webp'],
  'dry-wall': [
    'quest/spare.webp', 'quest/framing-inside.webp', 'quest/framing-openings.webp',
    'quest/framing-hose.webp', 'quest/framing-corner.webp'],
  siding: [
    'quest/home-side.webp', 'quest/home-trusses.webp', 'quest/custom-home-shell.webp',
    'quest/sheathing-panel.webp', 'quest/framing-walls.webp'],
  roofing: [
    'quest/roof-shingles.webp', 'quest/roof-ridge.webp', 'quest/roof-desert.webp',
    'quest/roof-eave.webp', 'quest/roof-valley.webp'],
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': [
    'quest/spare.webp', 'quest/framing-inside.webp', 'quest/framing-corner.webp',
    'quest/slab-walls.webp', 'quest/framing-openings.webp'],
  'custom-home-building': [
    'quest/custom-home-wide.webp', 'quest/custom-home-gables.webp', 'quest/home-trusses.webp',
    'quest/custom-home-shell.webp', 'quest/home-side.webp', 'quest/porch-dusk.webp',
    'quest/home-dusk.webp'],
  painting: [
    'quest/spare.webp', 'quest/custom-home-gables.webp', 'quest/home-windows.webp',
    'quest/gables-underlayment.webp', 'quest/custom-home-shell.webp'],
  'deck-building-uses-trex-system': [
    'quest/deck-joists.webp', 'quest/framing-lumber.webp', 'quest/slab-lumber.webp',
    'quest/porch-dusk.webp', 'quest/framing-slab.webp'],
  'window-installation': [
    'quest/gable-window.webp', 'quest/home-windows.webp', 'quest/framing-openings.webp',
    'quest/spare.webp', 'quest/gables-underlayment.webp'],
};

/** The photographs that belong on a service page, as [file, alt] pairs. */
export function serviceShots(slug, n = 4) {
  const pool = SERVICE_POOL[slug];
  if (!pool) throw new Error(`no photographs mapped for service ${slug}`);
  return fill(pool, taken('service', slug), n, `service ${slug}`);
}

// Quest photographs jobs, not towns, so a city page cannot show its own. Each
// gets a stable slice of the library instead — stable so the page does not
// reshuffle between builds, offset per city so eleven pages do not open alike.
const AREA_DECK = [
  'quest/framing-clouds.webp', 'quest/slab-poured.webp', 'quest/custom-home-wide.webp',
  'quest/roof-shingles.webp', 'quest/framing-palms.webp', 'quest/home-dusk.webp',
  'quest/deck-joists.webp', 'quest/framing-walls.webp', 'quest/porch-dusk.webp',
  'quest/roof-desert.webp', 'quest/slab-lumber.webp', 'quest/home-windows.webp',
  'quest/framing-roof.webp', 'quest/custom-home-gables.webp', 'quest/framing-openings.webp',
  'quest/roof-ridge.webp', 'quest/framing-long-wall.webp', 'quest/story.webp',
  'quest/framing-progress.webp', 'quest/hero.webp', 'quest/spare.webp',
  'quest/sheathing-panel.webp', 'quest/framing-header.webp', 'quest/roof-eave.webp',
  'quest/framing-hose.webp', 'quest/slab-walls.webp', 'quest/framing-sky.webp',
  'quest/roof-valley.webp', 'quest/framing-shade.webp', 'quest/framing-curve.webp',
  'quest/sheathing-curve.webp', 'quest/roof-underlayment.webp', 'quest/framing-block.webp',
];

/** The photographs that belong on the service-area page at index `i`. */
export function areaShots(i, n = 3) {
  const start = (i * 3) % AREA_DECK.length;
  const pool = [...AREA_DECK.slice(start), ...AREA_DECK.slice(0, start)];
  return fill(pool, taken('area', i), n, `area ${i}`);
}

// The bands on the pages that are neither a service nor a city. Each pool runs
// long for the same reason the trades' do.
const PAGE_POOL = {
  // Four longer than the band needs. The hero takes three photographs off the
  // top of this pool now rather than one cut-out that was in no pool at all,
  // and a pool sized exactly to the band leaves the build throwing the moment
  // anything upstream claims one of them.
  home: [
    'quest/slab-blockwall.webp', 'quest/framing-roof.webp', 'quest/sheathing-panel.webp',
    'quest/home-windows.webp', 'quest/porch-dusk.webp', 'quest/framing-long-wall.webp',
    'quest/roof-ridge.webp', 'quest/framing-header.webp', 'quest/slab-lumber.webp',
    'quest/framing-sky.webp', 'quest/roof-eave.webp', 'quest/framing-palms.webp',
    'quest/framing-openings.webp', 'quest/roof-deck.webp', 'quest/framing-corner.webp',
    'quest/slab-walls.webp'],
  about: [
    'quest/framing-palms.webp', 'quest/roof-ridge.webp', 'quest/framing-hose.webp',
    'quest/slab-walls.webp', 'quest/framing-sky.webp', 'quest/roof-valley.webp'],
  projects: [
    'quest/framing-long-wall.webp', 'quest/framing-header.webp', 'quest/roof-desert.webp',
    'quest/framing-shade.webp', 'quest/roof-underlayment.webp', 'quest/slab-walls.webp',
    'quest/framing-hose.webp', 'quest/framing-curve.webp'],
  serviceIndex: [
    'quest/framing-long-wall.webp', 'quest/roof-ridge.webp', 'quest/framing-header.webp',
    'quest/slab-lumber.webp', 'quest/framing-sky.webp', 'quest/roof-eave.webp'],
  areaIndex: [
    'quest/framing-palms.webp', 'quest/roof-desert.webp', 'quest/porch-dusk.webp',
    'quest/slab-lumber.webp', 'quest/roof-ridge.webp', 'quest/framing-sky.webp'],
};

/** The band on the home page, about, projects or either hub. */
export function pageShots(kind, n) {
  const pool = PAGE_POOL[kind];
  if (!pool) throw new Error(`no band mapped for ${kind}`);
  return fill(pool, taken(kind), n, kind);
}
