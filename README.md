# Quest Construction — Design Directions

Nine homepage directions for **Quest Construction** (general contracting), built as
standalone mockups for review. Nothing here is wired to a live site.

**Open `index.html`** — that is the chooser. Each card is a live, scaled iframe of the real page.

## The nine directions

| # | File | Personality | Style |
|---|------|-------------|-------|
| 01 | `direction-1-site-plan.html` | **Site Plan** — layered, editorial. The safest bet. | Dimensional |
| 02 | `direction-2-heavy-plant.html` | **Heavy Plant** — poster wordmark with the machine cutting through it. The risk. | Dimensional |
| 03 | `direction-3-split-bay.html` | **Split Bay** — dark, split hero, cursor-driven photo reveals. | Brutalist |
| 04 | `direction-4-grid-north.html` | **Grid North** — visible 12-column grid, hairline rules, numbered rows. | Swiss |
| 05 | `direction-5-ground-break.html` | **Ground Break** — deep green, one giant accent word, concentric pad arc. | Colour field |
| 06 | `direction-6-red-iron.html` | **Red Iron** — diagonal wedges, halftone photography, angled mosaic. | Constructivist |
| 07 | `direction-7-bid-desk.html` | **Bid Desk** — clean white, estimate bar on an organic hero sweep. | Utility |
| 08 | `direction-8-machine-age.html` | **Machine Age** — symmetrical, ziggurat frames, sunburst, brass on charcoal. | Art Deco |
| 09 | `direction-9-site-notice.html` | **Site Notice** — stapled flyers, tape, xerox halftone, tear-off tabs. | Punk / xerox |

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

### Named styles (04–09)

The second set. **04 and 06 replace an earlier pair (Soft Site and Field Journal) that read too
soft.** Each of these six takes one named style out of the graphic-design canon and commits to it
rather than blending several:

- **04 Grid North — Swiss / International Typographic.** One typeface (Schibsted Grotesk) at
  several weights on a visible 12-column grid. Flush left, ragged right, hairline rules instead of
  boxes, no radius, no shadows, deliberate empty space. The accent is the only colour on the page.
- **05 Ground Break — bold colour field.** Deep excavated-earth green, one oversized accent word,
  a concentric organic arc reading as a graded pad from above.
- **06 Red Iron — Constructivist / Bauhaus.** Everything on a diagonal: photographs cut as
  parallelograms, blocks rotated against each other, heavy condensed slab-grotesk stacked hard,
  and photography printed as CSS **halftone** rather than shown straight.
- **07 Bid Desk — clean utility.** White, an estimate bar straddling an organic hero sweep,
  everything pointing at one form.
- **08 Machine Age — Art Deco.** Symmetrical about a centre line, strong verticals, stepped
  ziggurat `clip-path` frames, hairline double rules with a brass lozenge, a `repeating-conic-gradient`
  sunburst. The style of the era that actually built the skyscrapers.
- **09 Site Notice — punk / xerox cut-and-paste.** Everything is a thing stuck to a hoarding:
  flyers stapled at angles, tape strips, a rubber stamp, typewriter captions, photographs blown out
  on a bad photocopier. Body copy always sits on clean paper so it stays readable.

## One skeleton, nine sets of furniture

04–09 all run the same section order — the standard high-converting homepage anatomy:

> logo + simple nav → short headline with one stand-out CTA → social proof → about →
> three key offers → lead magnet → content (selected work) → footer

**The order is shared; the components are not.** An earlier pass kept the order *and* reused the
same parts in every direction — a strip of pills, photo-beside-text, three cards in a row, a dark
box with a rotated booklet, a row of work cards. Four different paint jobs on one page. That was
the right criticism and this table is the fix:

| Section | 04 Grid North | 05 Ground Break | 06 Red Iron | 07 Bid Desk | 08 Machine Age | 09 Site Notice |
|---|---|---|---|---|---|---|
| Social proof | Data table | Cream band of pills | Diagonal marquee | Floating pill cluster | Chevron-divided rail | Torn strip, `××` separated |
| About | Full-bleed band, then 2 columns | Photo beside text | Angled photo, text overlapping | Photo cluster beside text | Symmetrical, ziggurat photo centred | Torn sheet + stapled photo |
| Offers | Numbered **rows** | 3 chunky cards | Asymmetric mosaic | 3 spec cards | 3 ziggurat arches | 3 stapled flyers |
| Lead magnet | Type-only accent band | Cream plate + booklet | Diagonal black band | Contents list, no booklet | Ornamental centred panel | A literal site notice with tear-off tabs |
| Work | Index **table** | 4 cards in a row | Overlapping angled collage | 3 spec cards | Vertical stepped tiles | Photocopied contact sheet |

If a new direction is added, fill in a new column here first. Anything that duplicates an existing
cell should be redesigned before it ships.

## Switching the accent

The three dots in the gallery header change the accent on **all nine designs at once, live**:

| Dot | Value | Text on accent |
|-----|-------|----------------|
| Ochre (default) | `#D9A93C` | near-black |
| Burnt Orange | `#D07C42` | near-black |
| Clay | `#A8543A` | white |

All three are **deliberately muted**. The first pass used fully saturated safety colours
(`#FFC629`, `#FF7A1C`) which are punishing across a full-width hero band — these are desaturated
and warmed toward earth tones instead.

01, 02 and 04–09 also carry a third token, `--acc-dim` — a darker shade used wherever the accent
has to sit as *text on cream*, since even the muted tints fail contrast on a light background.
05 needs a fourth, `--acc-lift`: a lightened tint, because the muted accents are far too dark to
carry a 180px headline on its green ground (clay on green is only ~3:1).

All nine directions share the same values, 03 included. Its layout is untouched; only its
palette map was updated, so the colour dots do the same thing on every card.

Each direction also reads the accent straight off its own URL, so
`direction-2-heavy-plant.html?acc=hivis` opens yellow. Full-screen links inherit whatever dot is
currently selected.

To add or change a colour, edit the `P` map in the small script at the bottom of each direction
file **and** the three `data-acc` buttons in `index.html`.

## Assets

`assets/` holds 19 free Unsplash photos, self-hosted (never hotlinked). All were visually reviewed
before use — one shot was discarded because a hard hat carried another firm's branding.

**Do not use `assets/plans.jpg`.** It has the same problem: the subject's polo carries a visible
"KRA" logo. It is unreferenced by every direction and should stay that way.

**No stock video.** The "watch" plates in Direction 3 are stills with a play control, which is what
the reference designs actually use. Pexels' video IDs are not guessable and every candidate that
resolved turned out to be unrelated footage.

## Placeholders to replace before this goes anywhere near production

- All body copy is written-to-fit placeholder.
- Phone `(480) 555-0100`, email `build@questconstruction.com`, `ROC #000000`.
- Every figure (340+ projects, 16 years, 96% on schedule, 4.9/87 reviews, plant counts) is invented.
- Stock photography stands in for real Quest jobsite photos.

## Verifying changes

`shots/click.mjs` drives a real click on the gallery's palette dots over CDP and screenshots the
result — useful because the accent swap is the one thing a static screenshot cannot prove:

```bash
cd shots && node click.mjs palHivis ./out.png    # palOrange | palClay | palHivis
```

Three more CDP helpers, all taking a path relative to `shots/`:

```bash
node page.mjs    ../direction-4-soft-site.html ./d4.png 1440   # full-page shot, scrolls first
node probe.mjs   ../direction-4-soft-site.html 1440            # fast layout check, no screenshot
node inspect.mjs ../direction-7-bid-desk.html ".deskbar" 1440  # computed styles for one selector
```

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
