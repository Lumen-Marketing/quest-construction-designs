import { graphFor } from './schema.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildHead({ page, res, dir, content, fonts = '', preload = '', extraCss = '' }) {
  const robots = dir.indexable
    ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'noindex,follow';
  const og = res.absAsset(`og/${page.ogImage}`);
  const place = page.kind === 'area' ? page.item.name : 'Arizona';

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${res.canonical}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(content.site.legalName)}">
<meta name="color-scheme" content="light">

<meta name="geo.region" content="US-AZ">
<meta name="geo.placename" content="${esc(place)}">

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

<link rel="icon" href="${res.root('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${res.root('apple-touch-icon.png')}">
${preload}${fonts}
<link rel="stylesheet" href="${res.local('assets/styles.css')}">
${extraCss}
<script type="application/ld+json">
${JSON.stringify(graphFor({ page, res, content }), null, 2)}
</script>`;
}
