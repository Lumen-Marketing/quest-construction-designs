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
  };
}

// Two service names are far too long for a 60-character title once the brand
// suffix is added. Shortening them here beats clipping mid-parenthesis.
const SHORT_NAME = {
  'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops': 'Full Remodel',
  'deck-building-uses-trex-system': 'Deck Building',
};

// Shared photography, chosen per page kind. The home card is the real Quest
// hero; the rest come from the existing library.
const OG = {
  home: ['quest-hero.jpg', 'A Quest Construction project in Arizona'],
  about: ['crew-slab.jpg', 'A Quest Construction crew finishing a concrete slab'],
  gallery: ['framing.jpg', 'Timber framing on a Quest Construction project'],
  projects: ['neighborhood.jpg', 'Completed homes on a Quest Construction project'],
  contact: ['site-steel.jpg', 'Structural steel on a Quest Construction site'],
  sitemap: ['cranes.jpg', 'Cranes over a Quest Construction site'],
  service: ['rebar.jpg', 'Reinforcing steel placed on a Quest Construction job'],
  area: ['trade-weld.jpg', 'Welding on a Quest Construction job in Arizona'],
};

const clip = (s, n) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, '');
};

export function pageList() {
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

  push('about', 'about', `About Us${brand}`,
    clip(`${pages.about.lede} Shaping Arizona homes since ${site.foundingYear}.`, 155));
  push('gallery', 'gallery', `Project Gallery${brand}`,
    clip('Photography from Quest Construction jobsites across Arizona — framing, concrete, ' +
      'exteriors and finished homes.', 155));
  push('projects', 'projects', `Project Showcase${brand}`,
    clip(`${pages.projects.lede} See framing, home construction and concrete work by ` +
      'Quest Construction.', 155));
  push('contact', 'contact', `Contact Us${brand}`,
    clip(`Talk to Quest Construction about your project. Call ${site.phoneDisplay} — ` +
      `${site.availability} — or send us a message.`, 155));
  push('sitemap', 'sitemap', `Sitemap${brand}`,
    clip('Every page on the Quest Construction site: services, service areas, projects ' +
      'and contact details.', 155));

  return out;
}
