# Quest Construction — ten directions, thirty-one pages each

**Status:** approved in brainstorming, awaiting spec review
**Date:** 2026-08-18

## Summary

Take the real content of the live Quest Construction site (31 pages, recovered from
`questconstruction.rar`) and build it out in all ten design directions in this repo. Each
direction becomes a complete, standalone, deployable 31-page site.

Ten directions × 31 pages = **310 HTML pages**.

Today the repo holds ten *single-page* homepage mockups with anchor-only navigation. This
turns each into a real multi-page site carrying real copy.

## Goals

- Every direction gets all 31 pages, in its own visual idiom.
- All body copy comes from the real site. No invented figures anywhere.
- Each direction folder is independently deployable.
- The client-facing chooser at `index.html` keeps working.
- Every page ships search-ready, as the existing directions already do.

## Non-goals

- Writing new marketing copy. Content is *ported*, not authored. (One exception is
  flagged under Risks and needs a decision.)
- Wiring the contact form to a real endpoint.
- Changing the ten directions' visual identities.

## Decisions taken in brainstorming

| Question | Decision |
|---|---|
| Which direction | All ten |
| Sections with no real content | Drop them |
| Imagery | Download the real Quest photos; stock library covers the rest |
| Location | This repo |
| Existing homepages | Rewrite with real content |
| File structure | Folder per direction |
| Gallery page | Build from the stock library |
| Sequencing | Build all ten straight through |

## Content inventory — what is actually there

This was audited against the extracted archive, not assumed. It is thinner than it first
looked and the plan depends on being honest about it.

| Page group | Count | Real content |
|---|---|---|
| Home | 1 | Hero, 14 service cards, story paragraph, 2 offers, CTA |
| Service — Concrete | 1 | ~790 words. Unique: scope list, quality section, 4 benefits, 6 FAQs |
| Service — other | 13 | ~280 words. Unique: **1–3 sentence intro only** |
| Service area | 11 | ~390 words, **byte-identical except the city name** |
| About | 1 | 2 paragraphs |
| Projects | 1 | 3 items, one line each |
| Gallery | 1 | Heading + one sentence. No images |
| Contact | 1 | Form, phone, one line |
| Sitemap | 1 | Link list |

**Boilerplate shared across all 14 service pages** (service name swapped in): the "Why choose
Quest Construction?" four bullets, the four-step process (Consultation → Planning → Execution →
Inspection), and the closing CTA.

**Boilerplate shared across all 11 area pages** (city name swapped in): every paragraph. The
14-service grid, the "A Community We Proudly Serve" paragraph, "Your Go-To Local Construction
Experts", the six-item capability list, "Commitment to Excellence", and the CTA.

### Facts recovered from the real site

- Phone **(602) 399-6455** (`tel:16023996455`), presented as 24/7.
- Founded **2005** ("shaping dreams since 2005").
- Positioning: **residential** — remodels, ADUs, casitas, exteriors. Family-owned.
- Offer codes `WELCOME10` (10% first project) and `REFER100` ($100 referral).
- An "Email us" link on area pages; no address published anywhere.

### Conflicts with the existing directions

The ten mockups carry placeholder NAP that contradicts the real site. Real content wins:

| Field | Directions say | Real site says | Resolution |
|---|---|---|---|
| Phone | (480) 555-0100 | (602) 399-6455 | Real |
| Founded | est. 2010 | since 2005 | Real |
| Positioning | Commercial / heavy civil, Phoenix | Residential remodel, East Valley | Real |
| Address | 1820 W Buchanan St, Phoenix | not published | **Stays placeholder** |
| ROC licence | ROC #000000 | not published | **Stays placeholder** |
| Ratings | 4.9 from 87 reviews | not published | **Deleted, not carried over** |

## Risks

### R1 — Eleven identical city pages are doorway pages

The 11 area pages differ only by city name. Google's spam policy names this pattern
explicitly. Shipping 110 such pages (11 cities × 10 directions) is a real manual-action risk,
and it is the single biggest liability in this build.

Three ways out, in order of preference:

1. **Write genuinely local content per city** — permit jurisdiction, HOA norms, typical housing
   stock and age, climate-driven build considerations. Roughly 150–200 unique words per city.
   Fixes the problem properly, but it is *authoring new copy*, which is outside the agreed
   "port the content" scope and needs explicit approval.
2. **Keep the pages, canonicalise them** to a single "Areas We Serve" page, so only one is
   indexable. Preserves navigation without competing in search.
3. **Ship as-is with `noindex,follow`** on all area pages. Zero content work, zero risk, zero
   local-SEO benefit.

**Recommendation: option 1** for whichever direction goes live, option 3 for the other nine.
**This is the main open question for spec review.**

### R2 — Thirteen near-identical service pages

Same problem, milder: 1–3 unique sentences per page. The Concrete page shows what a complete
service page looks like. Bringing the other 13 up to that standard is again new authoring.
Deferred to the same decision as R1.

### R3 — Ten sites with identical copy

Now that all ten homepages carry the same real content, the ten head keywords the directions
were built around no longer apply, and ten identical sites would cannibalise each other.

**Resolution:** `d01-site-plan` ships indexable. The other nine get `noindex,follow` via a
single per-direction flag. One line to change when Quest picks a different direction.

### R4 — Dropping invented-figure sections shortens the homepages

"Social proof" and "lead magnet" are two of the five rows in the README's furniture table.
Removing them costs each homepage roughly a third of its length. Accepted; the homepage
becomes hero → services → story → offers → work → CTA, where "work" is the 3 real projects.

## Architecture

Content is data; design is code. 310 hand-authored pages would make a nav change a 310-file
edit.

```
content/
  site.json          NAP, offers, socials, shared strings
  services.json      14 entries
  areas.json         11 entries + the shared area template
  pages.json         home, about, gallery, projects, contact, sitemap
build/
  extract.mjs        one-shot: scraped HTML -> content/*.json
  build.mjs          10 directions × 31 pages -> static HTML
  lib/               schema helpers, head builder, path resolver
  directions/
    d01.mjs … d10.mjs
d01-site-plan/
  index.html
  assets/styles.css
  about-us/index.html
  contact-us/index.html
  gallery/index.html
  projects/index.html
  sitemap/index.html
  services/<slug>/index.html        × 14
  service-areas/<slug>/index.html   × 11
…
d10-cross-cut/
index.html           chooser, repointed
```

Generated HTML is committed. The generator is a dev tool, not a runtime dependency — the
output stays plain static files with no client-side templating, exactly as the repo is today.

`extract.mjs` runs once against the archive and is kept for provenance. Retyping ~20,000 words
by hand is the likeliest source of transcription errors, so it is scripted.

### Direction module interface

Each `directions/dNN.mjs` exports:

```js
export const meta = { slug, name, indexable, accent }
export function head(ctx)      // <head> — title, meta, canonical, OG, JSON-LD
export function nav(ctx)       // multi-page nav in this direction's idiom
export function footer(ctx)
export function home(ctx)
export function service(ctx)   // ctx.service
export function area(ctx)      // ctx.area
export function about(ctx)
export function gallery(ctx)
export function projects(ctx)
export function contact(ctx)
export function sitemap(ctx)
```

`ctx` carries the content, the direction meta, and a `url()` helper so every link resolves
correctly from any depth. All internal links go through `url()` — relative-path bugs across
three directory levels are otherwise guaranteed.

### CSS extraction

Each direction currently inlines ~40KB in a `<style>` block. Across 31 pages that is 1.2MB
duplicated per direction, ~12MB total. Each direction's CSS moves to
`dNN-slug/assets/styles.css`, shared by its 31 pages. The accent-switching script stays inline
and small, and continues to read `?acc=` off the URL.

## New UI: the navbar

Every direction has anchor-only nav today (`#services`, `#work`, `#contact`). All ten need a
real one: 14-item Services dropdown, Areas Served, Projects, Gallery, About, Contact, plus the
phone CTA. Designed per idiom, not bolted on:

| | Nav treatment |
|---|---|
| 01 Site Plan | Floating panel, generous radius, layered shadow |
| 02 Heavy Plant | Ghost-wordmark backdrop, pill links |
| 03 Split Bay | Chamfered flyout, hard 90° grid, no radius |
| 04 Grid North | Mega-panel on the 12-column grid, hairline rules |
| 05 Ground Break | Full-width green drop, one giant accent word |
| 06 Red Iron | Diagonal panel, each item on its own black slab |
| 07 Bid Desk | Clean white dropdown, estimate CTA pinned right |
| 08 Machine Age | Ziggurat-framed panel, brass rules |
| 09 Site Notice | Stapled column on paper, typewriter labels |
| 10 Cross Cut | Notched steel flyout with an accent hairline |

## Inner-page furniture

Same rule as the README's existing table: shared section order, different components. No cell
may duplicate another.

**Service page** — hero → intro → why-choose → process → (FAQ, Concrete only) → CTA

| | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|
| Process | Layered cards, hard shadow | Machine-cut numbered band | Chamfered plates | Numbered rows on the grid | Concentric arc steps |
| Why-choose | Floating badge cards | Ghost-numeral list | Flat 2×2 blocks | Hairline-ruled columns | Chunky green cards |
| FAQ | Soft accordion | Skewed bar rows | Chamfered toggles | Hairline rows, no chrome | Colour-field panels |

| | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|
| Process | Rotated slabs | Spec cards in a rail | Ziggurat arches | Stapled index cards | Chevrons riding a slash |
| Why-choose | Halftone parallelograms | Checklist card | Symmetrical brass lozenges | Torn strip, `××` separated | Notched steel plates |
| FAQ | Black-slab questions | Plain utility accordion | Ornamental centred panel | Typewriter Q&A on clean paper | Expanding cut panes |

**Area page** — hero → 14-service grid → local copy → capability list → CTA. Full 10-column
table to be filled during implementation, following the same no-duplicate-cells rule.

**About / Projects / Gallery / Contact / Sitemap** — each reuses that direction's established
motifs. Gallery is built from the 21-photo stock library and labelled placeholder photography.

## SEO

Every page carries what the directions already carry, per-page rather than per-direction:

- Unique `<title>` ≤60 chars, `<meta description>` ≤155, self-referencing canonical.
- OG + Twitter `summary_large_image` against the 1200×630 JPEGs in `assets/og/`.
- JSON-LD, page-type aware:
  - Home → `GeneralContractor` + `WebSite` + `WebPage` + `BreadcrumbList`
  - Service → `Service` with `provider`, plus `BreadcrumbList`
  - Concrete → additionally `FAQPage` (it has six real FAQs)
  - Area → `GeneralContractor` with `areaServed`, plus `BreadcrumbList`
  - Contact → `ContactPage`
- Real NAP throughout: (602) 399-6455, Arizona, since 2005. **No `aggregateRating` node** —
  Quest has no published reviews and marking up ratings that cannot be evidenced is a
  manual-action risk.
- `<main id="main">`, skip link, alt text, intrinsic `width`/`height`, lazy below the fold,
  eager + preload on the LCP hero.
- `sitemap.xml` regenerated for whichever direction is indexable; `robots.txt` updated.

## Assets

The five real images download cleanly from ImageKit and become WebP in `assets/quest/`:

| File | Use |
|---|---|
| `logo.webp` | Brand mark, header and footer |
| `hero.webp` | Home hero |
| `story.webp` | About / story section |
| `contact.webp` | Contact hero |
| `spare.webp` | Spare, currently unreferenced |

The existing 21-photo library covers everything else. `assets/plans.webp` stays unused — it
carries a visible third-party logo, as the README records.

## Chooser

`index.html` keeps its ten cards, its three accent dots and its live scaled iframes. Each
`src` is repointed from `direction-N-name.html` to `dNN-slug/index.html`. The old paths are
removed rather than stubbed — nothing external links to them.

## Verification

The existing CDP helpers in `shots/` still apply, with one addition: a link checker walking all
310 pages for unresolved hrefs and missing images. At three directory levels deep with
generated relative paths, broken links are the most likely defect class.

Per direction, spot-check with `probe.mjs`: home, one service, one area, contact. That is the
set of distinct templates.

## Open questions for review

1. **R1 / R2 — do I author unique local and per-service copy, or canonicalise and `noindex`?**
   This is the one decision that changes scope materially.
2. Confirm `d01-site-plan` as the indexable direction.
3. Is there a real email address and street address to use, or do those stay placeholder?
