// JSON-LD, per page type. The business node deliberately carries no
// PostalAddress and no aggregateRating: Quest publishes neither, and invented
// values in structured data are exactly where wrong data does the most damage.
import { ORIGIN } from './url.mjs';

const city = (name) => ({
  '@type': 'City', name,
  containedInPlace: { '@type': 'State', name: 'Arizona' },
});

function business(content, areasServed) {
  const { site, areas } = content;
  const list = areasServed || areas.areas.map((a) => a.city);
  return {
    '@type': ['GeneralContractor', 'HomeAndConstructionBusiness'],
    '@id': `${ORIGIN}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: `${ORIGIN}/`,
    description: site.footerBlurb,
    slogan: site.tagline,
    telephone: site.phoneE164,
    foundingDate: site.foundingYear,
    priceRange: '$$',
    areaServed: list.map(city),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phoneE164,
      contactType: 'sales',
      areaServed: 'US',
      availableLanguage: ['en', 'es'],
    },
    knowsAbout: content.services.map((s) => s.name),
  };
}

function breadcrumbs(page, res) {
  const trail = [{ name: 'Home', key: 'home' }];
  if (page.kind === 'service') {
    trail.push({ name: 'Services', key: 'sitemap' });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind === 'area') {
    trail.push({ name: 'Service Areas', key: 'sitemap' });
    trail.push({ name: page.item.name, key: page.key });
  } else if (page.kind !== 'home') {
    trail.push({ name: page.title.split('|')[0].trim(), key: page.key });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${res.canonical}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: res.abs(t.key),
    })),
  };
}

export function graphFor({ page, res, content }) {
  const areasServed = page.kind === 'area' ? [page.item.city] : null;
  const crumbs = breadcrumbs(page, res);

  const graph = [
    business(content, areasServed),
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: content.site.name,
      inLanguage: 'en-US',
      publisher: { '@id': `${ORIGIN}/#business` },
    },
    {
      '@type': page.kind === 'contact' ? 'ContactPage' : 'WebPage',
      '@id': `${res.canonical}#webpage`,
      url: res.canonical,
      name: page.title,
      description: page.description,
      inLanguage: 'en-US',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#business` },
      primaryImageOfPage: { '@type': 'ImageObject', url: res.absAsset(page.ogImage) },
      breadcrumb: { '@id': crumbs['@id'] },
    },
    crumbs,
  ];

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
