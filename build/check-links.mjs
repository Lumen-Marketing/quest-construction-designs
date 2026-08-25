// Walks every generated page in a folder and resolves every internal href and
// src against the filesystem.
//   node build/check-links.mjs d01-site-plan [more...]
//
// The rules themselves live in lib/page-rules.mjs; this is the adapter that
// points them at a direction folder, where every link is relative.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { linkFindings, relativeTarget } from './lib/page-rules.mjs';

export function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    // Hidden entries are not ours — site/.vercel holds the deployment link.
    if (e.name.startsWith('.')) continue;
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
    for (const f of linkFindings(html, { file, resolve: relativeTarget })) {
      const href = f.message.replace(/^(broken link|dead anchor) /, '');
      (f.rule === 'anchor' ? anchors : broken).push({ file, href });
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
    for (const b of [...broken, ...anchors]) console.log(`   ${b.file} -> ${b.href}`);
    bad += broken.length + anchors.length;
  }
  process.exit(bad ? 1 : 0);
}
