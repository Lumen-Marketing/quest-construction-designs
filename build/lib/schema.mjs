// JSON-LD, per page type. The business node deliberately carries no
// PostalAddress and no aggregateRating: Quest publishes neither, and invented
// values in structured data are exactly where wrong data does the most damage.
import { ORIGIN } from './url.mjs';

const city = (name) => ({
  '@type': 'City', name,
  containedInPlace: { '@type': 'State', name: 'Arizona' },
});

function business(content, areasServed, opts) {
  const { site, areas } = content;
  const list = areasServed || areas.areas.map((a) => a.city);
  // The standalone site carries the fuller node. The demo directions keep the
  // lean one so ten noindex copies of an offer catalogue never reach an index.
  const rich = opts.rich ? {
    image: `${ORIGIN}/assets/og/quest-hero.jpg`,
    logo: {
      '@type': 'ImageObject',
      url: `${ORIGIN}/assets/quest/logo.webp`,
      width: 1261,
      height: 285,
    },
    // Quest states 24/7 reachability on every page; the node says the same.
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
        'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    }],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Construction and remodeling services',
      itemListElement: content.services.map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'Service',
          '@id': `${ORIGIN}/services/${s.slug}/#service`,
          name: s.name,
          description: s.shortDesc,
          url: `${ORIGIN}/services/${s.slug}/`,
        },
      })),
    },
  } : {};
  return {
    '@type': ['GeneralContractor', 'HomeAndConstructionBusiness'],
    '@id': `${ORIGIN}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: `${ORIGIN}/`,
    description: site.footerBlurb,
    slogan: site.tagline,
    telephone: site.phoneE164,
    email: site.email,
    // The one profile Quest actually publishes. sameAs is how a knowledge
    // panel ties the page to the page people already leave reviews on.
    sameAs: [site.facebook],
    foundingDate: site.foundingYear,
    priceRange: '$$',
    areaServed: list.map(city),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phoneE164,
      email: site.email,
      contactType: 'sales',
      areaServed: 'US',
      availableLanguage: ['en', 'es'],
    },
    knowsAbout: content.services.map((s) => s.name),
    ...rich,
  };
}

const CRUMB = { serviceIndex: 'Services', areaIndex: 'Service Areas', blogIndex: 'Blog' };

function breadcrumbs(page, res) {
  const trail = [{ name: 'Home', key: 'home' }];
  if (page.kind === 'service') {
    trail.push({ name: 'Services', key: res.hubKey('services') });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind === 'area') {
    trail.push({ name: 'Service Areas', key: res.hubKey('service-areas') });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind === 'serviceArea') {
    // Four deep, and it has to match the crumbs the page actually shows:
    // Home / Services / the trade / the city.
    trail.push({ name: 'Services', key: res.hubKey('services') });
    trail.push({ name: page.item.service.name, key: `services/${page.item.service.slug}` });
    trail.push({ name: page.item.area.city, key: page.key });
  } else if (page.kind === 'post') {
    // Home / Blog / the headline. The blog index always exists where a post
    // does — they are switched on by the same profile flag — so this one does
    // not need the hubKey fallback the service and area trails carry.
    trail.push({ name: 'Blog', key: 'blog' });
    trail.push({ name: page.item.title, key: page.key });
  } else if (page.kind !== 'home') {
    trail.push({
      name: CRUMB[page.kind] || page.title.split('|')[0].trim(),
      key: page.key,
    });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${res.canonical}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: res.abs(t.key),
    })),
  };
}

const PAGE_TYPE = {
  contact: 'ContactPage',
  about: 'AboutPage',
  gallery: 'CollectionPage',
  projects: 'CollectionPage',
  serviceIndex: 'CollectionPage',
  areaIndex: 'CollectionPage',
  blogIndex: 'CollectionPage',
};

/**
 * @param opts { rich, built } — the standalone site opts into the fuller
 *   business node and stamps a dateModified; the demo directions do neither.
 */
export function graphFor({ page, res, content }, opts = {}) {
  const areasServed = page.kind === 'area' ? [page.item.city]
    : (page.kind === 'serviceArea' ? [page.item.area.city] : null);
  const crumbs = breadcrumbs(page, res);

  const graph = [
    business(content, areasServed, opts),
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: content.site.name,
      inLanguage: 'en-US',
      publisher: { '@id': `${ORIGIN}/#business` },
    },
    {
      '@type': PAGE_TYPE[page.kind] || 'WebPage',
      '@id': `${res.canonical}#webpage`,
      url: res.canonical,
      name: page.title,
      description: page.description,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#business` },
      primaryImageOfPage: { '@type': 'ImageObject', url: res.absAsset(`og/${page.ogImage}`) },
      breadcrumb: { '@id': crumbs['@id'] },
      ...(opts.built ? { dateModified: opts.built } : {}),
    },
    crumbs,
  ];

  // A section landing page's whole job is the list it carries. Saying so in
  // the graph is what gets it quoted back as "the services they offer are...".
  if (page.kind === 'serviceIndex' || page.kind === 'areaIndex') {
    const items = page.kind === 'serviceIndex'
      ? content.services.map((s) => [s.name, res.abs(`services/${s.slug}`), s.shortDesc])
      : content.areas.areas.map((a) => [
        `${a.name} Construction`, res.abs(`service-areas/${a.slug}`),
        `Construction, remodeling and exterior work in ${a.name}.`]);
    graph.push({
      '@type': 'ItemList',
      '@id': `${res.canonical}#list`,
      name: page.title.split('|')[0].trim(),
      numberOfItems: items.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: items.map(([name, url, description], i) => ({
        '@type': 'ListItem', position: i + 1, name, url, description,
      })),
    });
  }

  // A city page is a service offered in one place. Narrowing the Service node
  // as well as the business node is what answers "contractor in Mesa".
  if (page.kind === 'area' && opts.rich) {
    graph.push({
      '@type': 'Service',
      '@id': `${res.canonical}#service`,
      name: `Construction and remodeling in ${page.item.name}`,
      serviceType: 'General contracting',
      description: page.description,
      provider: { '@id': `${ORIGIN}/#business` },
      areaServed: city(page.item.city),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Services in ${page.item.name}`,
        itemListElement: content.services.map((s, i) => ({
          '@type': 'Offer',
          position: i + 1,
          itemOffered: { '@type': 'Service', name: s.name },
          areaServed: city(page.item.city),
        })),
      },
    });
  }

  // One trade, one city: the Service node names both rather than listing every
  // city the way the trade page does. That is the whole claim of the page.
  if (page.kind === 'serviceArea') {
    const { service: svc, area: a } = page.item;
    graph.push({
      '@type': 'Service',
      '@id': `${res.canonical}#service`,
      name: `${svc.name} in ${a.city}, AZ`,
      serviceType: svc.name,
      description: page.item.copy.lede,
      provider: { '@id': `${ORIGIN}/#business` },
      areaServed: city(a.city),
    });
  }

  // A post is an article with a date on it, which is the one thing the rest of
  // this site does not have. The BlogPosting sits beside the WebPage rather
  // than replacing it, so the page keeps its breadcrumb and its site identity
  // and the article carries its own authorship and dates.
  if (page.kind === 'post') {
    const b = page.item;
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${res.canonical}#post`,
      headline: b.title,
      description: b.standfirst,
      articleSection: b.topic,
      datePublished: b.date,
      dateModified: b.date,
      wordCount: b.words,
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      mainEntityOfPage: { '@id': `${res.canonical}#webpage` },
      image: res.absAsset(`og/${page.ogImage}`),
      author: { '@id': `${ORIGIN}/#business` },
      publisher: { '@id': `${ORIGIN}/#business` },
    });
  }

  // The questions printed at the foot of the post, declared. Google withdrew
  // FAQ rich results for commercial sites in 2023, so this buys no stars in a
  // search result — it is here because an answer engine reading the page still
  // uses it, and because the schema must not disagree with what is on the page.
  if (page.kind === 'post' && page.item.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${res.canonical}#faq`,
      mainEntity: page.item.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  // The index's job is the list it carries, the same as the two hubs.
  if (page.kind === 'blogIndex') {
    graph.push({
      '@type': 'Blog',
      '@id': `${res.canonical}#blog`,
      name: page.title.split('|')[0].trim(),
      description: content.posts.index.lede,
      inLanguage: 'en-US',
      publisher: { '@id': `${ORIGIN}/#business` },
      blogPost: content.posts.posts.map((b) => ({
        '@type': 'BlogPosting',
        '@id': `${res.abs(`blog/${b.slug}`)}#post`,
        headline: b.title,
        description: b.standfirst,
        datePublished: b.date,
        url: res.abs(`blog/${b.slug}`),
      })),
    });
  }

  if (page.kind === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${res.canonical}#service`,
      name: page.item.name,
      serviceType: page.item.name,
      description: page.item.shortDesc,
      provider: { '@id': `${ORIGIN}/#business` },
      areaServed: content.areas.areas.map((a) => city(a.city)),
    });
    if (page.item.faqs && page.item.faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${res.canonical}#faq`,
        mainEntity: page.item.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
