# Quest Construction — Design Directions

Ten design directions for **Quest Construction** (general contracting). Each one is a complete
**thirty-one page site** — home, fourteen services, eleven service areas, about, gallery, projects,
contact and sitemap — so 310 pages in total. Nothing here is wired to a live site; the contact form
is not connected.

**Open `index.html`** — that is the chooser. Each card is a live, scaled iframe of the real
homepage, and the direction's whole site sits behind it.

## The ten directions

| # | Folder | Personality | Style |
|---|--------|-------------|-------|
| 01 | `d01-site-plan/` | **Site Plan** — layered, editorial. The safest bet. | Dimensional |
| 02 | `d02-heavy-plant/` | **Heavy Plant** — poster wordmark with the machine cutting through it. The risk. | Dimensional |
| 03 | `d03-split-bay/` | **Split Bay** — dark, split hero, cursor-driven photo reveals. | Brutalist |
| 04 | `d04-grid-north/` | **Grid North** — visible 12-column grid, hairline rules, numbered rows. | Swiss |
| 05 | `d05-ground-break/` | **Ground Break** — deep green, one giant accent word, concentric pad arc. | Colour field |
| 06 | `d06-red-iron/` | **Goop** — black hero, pill nav, bento cards on a tinted ground. | Product-site soft |
| 07 | `d07-bid-desk/` | **Bid Desk** — clean white, estimate bar on an organic hero sweep. | Utility |
| 08 | `d08-machine-age/` | **Machine Age** — symmetrical, ziggurat frames, sunburst, brass on charcoal. | Art Deco |
| 09 | `d09-site-notice/` | **Site Notice** — stapled flyers, tape, xerox halftone, tear-off tabs. | Punk / xerox |
| 10 | `d10-cross-cut/` | **Cross Cut** — diagonal section slashes, cut-out plant, graphite and steel. | Industrial B2B |

**Only `d01-site-plan` is indexable.** The other nine emit `noindex,follow` and are absent from
`sitemap.xml`: ten near-identical sites on one domain would cannibalise each other. Pick one,
flip its flag, and the rest can come down.

## The build

The pages are **generated**, not hand-written. Content lives as data in `content/*.json`; a
zero-dependency Node generator walks ten direction modules over the thirty-one page manifest and
writes static HTML. The generated HTML is committed — the generator is a dev tool, never a runtime
dependency, and the folders can be served as they stand.

```bash
node build/build.mjs              # all ten directions, 310 pages
node build/build.mjs d05          # just one
node build/apply-css.mjs d05      # re-splice build/css/d05.css onto that direction's stylesheet
node build/check-links.mjs d05-ground-break
node build/sitemap.mjs            # regenerate sitemap.xml
node build/verify.mjs             # the gate: link check + content rules across all ten
node --test "build/**/*.test.mjs" # the whole suite
```

| Path | Responsibility |
|---|---|
| `content/*.json` | The site's words and figures — services, areas, pages, NAP, offers |
| `build/lib/` | URL resolution, the page manifest, `<head>` assembly, JSON-LD, images |
| `build/directions/dNN.mjs` | One direction's markup — ten renderers plus `meta` and `script` |
| `build/css/dNN.css` | That direction's multi-page furniture, spliced onto its stylesheet |
| `dNN-slug/` | Generated output, committed |

`build/directions/all.test.mjs` is the contract: it discovers every direction module on disk and
holds all of them to the same guarantees — thirty-one pages, one `h1` each, alt text and intrinsic
dimensions on every image, navigation reaching every service and area from depth two, and no
placeholder identity data anywhere. A new direction cannot ship without meeting it.

**Area pages differ by direction.** `d01` carries authored per-city copy from
`content/areas-local.json`; 02–10 render the ported template from `content/areas.json` with the
`{{city}}` token filled. They are `noindex`, so the thin-content exposure never reaches the index.

## Design languages

The first pass made all three brutalist. That was wrong for 01 and 02 — brutalism is deliberately
flat, which fought the layered depth the reference deck was built on. **01 and 02 were rebuilt;
03 was explicitly left alone.**

### Dimensional (01, 02)

Depth comes from stacking real layers, in this order:

1. faint engineering **grid** on cream
2. a hard-edged **accent plane** with an angled boundary, or a giant **ghost wordmark**
3. a **cut-out machine with no frame** — an alpha image, not a photo in a box — sitting on
   top and straddling that boundary
4. on Heavy Plant, **clipped duplicates of the last letters painted back over the machine**,
   so the stack reads type behind → machine → type in front
5. a **floating badge card** with a hard shadow over the lot

The cut-out is the whole point. An earlier pass faked depth by stacking rounded photo cards,
which is just boxes next to boxes — no amount of shadow makes that read as foreground and
background.

Plus: pill buttons, generous radii (`--r` 16px / `--r-lg` 30px), soft layered shadows, skewed
diagonal bar motifs, and a cream hero that drops to dark sections and back.

### Brutalist (03)

Flat by design — chamfered `clip-path` corners, no radius, hard 90° grid, grayscale photography,
accent on whole surfaces only.

### Named styles (04–10)

The second set. **04 and 06 replace an earlier pair (Soft Site and Field Journal) that read too
soft.** Each of these six takes one named style out of the graphic-design canon and commits to it
rather than blending several:

- **04 Grid North — Swiss / International Typographic.** One typeface (Schibsted Grotesk) at
  several weights on a visible 12-column grid. Flush left, ragged right, hairline rules instead of
  boxes, no radius, no shadows. The accent is the only colour on the page. The hero is a **photo
  wall**: five jobsite photographs tiled with 2px gaps, the headline and the CTA occupying cells of
  the same grid. It is **full bleed** — the wall and the figures row under it run to the viewport
  edges, the row justified so it closes on both. The nav bar keeps the page gutter.
- **05 Ground Break — bold colour field.** Deep excavated-earth green. **Full-bleed hero**: a
  jobsite fills the first screen with the wordmark knocked over it and the figures as a hard bar
  along the base — the figures bar is the last thing in the section, and the photograph runs
  straight into the cream below it with no decorative shape in between.
- **06 Goop — modern product-site softness.** Modelled on Womp. The first screen is **pure
  black** with the headline centred over full-colour footage held down by an inverted vignette,
  and the nav is a **white pill floating over it** with the wordmark on a dark badge. Below the
  fold nothing is square: big-radius bento cards, dark rounded islands for the lead magnet and
  the contact band, and pill controls throughout. Every pale ground is `color-mix`ed from the
  accent, so the gallery's accent swap re-tints the whole page rather than only the buttons.
- **07 Bid Desk — clean utility.** White, an estimate bar straddling an organic hero sweep,
  everything pointing at one form.
- **08 Machine Age — Art Deco.** A **hard split hero** — charcoal type column with the sunburst
  behind it, crane photograph running off the right edge, divided by a stepped ziggurat cut rather
  than a straight line. Strong verticals, ziggurat `clip-path` frames, hairline double rules with a
  brass lozenge, a `repeating-conic-gradient` sunburst. The era that actually built the skyscrapers.
- **09 Site Notice — punk / xerox cut-and-paste.** Everything is a thing stuck to a hoarding:
  flyers stapled at angles, tape strips, a rubber stamp, typewriter captions, photographs blown out
  on a bad photocopier. Body copy always sits on clean paper so it stays readable.
- **10 Cross Cut — industrial B2B.** The house style of heavy-equipment and plant-hire firms:
  every section boundary is a diagonal `clip-path` slash with an accent hairline riding it,
  photography is full-bleed inside those slashes, and the machinery is a cut-out that breaks
  *across* a cut rather than sitting in a frame. Graphite, steel and one accent.
  Not to be confused with 06 — there the diagonal is the composition and the photography is
  bone-and-black halftone; here the diagonal is the section transition and the page is glossy
  and dark.

## One skeleton, ten sets of furniture

04–10 all run the same section order — the standard high-converting homepage anatomy:

> logo + simple nav → short headline with one stand-out CTA → social proof → about →
> three key offers → lead magnet → content (selected work) → footer

**The heroes are all different too.** 04 is a photo wall on the grid, 05 is full bleed, 06 is the
reel itself, 07 is an estimate bar over an organic sweep, 08 is a hard split with a stepped cut, 09
is a pasted-up poster and 10 is a diagonal slash with a cut-out machine. No two open the same way.

**The order is shared; the components are not.** An earlier pass kept the order *and* reused the
same parts in every direction — a strip of pills, photo-beside-text, three cards in a row, a dark
box with a rotated booklet, a row of work cards. Four different paint jobs on one page. That was
the right criticism and this table is the fix:

| Section | 04 Grid North | 05 Ground Break | 06 Goop | 07 Bid Desk | 08 Machine Age | 09 Site Notice | 10 Cross Cut |
|---|---|---|---|---|---|---|---|
| Social proof | Data table | Cream band of pills | Drift of pills | Floating pill cluster | Chevron-divided rail | Torn strip, `××` separated | Wall of notched steel plates |
| About | Full-bleed band, then 2 columns | Photo beside text | Two rounded cards, side by side | Photo cluster beside text | Symmetrical, ziggurat photo centred | Torn sheet + stapled photo | Slashed photo band, slab hung off its edge |
| Offers | Numbered **rows** | 3 chunky cards | Bento grid | 3 spec cards | 3 ziggurat arches | 3 stapled flyers | Chevron list beside a cut-out excavator |
| Lead magnet | Type-only accent band | Cream plate + booklet | Dark rounded island | Contents list, no booklet | Ornamental centred panel | A literal site notice with tear-off tabs | Checklist card whose boxes tick on scroll |
| Work | Index **table** | 4 cards in a row | Soft-tile bento, captions on glass | 3 spec cards | Vertical stepped tiles | Photocopied contact sheet | Skewed filmstrip, panes expand on hover |

If a new direction is added, fill in a new column here first. Anything that duplicates an existing
cell should be redesigned before it ships.

## Switching the accent

The three dots in the gallery header change the accent on **all ten designs at once, live**:

| Dot | Value | Text on accent |
|-----|-------|----------------|
| Ochre (default) | `#D9A93C` | near-black |
| Burnt Orange | `#D07C42` | near-black |
| Clay | `#A8543A` | white |

All three are **deliberately muted**. The first pass used fully saturated safety colours
(`#FFC629`, `#FF7A1C`) which are punishing across a full-width hero band — these are desaturated
and warmed toward earth tones instead.

01, 02 and 04–10 also carry a third token, `--acc-dim` — a darker shade used wherever the accent
has to sit as *text on cream*, since even the muted tints fail contrast on a light background.
05 needs a fourth, `--acc-lift`: a lightened tint, because the muted accents are far too dark to
carry a 180px headline on its green ground (clay on green is only ~3:1).

All ten directions share the same values, 03 included. Its layout is untouched; only its
palette map was updated, so the colour dots do the same thing on every card.

Each direction also reads the accent straight off its own URL, so
`direction-2-heavy-plant.html?acc=hivis` opens yellow. Full-screen links inherit whatever dot is
currently selected.

To add or change a colour, edit the `P` map in the small script at the bottom of each direction
file **and** the three `data-acc` buttons in `index.html`.

## Assets

`assets/` holds 19 free Unsplash photos, self-hosted (never hotlinked) and **served as WebP** —
they were 1800px JPEGs until the SEO pass re-encoded them at quality 80, which took the library
from 8.1MB to 4.5MB (−45%) with no visible loss. The eight images used as social cards keep a
JPEG twin at the correct 1200×630 in `assets/og/`, because Facebook's crawler is unreliable on
WebP and a 3:2 photo crops badly in a large summary card. 04, 05, 06 and 08 were
reworked to lean on the jobsite half of that library — rebar, steel, welding, rough-in, earthworks —
rather than the finished-interior half, which was reading soft for a general contractor. All were visually reviewed
before use — one shot was discarded because a hard hat carried another firm's branding.

**Do not use `assets/plans.webp`.** It has the same problem: the subject's polo carries a visible
"KRA" logo. It is unreferenced by every direction and should stay that way.

The cut-outs do carry **equipment-manufacturer** badges (CAT on the excavator, Deere on the loader).
That is a different thing from a rival contractor's mark and it is what a real plant photo looks
like, but if Quest would rather not advertise a brand, both are replaceable — the matting script
below turns any machine photo into a cut-out.

**No stock video — the reels are stills.** Directions 04, 05, 06 and 08 each carry a *reel*: three
photographs cross-dissolving on an 18-second loop behind a play control and a counter. They are
placeholders that reserve the video slot and show what it will look like — **drop a real Quest clip
in and the three `<img>` become one `<video>`; nothing else in the layout changes.** Direction 3's
"watch" plates are the same idea, a still with a play control, which is what the reference designs
actually use. Pexels' video IDs are not guessable and every candidate that resolved turned out to
be unrelated footage, so no stock footage is committed here.

Each reel is built in its own idiom rather than dropped in four times: a hairline chrome bar with a
timecode in 04, an organic blob with a pulsing medallion in 05, a halftone parallelogram with a
rotated plaque in 06, and a brass ziggurat frame with a Roman counter in 08.

## SEO

Every direction is a *fully optimised* page, not a mockup with a title tag. Whichever one Quest
picks ships search-ready rather than needing an SEO pass afterwards.

**One indexable site, thirty-one targeted pages.** The mockups each chased a different head term
so ten homepages would not compete. That is no longer how the cannibalisation is handled: only
`d01-site-plan` is indexable, and inside it each of the thirty-one pages targets its own query —
one per trade, one per city, plus the six standalone pages. Titles and descriptions are composed in
`build/lib/pages.mjs`, and a test enforces that all thirty-one are unique, ≤60 and ≤155 characters.

**What every page carries:**

- Unique `<title>` (≤60 chars) and `<meta name="description">` (≤155, so the snippet is never
  truncated), self-referencing `<link rel="canonical">`, and a `robots` directive that opts into
  `max-image-preview:large`.
- Open Graph + Twitter `summary_large_image` cards, pointing at a purpose-cut **1200×630** JPEG.
- A JSON-LD `@graph`: `GeneralContractor` + `HomeAndConstructionBusiness` (real telephone,
  founding year, `areaServed` for all eleven cities, `knowsAbout` the fourteen trades), `WebSite`,
  `WebPage` — `ContactPage` on contact — and a `BreadcrumbList`. Service pages add a `Service`
  node; the concrete page alone adds an `FAQPage`, because it is the only one with real FAQs.
  Area pages narrow `areaServed` to their own city.
  **There is no `PostalAddress`, no `identifier` for a licence, and no `aggregateRating`** —
  Quest has published none of them, and invented values in structured data are exactly where wrong
  data does the most damage. Title and description stay byte-identical across the meta tags and the
  schema.
- `<main id="main">` landmark and a keyboard skip link.
- Alt text on every rendered image; intrinsic `width`/`height` on all of them so nothing shifts
  while loading; `loading="lazy"` + `decoding="async"` below the fold, and the LCP hero marked
  `loading="eager" fetchpriority="high"` with a matching `<link rel="preload">` in the head.
- Local signals: `geo.region` and `geo.placename` meta — the latter naming the city on an area
  page — and one consistent NAP everywhere: **(602) 399-6455, Arizona, founded 2005**. Inconsistent
  NAP is the classic local-SEO own goal, so the number lives once in `content/site.json` and every
  page reads it from there.

Root files: `robots.txt` (which deliberately allows GPTBot, PerplexityBot, ClaudeBot and friends —
Quest wants to be the source AI answers cite), `sitemap.xml` with image extensions, `favicon.svg`
and `apple-touch-icon.png`.

There are **no dead `href="#"` links left**, and `build/check-links.mjs` walks all 310 generated
pages proving it: every internal href resolves to a file on disk, every `src` to a real image, and
every in-page anchor to an element that exists.

### Before this goes live

- `https://questconstruction.com` is assumed throughout — canonicals, OG URLs and schema `@id`s.
  If the domain differs, it is one find-and-replace across the HTML plus `sitemap.xml` and
  `robots.txt`.
- **`content/areas-local.json` is marked UNVERIFIED and needs Quest's review.** It carries the
  authored per-city copy behind `d01`'s eleven area pages. The claims worth checking hardest are
  the permitting authorities named for each city — Florence as Pinal County rather than Maricopa,
  Camelback East Village permitting through Phoenix, and Paradise Valley as its own town. A test
  enforces that the warning stays in the file until someone removes it deliberately.
- **Address, ROC number and email remain unpublished.** Nothing invents them, and no
  `PostalAddress`, licence `identifier` or `aggregateRating` appears in any schema node. If Quest
  supplies real values they can be added; until then, leaving them out is the correct answer, not
  an omission to fix.
- Only `d01-site-plan` is indexable today. Whichever direction Quest picks, flip `indexable` in
  its `meta`, regenerate, and take the other nine down.
- Self-host the fonts. Google Fonts is still a render-blocking third-party request on every page.

## Placeholders to replace before this goes anywhere near production

Far fewer than there used to be. The body copy is now Quest's own, extracted from the recovered
site into `content/*.json`, and the phone number and founding year are real.

- **Photography.** Only five images are genuinely Quest's (`assets/quest/`). Everything in the
  galleries is stock standing in for real jobsite photographs, and every gallery says so on the
  page. `assets/plans.webp` must never be referenced — it carries a visible third-party logo, and
  the image helper throws if anything asks for it.
- **The contact form is not wired.** Submitting it prints a note asking the visitor to call. Point
  it at a real endpoint before launch.
- **The per-city copy in `content/areas-local.json` is unverified.** See the SEO section above.
- **No invented figures anywhere.** Project counts, years-in-business, percentages and review
  numbers were all removed; every figure on every page is derived from the content files —
  fourteen trades, eleven cities, founded 2005, reachable 24/7. A test in `all.test.mjs` fails the
  build if the old placeholders reappear.

## Verifying changes

`shots/click.mjs` drives a real click on the gallery's palette dots over CDP and screenshots the
result — useful because the accent swap is the one thing a static screenshot cannot prove:

```bash
cd shots && node click.mjs palHivis ./out.png    # palOrange | palClay | palHivis
```

Three more CDP helpers, all taking a path relative to `shots/`:

```bash
node page.mjs    ../d04-grid-north/index.html ./d4.png 1440       # full-page shot, scrolls first
node probe.mjs   ../d04-grid-north/index.html 1440                # fast layout check, no screenshot
node slices.mjs  ../d05-ground-break/index.html ./s5 1440 1500    # long page, as viewport slices
node inspect.mjs ../d07-bid-desk/index.html ".deskbar" 1440       # computed styles for one selector
```

`slices.mjs` exists because the generated pages are long — a full-page shot of a 7,000px page can
hang the renderer or blow past a tool timeout. Shoot slices, or shoot `contact-us` instead: it
exercises the nav, the inner-page hero, a form and the footer in one screen.

Four more, added while verifying the 310 pages:

```bash
node sideways.mjs  ../d03-split-bay/index.html 1440       # does it REALLY scroll sideways?
node secscan.mjs   ../d03-split-bay/index.html 1440       # which block is causing it
node gridcheck.mjs ../d04-grid-north/contact-us/index.html ".contact-form" 1440
node dropcheck.mjs ../d09-site-notice/index.html 1440     # open the nav drop, is it hit-testable?
```

`sideways.mjs` is the one that settles arguments: it scrolls the page right and reads the offset
back, which is the only reliable test. `documentElement.scrollWidth` over-reports, because
`body{overflow-x:hidden}` propagates to the viewport and leaves `body`'s own used value visible —
so a "clipped" ancestor proves nothing. `secscan.mjs` then hides one top-level block at a time and
names the one whose removal shrinks the page.

`probe.mjs` flags lazy below-fold images as broken because it never scrolls them into view —
that one **is** a harness artefact. `mob.mjs` no longer has the matching problem: it used to wait
a fixed 2.5s and trust `img.complete`, which goes true well before the pixels exist, so photo
boxes reached the screenshot blank and read as layout bugs. It now awaits `img.decode()` on every
frame and walks the outer window down the whole surface to force a paint before capturing. Judge sideways overflow by `scrollW` against `vw`, not by
the `wide` list — several heroes bleed past the viewport on purpose inside `overflow:hidden`.

`probe.mjs` is the one to reach for first: it lists broken images and **names every element
sticking out past the viewport**, which is far quicker than eyeballing a screenshot for a page
that scrolls sideways.

Note that Chrome enforces a ~500px minimum window width, so `--window-size=390` will not give you
a true phone viewport — render the page inside a 390px-wide iframe instead.

### Two traps these scripts were bitten by

- **Give every run a random port *and* its own `--user-data-dir`.** With a fixed port, a new
  launch silently attaches to a leftover Chrome from an earlier run and screenshots the *old*
  page. A layout bug that was already fixed kept "reproducing" for three rounds because of this.
- **Do not animate `transform` for scroll reveals.** A `transform:none` on the revealed state wipes
  out any transform the element needs for its own layout — it broke 07's `translateX(-50%)` estimate
  bar and silently killed every card's hover lift. These pages animate the independent
  `translate` property instead, which composes with `transform` rather than replacing it.
- **Never name a state class the same as a layout class.** The reveal class was `in`, which collided
  with the wrapper class `.in` (`.hero .in{display:grid}`) and turned every revealed element into a
  two-column grid. Renamed to `vis`, which then collided with 06's `.magnet .vis` panel and repainted
  a whole cream box dark green. It is now `is-in`, which matches nothing else.
- **A rotated full-bleed bar needs a clipping parent, not `scale()`.** 09 tilts its nav and proof
  strip; `scale(1.02)` hid the corner gaps but pushed the document 14px wider than the viewport.
  The nav now clips itself and tilts an oversized slab inside; the strip sits in an `overflow:hidden`
  wrapper.
- **`h1 span{display:block}` is too broad** when a headline also contains inline highlight spans —
  in 09 it stretched a pasted-word patch across the full line. Use `h1>span`.
- **`clip-path` clips paint, not scroll.** 10's accent hairlines are 106% wide so they run past
  the diagonal edge; the sections clipped them visually but the document still scrolled 83px
  sideways until those sections got `overflow:hidden` as well.
- **A hide rule that also matches the thing you are showing wins on specificity.** 10's mobile nav
  hid `.nav .btn` and showed `.navtel` — but `.navtel` is also a `.btn`, so the hide rule
  outranked it and the phone button never appeared. It is `.nav .btn:not(.navtel)` now.
- **`margin:0 auto` on a flex item shrink-wraps it.** In a column flex container, auto side margins
  make the item `fit-content` instead of stretching — 05 and 06's new heroes both collapsed their
  `.wrap` to the width of its own text until it got an explicit `width:100%`.
- **`<figure>` carries a UA margin of `1em 40px`.** Every photo in 04's wall sat letterboxed inside
  its own cell until it was zeroed.
- **Two classes beat one class plus an element.** 04's plate captions are `figcaption.cap`, and
  `.hero .cap{display:block}` (0,2,0) outranked `.plates figcaption` (0,1,1) — every caption
  collapsed to a single run until the rule became `.plates figcaption.cap`.
- **A `<span>` is inline, so `overflow`, `aspect-ratio` and `border-radius` do nothing on it.**
  05's plant tiles rendered as plain squares until the wrapper got `display:block`.
- **A CSS width plus an HTML `height` attribute throws the natural ratio away.** 10's two cut-out
  machines carry intrinsic `width`/`height` attributes and the mockup only ever set a CSS width,
  so the loader rendered 825×1087 where it should have been 825×659 — stretched 65% taller on
  every page, desktop included, and invisible as a bug because a big machine just looks like a big
  machine. `height:auto` is the fix, and it is worth checking on any image that carries both.
- **`margin:0 auto` shrink-wraps a grid item too, not just a flex one.** 08's framed reel is a
  grid item whose only children are absolutely positioned, so at phone width it collapsed to zero
  width — and the aspect-ratio then gave it zero height. It needs an explicit `width:100%`.
- **Do not let the phone number be the first thing a mobile layout drops.** 06, 08 and 09 all hid
  it below 1080px, which on a contractor's site removes the single most valuable control on the
  page. It should be the last thing to go.
- **A descendant's `grid-column` builds tracks in its own grid parent.** 04's contact form is a
  grid and sits inside `.content`, so `.content h2` reached in and gave the form's heading
  `grid-column:1/7` — which created six implicit tracks inside the form and scattered the four
  fields across them. Scoped out with two classes, since one class plus an element outranks one
  class.
- **The supplied logo is a light-grey wordmark drawn for dark grounds.** On the cream and white
  navs it all but disappeared. `invert(1) hue-rotate(180deg) saturate(1.5)` darkens the grey and
  leaves the orange mark where it was; plain `invert()` turns the mark blue.
- **`:nth-child(1..4)` does not survive a longer list.** 08 stepped exactly four tiles that way;
  the gallery runs to fourteen and every tile past the fourth lost its aspect-ratio and collapsed.
  Cycle on `4n` instead.
- **Set `font-feature-settings:'tnum'` on the numbers, not on `body`.** Many faces make the comma
  and period tabular-width too, which opens a visible gap before every one. It made 04's copy read
  as "One bid . One manager ." until it was scoped to the tables and figures.


## Cutting out the machines

The alpha subjects in `assets/*.webp` are generated by `assets/cut/cutout.py`, which runs the
`isnet-general-use` matting model over a normal photo:

```bash
pip install rembg onnxruntime pillow numpy
python assets/cut/cutout.py source.jpg out.png --largest
```

- `--largest` keeps only the biggest connected blob. Without it the matte cheerfully returns
  offcut lumber and ground debris alongside the subject.
- The script zeroes any alpha below a floor before trimming, otherwise the subject carries a
  grey fringe once it sits on a colour panel.
- Convert to WebP afterwards — the excavator went from 1110KB PNG to 139KB WebP.
- **Always eyeball the result on light, dark AND accent backgrounds.** Matte problems are
  invisible on white and obvious on colour.

Intermediate PNGs and source JPEGs are gitignored; only the WebP outputs are committed.
