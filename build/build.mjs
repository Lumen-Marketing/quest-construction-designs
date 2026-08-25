// Walks ten direction modules over thirty-one pages and writes static HTML.
// Output is committed; this is a dev tool, not a runtime dependency.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { outPath } from './lib/url.mjs';
import { loadContent } from './lib/pages.mjs';
import { buildHead } from './lib/head.mjs';
import { demoProfile } from './lib/profile.mjs';
import { HTML_TAG, SKIP_LINK, MAIN_TAG } from './lib/page-rules.mjs';

const content = loadContent();

export function allPagesFor(profile = demoProfile) {
  return profile.pages().map((p) => p.key);
}

/**
 * Everything a renderer is handed. Split out of renderPage and exported,
 * because the 404 needs a context without wanting a page: it used to get one by
 * building a fake direction module whose nav was a spy, rendering the entire
 * home page through it and keeping what the spy caught.
 *
 * @param profile   which product is being built — see lib/profile.mjs
 * @param absolute  root-absolute paths, which only the 404 needs
 */
export function contextFor({ mod, key, profile = demoProfile, absolute = false }) {
  const page = profile.pages().find((p) => p.key === key);
  if (!page) throw new Error(`no such page: ${key}`);
  const res = profile.resolverFor(mod.meta.slug, key, { absolute });

  return {
    page, res,
    url: res.url, asset: res.asset, local: res.local, root: res.root,
    hub: res.hub, hubs: profile.hubs,
    site: content.site, services: content.services,
    areas: content.areas, pages: content.pages,
    areasLocal: content.areasLocal,
    item: page.item,
  };
}

export function renderPage({ mod, key, profile = demoProfile, absolute = false }) {
  const ctx = contextFor({ mod, key, profile, absolute });
  const { page } = ctx;
  const { res } = ctx;

  const head = buildHead({
    page, res, dir: mod.meta, content,
    fonts: mod.meta.fonts || '',
    preload: typeof mod.meta.preload === 'function'
      ? mod.meta.preload(ctx) : (mod.meta.preload || ''),
    extraMeta: typeof mod.meta.extraMeta === 'function'
      ? mod.meta.extraMeta(ctx) : (mod.meta.extraMeta || ''),
    schemaOpts: profile.schemaOpts(),
  });

  const body = mod[page.kind](ctx);

  // The shell's landmarks come from page-rules, which is also what checks for
  // them — so a change here can never drift from the rule that enforces it.
  return `<!doctype html>
${HTML_TAG}
<head>
${head}
</head>
<body>
${SKIP_LINK}
${mod.nav(ctx)}
${MAIN_TAG}
${body}
</main>
${mod.footer(ctx)}
${mod.script ? mod.script(ctx) : ''}
</body>
</html>
`;
}

export function buildDirection(mod, profile = demoProfile) {
  const root = mod.meta.slug;
  // Clear the generated page trees so a renamed slug cannot leave orphans
  // behind. assets/ is left alone — the stylesheet is not generated.
  for (const d of ['services', 'service-areas', 'about-us', 'gallery', 'projects',
    'contact-us', 'sitemap']) {
    rmSync(join(root, d), { recursive: true, force: true });
  }
  let written = 0;
  for (const key of allPagesFor(profile)) {
    const file = join(root, outPath(key));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderPage({ mod, key, profile }));
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
