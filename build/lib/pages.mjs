// The 31-page manifest. Titles and descriptions are composed here rather than
// in the direction modules so the length and uniqueness rules are enforced in
// one place by one test, for all ten directions at once.
import { readFileSync } from 'node:fs';

const json = (f) => JSON.parse(readFileSync(`content/${f}`, 'utf8'));

export function loadContent() {
  return {
    site: json('site.json'),
    services: json('services.json'),
    areas: json('areas.json'),
    pages: json('pages.json'),
    // Authored per-city copy. Only the indexable direction renders it; see the
    // _README key in the file for why it exists and what still needs checking.
    areasLocal: json('areas-local.json'),
  };
}

// Two service names are far too long for a 60-character title once the brand
// suffix is added. Shortening them here beats clipping mid-parenthesis. The
// footer reads the same map: those two labels are what force its trade list
// into one very long column, and "Full Remodel" is honest anchor text for a
// page whose h1 spells the rest out.
export const SHORT_NAME = {
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'Full Remodel',
  'deck-building-uses-trex-system': 'Deck Building',
};

// The social card, chosen per page kind. Every one of these is cropped from a
// photograph Quest took on one of its own jobs — see build/lib/photos.mjs —
// so a shared link shows the same work the page does.
const OG = {
  home: ['quest-hero.jpg', 'Wall and roof framing across a Quest Construction home'],
  about: ['framing.jpg', 'Framed walls under an Arizona sky on a Quest Construction build'],
  gallery: ['custom-home.jpg', 'A Quest Construction custom home under construction'],
  projects: ['dusk.jpg', 'A Quest Construction custom home at dusk'],
  contact: ['lumber.jpg', 'Framing lumber laid out across a Quest Construction slab'],
  sitemap: ['slab.jpg', 'A finished slab and block wall on a Quest Construction build'],
  service: ['gables.jpg', 'Gables and windows on a Quest Construction custom home'],
  area: ['deck.jpg', 'Deck framing and joists on a Quest Construction job in Arizona'],
  serviceIndex: ['framing.jpg', 'Framed walls under an Arizona sky on a Quest Construction build'],
  areaIndex: ['custom-home.jpg', 'A Quest Construction custom home under construction'],
};

const clip = (s, n) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, '');
};

/**
 * @param opts { hubs } — adds the two section landing pages. Off by default:
 *   the ten demo directions are held to a thirty-one page contract, and only
 *   the standalone site carries the hubs.
 */
/** How many pages a build should produce: home, every trade, every city, the
 *  five standalone pages, and the two hubs when they are switched on. Tests
 *  assert against this rather than a literal, so adding a city to
 *  content/areas.json does not mean editing a number in nine files. */
export function pageCount(opts = {}) {
  const { services, areas } = loadContent();
  return 1 + services.length + areas.areas.length + 5 + (opts.hubs ? 2 : 0);
}

/** "a, b and c" — an English list, for a meta description read by a person. */
const listOf = (xs) => (xs.length < 2 ? (xs[0] || '')
  : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`).toLowerCase();

export function pageList(opts = {}) {
  const { site, services, areas, pages } = loadContent();
  const brand = ' | Quest Construction';
  const budget = 60 - brand.length;
  const out = [];

  const push = (key, kind, title, description, item) => {
    const [img, alt] = OG[kind];
    out.push({ key, kind, title, description, ogImage: img, ogAlt: alt, item });
  };

  push('home', 'home',
    `Construction & Remodeling in Arizona${brand}`,
    clip(`${pages.home.heroBody} Serving Arizona homeowners since ${site.foundingYear}.`, 155));

  for (const s of services) {
    const short = SHORT_NAME[s.slug] || s.name;
    push(`services/${s.slug}`, 'service',
      clip(`${short} Services`, budget) + brand,
      clip(`${s.intro[0]} Quest Construction serves homeowners across Arizona.`, 155),
      s);
  }

  for (const a of areas.areas) {
    push(`service-areas/${a.slug}`, 'area',
      clip(`${a.name} Contractor`, budget) + brand,
      clip(`Construction, remodeling and exterior work in ${a.name} from Quest Construction. ` +
        `Family-owned, ${site.availability}. Call ${site.phoneDisplay}.`, 155),
      a);
  }

  if (opts.hubs) {
    push('services', 'serviceIndex', `Construction Services in Arizona${brand}`,
      clip(`All ${services.length} trades Quest Construction self-manages across Arizona — ` +
        'framing, concrete, roofing, stucco, remodels, ADUs and more.', 155));
    push('service-areas', 'areaIndex', `Service Areas in Arizona${brand}`,
      clip(`The ${areas.areas.length} Arizona cities Quest Construction builds in, from Phoenix ` +
        `and Scottsdale to Queen Creek. Call ${site.phoneDisplay}.`, 155));
  }

  push('about', 'about', `About Us${brand}`,
    clip(`${pages.about.lede} Shaping Arizona homes since ${site.foundingYear}.`, 155));
  push('gallery', 'gallery', `Project Gallery${brand}`,
    clip('Photography from Quest Construction jobsites across Arizona: framing, concrete, ' +
      'exteriors and finished homes.', 155));
  push('projects', 'projects', `Project Showcase${brand}`,
    // The showcase items themselves, so adding one to content/pages.json puts
    // it in the description too rather than leaving the list quietly stale.
    clip(`${pages.projects.lede} See ${listOf(pages.projects.items.map((i) => i.title))}.`, 155));
  push('contact', 'contact', `Contact Us${brand}`,
    clip(`Talk to Quest Construction about your project. Call ${site.phoneDisplay}, ` +
      `${site.availability}, or send us a message.`, 155));
  push('sitemap', 'sitemap', `Sitemap${brand}`,
    clip('Every page on the Quest Construction site: services, service areas, projects ' +
      'and contact details.', 155));

  return out;
}
