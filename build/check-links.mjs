// At three directory depths across 310 generated pages, a wrong relative path
// is the defect class most likely to ship unnoticed. This walks every href and
// src in the output and resolves it against the filesystem.
//   node build/check-links.mjs d01-site-plan [more...]
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

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
  const anchors = [];

  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = m[1];
      if (/^(https?:|tel:|mailto:|data:|\/\/)/.test(href)) continue;

      // A same-page anchor must point at an id that exists on this page.
      if (href.startsWith('#')) {
        const id = href.slice(1);
        if (!id || !ids.has(id)) anchors.push({ file, href });
        continue;
      }

      const [path, hash] = href.split('#');
      const target = resolve(dirname(file), path);
      if (!existsSync(target) || statSync(target).isDirectory()) {
        broken.push({ file, href });
        continue;
      }
      if (hash) {
        const targetIds = new Set(
          [...readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]),
        );
        if (!targetIds.has(hash)) anchors.push({ file, href });
      }
    }
  }
  return { checked: files.length, broken, anchors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const roots = process.argv.slice(2);
  let bad = 0;
  for (const r of roots) {
    const { checked, broken, anchors } = checkDir(r);
    console.log(`${r}: ${checked} pages, ${broken.length} broken, ${anchors.length} dead anchors`);
    for (const b of broken) console.log(`   BROKEN ${b.file} -> ${b.href}`);
    for (const a of anchors) console.log(`   ANCHOR ${a.file} -> ${a.href}`);
    bad += broken.length + anchors.length;
  }
  process.exit(bad ? 1 : 0);
}
