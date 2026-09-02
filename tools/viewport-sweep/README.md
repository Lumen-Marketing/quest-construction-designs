# Viewport sweep

Renders the built site in headless Chrome at real viewport sizes and reports
anything that leaves the screen. Needs Chrome and nothing else — no npm, no
Playwright, in keeping with the rest of this repo.

```
node build/site/build-site.mjs          # sweep reads site/, so build it first
python tools/viewport-sweep/sweep.py            # both passes
python tools/viewport-sweep/sweep.py widths     # 27 widths, 320 to 2560
python tools/viewport-sweep/sweep.py devices    # 17 geometries incl. landscape
```

Exit code is 0 when clean.

## Why it is built this way

Two things about Chrome make the obvious approach wrong, and both cost an
afternoon to find:

**Chrome will not open a window narrower than 500px.** `--window-size=320,800`
silently gives you a 500px viewport, so a naive sweep tests 500px and reports
that the phone layout is fine. The pages are loaded in an **iframe** sized to
the width under test instead. An iframe has a viewport of its own and the media
queries inside it answer to the iframe's width, which is what responsive design
mode does.

**The pages are served over HTTP, not opened from disk.** `404.html` links its
stylesheet and its whole navigation with root-absolute paths — which is correct,
because a 404 is served at whatever URL the visitor mistyped, and a relative
path would resolve against that. On `file://` those paths resolve to the drive
root, so the first run of this reported the 404 page as having no CSS at all.
That was the tool being wrong, not the site.

## What it reports

| | |
|---|---|
| `h-scroll` | The document is wider than the window. The bug people mean by "not responsive". |
| `overflow` | An element's box crosses an edge with nothing scrolling it. What causes `h-scroll`, named. |
| `clipped` | Text wider than its box **and inside something that cuts it off**. The clipping-ancestor test is load-bearing: without it every rotated pseudo-element reports, because a 6px square turned 45° paints 3px wider than its layout box and is not clipped at all. The nav caret does exactly that. |
| `bleed` | Everything leaving the viewport, with the ancestor responsible. To be read, not counted — see below. |
| small targets | Interactive boxes under 44px. This site's own bar is **24px**, which is the WCAG 2.2 AA threshold; 44px is the Apple HIG figure and is printed for information, not as a failure. |
| tiny text | Under 11.5px, which the stylesheet names as the floor for a phone. |

`bleed` is expected in exactly three components and nowhere else:

- `nav.strip` — the marquee, a continuous scroller
- `.svctabs .wrap` — the trade rail, `overflow-x:auto` with scroll-snap and a
  mask fade at its edge
- `.showcase-view` — the gallery's large frame, a scroll-snap track holding
  every photograph in the stage. The caption reported is the next figure's,
  waiting off to the right of the one on screen. The thumbnail rail under it
  does **not** appear here: it is a marquee on `overflow:hidden`, so its frames
  are clipped rather than bleeding.

Anything else in that column is a finding.

## What the first full run found

Swept 2026-09-02 against 17 page kinds — one of every layout the builder makes,
plus the longest trade name and the 404 — at 27 widths and 17 device
geometries.

No page scrolled sideways at any size. Four real defects, all in the
stylesheet, all fixed and pinned by tests in `build/directions/d01.test.mjs`:

1. **The display word in `.bigband` was sized off the raw viewport** (`118vw /
   --len`) while the wrap it sits in stops growing at 1400px. Above about
   1800px the word kept widening: "DETAIL SHOTS" measured 1374px inside a
   1280px box and `overflow:hidden` took a letter off each end. The same
   formula's 38px floor broke the other end — under about 420px it overrode
   the fit, and "FRAMING TO FINISH" came out 379px wide in a 276px band. It is
   measured against the wrap now.
2. **The FAQ toggle was a quarter of the box it drew.** The padding was on the
   `<details>`, and only a `<summary>` toggles, so the card looked like a 64px
   button of which the middle 24px answered a tap.
3. **The marquee's links were a 19px line box** centred in a 56px band, under
   the site's own 24px bar. They fill the band now.
4. **The two grouped-menu headings never joined the phone type bump.** They
   were written after that selector list, so the footer's valley and trade
   labels stayed at 10px on a phone — the exact size the rule exists to fix.

One fix could not be measured and was reasoned instead: iOS Safari inflates the
text of a wide block in landscape on its own initiative, and Chrome never does,
so no width in this ladder would ever catch it. `text-size-adjust:100%` is
pinned on `html`.
