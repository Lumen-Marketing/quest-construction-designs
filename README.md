# Quest Construction — Design Directions

Three brutalist homepage directions for **Quest Construction** (general contracting), built as
standalone mockups for review. Nothing here is wired to a live site.

**Open `index.html`** — that is the chooser. Each card is a live, scaled iframe of the real page.

## The three directions

| # | File | Personality | Style |
|---|------|-------------|-------|
| 01 | `direction-1-site-plan.html` | **Site Plan** — layered, editorial. The safest bet. | Dimensional |
| 02 | `direction-2-heavy-plant.html` | **Heavy Plant** — poster wordmark interlocked with a photo card. The risk. | Dimensional |
| 03 | `direction-3-split-bay.html` | **Split Bay** — dark, split hero, cursor-driven photo reveals. | Brutalist |

## Two design languages

The first pass made all three brutalist. That was wrong for 01 and 02 — brutalism is deliberately
flat, which fought the layered depth the reference deck was built on. **01 and 02 were rebuilt;
03 was explicitly left alone.**

### Dimensional (01, 02)

Depth comes from stacking real layers, in this order:

1. faint engineering **grid** on cream
2. big **ghosted machine watermark** at ~6% opacity
3. an **angular accent slab**, offset and slightly skewed
4. a **rounded photo card** sitting on top and breaking that slab's edge
5. a **second photo card** overlapping the first
6. a **floating badge card** with a hard shadow over the lot

Plus: pill buttons, generous radii (`--r` 16px / `--r-lg` 30px), soft layered shadows, skewed
diagonal bar motifs, and a cream hero that drops to dark sections and back.

### Brutalist (03)

Flat by design — chamfered `clip-path` corners, no radius, hard 90° grid, grayscale photography,
accent on whole surfaces only.

## Switching the accent

The three dots in the gallery header change the accent on **all three designs at once, live**:

| Dot | Value | Text on accent |
|-----|-------|----------------|
| Safety Orange | `#FF7A1C` on 01/02, `#FF4A1C` on 03 | white |
| Burnt Clay | `#C4552A` on 01/02, `#A8421C` on 03 | white |
| Hi-Vis Yellow | `#FFC629` on 01/02, `#F5C518` on 03 | black |

The gallery defaults to **Hi-Vis Yellow**, which is what the dimensional directions were designed
against. 01 and 02 also carry a third token, `--acc-dim` — a darker shade used wherever the accent
has to sit as *text on cream*, since the bright tints fail contrast on a light background.

**03 still runs the original, slightly hotter values** because it was deliberately left untouched.
Unifying them is a one-line change to the `P` map at the bottom of `direction-3-split-bay.html`.

Each direction also reads the accent straight off its own URL, so
`direction-2-heavy-plant.html?acc=hivis` opens yellow. Full-screen links inherit whatever dot is
currently selected.

To add or change a colour, edit the `P` map in the small script at the bottom of each direction
file **and** the three `data-acc` buttons in `index.html`.

## Assets

`assets/` holds 19 free Unsplash photos, self-hosted (never hotlinked). All were visually reviewed
before use — one shot was discarded because a hard hat carried another firm's branding.

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

For plain page shots, headless Chrome is enough. Note that Chrome enforces a ~500px minimum window
width, so `--window-size=390` will not give you a true phone viewport — render the page inside a
390px-wide iframe instead.
