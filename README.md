# Quest Construction — Design Directions

Seven homepage directions for **Quest Construction** (general contracting), built as
standalone mockups for review. Nothing here is wired to a live site.

**Open `index.html`** — that is the chooser. Each card is a live, scaled iframe of the real page.

## The seven directions

| # | File | Personality | Style |
|---|------|-------------|-------|
| 01 | `direction-1-site-plan.html` | **Site Plan** — layered, editorial. The safest bet. | Dimensional |
| 02 | `direction-2-heavy-plant.html` | **Heavy Plant** — poster wordmark with the machine cutting through it. The risk. | Dimensional |
| 03 | `direction-3-split-bay.html` | **Split Bay** — dark, split hero, cursor-driven photo reveals. | Brutalist |
| 04 | `direction-4-soft-site.html` | **Soft Site** — warm off-white, blob-masked photography, rounded offer cards. | Organic |
| 05 | `direction-5-ground-break.html` | **Ground Break** — deep green, one giant accent word, concentric pad arc. | Organic |
| 06 | `direction-6-field-journal.html` | **Field Journal** — cream paper, optical serif, overlapping prints. | Organic |
| 07 | `direction-7-bid-desk.html` | **Bid Desk** — clean white, estimate bar on an organic hero sweep. | Organic |

## Three design languages

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

### Organic (04–07)

The second set. All four cut their photography into **organic shapes rather than rectangles**, and
all four run the same section order — the standard high-converting homepage anatomy:

> logo + simple nav → short headline with one stand-out CTA → social proof → about →
> three key offers → lead magnet → content (selected work) → footer

Same skeleton, four different skins, so a reviewer is comparing the *look* and not the layout.
Each still reads as its own site: 04 is warm off-white and rounded, 05 is a deep green poster,
06 is printed cream with an optical serif, 07 is clean white and conversion-shaped.

**The blob discipline.** Organic shape is used as *structure*, never as decoration: it carries the
photographs and the colour fields, while type and grid stay strict. Three techniques do all the
work, no libraries and no images:

1. Lopsided superellipses — `border-radius: 58% 42% 46% 54% / 44% 47% 53% 56%` — as photo masks.
   Every photo on a page gets a **different** silhouette so the shapes never read as a repeated
   motif. Because `border-radius` is animatable, a slow `morph` keyframe makes them breathe.
2. One large accent blob per page as a ground plane, clipped by an `overflow:hidden` parent.
3. Nested concentric blobs for 05's graded-pad arc.

Deliberately avoided: pastel bubbles, gradient mush, and blobs floating loose behind text — all
three are what make organic shapes read as amateur.

## Switching the accent

The three dots in the gallery header change the accent on **all seven designs at once, live**:

| Dot | Value | Text on accent |
|-----|-------|----------------|
| Ochre (default) | `#D9A93C` | near-black |
| Burnt Orange | `#D07C42` | near-black |
| Clay | `#A8543A` | white |

All three are **deliberately muted**. The first pass used fully saturated safety colours
(`#FFC629`, `#FF7A1C`) which are punishing across a full-width hero band — these are desaturated
and warmed toward earth tones instead.

01, 02 and 04–07 also carry a third token, `--acc-dim` — a darker shade used wherever the accent
has to sit as *text on cream*, since even the muted tints fail contrast on a light background.
05 needs a fourth, `--acc-lift`: a lightened tint, because the muted accents are far too dark to
carry a 180px headline on its green ground (clay on green is only ~3:1).

All seven directions share the same values, 03 included. Its layout is untouched; only its
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
- **Do not animate `transform` for scroll reveals.** A `.rv.vis{transform:none}` rule wipes out
  any transform the element needs for its own layout — it broke 07's `translateX(-50%)` estimate
  bar and silently killed every card's hover lift. These pages animate the independent
  `translate` property instead, which composes with `transform` rather than replacing it.


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
