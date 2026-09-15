# Quest Construction — website

The live site. Static HTML, no build step, no runtime dependency: point a host
at this directory and it serves.

- **257 pages** — home, 15 services, 34 service areas,
  the trade-by-city pages, two section landing pages, the blog index and
  6 posts, about, gallery, projects, contact and sitemap — plus a 404.
- **Design**: "Site Plan" in Burnt Orange (`#D07C42`).
- **Fonts**: Archivo and JetBrains Mono, self-hosted variable woff2. No third-party requests.
- Canonicals, Open Graph, JSON-LD and `sitemap.xml` all assume **https://questconstruction.com**.
  A different domain is one find-and-replace across the HTML plus `sitemap.xml`,
  `robots.txt` and `llms.txt`.

## Deploying

Nothing to build. `vercel.json` and `_headers` carry the same caching and security
headers, so Vercel, Netlify and Cloudflare Pages all work with no further configuration.

| Host | Setting |
|---|---|
| Vercel | Framework preset **Other**, build command empty, output directory `.` |
| Netlify | Publish directory `.`, build command empty |
| Cloudflare Pages | Build output directory `/` |

## Before it goes live

- **Switch on Web Analytics** in the Vercel project (Analytics tab), then redeploy. The pages
  already load `/_vercel/insights/script.js`; it answers 404 until the feature is on.
- **Have Quest read the privacy policy and terms** (`/privacy-policy/`, `/terms-of-use/`).
  They describe what the site actually does, in plain language, and are not legal advice.
- **Check the per-city copy.** The thirty-four service-area pages name a permitting authority
  for each city; those claims need Quest's sign-off, particularly Florence (Pinal County
  rather than Maricopa), Camelback East Village (permitted through Phoenix) and Paradise
  Valley (its own town).
- **Replace the stock photography.** Some service pages carry licensed stock stand-ins,
  each marked "Stock photo" and credited on `/photo-credits/`. Swap them for Quest's own.
- **Confirm the domain** before submitting `sitemap.xml` to Search Console.

The contact form posts to FormSubmit, which forwards it to info@questconstruction.com.

No street address, licence number or review score appears anywhere on the site or in its
structured data. Quest has published none of them, and invented values in structured data
are where wrong data does the most damage. Add them when they are real.

## Regenerating

This tree is generated, not hand-edited — changes made here are overwritten. The source is
the `quest-construction-designs` repository:

```bash
node build/site/build-site.mjs     # writes site/
node build/site/verify-site.mjs    # the gate
```

Built 2026-08-22.
