// Only the indexable direction goes in. The other nine are noindex,follow —
// ten near-identical sites in one index would cannibalise each other.
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  writeFileSync('sitemap.xml', buildSitemap());
  console.log('sitemap.xml written');
}
