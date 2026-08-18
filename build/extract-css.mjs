// Lifts the inline <style> out of a direction mockup into a shared stylesheet.
// Thirty-one pages inlining ~20KB each is 600KB of duplication per direction.
//   node build/extract-css.mjs direction-1-site-plan.html d01-site-plan
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [, , src, dest] = process.argv;
if (!src || !dest) {
  console.error('usage: node build/extract-css.mjs <mockup.html> <dNN-slug>');
  process.exit(1);
}

const html = readFileSync(src, 'utf8');
const blocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
if (!blocks.length) throw new Error(`no <style> block in ${src}`);

// The mockups reference assets/ from the repo root. From dNN-slug/assets/styles.css
// that same file is two levels up.
const css = blocks.join('\n\n').trim()
  .replace(/url\((['"]?)assets\//g, 'url($1../../assets/');

mkdirSync(`${dest}/assets`, { recursive: true });
writeFileSync(`${dest}/assets/styles.css`, css + '\n');

const rewritten = (css.match(/\.\.\/\.\.\/assets\//g) || []).length;
console.log(`${dest}/assets/styles.css  ${css.length} chars, ${rewritten} asset urls rewritten`);
