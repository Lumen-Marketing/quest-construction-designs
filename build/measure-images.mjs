// Measures every shipped image and writes content/images.json. Renderers read
// it so each <img> carries true intrinsic width/height — the SEO layer requires
// them on every image, and guessing causes exactly the layout shift they prevent.
//   node build/measure-images.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function webpSize(b) {
  const tag = b.toString('ascii', 12, 16);
  if (tag === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (tag === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (tag === 'VP8L') {
    const n = b.readUInt32LE(21);
    return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1];
  }
  return null;
}

function jpegSize(b) {
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p, base, out); continue; }
    if (/\.(webp|jpg|jpeg|png)$/i.test(name)) {
      out.push(p.replace(/\\/g, '/').slice(base.length + 1));
    }
  }
  return out;
}

const sizes = {};
for (const rel of walk('assets')) {
  // Intermediate cut-out sources are gitignored and never referenced.
  if (rel.startsWith('cut/')) continue;
  const b = readFileSync(join('assets', rel));
  const s = /\.webp$/i.test(rel) ? webpSize(b) : jpegSize(b);
  if (s) sizes[rel] = s;
}

writeFileSync('content/images.json', JSON.stringify(sizes, null, 2) + '\n');
console.log(`measured ${Object.keys(sizes).length} images`);
