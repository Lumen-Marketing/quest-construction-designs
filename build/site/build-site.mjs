// Builds the standalone, deployable site into site/.
//
//   node build/site/build-site.mjs
//
// The ten demo directions stay where they are; this writes one tree that is
// the whole product — pages at the origin root, its own assets, its own
// robots and sitemap, and nothing pointing back at the chooser.
import {
  writeFileSync, mkdirSync, rmSync, readFileSync, copyFileSync, existsSync, readdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { renderPage, contextFor } from '../build.mjs';
import { loadContent } from '../lib/pages.mjs';
import { outPath, ORIGIN } from '../lib/url.mjs';
import { siteProfile, BUILT } from '../lib/profile.mjs';
import { palette, CHOSEN_KEY } from '../lib/palette.mjs';
// The stylesheet lives in lib/ alongside the fingerprint of its contents, so
// that the profile can hand every page's <head> the name it ships under.
import { buildCss } from '../lib/site-css.mjs';
import * as mod from './module.mjs';

export const OUT = 'site';
export { BUILT, buildCss };

const PAGES = siteProfile.pages();
const content = loadContent();
const { site, services, areas } = content;

const write = (rel, body) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
};

// ----------------------------------------------------------------------- 404
// Served in place of whatever URL was requested, so every path on it has to be
// root-absolute — a relative one would resolve against the missing URL.

function notFound() {
  // Root-absolute paths, because this page is served in place of whatever URL
  // was requested — a relative one would resolve against the missing URL.
  const c = contextFor({ mod, key: 'home', profile: siteProfile, absolute: true });
  const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found | ${site.name}</title>
<meta name="robots" content="noindex,follow">
<meta name="color-scheme" content="light">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="${palette(CHOSEN_KEY).acc}">
<link rel="stylesheet" href="/${siteProfile.stylesheet()}">`;

  return `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${mod.nav(c)}
<main id="main" tabindex="-1">
<section class="gone">
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <p class="code">Error 404</p>
    <h1>That page is not on site</h1>
    <p>The link may be old, or the address mistyped. Everything Quest Construction
      builds is one click away below &mdash; or call ${site.phoneDisplay} and we
      will point you at it.</p>
    <div class="hero-acts">
      <a class="btn" href="/"><span class="pip"></span>Back to home</a>
      <a class="btn ghost" href="/sitemap/"><span class="pip"></span>See every page</a>
    </div>
  </div>
</section>
</main>
${mod.footer(c)}
${mod.script(c)}
</body>
</html>
`;
}

// -------------------------------------------------------------------- assets
// Only what the built pages actually reference, plus the root files. Copying
// the whole library would ship the cut-out working files and the photograph
// that carries a third-party logo.
function copyAssets(htmls) {
  const wanted = new Set([
    'fonts/archivo-latin-var.woff2',
    'fonts/jetbrains-mono-latin-var.woff2',
  ]);
  for (const html of htmls) {
    for (const m of html.matchAll(/(?:src|href|content)="[^"]*?assets\/([^"]+)"/g)) {
      if (!m[1].startsWith('styles.')) wanted.add(m[1]);
    }
  }
  // The social cards are only ever named in absolute form, in the OG tags and
  // the schema, so the relative scan above never sees them.
  for (const p of PAGES) wanted.add(`og/${p.ogImage}`);

  let copied = 0;
  for (const rel of [...wanted].sort()) {
    const src = join('assets', rel);
    if (!existsSync(src)) throw new Error(`referenced asset is missing: ${src}`);
    const dest = join(OUT, 'assets', rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    copied++;
  }
  for (const f of ['favicon.svg', 'apple-touch-icon.png']) copyFileSync(f, join(OUT, f));
  return copied;
}

// ------------------------------------------------------------------- sitemap
const PRIORITY = {
  home: '1.0', serviceIndex: '0.9', areaIndex: '0.9', service: '0.8', area: '0.8',
};

export function buildSitemap(images) {
  const urls = PAGES.map((p) => {
    const loc = `${ORIGIN}/${outPath(p.key).replace(/index\.html$/, '')}`;
    const imgs = (images.get(p.key) || []).map((src) => `
    <image:image><image:loc>${ORIGIN}/assets/${src}</image:loc></image:image>`).join('');
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${PRIORITY[p.kind] || '0.6'}</priority>${imgs}
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

const robots = () => `# ${site.name} — ${ORIGIN}
# Everything is crawlable. Nothing here is behind a login.

User-agent: *
Allow: /

# The repository's own readme, which ships with the tree but is not a page.
Disallow: /README.md

# AI answer engines — allowed on purpose. Quest wants to be the source these
# cite for "general contractor in Phoenix" style questions.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

const llms = () => `# ${site.name}

> ${site.legalName} is a family-owned general contractor working across
> ${areas.areas.length} cities in Arizona. Founded ${site.foundingYear}.
> ${services.length} trades, all self-managed rather than brokered out.
> Reachable ${site.availability} on ${site.phoneDisplay}.

Quest builds and remodels residential property: new custom homes and residential
development, casitas and ADUs, full interior remodels, and the exterior envelope —
roofing, stucco, siding, windows and decks. The same crew carries a job from first
conversation through final walkthrough, which is the point of hiring one contractor
rather than co-ordinating several.

- Founded: ${site.foundingYear}
- Phone: ${site.phoneDisplay} (${site.availability})
- Region: ${site.regionName}, USA
- Positioning: ${site.positioning}

## Services

${services.map((s) => `- [${s.name}](${ORIGIN}/services/${s.slug}/): ${s.shortDesc}`).join('\n')}

## Service areas

${areas.areas.map((a) => `- [${a.name}](${ORIGIN}/service-areas/${a.slug}/)`).join('\n')}

## Key pages

- [Home](${ORIGIN}/): what Quest does and who it is
- [All services](${ORIGIN}/services/): the ${services.length} trades in one index
- [All service areas](${ORIGIN}/service-areas/): the ${areas.areas.length} cities in one index
- [About](${ORIGIN}/about-us/): the firm's history and how it works
- [Projects](${ORIGIN}/projects/): completed work
- [Gallery](${ORIGIN}/gallery/): jobsite photography
- [Contact](${ORIGIN}/contact-us/): phone, form and coverage

## Notes

- Quest has not published a street address, a licence number or a review score,
  so none appears on the site or in its structured data.
- Photography outside the three images marked as Quest's own is stock standing
  in for jobsite photographs; the gallery page says so on the page.
`;

const webmanifest = () => `${JSON.stringify({
  name: site.legalName,
  short_name: site.name,
  description: site.footerBlurb,
  start_url: '/',
  scope: '/',
  display: 'browser',
  lang: 'en-US',
  background_color: '#FAF6EC',
  theme_color: palette(CHOSEN_KEY).acc,
  icons: [
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}, null, 2)}\n`;

// Pages that were published and then retired. An indexed URL that starts
// returning 404 loses whatever authority it had and strands anyone holding the
// link, so each one points at its nearest live equivalent instead. 301, because
// these are not coming back.
//   camelback-east-village  a Phoenix urban village, never a city of its own
//   florence                dropped when the service area was set to the
//                           Phoenix metro; Pinal County, ~50 miles out
export const REDIRECTS = [
  ['/service-areas/camelback-east-village-az/', '/service-areas/phoenix-az/'],
  ['/service-areas/florence-az/', '/service-areas/'],
];

// The filenames are stable rather than hashed, so the photography and fonts get
// a long cache and the HTML gets none.
const vercelJson = () => `${JSON.stringify({
  $schema: 'https://openapi.vercel.sh/vercel.json',
  trailingSlash: true,
  redirects: REDIRECTS.map(([source, destination]) => ({
    source, destination, permanent: true,
  })),
  headers: [
    {
      source: '/assets/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public,max-age=31536000,immutable' }],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      ],
    },
  ],
}, null, 2)}\n`;

// The same rules for Netlify and Cloudflare Pages, so the tree deploys as it
// stands on any of the three without a config swap.
// Netlify and Cloudflare Pages read _redirects; Vercel reads vercel.json.
// Both are generated from the same list so swapping host cannot silently
// drop them.
const redirectsFile = () => `${REDIRECTS.map(([f, t]) => `${f} ${t} 301`).join('\n')}\n`;

const headersFile = () => `/assets/*
  Cache-Control: public,max-age=31536000,immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=()
`;

// ------------------------------------------------------------------- readme
// site/ is pushed to its own repository as the deploy artefact, so it carries
// the note explaining what it is and where it came from.
const readme = () => `# ${site.name} — website

The live site. Static HTML, no build step, no runtime dependency: point a host
at this directory and it serves.

- **${PAGES.length} pages** — home, ${services.length} services, ${areas.areas.length} service areas,
  two section landing pages, about, gallery, projects, contact and sitemap — plus a 404.
- **Design**: "Site Plan" in Burnt Orange (\`#D07C42\`).
- **Fonts**: Archivo and JetBrains Mono, self-hosted variable woff2. No third-party requests.
- Canonicals, Open Graph, JSON-LD and \`sitemap.xml\` all assume **${ORIGIN}**.
  A different domain is one find-and-replace across the HTML plus \`sitemap.xml\`,
  \`robots.txt\` and \`llms.txt\`.

## Deploying

Nothing to build. \`vercel.json\` and \`_headers\` carry the same caching and security
headers, so Vercel, Netlify and Cloudflare Pages all work with no further configuration.

| Host | Setting |
|---|---|
| Vercel | Framework preset **Other**, build command empty, output directory \`.\` |
| Netlify | Publish directory \`.\`, build command empty |
| Cloudflare Pages | Build output directory \`/\` |

## Before it goes live

- **Wire the contact form.** It currently prints a note asking the visitor to call.
- **Check the per-city copy.** The thirty-four service-area pages name a permitting authority
  for each city; those claims need Quest's sign-off, particularly Florence (Pinal County
  rather than Maricopa), Camelback East Village (permitted through Phoenix) and Paradise
  Valley (its own town).
- **Replace the stock photography.** Three images are Quest's own; the rest stand in, and
  the gallery page says so on the page.
- **Confirm the domain** before submitting \`sitemap.xml\` to Search Console.

No street address, licence number or review score appears anywhere on the site or in its
structured data. Quest has published none of them, and invented values in structured data
are where wrong data does the most damage. Add them when they are real.

## Regenerating

This tree is generated, not hand-edited — changes made here are overwritten. The source is
the \`quest-construction-designs\` repository:

\`\`\`bash
node build/site/build-site.mjs     # writes site/
node build/site/verify-site.mjs    # the gate
\`\`\`

Built ${BUILT}.
`;

// --------------------------------------------------------------------- build
export function buildSite() {
  // Clear the generated tree, but leave anything hidden alone: `vercel link`
  // keeps the project link in site/.vercel and its token in site/.env.local,
  // and wiping those on every rebuild would silently unlink the deployment.
  if (existsSync(OUT)) {
    for (const e of readdirSync(OUT)) {
      if (!e.startsWith('.')) rmSync(join(OUT, e), { recursive: true, force: true });
    }
  } else {
    mkdirSync(OUT, { recursive: true });
  }

  const htmls = [];
  const images = new Map();
  for (const p of PAGES) {
    const html = renderPage({ mod, key: p.key, profile: siteProfile });
    write(outPath(p.key), html);
    htmls.push(html);
    images.set(p.key, [...new Set(
      [...html.matchAll(/<img[^>]+src="[^"]*?assets\/([^"]+)"/g)].map((m) => m[1]),
    )]);
  }

  const four = notFound();
  write('404.html', four);
  htmls.push(four);

  write(siteProfile.stylesheet(), buildCss());
  const assets = copyAssets(htmls);

  write('robots.txt', robots());
  write('sitemap.xml', buildSitemap(images));
  write('llms.txt', llms());
  write('site.webmanifest', webmanifest());
  write('vercel.json', vercelJson());
  write('_headers', headersFile());
  write('_redirects', redirectsFile());
  write('README.md', readme());

  return { pages: PAGES.length, assets };
}

if (process.argv[1] && process.argv[1].endsWith('build-site.mjs')) {
  const { pages, assets } = buildSite();
  console.log(`${OUT}/: ${pages} pages + 404, ${assets} assets`);
}
