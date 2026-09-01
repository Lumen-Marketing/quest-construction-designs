// The photograph library. Every image on every page comes from here.
//
// Quest has supplied three shoots. The first two were single jobs caught
// mid-structure: an addition on a Phoenix-area lot (slab, framing, sheathing,
// deck joists) and a custom home in the desert (roof, gables, windows, dusk
// exteriors). The third is a spread across many jobs, and it is the one that
// closed the holes — a finished composite deck, an interior taken back to the
// studs, siding, a window job start to finish, a casita at three stages, and
// the first aerials Quest has ever handed over.
//
// There is no stock photography left in the tree, so nothing on the site shows
// work Quest did not do — which also means the alt text below has to describe
// what is actually in the frame and no more. Where a trade still has no
// photograph of its own (drywall, paint, cabinetry) it borrows the closest
// honest one and the alt text says what that picture really shows.
//
// Two files are not Quest's, and neither is a photograph in the sense the rest
// are: they are alpha cut-outs. See CUTOUTS below for why they stay.
//
// Filenames live under assets/quest/. The alt text lives here and only here,
// so the ten directions cannot drift apart on what a photograph depicts.

import { readFileSync } from 'node:fs';
import { known } from './images.mjs';

/** file -> alt. The single source of truth for what each photograph shows. */
export const ALT = {
  // ---- the three outsourced materials ----
  // The only photographs on the site Quest did not take, and the last two: the
  // hero was rebuilt on Quest's own photography, which took the cut-out object
  // and the block ground with it. What is left is the pair of vouchers, and
  // those are material studies rather than jobs. Both are CC0 — public domain,
  // commercial use, no attribution — and content/outsourced.json carries the
  // licence, the source and the landing page for each. images.test.mjs fails
  // if anything in the tree that is not Quest's is missing from that file.
  //
  // The alt text describes the material, because that is what the picture is
  // for. None of them claims to be a Quest job, and none is captioned as one.
  'mat/kit.webp': 'A hard hat, hi-vis vest, work gloves, saw, hammer, pliers, tape measure and screwdriver laid out together',
  'mat/board.webp': 'The face of an oriented strand board, its chips pressed flat in every direction',
  'mat/gear.webp': 'A hard hat, safety glasses and work gloves laid out on a timber bench',

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

  // ---- the third shoot: whole jobs rather than one stage of one job
  // Quest's first two shoots were an addition and a custom home, both caught
  // mid-structure. This one covers the trades the library could not show at
  // all — a finished deck, an interior stripped back to the studs, siding,
  // windows going in — plus the first aerials Quest has ever had.
  'quest/aerial-reroof.webp': 'A roofing crew stripping and re-covering a house roof, seen from above with the underlayment down',
  'quest/aerial-tearoff.webp': 'A whole house roof mid-replacement from above, shingle bundles staged across the deck',
  'quest/aerial-crane.webp': 'A crane setting roof trusses on a large timber-framed building, seen from above',
  'quest/deck-finished.webp': 'A finished composite deck running the length of a house under a covered patio',
  'quest/remodel-studs.webp': 'A house interior taken back to the studs, with new partition framing and ductwork in',
  'quest/siding-lap.webp': 'New lap siding and a new window on a house wall under exposed rafter tails',
  'quest/casita-stucco.webp': 'A finished casita with stucco walls, a tile roof and windows set, with roof tile stacked alongside',
  'quest/casita-shell.webp': 'The sheathed shell of a casita with its roof on and openings cut',
  'quest/casita-sunset.webp': 'A sheathed casita on its slab at sunset',
  'quest/framing-turret.webp': 'A curved turret framed in timber with its rafters radiating from the centre',
  'quest/framing-cricket.webp': 'A carpenter framing a roof cricket on a sheathed roof deck',
  'quest/framing-desert-lot.webp': 'Sheathed exterior walls standing across the footprint of a house on an open desert lot',
  'quest/framing-garage.webp': 'A sheathed garage addition beside an existing house in the late afternoon',
  'quest/framing-patio.webp': 'An addition framed on a new slab where it meets an existing tiled patio',
  'quest/framing-braced.webp': 'A braced sheathed wall and its opening standing on a freshly poured slab',
  'quest/framing-addition.webp': 'An addition framed and insulated against the wall of an existing house',
  'quest/footings-excavator.webp': 'A compact excavator cutting footings alongside an existing house',
  'quest/window-stucco.webp': 'A new window set and flashed into a stucco wall',
  'quest/window-flashed.webp': 'A new window flashed into a stucco wall with the sealing tape still exposed',
  'quest/window-reflection.webp': 'A new window fitted into its opening, the sky reflected in the upper light',
  'quest/window-opening.webp': 'An opening cut through a stucco wall for a new window, the finished room visible inside',
  'quest/window-scaffold.webp': 'Two new windows going into an upper storey from a scaffold',
  'quest/window-demo.webp': 'A wall opened up and the old window taken out, ready for a wider one',
  'quest/window-fitted.webp': 'A new window fitted into a widened opening with fresh siding below it',
  'quest/window-interior.webp': 'A stripped room with two new windows fitted, waiting on trim and paint',
  'quest/roof-windows.webp': 'A newly shingled roof with the tools still out and new windows going in behind it',

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
  'quest/aerial-reroof.webp',
  'quest/aerial-tearoff.webp',
  'quest/aerial-crane.webp',
  'quest/casita-stucco.webp',
  'quest/siding-lap.webp',
  'quest/framing-desert-lot.webp',
  'quest/framing-garage.webp',
  'quest/window-scaffold.webp',
  'quest/window-interior.webp',
  'quest/roof-windows.webp',
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
 * Direction 01's hero. A full-bleed photograph now, on the same construction
 * as the inner-page banners: the frame runs edge to edge, a directional scrim
 * holds the copy side down, and the type is read off the dark rather than off
 * a colour plane.
 *
 * The slot has been through every other answer. It was a machine cut-out, and
 * Quest asked for the plant off the front page. It became three of Quest's own
 * photographs in plates, and those were boxes. It became one frameless object
 * on an accent plane over a block ground, and that worked — but it was the one
 * composition on the site that had nothing to do with the rest of it, and it
 * was carrying an outsourced image whose rights were never verified.
 *
 * Landscape, wide, and something with weather in it: the band is far wider
 * than anything in the library is shot, so what goes here has to survive a
 * severe crop and still read as a Quest jobsite. Six candidates were put
 * through the band itself rather than judged as pictures — a desert lot, the
 * crane aerial, a garage at golden hour, the tear-off aerial, a custom home —
 * and this is the one that keeps its subject at 2:1: the framing and the palms
 * stay legible on the open side while the sky carries the scrim on the copy
 * side. It is nowhere else on the home page.
 *
 * It was the banner on the services hub and on projects, and it is far too
 * good to be spending itself there; both have their own frames now.
 */
export const HERO = 'quest/aerial-crane.webp';

/* HERO_GROUND used to live here: the photograph the accent plane was a tint
   over. There is no plane any more — the hero IS the photograph — so the
   ground has nowhere to be under. */

/* HERO_OBJECT used to live here: the materials cut-out that stood in front
   of the hero photograph. Quest asked for it out, and it was the one image
   on the site with no licence metadata behind it — see content/outsourced.json,
   where it is recorded as supplied by Quest with rights NOT VERIFIED. The
   hero is the photograph now, with nothing in front of it. */


/** The band across the head of each offer voucher, in the order they are listed. */
export const OFFER_SHOTS = ['mat/board.webp', 'mat/gear.webp'];

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

/** The pergola section on the showcase. These are the only two post-and-beam
    photographs in the library: the finished cover over the composite deck, and
    the timber porch posts with their hardware still showing at dusk. Both are
    subtracted from the projects band below, so neither appears twice on the
    page. A third tile would have to be a picture of something else. */
export const PERGOLA_SHOTS = [
  'quest/deck-finished.webp',
  'quest/porch-dusk.webp',
];

/** A fourteen-shot sampler across both shoots — one per trade the recovered
    site carried, marquee,
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

// The gallery, as a walk through a job rather than as a dump of the camera
// roll. It was already in this order — ground, slab, framing, sheathing, roof,
// finished — but it was one flat run of seventy-five frames and nothing on the
// page said so, so it read as the dump it was ordered not to be. The stages are
// declared now, which is the only difference: same photographs, same sequence,
// with the breaks written down.
//
// A stage's count has to be expressible as a sum of 3, 4 and 5 or justified()
// cannot break it into rows. Five is the smallest that works.
export const GALLERY_STAGES = [
  {
    slug: 'ground',
    name: 'Ground and slab',
    note: 'Footings cut beside what is already standing, the pad poured and '
      + 'floated, and the first lumber stacked on it.',
    files: [
      'quest/footings-excavator.webp',
      'quest/slab-poured.webp',
      'quest/slab-blockwall.webp',
      'quest/slab-lumber.webp',
      'quest/slab-walls.webp',
    ],
  },
  {
    slug: 'framing',
    name: 'Framing',
    note: 'Walls braced and standing, and the sun moving across them from one '
      + 'end of the day to the other.',
    files: [
      'quest/framing-braced.webp',
      'quest/framing-patio.webp',
      'quest/framing-slab.webp',
      'quest/framing-walls.webp',
      'quest/framing-long-wall.webp',
      'quest/framing-palms.webp',
      'quest/framing-block.webp',
      'quest/framing-court.webp',
      'quest/framing-progress.webp',
      'quest/framing-wide.webp',
      'quest/framing-addition.webp',
      'quest/framing-clouds.webp',
      'quest/framing-sky.webp',
      'quest/framing-sun.webp',
      'quest/framing-shade.webp',
      'quest/framing-ladder.webp',
      'quest/framing-lumber.webp',
      'quest/framing-hose.webp',
      'quest/framing-inside.webp',
      'quest/framing-curve.webp',
      'quest/framing-turret.webp',
      'quest/framing-roof.webp',
      'quest/story.webp',
      'quest/hero.webp',
      'quest/deck-joists.webp',
    ],
  },
  {
    slug: 'sheathing',
    name: 'Sheathing and openings',
    note: 'Panels on, and the windows and doors cut back out of them.',
    files: [
      'quest/sheathing-panel.webp',
      'quest/sheathing-curve.webp',
      'quest/framing-desert-lot.webp',
      'quest/framing-garage.webp',
      'quest/framing-corner.webp',
      'quest/framing-openings.webp',
      'quest/framing-header.webp',
      'quest/custom-home-shell.webp',
      'quest/custom-home-wide.webp',
      'quest/custom-home-gables.webp',
      'quest/home-windows.webp',
      'quest/gable-window.webp',
      'quest/casita-shell.webp',
    ],
  },
  {
    slug: 'roof',
    name: 'Roof',
    note: 'Trusses set, underlayment down, and the last course of shingles.',
    files: [
      'quest/aerial-crane.webp',
      'quest/home-trusses.webp',
      'quest/framing-cricket.webp',
      'quest/gables-underlayment.webp',
      'quest/roof-underlayment.webp',
      'quest/roof-deck.webp',
      'quest/roof-eave.webp',
      'quest/roof-shingles.webp',
      'quest/roof-ridge.webp',
      'quest/roof-valley.webp',
      'quest/roof-field.webp',
      'quest/roof-desert.webp',
      'quest/aerial-reroof.webp',
      'quest/aerial-tearoff.webp',
      'quest/roof-windows.webp',
    ],
  },
  {
    slug: 'retrofit',
    name: 'Windows and remodels',
    note: 'The half of the work that happens inside a house somebody is still '
      + 'living in.',
    files: [
      'quest/window-demo.webp',
      'quest/window-opening.webp',
      'quest/window-flashed.webp',
      'quest/window-reflection.webp',
      'quest/window-stucco.webp',
      'quest/window-scaffold.webp',
      'quest/window-fitted.webp',
      'quest/window-interior.webp',
      'quest/remodel-studs.webp',
      'quest/siding-lap.webp',
    ],
  },
  {
    slug: 'finished',
    name: 'Finished',
    note: 'The ones that are done.',
    files: [
      'quest/casita-sunset.webp',
      'quest/casita-stucco.webp',
      'quest/deck-finished.webp',
      'quest/home-side.webp',
      'quest/porch-dusk.webp',
      'quest/home-dusk.webp',
      'quest/spare.webp',
    ],
  },
];

/** Every gallery frame, flat and in stage order. */
export const GALLERY = GALLERY_STAGES.flatMap((s) => s.files);

// What a frame says when a visitor puts a pointer on it. ALT describes what is
// in the picture, which is what a screen reader needs and is a fair caption on
// its own. content/photo-notes.json is where Quest says the thing only Quest
// knows — "framing stage, but that is a custom bathroom, sauna and steam room"
// — and a note there wins. Nothing has to be written for a frame to work.
const NOTES = JSON.parse(readFileSync('content/photo-notes.json', 'utf8')).notes;
for (const f of Object.keys(NOTES)) {
  // A note keyed on a path that is not in the library would simply never show,
  // and Quest would have written a caption that silently goes nowhere.
  if (!ALT[f]) throw new Error(`content/photo-notes.json names ${f}, which is not a photograph`);
}

/** The visible caption for a frame: Quest's note if there is one, else the alt. */
export function caption(file) {
  return NOTES[file] || ALT[file] || '';
}

// ---------------------------------------------------------------- assignment
//
// Below this line is the question of which photograph goes where, and the one
// rule that governs it: **no page shows the same photograph twice.**
//
// That rule is easy to state and impossible to hold by hand. A service page
// carries a banner, a four-shot band and the closing plate. A city page carries
// a banner, a three-shot band, fifteen trade tiles and the closing plate — 20
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

/**
 * One photograph per trade for the service card. All fifteen differ.
 *
 * Nine of these were stand-ins until the third shoot arrived: the deck card
 * showed joists on grade because there was no photograph of a finished deck,
 * the remodel card showed bare framing, the window card showed a gable window
 * on a new build rather than a window being installed, and the siding and
 * casita cards showed whole houses that happened to have siding or happened to
 * be small. Every one of those now shows the trade the card is named after.
 */
const CARD_SHOTS = {
  // The aerial went to the hero, where it is the whole photograph. Framed
  // walls going up under an Arizona sky is what this trade looks like anyway,
  // and it is the picture the hero vacated.
  'residential-development': 'framing-clouds',
  casita: 'casita-shell',
  adu: 'casita-sunset',
  framing: 'framing-turret',
  concrete: 'slab-poured',
  stucco: 'custom-home-shell',
  'dry-wall': 'spare',
  siding: 'siding-lap',
  roofing: 'aerial-reroof',
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'remodel-studs',
  'custom-home-building': 'porch-dusk',
  painting: 'custom-home-gables',
  'deck-building-uses-trex-system': 'deck-finished',
  'window-installation': 'window-stucco',
  // The only machine in the library, and the only frame in it where the ground
  // is torn open rather than being built on. It is a footing dig, and the alt
  // text says so — but a tracked excavator with its bucket down beside a house
  // is what this trade looks like at card size, and nothing else here is close.
  demolition: 'footings-excavator',
};

// The tile repeats fifteen times on the home page, on every city page and on
// the services hub, in a fixed 3:2 slot about 430px wide. Forty-two tiles a page
// pulling 1500px originals is four megabytes to show one and a half, so the crop
// is pre-baked at 900x600 under assets/quest/card/ — 816KB for the whole set,
// taken a little above centre on the portrait frames, because the roof, the
// gable and the header are the half of a phone photograph worth keeping.
// A card normally has a 900x600 crop cut for it. Where one has not been cut,
// the full-size original stands in — the card is object-fit:cover either way,
// so the only cost is a few more kilobytes. Better than forcing a trade onto
// the wrong photograph because the right one has no crop.
const cardFile = (name) => {
  const crop = `quest/card/${name}.webp`;
  return known(crop) ? crop : `quest/${name}.webp`;
};

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
  'residential-development': 'quest/aerial-crane.webp',
  casita: 'quest/casita-stucco.webp',
  adu: 'quest/framing-desert-lot.webp',
  framing: 'quest/framing-clouds.webp',
  concrete: 'quest/slab-blockwall.webp',
  stucco: 'quest/custom-home-gables.webp',
  'dry-wall': 'quest/framing-roof.webp',
  siding: 'quest/siding-lap.webp',
  roofing: 'quest/aerial-reroof.webp',
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'quest/window-interior.webp',
  'custom-home-building': 'quest/porch-dusk.webp',
  painting: 'quest/hero.webp',
  // The best deck photograph is the finished one and it is a portrait frame,
  // which this slot cannot take — so it opens on the joists going down and the
  // band below leads on the finished deck instead.
  'deck-building-uses-trex-system': 'quest/deck-joists.webp',
  'window-installation': 'quest/window-scaffold.webp',
  // A whole roof off from above. It is the one photograph Quest has of a
  // structure being taken apart at building scale rather than at wall scale,
  // and it is an aerial, so it fills a 500x340 plate without being cropped.
  demolition: 'quest/aerial-tearoff.webp',
};

// Eleven frames, none of them one of the fifteen trade tiles
// that sit further down the same page.
const AREA_BANNER = [
  'quest/framing-roof.webp',
  'quest/story.webp',
  'quest/aerial-tearoff.webp',
  'quest/slab-lumber.webp',
  'quest/hero.webp',
  'quest/framing-garage.webp',
  'quest/sheathing-panel.webp',
  'quest/roof-desert.webp',
  'quest/casita-stucco.webp',
  'quest/framing-lumber.webp',
  'quest/roof-windows.webp',
];

const BANNER_PAGE = {
  about: 'quest/hero.webp',
  gallery: 'quest/roof-shingles.webp',
  projects: 'quest/framing-desert-lot.webp',
  contact: 'quest/slab-lumber.webp',
  sitemap: 'quest/sheathing-panel.webp',
  serviceIndex: 'quest/framing-garage.webp',
  areaIndex: 'quest/custom-home-wide.webp',
  blog: 'quest/framing-ladder.webp',
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
      return [...base, HERO, STORY, ...PROJECT_SHOTS, ...CARD_ORIGINALS];
    case 'service':
      return [...base, bannerShot('service', key)[0]];
    case 'area':
      return [...base, bannerShot('area', key)[0], ...CARD_ORIGINALS];
    case 'serviceIndex':
      return [...base, bannerShot('serviceIndex')[0], ...CARD_ORIGINALS];
    case 'about':
      return [...base, bannerShot('about')[0], STORY];
    case 'projects':
      return [...base, bannerShot('projects')[0], ...PROJECT_SHOTS, ...PERGOLA_SHOTS];
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
    'quest/aerial-tearoff.webp', 'quest/framing-desert-lot.webp', 'quest/framing-garage.webp',
    'quest/framing-clouds.webp', 'quest/slab-lumber.webp', 'quest/custom-home-wide.webp',
    'quest/home-dusk.webp', 'quest/framing-progress.webp', 'quest/framing-sky.webp'],
  casita: [
    'quest/casita-shell.webp', 'quest/casita-sunset.webp', 'quest/framing-addition.webp',
    'quest/framing-walls.webp', 'quest/slab-poured.webp', 'quest/framing-palms.webp',
    'quest/framing-progress.webp', 'quest/framing-corner.webp'],
  adu: [
    'quest/casita-stucco.webp', 'quest/casita-shell.webp', 'quest/casita-sunset.webp',
    'quest/framing-slab.webp', 'quest/sheathing-panel.webp', 'quest/framing-long-wall.webp',
    'quest/framing-block.webp', 'quest/framing-wide.webp'],
  framing: [
    'quest/framing-turret.webp', 'quest/framing-cricket.webp', 'quest/aerial-crane.webp',
    'quest/framing-desert-lot.webp', 'quest/framing-roof.webp', 'quest/framing-header.webp',
    'quest/home-trusses.webp', 'quest/framing-sky.webp'],
  concrete: [
    'quest/slab-poured.webp', 'quest/footings-excavator.webp', 'quest/framing-patio.webp',
    'quest/framing-braced.webp', 'quest/slab-walls.webp',
    'quest/slab-lumber.webp', 'quest/framing-shade.webp'],
  stucco: [
    'quest/casita-stucco.webp', 'quest/custom-home-shell.webp', 'quest/window-flashed.webp',
    'quest/home-side.webp', 'quest/framing-walls.webp', 'quest/gables-underlayment.webp'],
  'dry-wall': [
    'quest/spare.webp', 'quest/framing-inside.webp', 'quest/framing-openings.webp',
    'quest/framing-hose.webp', 'quest/framing-corner.webp'],
  siding: [
    'quest/window-fitted.webp', 'quest/framing-garage.webp', 'quest/home-side.webp',
    'quest/home-trusses.webp', 'quest/custom-home-shell.webp',
    'quest/sheathing-panel.webp', 'quest/framing-walls.webp'],
  roofing: [
    'quest/aerial-tearoff.webp', 'quest/roof-windows.webp', 'quest/framing-cricket.webp',
    'quest/roof-shingles.webp', 'quest/roof-ridge.webp', 'quest/roof-desert.webp',
    'quest/roof-eave.webp', 'quest/roof-valley.webp'],
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': [
    'quest/remodel-studs.webp', 'quest/window-opening.webp', 'quest/spare.webp',
    'quest/framing-addition.webp', 'quest/framing-inside.webp', 'quest/framing-corner.webp',
    'quest/slab-walls.webp', 'quest/framing-openings.webp'],
  'custom-home-building': [
    'quest/custom-home-wide.webp', 'quest/custom-home-gables.webp', 'quest/home-trusses.webp',
    'quest/custom-home-shell.webp', 'quest/home-side.webp', 'quest/porch-dusk.webp',
    'quest/home-dusk.webp'],
  painting: [
    'quest/spare.webp', 'quest/window-interior.webp', 'quest/casita-stucco.webp',
    'quest/home-windows.webp', 'quest/gables-underlayment.webp', 'quest/custom-home-shell.webp'],
  'deck-building-uses-trex-system': [
    'quest/deck-finished.webp', 'quest/framing-lumber.webp', 'quest/slab-lumber.webp',
    'quest/porch-dusk.webp', 'quest/framing-slab.webp'],
  // The one trade with a start-to-finish sequence of its own: the wall opened
  // up, the unit flashed in, the sky in the glass, the finished opening.
  'window-installation': [
    'quest/window-demo.webp', 'quest/window-flashed.webp', 'quest/window-reflection.webp',
    'quest/window-fitted.webp', 'quest/window-opening.webp', 'quest/window-interior.webp',
    'quest/gable-window.webp', 'quest/home-windows.webp', 'quest/framing-openings.webp'],
  // Quest photographs what it builds, so the demolition frames are the moments
  // in other jobs where something came out first: the wall opened up for a
  // wider window, the interior taken back to studs, the ground cut open beside
  // a standing house. Each alt still describes its own frame.
  demolition: [
    'quest/window-demo.webp', 'quest/remodel-studs.webp', 'quest/footings-excavator.webp',
    'quest/framing-inside.webp', 'quest/aerial-reroof.webp', 'quest/framing-court.webp',
    'quest/slab-blockwall.webp'],
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
  'quest/deck-finished.webp', 'quest/remodel-studs.webp', 'quest/window-stucco.webp',
  'quest/casita-shell.webp', 'quest/siding-lap.webp', 'quest/framing-turret.webp',
  'quest/aerial-reroof.webp', 'quest/framing-cricket.webp', 'quest/window-fitted.webp',
  'quest/casita-sunset.webp', 'quest/framing-desert-lot.webp', 'quest/window-reflection.webp',
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
    'quest/aerial-tearoff.webp', 'quest/deck-finished.webp', 'quest/framing-turret.webp',
    'quest/slab-blockwall.webp', 'quest/framing-roof.webp', 'quest/sheathing-panel.webp',
    'quest/home-windows.webp', 'quest/porch-dusk.webp', 'quest/framing-long-wall.webp',
    'quest/roof-ridge.webp', 'quest/framing-header.webp', 'quest/slab-lumber.webp',
    'quest/framing-sky.webp', 'quest/roof-eave.webp', 'quest/framing-palms.webp',
    'quest/framing-openings.webp', 'quest/roof-deck.webp', 'quest/framing-corner.webp',
    'quest/slab-walls.webp'],
  about: [
    'quest/framing-cricket.webp', 'quest/casita-stucco.webp', 'quest/framing-palms.webp',
    'quest/roof-ridge.webp', 'quest/framing-hose.webp',
    'quest/slab-walls.webp', 'quest/framing-sky.webp', 'quest/roof-valley.webp'],
  projects: [
    'quest/aerial-crane.webp', 'quest/deck-finished.webp', 'quest/remodel-studs.webp',
    'quest/framing-long-wall.webp', 'quest/framing-header.webp', 'quest/roof-desert.webp',
    'quest/framing-shade.webp', 'quest/roof-underlayment.webp', 'quest/slab-walls.webp',
    'quest/framing-hose.webp', 'quest/framing-curve.webp'],
  serviceIndex: [
    'quest/aerial-tearoff.webp', 'quest/window-scaffold.webp', 'quest/framing-long-wall.webp',
    'quest/roof-ridge.webp', 'quest/framing-header.webp',
    'quest/slab-lumber.webp', 'quest/framing-sky.webp', 'quest/roof-eave.webp'],
  areaIndex: [
    'quest/framing-desert-lot.webp', 'quest/casita-sunset.webp', 'quest/framing-palms.webp',
    'quest/roof-desert.webp', 'quest/porch-dusk.webp',
    'quest/slab-lumber.webp', 'quest/roof-ridge.webp', 'quest/framing-sky.webp'],
};

/** The band on the home page, about, projects or either hub. */
export function pageShots(kind, n) {
  const pool = PAGE_POOL[kind];
  if (!pool) throw new Error(`no band mapped for ${kind}`);
  return fill(pool, taken(kind), n, kind);
}
