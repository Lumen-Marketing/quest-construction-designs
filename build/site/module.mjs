// The standalone site: direction 01 "Site Plan" in Burnt Orange, the pairing
// the team picked, with the chooser furniture taken off.
//
// It reuses direction 01's renderers rather than forking them — a fork would
// drift the moment anyone touched either copy. What changes is the shell:
// the accent is baked into the stylesheet instead of swapped from a parent
// frame, the fonts are first-party, and the two section landing pages exist.
import * as d01 from '../directions/d01.mjs';
import { preloadImage } from '../lib/images.mjs';
import { HERO } from '../lib/photos.mjs';

export const meta = {
  slug: '',                 // '' means the origin root, not a subfolder
  name: 'Quest Construction',
  indexable: true,
  fonts: '',                // self-hosted; the @font-face rules are in the CSS
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, HERO) : ''),
  extraMeta: (c) => `<link rel="preload" as="font" type="font/woff2" \
href="${c.local('assets/fonts/archivo-latin-var.woff2')}" crossorigin>
<link rel="preload" as="font" type="font/woff2" \
href="${c.local('assets/fonts/jetbrains-mono-latin-var.woff2')}" crossorigin>
<link rel="manifest" href="${c.root('site.webmanifest')}">
<meta name="theme-color" content="#D07C42">
`,
};

export const { nav, footer } = d01;
export const {
  home, service, area, serviceIndex, areaIndex, serviceArea,
  about, gallery, projects, contact, sitemap, blogIndex, post,
} = d01;

// Everything direction 01's script does except read an accent off the URL.
export const script = d01.baseScript;
