// The five images the live site actually serves. Everything else in assets/
// is the existing stock library. Run once; outputs are committed.
//   node build/fetch-images.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'https://ik.imagekit.io/4wu305uo4';

const SRC = {
  logo: 'image_6809b3da432c476416135f81.png',
  hero: 'image_67fe61e8432c47641640f98b.jpeg',
  story: 'image_67fe542c432c476416d91f27.jpeg',
  contact: 'contact-us.png',
  spare: 'image_68082c76432c47641622f310.jpeg',
};

mkdirSync('assets/quest', { recursive: true });
mkdirSync('assets/og', { recursive: true });

const get = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return { buf: Buffer.from(await r.arrayBuffer()), type: r.headers.get('content-type') };
};

for (const [name, file] of Object.entries(SRC)) {
  // ImageKit transforms on the fly; ask for WebP at quality 80, matching the
  // encoding the existing library already uses. The logo keeps its alpha.
  const tr = name === 'logo' ? 'tr:f-webp,q-90' : 'tr:w-1800,f-webp,q-80';
  const { buf, type } = await get(`${BASE}/${tr}/${file}`);
  writeFileSync(`assets/quest/${name}.webp`, buf);
  console.log(`assets/quest/${name}.webp  ${buf.length} bytes  ${type}`);
}

// The home page's social card should be the real Quest hero, cut to the exact
// 1200x630 a large summary card wants, as JPEG — Facebook's crawler is
// unreliable on WebP.
const og = await get(`${BASE}/tr:w-1200,h-630,fo-auto,f-jpg,q-82/${SRC.hero}`);
writeFileSync('assets/og/quest-hero.jpg', og.buf);
console.log(`assets/og/quest-hero.jpg  ${og.buf.length} bytes  ${og.type}`);
