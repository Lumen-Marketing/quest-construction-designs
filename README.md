# Quest Construction — Design Directions

Three brutalist homepage directions for **Quest Construction** (general contracting), built as
standalone mockups for review. Nothing here is wired to a live site.

**Open `index.html`** — that is the chooser. Each card is a live, scaled iframe of the real page.

## The three directions

| # | File | Personality |
|---|------|-------------|
| 01 | `direction-1-site-plan.html` | **Site Plan** — modular, editorial, paper-white. The safest bet. |
| 02 | `direction-2-heavy-plant.html` | **Heavy Plant** — poster brutalism, giant wordmark interlocked with a photo band. The risk. |
| 03 | `direction-3-split-bay.html` | **Split Bay** — dark, split hero, cursor-driven photo reveals. The most premium. |

## Shared design system

All three run the same rules, so the only variable is layout personality:

- **Black + white + one accent.** The accent is used on *whole surfaces* — a full card, a full
  band — never on thin borders.
- **Chamfered corners, never rounded.** Every cut is a hard 45°, done with `clip-path`.
- **Asymmetric grids.** Never 50/50 — 60/40 or 70/30.
- **Photos break their container** and get overlapped by type or a solid block.
- **Oversized condensed caps**, tight tracking, compressed leading, mono for all metadata.
- Grayscale photography throughout so the accent is the only colour that shouts.

## Switching the accent

The three dots in the gallery header change the accent on **all three designs at once, live**:

| Dot | Value | Text on accent |
|-----|-------|----------------|
| Safety Orange | `#FF4A1C` | white |
| Burnt Clay | `#A8421C` | white |
| Hi-Vis Yellow | `#F5C518` | black |

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
