# Quest Construction Multi-Page Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real Quest Construction site content out to 31 pages in each of the ten design directions — 310 static pages — from a content-as-data generator.

**Architecture:** A one-shot extractor parses the scraped archive into `content/*.json`. A zero-dependency Node generator walks ten direction modules × 31 pages and writes static HTML into `dNN-slug/` folders. Each direction module owns its own markup and shares one extracted stylesheet across its 31 pages. Generated HTML is committed; the generator is a dev tool, never a runtime dependency.

**Tech Stack:** Node 24 ESM (`.mjs`, no `package.json`, no npm dependencies), `node:test` + `node:assert/strict` for tests, existing `shots/*.mjs` CDP helpers for visual verification.

**Spec:** `docs/superpowers/specs/2026-08-18-quest-multi-page-site-design.md`

---

## STATUS — resume here (last updated 2026-08-18)

**Done and pushed. 143 tests green, 124 pages, 0 broken links, 0 dead anchors.**

| Task | State |
|---|---|
| 1–8 Content pipeline and generator | Complete |
| 9–13 Direction 01 + link checker | Complete — 31 pages, the worked reference |
| 14 Direction 02 Heavy Plant | Complete — 31 pages |
| 15 Direction 03 Split Bay | Complete — 31 pages |
| 16 Direction 04 Grid North | Complete — 31 pages |
| 17–22 Directions 05–10 | **Not started.** Stylesheets extracted only |
| 23 Repoint the chooser | Not started |
| 24 Sitemap, robots, README | Not started |
| 25 Full-site verification | Not started |

`d05-ground-break/` … `d10-cross-cut/` each already contain `assets/styles.css`
(extracted and asset-path-rewritten). They have **no** `build/directions/dNN.mjs`,
so `node build/build.mjs` skips them with "not yet written".

### How to resume

Read `build/directions/d01.mjs` as the reference implementation and
`build/directions/all.test.mjs` for the contract every direction must satisfy.
Then, per direction:

1. Learn its vocabulary — the extracted stylesheet is the source of truth:
   `grep -oE '^[^{@/][^{]*\{' dNN-slug/assets/styles.css | sed 's/{$//' | tr ',' '\n' | sort -u`
   and read `:root` for its tokens. **Reuse its existing class names**; only add
   CSS for furniture the single-page mockup never had.
2. Write `build/directions/dNN.mjs` against the module contract (Task 7), taking
   that direction's row from the furniture tables in Tasks 14–22.
3. Write `build/css/dNN.css` and append it:
   `cat build/css/dNN.css >> dNN-slug/assets/styles.css`
4. `node build/build.mjs dNN && node build/check-links.mjs dNN-slug`
5. `node --test "build/**/*.test.mjs"`
6. Render and **look at it** — `cd shots && node page.mjs ../dNN-slug/contact-us/index.html ./x.png 1440`

### Corrections already applied to this plan — do not reintroduce

- **The CLI guard.** `import.meta.url === \`file://${process.argv[1]}\`` never matches on
  Windows. Use `process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href`.
- **`node --test build/` does not work** on Node 24 — it resolves `build` as a module.
  Use `node --test "build/**/*.test.mjs"`.
- **Directions 04–10 use `.rv.is-in`**, not `.rv.in`, and ship `.burger` / `.nlinks`
  rather than a bespoke toggle. 01–03 use `.rv.in`.
- **Animate `translate`, never `transform`, for reveals.** `transform:none` on the
  revealed state outranks `:hover` transforms at equal specificity and silently kills
  every hover lift.
- **`.fg a` (0,1,1) outranks `.btn` (0,1,0)** whatever the source order. Footer buttons
  need `.fg a.btn` or they collapse to `display:block`.
- **`aspect-ratio` needs `height:auto`.** Every `<img>` carries intrinsic `width`/`height`
  attributes; with `width:100%` and no CSS height, both dimensions are set and
  `aspect-ratio` is ignored entirely.
- **Restate colours when moving a component between light and dark sections.** Components
  styled only for one ground inherit the wrong text colour on the other.
- **Harness artefacts, not bugs:** `probe.mjs` reports lazy below-fold images as broken,
  and `mob.mjs` does not scroll so `.rv` content reads as blank. Judge overflow by
  `scrollW` vs `vw` (or `sideways`), not by the `wide` list — several heroes bleed
  deliberately inside `overflow:hidden`. Full-page shots of long pages can exceed the
  120s tool timeout; shoot `contact-us` instead, it exercises nav, hero, form and footer.

### Open items for Quest, carried from the spec

- `content/areas-local.json` is marked **UNVERIFIED** and must be reviewed before launch —
  specifically the permitting authority named for each city.
- Address, ROC number and email remain unpublished, so no `PostalAddress` and no
  `aggregateRating` appear in any schema. Do not add them without real values.
- Only `d01-site-plan` is indexable; the other nine are `noindex,follow`.

---

## Global Constraints

- **Zero dependencies.** No `package.json`, no `npm install`. Node built-ins only. The repo is dependency-free today and stays that way.
- **All scripts are ESM `.mjs`** run directly: `node build/build.mjs`.
- **Source archive** is extracted at `C:/Users/tagal/AppData/Local/Temp/claude/c--Users-tagal-quest-construction-designs/344aca41-3005-4543-8747-109a911f2ce9/scratchpad/qc/questconstruction`. Referenced by the `QUEST_SRC` constant in `build/extract.mjs`, defined once.
- **Real NAP, used verbatim everywhere:** phone `(602) 399-6455`, `tel:16023996455`, E.164 `+1-602-399-6455`. Founded **2005**. Region Arizona.
- **No street address, no ROC number, no email, no ratings** in any generated page or any JSON-LD node. Quest has not published them. Never emit a `PostalAddress` or `aggregateRating`.
- **No invented figures.** No project counts, years-in-business counts, percentages, or review numbers anywhere.
- **Ten direction slugs**, fixed: `d01-site-plan`, `d02-heavy-plant`, `d03-split-bay`, `d04-grid-north`, `d05-ground-break`, `d06-red-iron`, `d07-bid-desk`, `d08-machine-age`, `d09-site-notice`, `d10-cross-cut`.
- **Only `d01-site-plan` is indexable.** Every other direction emits `<meta name="robots" content="noindex,follow">`.
- **Canonical origin** is `https://questconstruction.com`, defined once as `ORIGIN` in `build/lib/url.mjs`.
- **Shared photography lives at repo-root `assets/`** and is never duplicated into direction folders. Only `assets/styles.css` is per-direction.
- **`assets/plans.webp` must never be referenced** — it carries a visible third-party logo.
- **Titles ≤60 characters, meta descriptions ≤155 characters.** Enforced by a test, not by eye.
- **Every internal link goes through the `url()` / `asset()` helpers.** Never hand-write a relative path.

---

## File Structure

| Path | Responsibility |
|---|---|
| `build/lib/html.mjs` | Entity decoding, tag stripping, section extraction from source HTML |
| `build/lib/url.mjs` | `ORIGIN`, page-key → relative path resolution, canonical URLs |
| `build/lib/head.mjs` | `<head>` assembly: title, meta, OG, Twitter, canonical, robots |
| `build/lib/schema.mjs` | JSON-LD graph builders, one per page type |
| `build/lib/pages.mjs` | The 31-page manifest: which pages exist and their metadata |
| `build/extract.mjs` | One-shot: archive HTML → `content/*.json` |
| `build/build.mjs` | Orchestrator: 10 directions × 31 pages → written files |
| `build/check-links.mjs` | Walks generated output for broken hrefs and missing images |
| `build/directions/d01.mjs` … `d10.mjs` | Per-direction renderers |
| `content/site.json` | NAP, offers, shared strings |
| `content/services.json` | 14 services |
| `content/areas.json` | 11 areas + shared area copy |
| `content/pages.json` | home, about, gallery, projects, contact, sitemap |
| `dNN-slug/**` | Generated output, committed |

---

### Task 1: HTML parsing helpers

**Files:**
- Create: `build/lib/html.mjs`
- Test: `build/lib/html.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces: `decode(s) -> string`, `stripTags(s) -> string`, `text(s) -> string`, `matchAll(html, re, group=1) -> string[]`, `section(html, className) -> string|null`

- [ ] **Step 1: Write the failing test**

```js
// build/lib/html.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decode, stripTags, text, matchAll, section } from './html.mjs';

test('decode resolves the entities the archive actually contains', () => {
  assert.equal(decode('you&#x27;ll'), "you'll");
  assert.equal(decode('Consultation &amp; Estimate'), 'Consultation & Estimate');
  assert.equal(decode('a &lt;b&gt; c'), 'a <b> c');
  assert.equal(decode('&quot;x&quot;'), '"x"');
  assert.equal(decode('Learn more &#8594;'), 'Learn more →');
  assert.equal(decode('plain'), 'plain');
});

test('stripTags removes markup but keeps the words apart', () => {
  assert.equal(stripTags('<p>one</p><p>two</p>'), 'one two');
  assert.equal(stripTags('<a href="x">link</a>'), 'link');
});

test('text strips, decodes and collapses whitespace', () => {
  assert.equal(text('  <p>you&#x27;ll   see</p>\n<p>it</p> '), "you'll see it");
});

test('matchAll returns every capture of a global pattern', () => {
  const html = '<li>a</li><li>b</li><li>c</li>';
  assert.deepEqual(matchAll(html, /<li>(.*?)<\/li>/g), ['a', 'b', 'c']);
});

test('matchAll returns an empty array when nothing matches', () => {
  assert.deepEqual(matchAll('<p>x</p>', /<li>(.*?)<\/li>/g), []);
});

test('section extracts one section element by class, and null when absent', () => {
  const html = '<section class="section prose"><h2>Hi</h2></section><section class="cta">Go</section>';
  assert.match(section(html, 'prose'), /<h2>Hi<\/h2>/);
  assert.match(section(html, 'cta'), /Go/);
  assert.equal(section(html, 'nope'), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/lib/html.test.mjs`
Expected: FAIL — `Cannot find module './html.mjs'`

- [ ] **Step 3: Write minimal implementation**

```js
// build/lib/html.mjs
// Parsing helpers for the scraped Quest archive. Deliberately regex-based:
// the source is machine-generated, uniformly structured HTML, and pulling in a
// DOM parser would break the repo's zero-dependency rule for no gain.

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#x27;': "'", '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  '&#8594;': '→', '&rarr;': '→', '&#8212;': '—', '&mdash;': '—',
  '&#8211;': '–', '&ndash;': '–', '&#9670;': '◆',
};

export function decode(s) {
  return String(s).replace(/&(?:#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m) => {
    if (ENTITIES[m]) return ENTITIES[m];
    const hex = /^&#x([0-9a-fA-F]+);$/.exec(m);
    if (hex) return String.fromCodePoint(parseInt(hex[1], 16));
    const dec = /^&#(\d+);$/.exec(m);
    if (dec) return String.fromCodePoint(Number(dec[1]));
    return m;
  });
}

export function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, ' ');
}

export function text(s) {
  return decode(stripTags(s)).replace(/\s+/g, ' ').trim();
}

export function matchAll(html, re, group = 1) {
  return [...String(html).matchAll(re)].map((m) => m[group]);
}

export function section(html, className) {
  const re = new RegExp(
    `<section[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</section>`,
  );
  const m = re.exec(String(html));
  return m ? m[1] : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test build/lib/html.test.mjs`
Expected: PASS, 6 tests

- [ ] **Step 5: Commit**

```bash
git add build/lib/html.mjs build/lib/html.test.mjs
git commit -m "Add HTML parsing helpers for the archive extractor"
```

---

### Task 2: Extract services and areas from the archive

**Files:**
- Create: `build/extract.mjs`
- Create: `content/services.json`, `content/areas.json` (generated output, committed)
- Test: `build/extract.test.mjs`

**Interfaces:**
- Consumes: `build/lib/html.mjs` — `text`, `matchAll`, `section`
- Produces: `content/services.json` as `Service[]` where
  `Service = { slug, name, shortDesc, h1, subheroTagline, intro: string[], whyChoose: string[], process: {n, title, body}[], scope?: {title, body}[], quality?: string, faqs?: {q, a}[], ctaHeading, ctaBody }`
  and `content/areas.json` as `{ template: {...}, areas: {slug, name, city}[] }`

- [ ] **Step 1: Write the failing test**

```js
// build/extract.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractServices, extractAreas } from './extract.mjs';

test('extracts all fourteen services', () => {
  const s = extractServices();
  assert.equal(s.length, 14);
  assert.deepEqual(
    s.map((x) => x.slug).sort(),
    ['adu', 'casita', 'concrete', 'custom-home-building',
     'deck-building-uses-trex-system', 'dry-wall', 'framing',
     'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops',
     'painting', 'residential-development', 'roofing', 'siding',
     'stucco', 'window-installation'].sort(),
  );
});

test('every service carries the boilerplate four-step process and four why-choose bullets', () => {
  for (const s of extractServices()) {
    assert.equal(s.process.length, 4, `${s.slug} process`);
    assert.equal(s.whyChoose.length, 4, `${s.slug} whyChoose`);
    assert.deepEqual(s.process.map((p) => p.n), [1, 2, 3, 4]);
  }
});

test('every service has a non-empty unique intro and no leftover entities', () => {
  const seen = new Set();
  for (const s of extractServices()) {
    assert.ok(s.intro.length >= 1, `${s.slug} has intro`);
    assert.ok(s.intro[0].length > 40, `${s.slug} intro is substantive`);
    assert.doesNotMatch(s.intro.join(' '), /&[a-z#0-9]+;/i, `${s.slug} decoded`);
    assert.ok(!seen.has(s.intro[0]), `${s.slug} intro is unique`);
    seen.add(s.intro[0]);
  }
});

test('concrete is the one service carrying FAQs and a scope list', () => {
  const s = extractServices();
  const withFaqs = s.filter((x) => x.faqs && x.faqs.length);
  assert.equal(withFaqs.length, 1);
  assert.equal(withFaqs[0].slug, 'concrete');
  assert.equal(withFaqs[0].faqs.length, 6);
  assert.ok(withFaqs[0].scope.length >= 4);
});

test('extracts eleven areas with a shared template', () => {
  const a = extractAreas();
  assert.equal(a.areas.length, 11);
  assert.ok(a.areas.every((x) => x.name.endsWith(', AZ')));
  assert.ok(a.template.community.includes('{{city}}'),
    'city is tokenised so the template is provably shared');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/extract.test.mjs`
Expected: FAIL — `Cannot find module './extract.mjs'`

- [ ] **Step 3: Write the implementation**

```js
// build/extract.mjs
// One-shot: reads the recovered questconstruction.com archive and writes
// content/*.json. Kept in the repo for provenance — rerunning it must be
// idempotent. Retyping ~20,000 words by hand is the likeliest source of
// transcription error, which is why this is scripted.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { text, matchAll, section } from './lib/html.mjs';

export const QUEST_SRC =
  'C:/Users/tagal/AppData/Local/Temp/claude/c--Users-tagal-quest-construction-designs/' +
  '344aca41-3005-4543-8747-109a911f2ce9/scratchpad/qc/questconstruction';

const read = (...p) => readFileSync(join(QUEST_SRC, ...p), 'utf8');
const main = (html) => /<main>([\s\S]*?)<\/main>/.exec(html)[1];

export function extractServices() {
  return readdirSync(join(QUEST_SRC, 'services')).map((slug) => {
    const m = main(read('services', slug, 'index.html'));

    const sub = section(m, 'subhero');
    const h1 = text(/<h1>([\s\S]*?)<\/h1>/.exec(sub)[1]);
    const subheroTagline = text(/<p>([\s\S]*?)<\/p>/.exec(sub)[1]);

    const prose = section(m, 'prose');
    const intro = matchAll(prose, /<p>([\s\S]*?)<\/p>/g).map(text);
    const whyChoose = matchAll(prose, /<li>([\s\S]*?)<\/li>/g).map(text);

    const procBlock = /<div class="process">([\s\S]*?)<\/div>\s*<\/section>/.exec(m);
    const process = procBlock
      ? [...procBlock[1].matchAll(
          /<span>(\d+)<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>/g)]
          .map((x) => ({ n: Number(x[1]), title: text(x[2]), body: text(x[3]) }))
      : [];

    const cta = section(m, 'cta');
    const svc = {
      slug,
      name: nameFor(slug),
      shortDesc: shortDescFor(slug),
      h1, subheroTagline, intro, whyChoose, process,
      ctaHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(cta)[1]),
      ctaBody: text(/<p>([\s\S]*?)<\/p>/.exec(cta)[1]),
    };

    const faqSection = section(m, 'faq');
    if (faqSection) {
      svc.faqs = [...faqSection.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)]
        .map((x) => ({ q: text(x[1]), a: text(x[2]) }));
      const scopeUl = /<h3>Complete Range[\s\S]*?<ul>([\s\S]*?)<\/ul>/.exec(m);
      svc.scope = scopeUl
        ? matchAll(scopeUl[1], /<li>([\s\S]*?)<\/li>/g).map((li) => {
            const t = text(li);
            const i = t.indexOf(':');
            return i > 0
              ? { title: t.slice(0, i).trim(), body: t.slice(i + 1).trim() }
              : { title: t, body: '' };
          })
        : [];
    }
    return svc;
  });
}

// The manifest the archive shipped is the authority for display names and the
// one-line descriptions used on cards — they are not repeated in page bodies.
const MANIFEST = JSON.parse(readFileSync(join(QUEST_SRC, 'manifest.json'), 'utf8'));
const nameFor = (slug) => MANIFEST.services.find((s) => s.slug === slug).name;
const shortDescFor = (slug) => MANIFEST.services.find((s) => s.slug === slug).description;

export function extractAreas() {
  const areas = MANIFEST.areas.map((a) => ({
    slug: a.slug, name: a.name, city: a.name.replace(/,\s*AZ$/, ''),
  }));

  // Every area page is byte-identical bar the city name, so one page is read
  // and the city is tokenised back out. The test asserts the token survives —
  // that is what proves the pages really are a shared template.
  const m = main(read('service-areas', 'mesa-az', 'index.html'));
  const tok = (s) => s.replace(/Mesa/g, '{{city}}');
  const ps = matchAll(m, /<p>([\s\S]*?)<\/p>/g).map(text);
  const h2s = matchAll(m, /<h2>([\s\S]*?)<\/h2>/g).map(text);
  const long = ps.filter((p) => p.length > 120);

  return {
    template: {
      h1: tok(text(/<h1>([\s\S]*?)<\/h1>/.exec(m)[1])),
      tagline: tok(ps[0]),
      servicesHeading: tok(h2s.find((h) => /Professional Construction Services/.test(h))),
      communityHeading: tok(h2s.find((h) => /Community We Proudly Serve/.test(h))),
      community: tok(long[0]),
      localHeading: tok(h2s.find((h) => /Go-To Local/.test(h))),
      local: tok(long[1]),
      capabilities: matchAll(m, /<li>([\s\S]*?)<\/li>/g).map(text)
        .filter((li) => !/Learn more/.test(li)),
      commitmentHeading: tok(h2s.find((h) => /Commitment to Excellence/.test(h))),
      commitment: tok(long[2]),
      ctaHeading: tok(text(/<h2>([\s\S]*?)<\/h2>/.exec(section(m, 'cta'))[1])),
      ctaBody: tok(ps.find((p) => /Contact Quest Construction now/.test(p))),
    },
    areas,
  };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  mkdirSync('content', { recursive: true });
  const w = (f, d) => writeFileSync(`content/${f}`, JSON.stringify(d, null, 2) + '\n');
  w('services.json', extractServices());
  w('areas.json', extractAreas());
  console.log('wrote content/services.json, content/areas.json');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test build/extract.test.mjs`
Expected: PASS, 5 tests. If the concrete FAQ or scope selectors miss, inspect with
`node -e "import('./build/extract.mjs').then(m=>console.log(m.extractServices().find(s=>s.slug==='concrete')))"`
and adjust the regex — do not loosen the assertions.

- [ ] **Step 5: Generate the content files**

Run: `node build/extract.mjs`
Expected: `wrote content/services.json, content/areas.json`

- [ ] **Step 6: Commit**

```bash
git add build/extract.mjs build/extract.test.mjs content/services.json content/areas.json
git commit -m "Extract the fourteen services and eleven areas from the archive"
```

---

### Task 3: Site-level content and the remaining six pages

**Files:**
- Create: `content/site.json`
- Create: `content/pages.json`
- Modify: `build/extract.mjs` — add `extractPages()`
- Test: `build/extract.test.mjs` — add cases

**Interfaces:**
- Consumes: Task 2's `QUEST_SRC`, `main()`, helpers
- Produces: `content/site.json` and `content/pages.json`, both read by `build/build.mjs`

- [ ] **Step 1: Write `content/site.json` by hand**

This one is authored, not extracted — it reconciles the archive's facts against the
mockups' placeholders. Every value here is from the real site.

```json
{
  "name": "Quest Construction",
  "legalName": "Quest Construction LLC",
  "tagline": "From Concept to Creation",
  "phoneDisplay": "(602) 399-6455",
  "phoneHref": "tel:16023996455",
  "phoneE164": "+1-602-399-6455",
  "availability": "24/7",
  "foundingYear": "2005",
  "region": "AZ",
  "regionName": "Arizona",
  "footerBlurb": "Expert craftsmanship for construction, remodeling, and home improvement projects across Arizona.",
  "positioning": "Local, family-owned experts in quality building solutions",
  "instagram": "https://www.instagram.com/",
  "offers": [
    {
      "amount": "10%",
      "code": "WELCOME10",
      "title": "Welcome Discount",
      "body": "Enjoy a refreshing 10% off on your first home renovation project with us. Transform your living space today! Valid for first-time clients only."
    },
    {
      "amount": "$100",
      "code": "REFER100",
      "title": "Referral Reward",
      "body": "Refer a friend and receive $100 off your next service. Share the love, save big! Applies to any construction service."
    }
  ]
}
```

- [ ] **Step 2: Write the failing test**

```js
// append to build/extract.test.mjs
import { extractPages } from './extract.mjs';
import { readFileSync } from 'node:fs';

test('site.json carries the real NAP and no placeholder data', () => {
  const s = JSON.parse(readFileSync('content/site.json', 'utf8'));
  assert.equal(s.phoneDisplay, '(602) 399-6455');
  assert.equal(s.phoneHref, 'tel:16023996455');
  assert.equal(s.foundingYear, '2005');
  const raw = readFileSync('content/site.json', 'utf8');
  for (const banned of ['555-0100', 'ROC #', 'Buchanan', '4.9', 'aggregateRating']) {
    assert.doesNotMatch(raw, new RegExp(banned), `site.json must not contain ${banned}`);
  }
});

test('extracts the six standalone pages with their real copy', () => {
  const p = extractPages();
  assert.deepEqual(Object.keys(p).sort(),
    ['about', 'contact', 'gallery', 'home', 'projects', 'sitemap']);
  assert.match(p.home.heroTitle, /From Concept to Creation/);
  assert.match(p.about.story[0], /since 2005/);
  assert.equal(p.projects.items.length, 3);
  assert.ok(p.contact.fields.length >= 4);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test build/extract.test.mjs`
Expected: FAIL — `extractPages is not a function`

- [ ] **Step 4: Implement `extractPages()`**

```js
// append to build/extract.mjs, before the CLI block
export function extractPages() {
  const home = main(read('index.html'));
  const hero = section(home, 'hero');
  const story = section(home, 'story');
  const homeCta = section(home, 'cta');

  const about = main(read('about-us', 'index.html'));
  const projects = main(read('projects', 'index.html'));
  const gallery = main(read('gallery', 'index.html'));
  const contact = main(read('contact-us', 'index.html'));

  const h1 = (m) => text(/<h1>([\s\S]*?)<\/h1>/.exec(m)[1]);
  const paras = (m) => matchAll(m, /<p>([\s\S]*?)<\/p>/g).map(text);

  return {
    home: {
      heroTitle: text(/<h1>([\s\S]*?)<\/h1>/.exec(hero)[1]),
      heroBody: text(/<p>([\s\S]*?)<\/p>/.exec(hero)[1]),
      servicesHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(home)[1]),
      storyEyebrow: text(/<p class="eyebrow">([\s\S]*?)<\/p>/.exec(story)[1]),
      storyHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(story)[1]),
      story: paras(story).filter((p) => p.length > 80),
      ctaHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(homeCta)[1]),
      ctaBody: paras(homeCta)[0],
    },
    about: {
      h1: h1(about),
      lede: paras(about)[0],
      storyHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(about)[1]),
      story: paras(about).filter((p) => p.length > 100),
    },
    gallery: { h1: h1(gallery), lede: paras(gallery)[0] },
    projects: {
      h1: h1(projects),
      lede: paras(projects)[0],
      items: [...projects.matchAll(/<h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>/g)]
        .map((m) => ({ title: text(m[1]), body: text(m[2]) })),
    },
    contact: {
      h1: h1(contact),
      lede: paras(contact)[0],
      formHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(contact)[1]),
      fields: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'message', label: 'Leave us a message', type: 'textarea' },
      ],
      helpHeading: "We're here to help",
    },
    sitemap: { h1: 'Sitemap', lede: 'Every page on the Quest Construction site.' },
  };
}
```

Also extend the CLI block at the bottom of the file:

```js
  w('pages.json', extractPages());
```

- [ ] **Step 5: Run tests and generate**

Run: `node --test build/extract.test.mjs && node build/extract.mjs`
Expected: PASS, 7 tests; `content/pages.json` written

- [ ] **Step 6: Commit**

```bash
git add build/extract.mjs build/extract.test.mjs content/site.json content/pages.json
git commit -m "Add site-level content and extract the six standalone pages"
```

---

### Task 4: URL resolution

This is the highest-risk mechanical component in the build — every page sits at one of
three directory depths, and shared assets live *outside* the direction folder. Broken
relative paths are the most likely defect class in 310 generated pages, so this gets the
heaviest test coverage in the plan.

**Files:**
- Create: `build/lib/url.mjs`
- Test: `build/lib/url.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces: `ORIGIN`, `PAGE_PATHS`, `resolver(dirSlug, pageKey) -> { url, asset, canonical, depth }`

Page keys are canonical identifiers used by every renderer: `home`, `about`, `gallery`,
`projects`, `contact`, `sitemap`, `services/<slug>`, `service-areas/<slug>`.

- [ ] **Step 1: Write the failing test**

```js
// build/lib/url.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN, outPath, resolver } from './url.mjs';

test('outPath maps a page key to its file inside the direction folder', () => {
  assert.equal(outPath('home'), 'index.html');
  assert.equal(outPath('about'), 'about-us/index.html');
  assert.equal(outPath('contact'), 'contact-us/index.html');
  assert.equal(outPath('services/adu'), 'services/adu/index.html');
  assert.equal(outPath('service-areas/mesa-az'), 'service-areas/mesa-az/index.html');
});

test('url() from the home page points down into subfolders', () => {
  const { url } = resolver('d01-site-plan', 'home');
  assert.equal(url('home'), 'index.html');
  assert.equal(url('services/adu'), 'services/adu/index.html');
  assert.equal(url('contact'), 'contact-us/index.html');
});

test('url() from a two-deep page climbs back out correctly', () => {
  const { url } = resolver('d01-site-plan', 'services/adu');
  assert.equal(url('home'), '../../index.html');
  assert.equal(url('services/roofing'), '../roofing/index.html');
  assert.equal(url('service-areas/mesa-az'), '../../service-areas/mesa-az/index.html');
  assert.equal(url('contact'), '../../contact-us/index.html');
});

test('url() from a one-deep page climbs one level', () => {
  const { url } = resolver('d01-site-plan', 'about');
  assert.equal(url('home'), '../index.html');
  assert.equal(url('services/adu'), '../services/adu/index.html');
});

test('asset() reaches repo-root shared assets from every depth', () => {
  assert.equal(resolver('d01-site-plan', 'home').asset('rebar.webp'), '../assets/rebar.webp');
  assert.equal(resolver('d01-site-plan', 'about').asset('rebar.webp'), '../../assets/rebar.webp');
  assert.equal(resolver('d01-site-plan', 'services/adu').asset('og/rebar.jpg'),
    '../../../assets/og/rebar.jpg');
});

test('local() reaches the direction-local stylesheet', () => {
  assert.equal(resolver('d01-site-plan', 'home').local('assets/styles.css'), 'assets/styles.css');
  assert.equal(resolver('d01-site-plan', 'services/adu').local('assets/styles.css'),
    '../../assets/styles.css');
});

test('canonical URLs are absolute, directory-form and origin-prefixed', () => {
  assert.equal(resolver('d01-site-plan', 'home').canonical, `${ORIGIN}/d01-site-plan/`);
  assert.equal(resolver('d01-site-plan', 'services/adu').canonical,
    `${ORIGIN}/d01-site-plan/services/adu/`);
});

test('an unknown page key throws rather than emitting a silently broken link', () => {
  const { url } = resolver('d01-site-plan', 'home');
  assert.throws(() => url('services/does-not-exist'), /unknown page key/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/lib/url.test.mjs`
Expected: FAIL — `Cannot find module './url.mjs'`

- [ ] **Step 3: Write the implementation**

```js
// build/lib/url.mjs
// Every internal link in every generated page goes through here. Nothing
// hand-writes a relative path: at three directory depths across 310 pages,
// hand-written paths are the defect class that would actually bite.
import { readFileSync } from 'node:fs';

export const ORIGIN = 'https://questconstruction.com';

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;

const FIXED = {
  home: '', about: 'about-us', gallery: 'gallery',
  projects: 'projects', contact: 'contact-us', sitemap: 'sitemap',
};

export const PAGE_KEYS = [
  ...Object.keys(FIXED),
  ...services.map((s) => `services/${s.slug}`),
  ...areas.map((a) => `service-areas/${a.slug}`),
];

const KEYS = new Set(PAGE_KEYS);

/** Page key -> file path relative to the direction folder. */
export function outPath(key) {
  if (!KEYS.has(key)) throw new Error(`unknown page key: ${key}`);
  const dir = key in FIXED ? FIXED[key] : key;
  return dir ? `${dir}/index.html` : 'index.html';
}

/** Page key -> directory form, for canonical URLs. */
function dirForm(key) {
  const dir = key in FIXED ? FIXED[key] : key;
  return dir ? `${dir}/` : '';
}

export function resolver(dirSlug, pageKey) {
  const depth = outPath(pageKey).split('/').length - 1;
  const up = depth === 0 ? '' : '../'.repeat(depth);

  return {
    depth,
    /** Link to another page in this same direction. */
    url(key) { return up + outPath(key); },
    /** A file inside this direction folder, e.g. assets/styles.css. */
    local(path) { return up + path; },
    /** A shared file at repo-root assets/, one level above the direction folder. */
    asset(path) { return '../'.repeat(depth + 1) + 'assets/' + path; },
    /** Absolute URL of a page, for canonical / OG / schema @id. */
    abs(key = pageKey) { return `${ORIGIN}/${dirSlug}/${dirForm(key)}`; },
    get canonical() { return `${ORIGIN}/${dirSlug}/${dirForm(pageKey)}`; },
    /** Absolute URL of a shared asset, for OG images and schema. */
    absAsset(path) { return `${ORIGIN}/assets/${path}`; },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test build/lib/url.test.mjs`
Expected: PASS, 8 tests

- [ ] **Step 5: Commit**

```bash
git add build/lib/url.mjs build/lib/url.test.mjs
git commit -m "Add URL resolution for pages, shared assets and canonicals"
```

---

### Task 5: The page manifest

**Files:**
- Create: `build/lib/pages.mjs`
- Test: `build/lib/pages.test.mjs`

**Interfaces:**
- Consumes: `content/*.json`, `build/lib/url.mjs` — `PAGE_KEYS`
- Produces: `loadContent() -> { site, services, areas, pages }`, `pageList() -> {key, kind, title, description, ogImage, ogAlt, item?}[]`

`kind` is one of `home | service | area | about | gallery | projects | contact | sitemap`,
and is what each direction module switches on.

- [ ] **Step 1: Write the failing test**

```js
// build/lib/pages.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, pageList } from './pages.mjs';

test('there are exactly thirty-one pages', () => {
  assert.equal(pageList().length, 31);
});

test('page kinds are distributed as expected', () => {
  const by = {};
  for (const p of pageList()) by[p.kind] = (by[p.kind] || 0) + 1;
  assert.deepEqual(by, {
    home: 1, service: 14, area: 11,
    about: 1, gallery: 1, projects: 1, contact: 1, sitemap: 1,
  });
});

test('every title is at most sixty characters and every description at most 155', () => {
  for (const p of pageList()) {
    assert.ok(p.title.length <= 60, `title too long (${p.title.length}): ${p.title}`);
    assert.ok(p.description.length <= 155,
      `description too long (${p.description.length}) on ${p.key}`);
  }
});

test('every title and description is unique across the site', () => {
  const t = new Set(), d = new Set();
  for (const p of pageList()) {
    assert.ok(!t.has(p.title), `duplicate title: ${p.title}`);
    assert.ok(!d.has(p.description), `duplicate description on ${p.key}`);
    t.add(p.title); d.add(p.description);
  }
});

test('no page references the forbidden plans.webp asset', () => {
  assert.ok(pageList().every((p) => !String(p.ogImage).includes('plans')));
});

test('service and area pages carry their content item', () => {
  const svc = pageList().find((p) => p.key === 'services/roofing');
  assert.equal(svc.item.slug, 'roofing');
  const area = pageList().find((p) => p.key === 'service-areas/mesa-az');
  assert.equal(area.item.city, 'Mesa');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/lib/pages.test.mjs`
Expected: FAIL — `Cannot find module './pages.mjs'`

- [ ] **Step 3: Write the implementation**

```js
// build/lib/pages.mjs
// The 31-page manifest. Titles and descriptions are composed here rather than
// in the direction modules so the length and uniqueness rules are enforced in
// one place by one test, for all ten directions at once.
import { readFileSync } from 'node:fs';

const json = (f) => JSON.parse(readFileSync(`content/${f}`, 'utf8'));

export function loadContent() {
  return {
    site: json('site.json'),
    services: json('services.json'),
    areas: json('areas.json'),
    pages: json('pages.json'),
  };
}

// Shared photography, chosen per page so no two pages of a kind share a card.
const OG = {
  home: ['neighborhood.jpg', 'A completed Quest Construction home at dusk'],
  about: ['crew-slab.jpg', 'A Quest Construction crew finishing a concrete slab'],
  gallery: ['framing.jpg', 'Timber framing on a Quest Construction project'],
  projects: ['roofline.jpg', 'A finished roofline on a Quest Construction build'],
  contact: ['site-steel.jpg', 'Structural steel on a Quest Construction site'],
  sitemap: ['neighborhood.jpg', 'A completed Quest Construction home at dusk'],
  service: ['rebar.jpg', 'Reinforcing steel placed on a Quest Construction job'],
  area: ['neighborhood.jpg', 'A Quest Construction home in an Arizona neighbourhood'],
};

const clip = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).trim());

export function pageList() {
  const { site, services, areas, pages } = loadContent();
  const brand = ' | Quest Construction';
  const out = [];

  const push = (key, kind, title, description, item) => {
    const [img, alt] = OG[kind] || OG.home;
    out.push({ key, kind, title, description, ogImage: img, ogAlt: alt, item });
  };

  push('home', 'home',
    `Construction & Remodeling in Arizona${brand}`,
    clip(`${pages.home.heroBody} Serving homeowners across Arizona since ${site.foundingYear}.`, 155));

  for (const s of services) {
    push(`services/${s.slug}`, 'service',
      clip(`${s.name} Services`, 60 - brand.length) + brand,
      clip(`${s.intro[0]} Quest Construction serves homeowners across Arizona.`, 155),
      s);
  }

  for (const a of areas.areas) {
    push(`service-areas/${a.slug}`, 'area',
      clip(`${a.name} Construction & Remodeling`, 60 - brand.length) + brand,
      clip(`Construction, remodeling and exterior work in ${a.name} from Quest Construction. ` +
        `Family-owned, ${site.availability}. Call ${site.phoneDisplay}.`, 155),
      a);
  }

  push('about', 'about', `About Us${brand}`,
    clip(`${pages.about.lede} Quest Construction has been shaping Arizona homes since ${site.foundingYear}.`, 155));
  push('gallery', 'gallery', `Project Gallery${brand}`,
    clip('Photography from Quest Construction jobsites across Arizona — framing, concrete, exteriors and finished homes.', 155));
  push('projects', 'projects', `Project Showcase${brand}`,
    clip(`${pages.projects.lede}`, 155));
  push('contact', 'contact', `Contact Us${brand}`,
    clip(`Talk to Quest Construction about your project. Call ${site.phoneDisplay} — ${site.availability} — or send us a message.`, 155));
  push('sitemap', 'sitemap', `Sitemap${brand}`,
    clip('Every page on the Quest Construction site: services, service areas, projects and contact details.', 155));

  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test build/lib/pages.test.mjs`
Expected: PASS, 6 tests. If a title exceeds 60 chars — the Full Remodel service name is
long — shorten via the `clip()` budget, never by relaxing the assertion.

- [ ] **Step 5: Commit**

```bash
git add build/lib/pages.mjs build/lib/pages.test.mjs
git commit -m "Add the thirty-one page manifest with title and description rules"
```

---

### Task 6: Head and structured data

**Files:**
- Create: `build/lib/head.mjs`
- Create: `build/lib/schema.mjs`
- Test: `build/lib/head.test.mjs`

**Interfaces:**
- Consumes: `build/lib/url.mjs` — `ORIGIN`, `resolver`; `build/lib/pages.mjs` — `loadContent`
- Produces: `buildHead({page, res, dir, content, fonts, preload, extraCss}) -> string`,
  `graphFor({page, res, content}) -> object`

- [ ] **Step 1: Write the failing test**

```js
// build/lib/head.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolver } from './url.mjs';
import { loadContent, pageList } from './pages.mjs';
import { buildHead } from './head.mjs';
import { graphFor } from './schema.mjs';

const content = loadContent();
const pages = pageList();
const find = (k) => pages.find((p) => p.key === k);
const dirIndexable = { slug: 'd01-site-plan', indexable: true };
const dirHidden = { slug: 'd05-ground-break', indexable: false };

test('the indexable direction opts in, the others opt out', () => {
  const a = buildHead({ page: find('home'), res: resolver('d01-site-plan', 'home'), dir: dirIndexable, content, fonts: '' });
  assert.match(a, /content="index,follow,max-image-preview:large/);
  const b = buildHead({ page: find('home'), res: resolver('d05-ground-break', 'home'), dir: dirHidden, content, fonts: '' });
  assert.match(b, /content="noindex,follow"/);
});

test('canonical, og:url and title agree', () => {
  const p = find('services/roofing');
  const h = buildHead({ page: p, res: resolver('d01-site-plan', p.key), dir: dirIndexable, content, fonts: '' });
  assert.match(h, /<link rel="canonical" href="https:\/\/questconstruction\.com\/d01-site-plan\/services\/roofing\/">/);
  assert.match(h, /<meta property="og:url" content="https:\/\/questconstruction\.com\/d01-site-plan\/services\/roofing\/">/);
  assert.ok(h.includes(`<title>${p.title}</title>`));
  assert.ok(h.includes(`<meta property="og:title" content="${p.title}">`));
});

test('no head ever leaks placeholder identity data', () => {
  for (const p of pages) {
    const h = buildHead({ page: p, res: resolver('d01-site-plan', p.key), dir: dirIndexable, content, fonts: '' });
    for (const banned of ['555-0100', 'Buchanan', 'ROC #', 'aggregateRating', 'plans.webp']) {
      assert.ok(!h.includes(banned), `${p.key} head leaked ${banned}`);
    }
  }
});

test('the business node carries the real NAP and no address or rating', () => {
  const g = graphFor({ page: find('home'), res: resolver('d01-site-plan', 'home'), content });
  const biz = g['@graph'].find((n) => String(n['@type']).includes('GeneralContractor'));
  assert.equal(biz.telephone, '+1-602-399-6455');
  assert.equal(biz.foundingDate, '2005');
  assert.equal(biz.address, undefined);
  assert.equal(biz.aggregateRating, undefined);
  assert.equal(biz.areaServed.length, 11);
});

test('a service page emits a Service node and a breadcrumb trail', () => {
  const p = find('services/roofing');
  const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
  const svc = g['@graph'].find((n) => n['@type'] === 'Service');
  assert.equal(svc.name, 'Roofing');
  const crumbs = g['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[2].name, 'Roofing');
});

test('only the concrete page emits FAQPage, with six entries', () => {
  const withFaq = pageList().filter((p) => {
    const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
    return g['@graph'].some((n) => n['@type'] === 'FAQPage');
  });
  assert.deepEqual(withFaq.map((p) => p.key), ['services/concrete']);
  const g = graphFor({ page: find('services/concrete'), res: resolver('d01-site-plan', 'services/concrete'), content });
  assert.equal(g['@graph'].find((n) => n['@type'] === 'FAQPage').mainEntity.length, 6);
});

test('an area page scopes areaServed to its own city', () => {
  const p = find('service-areas/mesa-az');
  const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
  const biz = g['@graph'].find((n) => String(n['@type']).includes('GeneralContractor'));
  assert.equal(biz.areaServed.length, 1);
  assert.equal(biz.areaServed[0].name, 'Mesa');
});

test('every page produces valid serialisable JSON-LD', () => {
  for (const p of pages) {
    const g = graphFor({ page: p, res: resolver('d01-site-plan', p.key), content });
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(g)), p.key);
    assert.equal(g['@context'], 'https://schema.org');
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/lib/head.test.mjs`
Expected: FAIL — `Cannot find module './head.mjs'`

- [ ] **Step 3: Write `build/lib/schema.mjs`**

```js
// build/lib/schema.mjs
// JSON-LD, per page type. The business node deliberately carries no
// PostalAddress and no aggregateRating: Quest publishes neither, and invented
// values in structured data are exactly where wrong data does the most damage.
import { ORIGIN } from './url.mjs';

const city = (name) => ({
  '@type': 'City', name,
  containedInPlace: { '@type': 'State', name: 'Arizona' },
});

function business(content, areasServed) {
  const { site, areas } = content;
  const list = areasServed || areas.areas.map((a) => a.city);
  return {
    '@type': ['GeneralContractor', 'HomeAndConstructionBusiness'],
    '@id': `${ORIGIN}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: `${ORIGIN}/`,
    description: site.footerBlurb,
    slogan: site.tagline,
    telephone: site.phoneE164,
    foundingDate: site.foundingYear,
    priceRange: '$$',
    areaServed: list.map(city),
    address: undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phoneE164,
      contactType: 'sales',
      areaServed: 'US',
      availableLanguage: ['en', 'es'],
    },
    knowsAbout: content.services.map((s) => s.name),
  };
}

function breadcrumbs(page, res, content) {
  const trail = [{ name: 'Home', key: 'home' }];
  if (page.kind === 'service') {
    trail.push({ name: 'Services', key: 'sitemap' });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind === 'area') {
    trail.push({ name: 'Service Areas', key: 'sitemap' });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind !== 'home') {
    trail.push({ name: page.title.split('|')[0].trim(), key: page.key });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${res.canonical}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: res.abs(t.key),
    })),
  };
}

export function graphFor({ page, res, content }) {
  const areasServed = page.kind === 'area' ? [page.item.city] : null;
  const graph = [
    business(content, areasServed),
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: content.site.name,
      inLanguage: 'en-US',
      publisher: { '@id': `${ORIGIN}/#business` },
    },
    {
      '@type': page.kind === 'contact' ? 'ContactPage' : 'WebPage',
      '@id': `${res.canonical}#webpage`,
      url: res.canonical,
      name: page.title,
      description: page.description,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#business` },
      primaryImageOfPage: { '@type': 'ImageObject', url: res.absAsset(page.ogImage) },
      breadcrumb: breadcrumbs(page, res, content),
    },
    breadcrumbs(page, res, content),
  ];

  if (page.kind === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${res.canonical}#service`,
      name: page.item.name,
      serviceType: page.item.name,
      description: page.item.shortDesc,
      provider: { '@id': `${ORIGIN}/#business` },
      areaServed: content.areas.areas.map((a) => city(a.city)),
    });
    if (page.item.faqs && page.item.faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${res.canonical}#faq`,
        mainEntity: page.item.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
  }

  // Drop undefined keys so `address: undefined` never serialises.
  return JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }));
}
```

- [ ] **Step 4: Write `build/lib/head.mjs`**

```js
// build/lib/head.mjs
import { graphFor } from './schema.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildHead({ page, res, dir, content, fonts = '', preload = '', extraCss = '' }) {
  const robots = dir.indexable
    ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'noindex,follow';
  const og = res.absAsset(page.ogImage.replace(/\.webp$/, '.jpg'));

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${res.canonical}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(content.site.legalName)}">
<meta name="color-scheme" content="light">

<meta name="geo.region" content="US-AZ">
<meta name="geo.placename" content="${esc(page.kind === 'area' ? page.item.name : 'Arizona')}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(content.site.name)}">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${res.canonical}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${esc(page.ogAlt)}">

<link rel="icon" href="${res.local('../favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${res.local('../apple-touch-icon.png')}">
${preload}
${fonts}
<link rel="stylesheet" href="${res.local('assets/styles.css')}">
${extraCss}
<script type="application/ld+json">
${JSON.stringify(graphFor({ page, res, content }), null, 2)}
</script>`;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test build/lib/head.test.mjs`
Expected: PASS, 8 tests

- [ ] **Step 6: Commit**

```bash
git add build/lib/head.mjs build/lib/schema.mjs build/lib/head.test.mjs
git commit -m "Add head assembly and per-page-type structured data"
```

---

### Task 7: Build orchestrator with a stub direction

**Files:**
- Create: `build/build.mjs`
- Create: `build/directions/_stub.mjs`
- Test: `build/build.test.mjs`

**Interfaces:**
- Consumes: everything above
- Produces: `buildDirection(mod) -> {written: number}`, `renderPage({mod, page, content}) -> string`.
  Each direction module must export `meta`, `head`-contributions and the eight renderers listed below.

**The direction module contract** — every `dNN.mjs` exports exactly this:

```js
export const meta = { slug, name, indexable, fonts, preload };
export function nav(ctx);      export function footer(ctx);
export function home(ctx);     export function service(ctx);
export function area(ctx);     export function about(ctx);
export function gallery(ctx);  export function projects(ctx);
export function contact(ctx);  export function sitemap(ctx);
```

`ctx` is `{ page, res, url, asset, local, site, services, areas, pages, item }` — `url`,
`asset` and `local` are the resolver functions bound for this page, and `item` is the
service or area when relevant.

- [ ] **Step 1: Write the failing test**

```js
// build/build.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, allPagesFor } from './build.mjs';
import * as stub from './directions/_stub.mjs';

test('a direction renders all thirty-one pages', () => {
  assert.equal(allPagesFor(stub).length, 31);
});

test('a rendered page is a complete document with the landmarks', () => {
  const html = renderPage({ mod: stub, key: 'services/roofing' });
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<a class="skip-link" href="#main">/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<\/html>\s*$/);
});

test('rendered links resolve relative to the page depth', () => {
  const html = renderPage({ mod: stub, key: 'services/roofing' });
  assert.match(html, /href="\.\.\/\.\.\/contact-us\/index\.html"/);
  assert.match(html, /href="\.\.\/\.\.\/assets\/styles\.css"|\.\.\/\.\.\/assets\/styles\.css/);
});

test('no rendered page contains an unresolved template token or a dead anchor', () => {
  for (const key of allPagesFor(stub)) {
    const html = renderPage({ mod: stub, key });
    assert.doesNotMatch(html, /\{\{/, `${key} has an unresolved token`);
    assert.doesNotMatch(html, /href="#"/, `${key} has a dead anchor`);
  }
});

test('no rendered page leaks placeholder identity data', () => {
  for (const key of allPagesFor(stub)) {
    const html = renderPage({ mod: stub, key });
    for (const banned of ['555-0100', 'Buchanan', 'ROC #', '4.9', 'plans.webp', 'est. 2010']) {
      assert.ok(!html.includes(banned), `${key} leaked ${banned}`);
    }
  }
});
```

- [ ] **Step 2: Write `build/directions/_stub.mjs`**

A minimal direction used only to test the harness. It exercises every hook with
the least possible markup.

```js
// build/directions/_stub.mjs — test fixture, never built to disk.
export const meta = { slug: 'd00-stub', name: 'Stub', indexable: false, fonts: '', preload: '' };
export const nav = (c) => `<header class="nav"><a href="${c.url('home')}">${c.site.name}</a>
<a href="${c.url('contact')}">Contact</a><a href="${c.site.phoneHref}">${c.site.phoneDisplay}</a></header>`;
export const footer = (c) => `<footer><p>${c.site.footerBlurb}</p>
<a href="${c.url('sitemap')}">Sitemap</a></footer>`;
export const home = (c) => `<h1>${c.pages.home.heroTitle}</h1>`;
export const service = (c) => `<h1>${c.item.h1}</h1><p>${c.item.intro[0]}</p>`;
export const area = (c) => `<h1>${c.item.name}</h1>`;
export const about = (c) => `<h1>${c.pages.about.h1}</h1>`;
export const gallery = (c) => `<h1>${c.pages.gallery.h1}</h1>`;
export const projects = (c) => `<h1>${c.pages.projects.h1}</h1>`;
export const contact = (c) => `<h1>${c.pages.contact.h1}</h1>`;
export const sitemap = (c) => `<h1>${c.pages.sitemap.h1}</h1>`;
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test build/build.test.mjs`
Expected: FAIL — `Cannot find module './build.mjs'`

- [ ] **Step 4: Write `build/build.mjs`**

```js
// build/build.mjs
// Walks ten direction modules over thirty-one pages and writes static HTML.
// Output is committed; this is a dev tool, not a runtime dependency.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { resolver, outPath } from './lib/url.mjs';
import { loadContent, pageList } from './lib/pages.mjs';
import { buildHead } from './lib/head.mjs';

const content = loadContent();
const PAGES = pageList();

export function allPagesFor() { return PAGES.map((p) => p.key); }

export function renderPage({ mod, key }) {
  const page = PAGES.find((p) => p.key === key);
  if (!page) throw new Error(`no such page: ${key}`);
  const res = resolver(mod.meta.slug, key);

  const ctx = {
    page, res,
    url: res.url, asset: res.asset, local: res.local,
    site: content.site, services: content.services,
    areas: content.areas, pages: content.pages,
    item: page.item,
  };

  const head = buildHead({
    page, res, dir: mod.meta, content,
    fonts: mod.meta.fonts || '',
    preload: mod.meta.preload || '',
  });

  const body = mod[page.kind](ctx);

  return `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${mod.nav(ctx)}
<main id="main">
${body}
</main>
${mod.footer(ctx)}
${mod.script ? mod.script(ctx) : ''}
</body>
</html>
`;
}

export function buildDirection(mod) {
  const root = mod.meta.slug;
  rmSync(join(root, 'services'), { recursive: true, force: true });
  rmSync(join(root, 'service-areas'), { recursive: true, force: true });
  let written = 0;
  for (const key of allPagesFor()) {
    const file = join(root, outPath(key));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage({ mod, key }));
    written++;
  }
  return { written };
}

const DIRECTIONS = [
  'd01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10',
];

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const only = process.argv[2];
  let total = 0;
  for (const d of DIRECTIONS) {
    if (only && d !== only) continue;
    let mod;
    try { mod = await import(`./directions/${d}.mjs`); }
    catch { console.log(`${d}: not yet written, skipping`); continue; }
    const { written } = buildDirection(mod);
    total += written;
    console.log(`${mod.meta.slug}: ${written} pages`);
  }
  console.log(`total: ${total} pages`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test build/build.test.mjs`
Expected: PASS, 5 tests

- [ ] **Step 6: Run the whole suite**

Run: `node --test build/`
Expected: PASS, all tests across the five test files

- [ ] **Step 7: Commit**

```bash
git add build/build.mjs build/build.test.mjs build/directions/_stub.mjs
git commit -m "Add the build orchestrator and the direction module contract"
```

---

### Task 8: Download the five real Quest images

**Files:**
- Create: `build/fetch-images.mjs`
- Create: `assets/quest/logo.webp`, `hero.webp`, `story.webp`, `contact.webp`, `spare.webp`
- Create: `assets/og/quest-hero.jpg`

**Interfaces:**
- Consumes: nothing
- Produces: five WebP files under `assets/quest/`, referenced by every direction as
  `asset('quest/logo.webp')` etc.

- [ ] **Step 1: Write the fetch script**

```js
// build/fetch-images.mjs
// The five images the live site actually serves. Everything else in assets/
// is the existing stock library. Run once; outputs are committed.
import { writeFileSync, mkdirSync } from 'node:fs';

const SRC = {
  logo:    'https://ik.imagekit.io/4wu305uo4/image_6809b3da432c476416135f81.png',
  hero:    'https://ik.imagekit.io/4wu305uo4/image_67fe61e8432c47641640f98b.jpeg',
  story:   'https://ik.imagekit.io/4wu305uo4/image_67fe542c432c476416d91f27.jpeg',
  contact: 'https://ik.imagekit.io/4wu305uo4/contact-us.png',
  spare:   'https://ik.imagekit.io/4wu305uo4/image_68082c76432c47641622f310.jpeg',
};

mkdirSync('assets/quest', { recursive: true });
for (const [name, url] of Object.entries(SRC)) {
  // ImageKit converts on the fly; ask it for WebP at quality 80, matching the
  // encoding the existing library already uses.
  const webp = url.includes('?')
    ? `${url}&tr=f-webp,q-80`
    : `${url}?tr=f-webp,q-80`;
  const r = await fetch(webp);
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(`assets/quest/${name}.webp`, buf);
  console.log(`assets/quest/${name}.webp  ${buf.length} bytes  ${r.headers.get('content-type')}`);
}
```

- [ ] **Step 2: Run it**

Run: `node build/fetch-images.mjs`
Expected: five lines, each reporting `image/webp`. If any reports `image/jpeg`,
ImageKit declined the transform — refetch that one without `tr=` and note it in the
README as an un-optimised original rather than shipping a mislabelled file.

- [ ] **Step 3: Produce the 1200×630 social card**

The home page's OG card should be the real Quest hero, not a stock photo. Crop it with
the CDP helper pattern already in `shots/`:

```bash
node -e "
import('node:fs').then(async fs => {
  const r = await fetch('https://ik.imagekit.io/4wu305uo4/tr:w-1200,h-630,fo-auto,f-jpg,q-82/image_67fe61e8432c47641640f98b.jpeg');
  fs.writeFileSync('assets/og/quest-hero.jpg', Buffer.from(await r.arrayBuffer()));
  console.log('assets/og/quest-hero.jpg written');
})"
```

- [ ] **Step 4: Point the home and about OG entries at the real photos**

In `build/lib/pages.mjs`, change the `OG` map:

```js
  home: ['quest-hero.jpg', 'A Quest Construction project in Arizona'],
  sitemap: ['quest-hero.jpg', 'A Quest Construction project in Arizona'],
```

- [ ] **Step 5: Verify and commit**

Run: `node --test build/`
Expected: PASS

```bash
git add build/fetch-images.mjs assets/quest assets/og/quest-hero.jpg build/lib/pages.mjs
git commit -m "Self-host the five real Quest images and the home social card"
```

---

### Task 9: Direction 01 — stylesheet, shell and navbar

**Files:**
- Create: `build/directions/d01.mjs`
- Create: `d01-site-plan/assets/styles.css` (extracted from `direction-1-site-plan.html`)
- Create: `build/extract-css.mjs`
- Test: `build/directions/d01.test.mjs`

**Interfaces:**
- Consumes: the module contract from Task 7
- Produces: `meta`, `nav`, `footer`, `script` for direction 01; the other seven renderers
  arrive in Tasks 10–12

Direction 01 is **Site Plan** — layered and editorial, cream ground with a faint engineering
grid, hard-edged accent planes, pill buttons, `--r` 16px / `--r-lg` 30px radii, soft layered
shadows, and a cream-to-dark-to-cream section rhythm. Its nav is a **floating panel with
generous radius and a layered shadow**.

- [ ] **Step 1: Write the CSS extractor**

```js
// build/extract-css.mjs
// Lifts the inline <style> out of a direction mockup into a shared stylesheet.
// Thirty-one pages inlining 20KB each is 620KB of duplication per direction.
//   node build/extract-css.mjs direction-1-site-plan.html d01-site-plan
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [, , src, dest] = process.argv;
const html = readFileSync(src, 'utf8');
const css = /<style>([\s\S]*?)<\/style>/.exec(html)[1];
mkdirSync(`${dest}/assets`, { recursive: true });
writeFileSync(`${dest}/assets/styles.css`, css.trim() + '\n');
console.log(`${dest}/assets/styles.css  ${css.length} chars`);
```

- [ ] **Step 2: Extract direction 01's stylesheet**

Run: `node build/extract-css.mjs direction-1-site-plan.html d01-site-plan`
Expected: `d01-site-plan/assets/styles.css  20770 chars`

- [ ] **Step 3: Fix asset paths inside the extracted CSS**

The mockup's CSS references `assets/*.webp` relative to the repo root; from
`d01-site-plan/assets/styles.css` those become `../../assets/*.webp`.

```bash
node -e "
const fs=require('fs');const f='d01-site-plan/assets/styles.css';
let c=fs.readFileSync(f,'utf8');
c=c.replace(/url\(([\"']?)assets\//g,'url(\$1../../assets/');
fs.writeFileSync(f,c);
console.log('rewrote', (c.match(/\.\.\/\.\.\/assets\//g)||[]).length, 'asset urls');
"
```

- [ ] **Step 4: Write the failing test**

```js
// build/directions/d01.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, allPagesFor } from '../build.mjs';
import * as d01 from './d01.mjs';

test('direction 01 is the one indexable direction', () => {
  assert.equal(d01.meta.slug, 'd01-site-plan');
  assert.equal(d01.meta.indexable, true);
});

test('the navbar links every service and every area, from any depth', () => {
  const html = renderPage({ mod: d01, key: 'services/adu' });
  for (const slug of ['roofing', 'stucco', 'window-installation']) {
    assert.ok(html.includes(`../${slug}/index.html`), `nav missing service ${slug}`);
  }
  for (const slug of ['mesa-az', 'phoenix-az']) {
    assert.ok(html.includes(`../../service-areas/${slug}/index.html`), `nav missing area ${slug}`);
  }
});

test('the navbar carries the real phone number as a tel link', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.ok(html.includes('(602) 399-6455'));
});

test('the footer states the real founding year and no invented figures', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.doesNotMatch(html, /est\.\s*2010|340\+|96%|4\.9/);
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `node --test build/directions/d01.test.mjs`
Expected: FAIL — `Cannot find module './d01.mjs'`

- [ ] **Step 6: Write the shell of `build/directions/d01.mjs`**

```js
// build/directions/d01.mjs — Site Plan. Layered, editorial, cream ground.
export const meta = {
  slug: 'd01-site-plan',
  name: 'Site Plan',
  indexable: true,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`,
  preload: '',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Floating panel nav with generous radius and a layered shadow — 01's idiom. */
export function nav(c) {
  const svc = c.services.map((s) =>
    `<a href="${c.url(`services/${s.slug}`)}">${esc(s.name)}</a>`).join('');
  const areas = c.areas.areas.map((a) =>
    `<a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.name)}</a>`).join('');
  return `<header class="nav">
<div class="wrap navwrap">
  <a class="brand" href="${c.url('home')}">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="150" height="40">
  </a>
  <button class="navtoggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button>
  <nav class="navmain">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="dropmenu dropmenu--svc">${svc}</div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas Served</button>
      <div class="dropmenu dropmenu--area">${areas}</div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, links) =>
    `<div><h3>${title}</h3><ul>${links.map(([href, label]) =>
      `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul></div>`;
  return `<footer>
<div class="wrap fg">
  <div class="about">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="150" height="40">
    <p>${esc(c.site.footerBlurb)}</p>
    <p class="mono">${esc(c.site.positioning)} &middot; Since ${c.site.foundingYear}</p>
    <a class="btn" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </div>
  ${col('Company', [
    [c.url('about'), 'About Us'], [c.url('projects'), 'Project Showcase'],
    [c.url('gallery'), 'Gallery'], [c.url('contact'), 'Contact'],
    [c.url('sitemap'), 'Sitemap'],
  ])}
  ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
  ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
</div>
<div class="wrap fbar">
  <p>&copy; 2026 ${esc(c.site.name)}. All rights reserved.</p>
  <a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a>
</div>
</footer>`;
}

/** Accent swap + nav toggle + scroll reveals. Mirrors the mockup's inline script. */
export function script() {
  return `<script>
(function(){
  var P={orange:['#D07C42','#1C1208','#9A4E1E'],clay:['#A8543A','#ffffff','#7C3A24'],hivis:['#D9A93C','#191307','#8A6712']};
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);s.setProperty('--acc-dim',p[2]);}
  var q=new URLSearchParams(location.search).get('acc'); if(q) set(q);
  addEventListener('message',function(e){ if(e.data&&e.data.acc) set(e.data.acc); });
})();
(function(){
  var t=document.querySelector('.navtoggle'), n=document.querySelector('.navmain');
  if(t&&n) t.addEventListener('click',function(){
    var o=n.classList.toggle('open'); t.setAttribute('aria-expanded',String(o));
  });
  document.querySelectorAll('.drop>button').forEach(function(b){
    b.addEventListener('click',function(){
      var o=b.parentNode.classList.toggle('open'); b.setAttribute('aria-expanded',String(o));
    });
  });
})();
(function(){
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},
    {threshold:.1,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();
</script>`;
}

// Renderers land in Tasks 10-12.
export const home = () => '';
export const service = () => '';
export const area = () => '';
export const about = () => '';
export const gallery = () => '';
export const projects = () => '';
export const contact = () => '';
export const sitemap = () => '';
```

- [ ] **Step 7: Add the navbar CSS**

Append to `d01-site-plan/assets/styles.css`. The mockup had no multi-page nav, so this
is new — written in 01's idiom (radius, layered shadow, cream panel).

```css
/* ---- multi-page navigation (new; the mockup was anchor-only) ---- */
.navwrap{display:flex;align-items:center;gap:22px}
.navmain{display:flex;align-items:center;gap:6px;margin-left:auto}
.navmain>a,.drop>button{padding:10px 14px;border-radius:var(--r);font-weight:600;
  font-size:15px;background:none;border:0;cursor:pointer;color:inherit;font:inherit}
.navmain>a:hover,.drop>button:hover{background:rgba(20,19,16,.06)}
.drop{position:relative}
.dropmenu{position:absolute;top:calc(100% + 10px);left:0;display:none;z-index:60;
  background:var(--cream,#F5F1E8);border-radius:var(--r-lg,30px);padding:18px;
  box-shadow:0 2px 6px rgba(20,19,16,.06),0 12px 34px rgba(20,19,16,.16);
  border:1px solid rgba(20,19,16,.08)}
.drop:hover .dropmenu,.drop.open .dropmenu{display:grid}
.dropmenu--svc{grid-template-columns:repeat(2,minmax(210px,1fr));gap:2px 18px}
.dropmenu--area{grid-template-columns:repeat(2,minmax(160px,1fr));gap:2px 18px}
.dropmenu a{padding:9px 12px;border-radius:12px;font-size:14.5px;white-space:nowrap}
.dropmenu a:hover{background:rgba(20,19,16,.06)}
.navtoggle{display:none}
@media(max-width:1080px){
  .navtoggle{display:inline-block;margin-left:auto;padding:10px 16px;
    border-radius:999px;border:1px solid rgba(20,19,16,.2);background:none;
    font:inherit;font-weight:600;cursor:pointer}
  .navmain{display:none;margin-left:0}
  .navmain.open{display:block;position:absolute;top:100%;left:0;right:0;
    background:var(--cream,#F5F1E8);padding:16px;
    box-shadow:0 18px 40px rgba(20,19,16,.18);max-height:78vh;overflow:auto}
  .dropmenu{position:static;display:none;box-shadow:none;border:0;padding:4px 0 12px 12px}
  .drop.open .dropmenu{display:grid;grid-template-columns:1fr}
  .nav{position:relative}
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `node --test build/directions/d01.test.mjs`
Expected: PASS, 4 tests

- [ ] **Step 9: Commit**

```bash
git add build/extract-css.mjs build/directions/d01.mjs build/directions/d01.test.mjs d01-site-plan/assets/styles.css
git commit -m "Add direction 01's shell, multi-page navbar and extracted stylesheet"
```

---

### Task 10: Direction 01 — home page

**Files:**
- Modify: `build/directions/d01.mjs` — replace the `home` stub
- Test: `build/directions/d01.test.mjs` — add cases

**Interfaces:**
- Consumes: `ctx.pages.home`, `ctx.services`, `ctx.site.offers`, `ctx.pages.projects`
- Produces: nothing downstream

Section order, per the spec's "dropped sections" decision — hero → services → story →
offers → work → CTA. No social-proof band, no lead magnet, no invented figures.

- [ ] **Step 1: Write the failing test**

```js
// append to build/directions/d01.test.mjs
test('the home page carries all fourteen service cards', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  for (const s of ['Residential Development', 'Casita', 'ADU', 'Window Installation']) {
    assert.ok(html.includes(s), `home missing service card: ${s}`);
  }
});

test('the home page carries both real offers with their codes', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('WELCOME10'));
  assert.ok(html.includes('REFER100'));
});

test('the home page shows the three real projects and no invented statistics', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Residential Framing'));
  assert.doesNotMatch(html, /\b\d{3}\+\s*(projects|builds)/i);
});

test('the home hero is eager-loaded for LCP', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /fetchpriority="high"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/directions/d01.test.mjs`
Expected: FAIL — home renders empty, service names absent

- [ ] **Step 3: Implement `home`**

```js
export function home(c) {
  const h = c.pages.home;
  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="mono">Services</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="more" href="${c.url(`services/${s.slug}`)}">View details &rarr;</a>
    </article>`).join('');

  const offers = c.site.offers.map((o) => `
    <div class="offer rv">
      <strong>${esc(o.amount)}</strong>
      <button type="button" data-copy="${esc(o.code)}">GET CODE</button>
      <h3>${esc(o.title)}</h3>
      <p>${esc(o.body)}</p>
    </div>`).join('');

  const work = c.pages.projects.items.map((p, i) => `
    <a class="pj ${'abc'[i]}" href="${c.url('projects')}">
      <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p>
    </a>`).join('');

  return `
<section class="hero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="hero-panel" aria-hidden="true"></div>
  <div class="wrap in">
    <div class="hero-copy">
      <p class="eyebrow mono">${esc(c.site.positioning)}</p>
      <h1>${esc(h.heroTitle)}</h1>
      <p class="lede">${esc(h.heroBody)}</p>
      <div class="hero-acts">
        <a class="btn" href="${c.url('contact')}">Get in touch</a>
        <a class="btn ghost" href="${c.site.phoneHref}">Call ${esc(c.site.phoneDisplay)}</a>
      </div>
    </div>
    <img class="hero-shot" src="${c.asset('quest/hero.webp')}"
      alt="A Quest Construction project in Arizona"
      width="1200" height="800" loading="eager" fetchpriority="high" decoding="async">
    <div class="badge badge-float">
      <strong>Since ${c.site.foundingYear}</strong>
      <span>${esc(c.site.availability)} &middot; ${esc(c.site.phoneDisplay)}</span>
    </div>
  </div>
</section>

<section class="sec dark" id="services">
  <div class="grid-bg on-dark" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead rv"><p class="eyebrow mono">&mdash; Our Top Services</p>
      <h2>${esc(h.servicesHeading)}</h2></div>
    <div class="svcs">${cards}</div>
  </div>
</section>

<section class="sec cream story">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap split">
    <img src="${c.asset('quest/story.webp')}" alt="A Quest Construction build in progress"
      width="1000" height="700" loading="lazy" decoding="async">
    <div class="rv">
      <p class="eyebrow mono">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)}</h2>
      ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      <a class="btn" href="${c.url('about')}">Learn More</a>
    </div>
  </div>
</section>

<section class="sec offers">
  <div class="wrap">
    <div class="shead rv"><h2>Exclusive Offers Just For You</h2></div>
    <div class="offer-grid">${offers}</div>
  </div>
</section>

<section class="sec dark" id="work">
  <div class="wrap">
    <div class="shead rv"><p class="eyebrow mono">&mdash; Selected Work</p>
      <h2>${esc(c.pages.projects.h1)}</h2><p>${esc(c.pages.projects.lede)}</p></div>
    <div class="work rv">${work}</div>
  </div>
</section>

<section class="cta">
  <div class="wrap cta-copy">
    <h2>${esc(h.ctaHeading)}</h2>
    <p>${esc(h.ctaBody)}</p>
    <a class="btn" href="${c.url('contact')}">Get in touch</a>
    <a class="btn ghost" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </div>
</section>`;
}
```

- [ ] **Step 4: Add the offer-copy handler to `script()`**

Insert before the closing `</script>` in `d01.mjs`'s `script()`:

```js
(function(){
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',async function(){
      var code=b.getAttribute('data-copy');
      try{await navigator.clipboard.writeText(code);b.textContent='COPIED'}
      catch(e){b.textContent=code}
      setTimeout(function(){b.textContent='GET CODE'},1600);
    });
  });
})();
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test build/directions/d01.test.mjs`
Expected: PASS, 8 tests

- [ ] **Step 6: Build and eyeball**

```bash
node build/build.mjs d01
cd shots && node page.mjs ../d01-site-plan/index.html ./d01-home.png 1440
```

Expected: 31 pages written; the screenshot shows hero, 14 service cards, story, offers,
work and CTA with no empty bands where the dropped sections were.

- [ ] **Step 7: Commit**

```bash
git add build/directions/d01.mjs build/directions/d01.test.mjs d01-site-plan
git commit -m "Build direction 01's home page from the real Quest content"
```

---

### Task 11: Direction 01 — service and area pages

**Files:**
- Modify: `build/directions/d01.mjs` — replace the `service` and `area` stubs
- Create: `content/areas-local.json` — the authored local copy
- Test: `build/directions/d01.test.mjs` — add cases

**Interfaces:**
- Consumes: `ctx.item` (a service or an area), `content/areas-local.json`
- Produces: `content/areas-local.json` shape `{ "<slug>": { paras: string[], notes: string[] } }`

**Service page furniture for 01** — layered cards with hard shadows for the process,
floating badge cards for why-choose, a soft accordion for the FAQ (concrete only).

**On the area pages:** per the spec's R1 decision, direction 01 ships *authored* local
copy — roughly 150–200 words per city covering permit jurisdiction, typical housing stock
and age, and climate-driven build considerations. The other nine directions reuse the
ported template and are `noindex`, so the doorway-page exposure is confined to pages that
are not indexed.

- [ ] **Step 1: Write the failing test**

```js
// append to build/directions/d01.test.mjs
import { readFileSync } from 'node:fs';

test('every service page renders its unique intro and the four process steps', () => {
  const svcs = JSON.parse(readFileSync('content/services.json', 'utf8'));
  for (const s of svcs) {
    const html = renderPage({ mod: d01, key: `services/${s.slug}` });
    assert.ok(html.includes(esc(s.intro[0])), `${s.slug} intro missing`);
    for (const p of s.process) assert.ok(html.includes(esc(p.title)), `${s.slug} step ${p.n}`);
  }
});

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}

test('only the concrete page renders an FAQ block', () => {
  assert.match(renderPage({ mod: d01, key: 'services/concrete' }), /class="faq"/);
  assert.doesNotMatch(renderPage({ mod: d01, key: 'services/roofing' }), /class="faq"/);
});

test('the service page cross-links the other thirteen services', () => {
  const html = renderPage({ mod: d01, key: 'services/roofing' });
  assert.ok(html.includes('aria-current="page"'), 'active service is marked');
  assert.ok(html.includes('../stucco/index.html'));
});

test('every area page carries authored local copy, unique per city', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;
  assert.equal(Object.keys(local).length, 11);
  const seen = new Set();
  for (const a of areas) {
    const entry = local[a.slug];
    assert.ok(entry, `no local copy for ${a.slug}`);
    const words = entry.paras.join(' ').split(/\s+/).length;
    assert.ok(words >= 120, `${a.slug} local copy too thin (${words} words)`);
    for (const p of entry.paras) {
      assert.ok(!seen.has(p), `${a.slug} reuses a paragraph from another city`);
      seen.add(p);
    }
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    assert.ok(html.includes(esc(entry.paras[0])), `${a.slug} does not render its local copy`);
  }
});

test('area pages resolve the city token everywhere', () => {
  const html = renderPage({ mod: d01, key: 'service-areas/queen-creek-az' });
  assert.doesNotMatch(html, /\{\{city\}\}/);
  assert.ok(html.includes('Queen Creek'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/directions/d01.test.mjs`
Expected: FAIL — `content/areas-local.json` does not exist

- [ ] **Step 3: Author `content/areas-local.json`**

Eleven entries, one per slug: `camelback-east-village-az`, `chandler-az`, `florence-az`,
`gilbert-az`, `goodyear-meadows-az`, `mesa-az`, `paradise-valley-az`, `phoenix-az`,
`queen-creek-az`, `scottsdale-az`, `tempe-az`.

Each entry is `{ "paras": [...], "notes": [...] }` with **120–200 words of genuinely
city-specific prose**. Write about, per city: which authority issues permits, the dominant
era and construction type of the housing stock, and the local conditions that change how
work is specified. `notes` is 3–4 short bullets rendered as a capability list.

Worked example for one city — write the other ten to this standard, and **do not
paraphrase this one**, since the test asserts no paragraph is reused:

```json
{
  "mesa-az": {
    "paras": [
      "Mesa permits through the city's own Development Services department rather than Maricopa County, and its plan review turnaround shapes how we sequence a remodel schedule. We build the review window into the programme up front so demolition does not start against a permit that has not cleared.",
      "Much of Mesa's housing stock is post-war ranch and 1970s-80s block construction, which means slab-on-grade foundations, painted CMU or stucco-over-block exteriors, and original electrical that frequently needs bringing up to current code once walls are open. On additions we plan for matching a stucco texture that has weathered for forty years, not for matching it new.",
      "West Mesa's mature neighbourhoods carry established landscaping and tighter lot access, so we stage material deliveries to keep a street passable. East of Power Road the newer subdivisions bring HOA design review into the timeline, which we handle alongside the city submittal rather than after it."
    ],
    "notes": [
      "City of Mesa Development Services permitting",
      "Slab-on-grade and CMU block construction",
      "Stucco matching on weathered exteriors",
      "HOA design review in east Mesa"
    ]
  }
}
```

Guidance for the remaining ten, so each is genuinely distinct:
Phoenix — city permitting, huge range of stock from 1920s bungalow to new build, historic
district overlays. Scottsdale — strict design review, desert-adjacent lots, higher-end
finishes. Tempe — dense infill, university rentals, small lots. Chandler and Gilbert —
newer master-planned stock, HOA-heavy, tile roofs at end of first life. Queen Creek —
rapid growth, larger lots, well-and-septic edges. Paradise Valley — town permitting,
hillside ordinance, custom estates. Camelback East Village — a Phoenix urban village, midcentury
stock, infill. Goodyear Meadows — West Valley, newer stock, expansive-soil considerations.
Florence — Pinal County jurisdiction, not Maricopa; rural parcels, long utility runs.

- [ ] **Step 4: Implement `service` and `area`**

```js
export function service(c) {
  const s = c.item;
  const tabs = c.services.map((x) => {
    const on = x.slug === s.slug;
    return `<a href="${c.url(`services/${x.slug}`)}"${on ? ' class="active" aria-current="page"' : ''}>${esc(x.name)}</a>`;
  }).join('');

  const steps = s.process.map((p) => `
    <div class="step rv"><span class="mono">${p.n}</span>
      <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>`).join('');

  const why = s.whyChoose.map((w) => `<div class="badge rv"><p>${esc(w)}</p></div>`).join('');

  const scope = s.scope && s.scope.length ? `
<section class="sec cream">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead rv"><h2>Complete Range of ${esc(s.name)} Services</h2></div>
    <div class="svcs">${s.scope.map((x) => `
      <article class="svc rv"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join('')}
    </div>
  </div>
</section>` : '';

  const faq = s.faqs && s.faqs.length ? `
<section class="sec faq">
  <div class="wrap">
    <div class="shead rv"><p class="eyebrow mono">&mdash; FAQs</p>
      <h2>${esc(s.name)} Services FAQ</h2></div>
    <div class="faqlist">${s.faqs.map((f) => `
      <details class="rv"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono">Services</p>
    <h1>${esc(s.h1)}</h1>
    <p class="lede">${esc(s.subheroTagline)}</p>
    <a class="btn" href="${c.url('contact')}">Get in touch</a>
  </div>
</section>

<nav class="sec svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="sec cream">
  <div class="wrap prose rv">
    <h2>${esc(s.name)} Services by ${esc(c.site.name)}</h2>
    ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
    <h3>Why choose ${esc(c.site.name)}?</h3>
    <div class="badges">${why}</div>
  </div>
</section>
${scope}

<section class="sec dark">
  <div class="grid-bg on-dark" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead rv"><h2>Our Unique ${esc(s.name)} Service Process</h2></div>
    <div class="steps">${steps}</div>
  </div>
</section>
${faq}

<section class="cta">
  <div class="wrap cta-copy">
    <h2>${esc(s.ctaHeading)}</h2><p>${esc(s.ctaBody)}</p>
    <a class="btn" href="${c.url('contact')}">Get in touch</a>
    <a class="btn ghost" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </div>
</section>`;
}

import { readFileSync as _read } from 'node:fs';
const LOCAL = JSON.parse(_read('content/areas-local.json', 'utf8'));

export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));
  const local = LOCAL[a.slug];

  const cards = c.services.map((s) => `
    <article class="svc rv"><h3>${esc(s.name)}</h3><p>${esc(s.shortDesc)}</p>
      <a class="more" href="${c.url(`services/${s.slug}`)}">Learn more &rarr;</a></article>`).join('');

  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono">Service Area</p>
    <h1>${fill(t.h1)}</h1>
    <p class="lede">${fill(t.tagline)}</p>
    <div class="hero-acts">
      <a class="btn" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <a class="btn ghost" href="${c.url('contact')}">Get in touch</a>
    </div>
  </div>
</section>

<section class="sec cream">
  <div class="wrap prose rv">
    <h2>Building in ${esc(a.city)}</h2>
    ${local.paras.map((p) => `<p>${esc(p)}</p>`).join('')}
    <div class="badges">${local.notes.map((n) =>
      `<div class="badge"><p>${esc(n)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="sec dark">
  <div class="grid-bg on-dark" aria-hidden="true"></div>
  <div class="wrap">
    <div class="shead rv"><h2>${fill(t.servicesHeading)}</h2></div>
    <div class="svcs">${cards}</div>
  </div>
</section>

<section class="cta">
  <div class="wrap cta-copy">
    <h2>${fill(t.ctaHeading)}</h2><p>${fill(t.ctaBody)}</p>
    <a class="btn" href="${c.url('contact')}">Get in touch</a>
    <a class="btn ghost" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </div>
</section>`;
}
```

- [ ] **Step 5: Add the FAQ, tabs and badge CSS**

Append to `d01-site-plan/assets/styles.css`:

```css
/* ---- service tabs, why-choose badges, FAQ accordion ---- */
.svctabs .wrap{display:flex;flex-wrap:wrap;gap:8px;padding-top:22px;padding-bottom:22px}
.svctabs a{padding:9px 15px;border-radius:999px;font-size:14px;font-weight:600;
  border:1px solid rgba(20,19,16,.16)}
.svctabs a:hover{background:rgba(20,19,16,.06)}
.svctabs a.active{background:var(--acc);color:var(--on-acc);border-color:transparent}
.badges{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:14px;margin-top:26px}
.badge p{margin:0}
.faqlist{display:grid;gap:12px;max-width:900px}
.faqlist details{background:#fff;border-radius:var(--r,16px);padding:18px 22px;
  box-shadow:0 1px 3px rgba(20,19,16,.06),0 10px 26px rgba(20,19,16,.07)}
.faqlist summary{font-weight:700;cursor:pointer;list-style:none}
.faqlist summary::-webkit-details-marker{display:none}
.faqlist summary::after{content:'+';float:right;font-weight:400;opacity:.55}
.faqlist details[open] summary::after{content:'\2013'}
.faqlist details p{margin:12px 0 0;opacity:.82}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test build/directions/d01.test.mjs`
Expected: PASS, 13 tests

- [ ] **Step 7: Build and probe**

```bash
node build/build.mjs d01
cd shots && node probe.mjs ../d01-site-plan/services/concrete/index.html 1440
cd shots && node probe.mjs ../d01-site-plan/service-areas/mesa-az/index.html 390
```

Expected: no broken images, nothing past the viewport at either width.

- [ ] **Step 8: Commit**

```bash
git add build/directions/d01.mjs build/directions/d01.test.mjs content/areas-local.json d01-site-plan
git commit -m "Build direction 01's service pages and area pages with authored local copy"
```

---

### Task 12: Direction 01 — the five remaining pages

**Files:**
- Modify: `build/directions/d01.mjs` — replace the `about`, `gallery`, `projects`, `contact`, `sitemap` stubs
- Test: `build/directions/d01.test.mjs` — add cases

**Interfaces:**
- Consumes: `ctx.pages.{about,gallery,projects,contact,sitemap}`
- Produces: nothing downstream

- [ ] **Step 1: Write the failing test**

```js
// append to build/directions/d01.test.mjs
test('the contact page renders the form and the real phone number', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  assert.match(html, /<form[^>]*class="contact-form"/);
  for (const n of ['name', 'email', 'phone', 'message']) {
    assert.ok(html.includes(`name="${n}"`), `contact form missing field ${n}`);
  }
  assert.ok(html.includes('tel:16023996455'));
});

test('the gallery renders stock photography, labelled as placeholder', () => {
  const html = renderPage({ mod: d01, key: 'gallery' });
  const imgs = html.match(/<img[^>]+>/g) || [];
  assert.ok(imgs.length >= 9, `gallery has only ${imgs.length} images`);
  assert.match(html, /placeholder photography/i);
  assert.ok(!html.includes('plans.webp'));
});

test('every gallery image has alt text and intrinsic dimensions', () => {
  const html = renderPage({ mod: d01, key: 'gallery' });
  for (const img of html.match(/<img[^>]+>/g) || []) {
    assert.match(img, /alt="[^"]+"/, `image without alt: ${img}`);
    assert.match(img, /width="\d+"/, `image without width: ${img}`);
    assert.match(img, /height="\d+"/, `image without height: ${img}`);
  }
});

test('the sitemap links all thirty-one pages', () => {
  const html = renderPage({ mod: d01, key: 'sitemap' });
  const svcs = JSON.parse(readFileSync('content/services.json', 'utf8'));
  const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;
  for (const s of svcs) assert.ok(html.includes(`../services/${s.slug}/index.html`), s.slug);
  for (const a of areas) assert.ok(html.includes(`../service-areas/${a.slug}/index.html`), a.slug);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/directions/d01.test.mjs`
Expected: FAIL — the five pages render empty

- [ ] **Step 3: Implement the five renderers**

```js
const GALLERY = [
  ['framing.webp', 'Timber framing on a Quest Construction project'],
  ['rebar.webp', 'Reinforcing steel placed before a pour'],
  ['crew-slab.webp', 'A crew finishing a concrete slab'],
  ['roofline.webp', 'A finished roofline against the Arizona sky'],
  ['facade.webp', 'A rendered and painted exterior facade'],
  ['kitchen.webp', 'A completed kitchen remodel'],
  ['bath.webp', 'A completed bathroom remodel'],
  ['mech.webp', 'Mechanical rough-in before drywall'],
  ['trade-electric.webp', 'Electrical rough-in on a remodel'],
  ['home-dusk.webp', 'A finished home at dusk'],
  ['neighborhood.webp', 'A residential street of completed homes'],
  ['site-steel.webp', 'Structural steel on site'],
];

export function about(c) {
  const a = c.pages.about;
  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap"><p class="eyebrow mono">About</p>
    <h1>${esc(a.h1)}</h1><p class="lede">${esc(a.lede)}</p></div>
</section>

<section class="sec cream story">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap split">
    <img src="${c.asset('quest/story.webp')}" alt="A Quest Construction build in progress"
      width="1000" height="700" loading="lazy" decoding="async">
    <div class="rv"><p class="eyebrow mono">Our Story</p>
      <h2>${esc(a.storyHeading)}</h2>
      ${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      <a class="btn" href="${c.url('contact')}">Get in touch</a></div>
  </div>
</section>

<section class="cta"><div class="wrap cta-copy">
  <h2>Build with a team that answers the phone</h2>
  <p>${esc(c.site.positioning)} &middot; ${esc(c.site.availability)}.</p>
  <a class="btn" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
</div></section>`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap"><p class="eyebrow mono">Gallery</p>
    <h1>${esc(g.h1)}</h1><p class="lede">${esc(g.lede)}</p></div>
</section>

<section class="sec cream"><div class="wrap">
  <div class="gal">${GALLERY.map(([f, alt]) => `
    <figure class="rv"><img src="${c.asset(f)}" alt="${esc(alt)}"
      width="900" height="600" loading="lazy" decoding="async"></figure>`).join('')}
  </div>
  <p class="mono note">Placeholder photography &mdash; to be replaced with Quest Construction jobsite photographs.</p>
</div></section>

<section class="cta"><div class="wrap cta-copy">
  <h2>Start your project</h2><p>${esc(c.pages.home.ctaBody)}</p>
  <a class="btn" href="${c.url('contact')}">Get in touch</a>
</div></section>`;
}

export function projects(c) {
  const p = c.pages.projects;
  const shots = ['framing.webp', 'home-dusk.webp', 'crew-slab.webp'];
  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap"><p class="eyebrow mono">Work</p>
    <h1>${esc(p.h1)}</h1><p class="lede">${esc(p.lede)}</p></div>
</section>

<section class="sec cream"><div class="wrap">
  <div class="pjs">${p.items.map((it, i) => `
    <article class="pjcard rv">
      <img src="${c.asset(shots[i % shots.length])}" alt="${esc(it.title)}"
        width="900" height="600" loading="lazy" decoding="async">
      <h3>${esc(it.title)}</h3><p>${esc(it.body)}</p>
    </article>`).join('')}
  </div>
  <p class="mono note">Placeholder photography &mdash; to be replaced with Quest Construction project photographs.</p>
</div></section>

<section class="cta"><div class="wrap cta-copy">
  <h2>${esc(c.pages.home.ctaHeading)}</h2><p>${esc(c.pages.home.ctaBody)}</p>
  <a class="btn" href="${c.url('contact')}">Get in touch</a>
</div></section>`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label>${esc(f.label)}<textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label>${esc(f.label)}<input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;
  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap"><p class="eyebrow mono">Contact</p>
    <h1>${esc(p.h1)}</h1><p class="lede">${esc(p.lede)}</p></div>
</section>

<section class="sec cream"><div class="wrap contact-grid">
  <form class="contact-form rv">
    <h2>${esc(p.formHeading)}</h2>
    ${p.fields.map(field).join('')}
    <button class="btn" type="submit">Submit</button>
    <p class="form-note mono" aria-live="polite"></p>
  </form>
  <aside class="help-card rv">
    <h2>${esc(p.helpHeading)}</h2>
    <p class="eyebrow mono">Phone &middot; ${esc(c.site.availability)}</p>
    <a class="phone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
    <p>${esc(c.site.footerBlurb)}</p>
  </aside>
</div></section>`;
}

export function sitemap(c) {
  const list = (title, items) => `<div><h2>${title}</h2><ul>${items.map(([h, l]) =>
    `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul></div>`;
  return `
<section class="subhero">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap"><p class="eyebrow mono">Sitemap</p>
    <h1>${esc(c.pages.sitemap.h1)}</h1><p class="lede">${esc(c.pages.sitemap.lede)}</p></div>
</section>

<section class="sec cream"><div class="wrap smap">
  ${list('Pages', [[c.url('home'), 'Home'], [c.url('about'), 'About Us'],
    [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
    [c.url('contact'), 'Contact']])}
  ${list('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
  ${list('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
</div></section>`;
}
```

- [ ] **Step 4: Add the CSS for the new page types**

Append to `d01-site-plan/assets/styles.css`:

```css
/* ---- gallery, projects, contact, sitemap ---- */
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.gal figure{margin:0;border-radius:var(--r-lg,30px);overflow:hidden;
  box-shadow:0 2px 6px rgba(20,19,16,.06),0 14px 32px rgba(20,19,16,.10)}
.gal img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:3/2}
.pjs{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px}
.pjcard{background:#fff;border-radius:var(--r-lg,30px);overflow:hidden;
  box-shadow:0 2px 6px rgba(20,19,16,.06),0 14px 32px rgba(20,19,16,.10)}
.pjcard img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover}
.pjcard h3,.pjcard p{padding:0 24px}
.pjcard h3{margin:22px 0 8px}.pjcard p{padding-bottom:26px;opacity:.82}
.note{opacity:.55;margin-top:22px;font-size:13px}
.contact-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:28px;align-items:start}
.contact-form{background:#fff;border-radius:var(--r-lg,30px);padding:30px;
  box-shadow:0 2px 6px rgba(20,19,16,.06),0 14px 32px rgba(20,19,16,.10);display:grid;gap:14px}
.contact-form label{display:grid;gap:6px;font-weight:600;font-size:14px}
.contact-form input,.contact-form textarea{font:inherit;padding:13px 15px;
  border:1px solid rgba(20,19,16,.18);border-radius:var(--r,16px);background:#FCFAF5}
.help-card{background:var(--acc);color:var(--on-acc);border-radius:var(--r-lg,30px);padding:30px}
.help-card .phone{font-size:30px;font-weight:800;display:block;margin:6px 0 16px}
.smap{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:30px}
.smap ul{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}
@media(max-width:820px){.contact-grid{grid-template-columns:1fr}}
```

- [ ] **Step 5: Wire the static-form notice into `script()`**

```js
(function(){
  document.querySelectorAll('.contact-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var n=f.querySelector('.form-note');
      if(n) n.textContent='This form is not yet connected. Please call '
        + '(602) 399-6455 and we will pick up.';
    });
  });
})();
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test build/directions/d01.test.mjs`
Expected: PASS, 17 tests

- [ ] **Step 7: Build and commit**

```bash
node build/build.mjs d01
git add build/directions/d01.mjs build/directions/d01.test.mjs d01-site-plan
git commit -m "Build direction 01's about, gallery, projects, contact and sitemap pages"
```

---

### Task 13: Link checker

**Files:**
- Create: `build/check-links.mjs`
- Test: `build/check-links.test.mjs`

**Interfaces:**
- Consumes: generated output on disk
- Produces: `checkDir(root) -> {checked, broken: {file, href}[]}`; exits non-zero when broken

- [ ] **Step 1: Write the failing test**

```js
// build/check-links.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDir } from './check-links.mjs';

test('direction 01 has no broken internal links or missing images', () => {
  const r = checkDir('d01-site-plan');
  assert.equal(r.broken.length, 0,
    'broken:\n' + r.broken.map((b) => `  ${b.file} -> ${b.href}`).join('\n'));
  assert.equal(r.checked, 31);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/check-links.test.mjs`
Expected: FAIL — `Cannot find module './check-links.mjs'`

- [ ] **Step 3: Write the implementation**

```js
// build/check-links.mjs
// At three directory depths across 310 generated pages, a wrong relative path
// is the defect class most likely to ship unnoticed. This walks every href and
// src in the output and resolves it against the filesystem.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

export function checkDir(root) {
  const files = walk(root);
  const broken = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = m[1];
      if (/^(https?:|tel:|mailto:|data:|#|\/\/)/.test(href)) continue;
      const target = resolve(dirname(file), href.split('#')[0]);
      if (!existsSync(target) || statSync(target).isDirectory()) broken.push({ file, href });
    }
  }
  return { checked: files.length, broken };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const roots = process.argv.slice(2);
  let bad = 0;
  for (const r of roots) {
    const { checked, broken } = checkDir(r);
    console.log(`${r}: ${checked} pages, ${broken.length} broken`);
    for (const b of broken) console.log(`  ${b.file} -> ${b.href}`);
    bad += broken.length;
  }
  process.exit(bad ? 1 : 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test build/check-links.test.mjs`
Expected: PASS. If it fails, the reported paths name the exact bad link — fix the
renderer, never the checker.

- [ ] **Step 5: Commit**

```bash
git add build/check-links.mjs build/check-links.test.mjs
git commit -m "Add a link checker for the generated output"
```

---

### Tasks 14–22: Directions 02 through 10

Nine tasks, one per direction. **Each follows exactly the same nine steps as Tasks 9–12
combined**, with only the idiom differing. The mechanical steps are identical every time:

1. `node build/extract-css.mjs direction-N-<name>.html dNN-<slug>` and rewrite its asset URLs
   with the one-liner from Task 9 Step 3.
2. Copy `build/directions/d01.mjs` to `build/directions/dNN.mjs`, set `meta` (slug, name,
   `indexable: false`, that direction's own `fonts` link lifted from its mockup `<head>`,
   and its `preload` for the LCP hero).
3. Copy `build/directions/d01.test.mjs` to `dNN.test.mjs`, swap the import and the slug,
   and change the indexable assertion to `assert.equal(dNN.meta.indexable, false)`.
4. Rewrite each of the ten renderers in that direction's idiom, per the tables below.
5. Append that direction's nav, FAQ, gallery, contact and sitemap CSS to its stylesheet.
6. Lift that direction's own accent-swap `P` map and any bespoke scripts from its mockup
   into `script()`.
7. `node --test build/directions/dNN.test.mjs`
8. `node build/build.mjs dNN && node build/check-links.mjs dNN-<slug>`
9. `cd shots && node probe.mjs ../dNN-<slug>/services/concrete/index.html 1440` and again at
   390 wide; then commit.

**Area pages in directions 02–10** use the ported template (`c.areas.template` with the
`{{city}}` token filled), *not* `areas-local.json`. They are `noindex`, so the thin-content
exposure does not reach the index. The `area` renderer for these directions is d01's with
the `LOCAL` block removed and the community/local/commitment paragraphs from the template
rendered in its place.

**Per-direction assignments.** No cell may repeat another direction's cell — the same rule
the README already applies to the homepage furniture.

| # | Slug | Nav | Service process | Why-choose | FAQ |
|---|---|---|---|---|---|
| 02 | `d02-heavy-plant` | Ghost-wordmark backdrop, pill links | Machine-cut numbered band | Ghost-numeral list | Skewed bar rows |
| 03 | `d03-split-bay` | Chamfered flyout, hard 90° grid | Chamfered plates | Flat 2×2 blocks | Chamfered toggles |
| 04 | `d04-grid-north` | Mega-panel on the 12-column grid | Numbered rows on the grid | Hairline-ruled columns | Hairline rows, no chrome |
| 05 | `d05-ground-break` | Full-width green drop | Concentric arc steps | Chunky green cards | Colour-field panels |
| 06 | `d06-red-iron` | Diagonal panel, black slabs | Rotated slabs | Halftone parallelograms | Black-slab questions |
| 07 | `d07-bid-desk` | Clean white dropdown, estimate CTA right | Spec cards in a rail | Checklist card | Plain utility accordion |
| 08 | `d08-machine-age` | Ziggurat-framed panel, brass rules | Ziggurat arches | Symmetrical brass lozenges | Ornamental centred panel |
| 09 | `d09-site-notice` | Stapled column on paper | Stapled index cards | Torn strip, `××` separated | Typewriter Q&A on clean paper |
| 10 | `d10-cross-cut` | Notched steel flyout, accent hairline | Chevrons riding a slash | Notched steel plates | Expanding cut panes |

| # | Gallery | Projects | Contact | Sitemap |
|---|---|---|---|---|
| 02 | Staggered plant-yard grid | Wide banded rows | Form on a cream plate | Ghost-numeral columns |
| 03 | Chamfered grayscale tiles | Split-bay pairs | Dark split form | Flat ruled columns |
| 04 | Photo wall, 2px gaps | Index table | Form on the grid, hairline fields | Numbered index table |
| 05 | Full-bleed masonry | 4 chunky cards | Green field, knocked-out form | Cream plate columns |
| 06 | Angled collage | Overlapping parallelograms | Diagonal black band form | Diagonal marquee columns |
| 07 | Even utility grid | 3 spec cards | The estimate bar, expanded | Plain utility list |
| 08 | Vertical stepped tiles | Ziggurat frames | Symmetrical brass panel | Centred ornamental columns |
| 09 | Photocopied contact sheet | Stapled flyers | A notice with a tear-off tab | Pinned index on the hoarding |
| 10 | Skewed filmstrip | Slashed photo bands | Slab form over a cut | Notched plate columns |

- [ ] **Task 14: Direction 02 — Heavy Plant** (`direction-2-heavy-plant.html` → `d02-heavy-plant`)
- [ ] **Task 15: Direction 03 — Split Bay** (`direction-3-split-bay.html` → `d03-split-bay`)
- [ ] **Task 16: Direction 04 — Grid North** (`direction-4-grid-north.html` → `d04-grid-north`)
- [ ] **Task 17: Direction 05 — Ground Break** (`direction-5-ground-break.html` → `d05-ground-break`)
- [ ] **Task 18: Direction 06 — Red Iron** (`direction-6-red-iron.html` → `d06-red-iron`)
- [ ] **Task 19: Direction 07 — Bid Desk** (`direction-7-bid-desk.html` → `d07-bid-desk`)
- [ ] **Task 20: Direction 08 — Machine Age** (`direction-8-machine-age.html` → `d08-machine-age`)
- [ ] **Task 21: Direction 09 — Site Notice** (`direction-9-site-notice.html` → `d09-site-notice`)
- [ ] **Task 22: Direction 10 — Cross Cut** (`direction-10-cross-cut.html` → `d10-cross-cut`)

Commit each separately: `git commit -m "Build direction NN's thirty-one pages"`.

**Traps these directions have already been bitten by** — all recorded in the README, and
all still apply to the new inner pages:

- Do not animate `transform` for scroll reveals; animate `translate`.
- Never name a state class the same as a layout class.
- A rotated full-bleed bar needs a clipping parent, not `scale()` (09).
- `clip-path` clips paint, not scroll — slashed sections also need `overflow:hidden` (10).
- A hide rule that also matches the thing you are showing wins on specificity — `.nav .btn:not(.navtel)` (10).
- `margin:0 auto` on a column flex item shrink-wraps it; give it `width:100%` (05, 06).
- `<figure>` carries a UA margin of `1em 40px` — zero it (04).
- Two classes beat one class plus an element (04).
- A `<span>` is inline; `overflow`/`aspect-ratio`/`border-radius` need `display:block` (05).
- Scope `font-feature-settings:'tnum'` to numerals, never `body`.

---

### Task 23: Repoint the chooser

**Files:**
- Modify: `index.html`
- Delete: `direction-1-site-plan.html` … `direction-10-cross-cut.html`
- Test: `build/chooser.test.mjs`

**Interfaces:**
- Consumes: the ten built direction folders
- Produces: nothing downstream

- [ ] **Step 1: Write the failing test**

```js
// build/chooser.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const SLUGS = ['d01-site-plan','d02-heavy-plant','d03-split-bay','d04-grid-north',
  'd05-ground-break','d06-red-iron','d07-bid-desk','d08-machine-age',
  'd09-site-notice','d10-cross-cut'];

test('the chooser points at every built direction and no legacy path', () => {
  const html = readFileSync('index.html', 'utf8');
  for (const s of SLUGS) assert.ok(html.includes(`${s}/index.html`), `chooser missing ${s}`);
  assert.doesNotMatch(html, /direction-\d+-[a-z-]+\.html/, 'chooser still references a legacy path');
});

test('the legacy mockup files are gone and every target exists', () => {
  assert.ok(!existsSync('direction-1-site-plan.html'));
  for (const s of SLUGS) assert.ok(existsSync(`${s}/index.html`), `${s} not built`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/chooser.test.mjs`
Expected: FAIL — chooser still references `direction-1-site-plan.html`

- [ ] **Step 3: Rewrite the chooser's targets**

```bash
node -e "
const fs=require('fs');
const map={'direction-1-site-plan.html':'d01-site-plan/index.html',
'direction-2-heavy-plant.html':'d02-heavy-plant/index.html',
'direction-3-split-bay.html':'d03-split-bay/index.html',
'direction-4-grid-north.html':'d04-grid-north/index.html',
'direction-5-ground-break.html':'d05-ground-break/index.html',
'direction-6-red-iron.html':'d06-red-iron/index.html',
'direction-7-bid-desk.html':'d07-bid-desk/index.html',
'direction-8-machine-age.html':'d08-machine-age/index.html',
'direction-9-site-notice.html':'d09-site-notice/index.html',
'direction-10-cross-cut.html':'d10-cross-cut/index.html'};
let h=fs.readFileSync('index.html','utf8');
for(const [a,b] of Object.entries(map)) h=h.split(a).join(b);
fs.writeFileSync('index.html',h);
console.log('chooser repointed');
"
```

- [ ] **Step 4: Delete the legacy mockups**

```bash
git rm direction-1-site-plan.html direction-2-heavy-plant.html direction-3-split-bay.html \
       direction-4-grid-north.html direction-5-ground-break.html direction-6-red-iron.html \
       direction-7-bid-desk.html direction-8-machine-age.html direction-9-site-notice.html \
       direction-10-cross-cut.html
```

- [ ] **Step 5: Confirm the accent dots still drive all ten iframes**

Run: `cd shots && node click.mjs palClay ./chooser-clay.png`
Expected: all ten cards repaint clay. The dots use `postMessage`, and each direction's
`script()` still listens — but the iframes are one directory deeper now, so verify rather
than assume.

- [ ] **Step 6: Run test and commit**

```bash
node --test build/chooser.test.mjs
git add index.html
git commit -m "Repoint the chooser at the ten built sites and drop the legacy mockups"
```

---

### Task 24: Sitemap, robots and the README

**Files:**
- Modify: `sitemap.xml`
- Modify: `robots.txt`
- Modify: `README.md`
- Create: `build/sitemap.mjs`
- Test: `build/sitemap.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// build/sitemap.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSitemap } from './sitemap.mjs';

test('the sitemap lists exactly the thirty-one indexable pages', () => {
  const xml = buildSitemap();
  assert.equal((xml.match(/<url>/g) || []).length, 31);
  assert.ok(xml.includes('https://questconstruction.com/d01-site-plan/'));
});

test('the sitemap excludes every noindex direction', () => {
  const xml = buildSitemap();
  for (const s of ['d02-heavy-plant', 'd05-ground-break', 'd10-cross-cut']) {
    assert.ok(!xml.includes(s), `sitemap must not list ${s}`);
  }
});

test('robots.txt still welcomes the AI crawlers and points at the sitemap', () => {
  const r = readFileSync('robots.txt', 'utf8');
  for (const bot of ['GPTBot', 'PerplexityBot', 'ClaudeBot']) assert.ok(r.includes(bot));
  assert.match(r, /Sitemap:\s*https:\/\/questconstruction\.com\/sitemap\.xml/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test build/sitemap.test.mjs`
Expected: FAIL — `Cannot find module './sitemap.mjs'`

- [ ] **Step 3: Write the generator**

```js
// build/sitemap.mjs
// Only the indexable direction goes in. The other nine are noindex,follow —
// ten near-identical sites in one index would cannibalise each other.
import { writeFileSync } from 'node:fs';
import { resolver } from './lib/url.mjs';
import { pageList } from './lib/pages.mjs';

const INDEXABLE = 'd01-site-plan';
const TODAY = '2026-08-18';

export function buildSitemap() {
  const urls = pageList().map((p) => {
    const res = resolver(INDEXABLE, p.key);
    const priority = p.kind === 'home' ? '1.0'
      : p.kind === 'service' || p.kind === 'area' ? '0.8' : '0.6';
    return `  <url>
    <loc>${res.canonical}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9".replace>
${urls}
</urlset>
`;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  writeFileSync('sitemap.xml', buildSitemap());
  console.log('sitemap.xml written');
}
```

Fix the namespace line to exactly `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
— the string above is deliberately wrong so the test catches an unreviewed copy-paste. Correct
it before running.

- [ ] **Step 4: Generate and verify**

Run: `node build/sitemap.mjs && node --test build/sitemap.test.mjs`
Expected: `sitemap.xml written`, then PASS

- [ ] **Step 5: Update the README**

Add a section recording, in the README's existing voice: the folder-per-direction layout;
that content lives in `content/*.json` and pages are generated by `node build/build.mjs`;
that only `d01-site-plan` is indexable and why; that area pages in 02–10 carry the ported
template while `d01` carries authored local copy; that the contact form is still unwired;
and that address, ROC number and email remain unpublished so no `PostalAddress` or
`aggregateRating` appears in any schema. Update the "Placeholders to replace" section to
drop the now-real phone and founding year, and to add the gallery/projects placeholder
photography.

- [ ] **Step 6: Commit**

```bash
git add build/sitemap.mjs build/sitemap.test.mjs sitemap.xml robots.txt README.md
git commit -m "Regenerate the sitemap for the indexable direction and document the build"
```

---

### Task 25: Full-site verification

**Files:**
- Create: `build/verify.mjs`
- Test: run against all ten directions

- [ ] **Step 1: Write the verifier**

```js
// build/verify.mjs — the gate before this is called done.
import { checkDir } from './check-links.mjs';
import { readFileSync } from 'node:fs';
import { readdirSync } from 'node:fs';

const SLUGS = readdirSync('.', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^d\d\d-/.test(e.name)).map((e) => e.name).sort();

const BANNED = ['555-0100', 'Buchanan', 'ROC #', 'aggregateRating',
  'plans.webp', 'est. 2010', '{{city}}', 'href="#"'];

let fail = 0, pages = 0;
console.log(`directions: ${SLUGS.length}`);
if (SLUGS.length !== 10) { console.log('EXPECTED 10 DIRECTIONS'); fail++; }

for (const slug of SLUGS) {
  const { checked, broken } = checkDir(slug);
  pages += checked;
  if (checked !== 31) { console.log(`${slug}: ${checked} pages, expected 31`); fail++; }
  if (broken.length) {
    console.log(`${slug}: ${broken.length} broken links`);
    for (const b of broken.slice(0, 10)) console.log(`   ${b.file} -> ${b.href}`);
    fail++;
  }
}

// Content rules, across every generated page.
import { readdirSync as rd } from 'node:fs';
import { join } from 'node:path';
function walk(d, o = []) {
  for (const e of rd(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, o); else if (e.name.endsWith('.html')) o.push(p);
  }
  return o;
}
let indexable = 0;
for (const slug of SLUGS) {
  for (const f of walk(slug)) {
    const html = readFileSync(f, 'utf8');
    for (const b of BANNED) {
      if (html.includes(b)) { console.log(`${f}: contains "${b}"`); fail++; }
    }
    if (/content="index,follow/.test(html)) indexable++;
  }
}
if (indexable !== 31) { console.log(`indexable pages: ${indexable}, expected 31`); fail++; }

console.log(`\n${pages} pages checked, ${fail} problem${fail === 1 ? '' : 's'}`);
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run the full suite**

```bash
node --test build/
node build/build.mjs
node build/verify.mjs
```

Expected: all tests pass; `total: 310 pages`; `310 pages checked, 0 problems`.

- [ ] **Step 3: Visual spot-check across all ten**

```bash
cd shots
for d in d01-site-plan d02-heavy-plant d03-split-bay d04-grid-north d05-ground-break \
         d06-red-iron d07-bid-desk d08-machine-age d09-site-notice d10-cross-cut; do
  node probe.mjs ../$d/index.html 1440
  node probe.mjs ../$d/services/concrete/index.html 1440
  node probe.mjs ../$d/contact-us/index.html 390
done
```

Expected: no broken images and nothing past the viewport, at either width, anywhere.
A sideways-scrolling page names the offending element — fix that direction's CSS.

- [ ] **Step 4: Commit**

```bash
git add build/verify.mjs
git commit -m "Add the full-site verifier and confirm all 310 pages build clean"
git push origin main
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: content inventory → Tasks 2–3;
architecture and the module contract → Tasks 4–7; the five real images → Task 8; CSS
extraction → Task 9; the new navbar → Task 9 and each of 14–22; inner-page furniture →
Tasks 10–12 and the two assignment tables; SEO and schema → Task 6; R1 and R2 (the
doorway-page mitigations) → Task 11 and the noindex rule in Task 14–22's preamble; R3 →
the `indexable` flag in Task 6 and the sitemap in Task 24; R4 (dropped sections) → Task 10;
the chooser → Task 23; verification → Tasks 13 and 25.

**Type consistency.** `resolver()` returns `{depth, url, local, asset, abs, canonical,
absAsset}` in Task 4 and is consumed under exactly those names in Tasks 6, 7 and 9–12.
`pageList()` entries carry `{key, kind, title, description, ogImage, ogAlt, item}`
throughout. The direction module contract in Task 7 lists ten renderers plus `meta` and
`script`; `d01.mjs` exports all twelve.

**Known gap, deliberate.** Tasks 14–22 give each direction a design brief and identical
mechanical steps rather than full markup. Ten complete sets of renderers would be
~4,000 lines of design work that cannot be meaningfully pre-written — the furniture tables
plus d01 as a worked reference are the specification. Every one of those tasks is still
gated by its own test file, `check-links`, and `probe.mjs`.
