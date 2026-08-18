// Walks ten direction modules over thirty-one pages and writes static HTML.
// Output is committed; this is a dev tool, not a runtime dependency.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
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
    url: res.url, asset: res.asset, local: res.local, root: res.root,
    site: content.site, services: content.services,
    areas: content.areas, pages: content.pages,
    item: page.item,
  };

  const head = buildHead({
    page, res, dir: mod.meta, content,
    fonts: mod.meta.fonts || '',
    preload: typeof mod.meta.preload === 'function'
      ? mod.meta.preload(ctx) : (mod.meta.preload || ''),
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
  // Clear the generated page trees so a renamed slug cannot leave orphans
  // behind. assets/ is left alone — the stylesheet is not generated.
  for (const d of ['services', 'service-areas', 'about-us', 'gallery', 'projects',
    'contact-us', 'sitemap']) {
    rmSync(join(root, d), { recursive: true, force: true });
  }
  let written = 0;
  for (const key of allPagesFor()) {
    const file = join(root, outPath(key));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage({ mod, key }));
    written++;
  }
  return { written };
}

const DIRECTIONS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 'd09', 'd10'];

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const only = process.argv[2];
  let total = 0;
  for (const d of DIRECTIONS) {
    if (only && d !== only) continue;
    let mod;
    try {
      mod = await import(`./directions/${d}.mjs`);
    } catch (e) {
      if (e.code === 'ERR_MODULE_NOT_FOUND' && e.message.includes(`${d}.mjs`)) {
        console.log(`${d}: not yet written, skipping`);
        continue;
      }
      throw e;
    }
    const { written } = buildDirection(mod);
    total += written;
    console.log(`${mod.meta.slug}: ${written} pages`);
  }
  console.log(`total: ${total} pages`);
}
