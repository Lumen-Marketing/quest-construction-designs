// One-shot: reads the recovered questconstruction.com archive and writes
// content/*.json. Kept in the repo for provenance — rerunning it must be
// idempotent. Retyping ~20,000 words by hand is the likeliest source of
// transcription error, which is why this is scripted.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { text, matchAll, section } from './lib/html.mjs';

export const QUEST_SRC = '.source/questconstruction';

const read = (...p) => readFileSync(join(QUEST_SRC, ...p), 'utf8');
const main = (html) => /<main>([\s\S]*?)<\/main>/.exec(html)[1];

const MANIFEST = JSON.parse(readFileSync(join(QUEST_SRC, 'manifest.json'), 'utf8'));
const nameFor = (slug) => MANIFEST.services.find((s) => s.slug === slug).name;
const shortDescFor = (slug) => MANIFEST.services.find((s) => s.slug === slug).description;

const listItems = (ul) => matchAll(ul, /<li>([\s\S]*?)<\/li>/g).map(text);

export function extractServices() {
  // Manifest order, not directory order. readdirSync is alphabetical, which
  // would bury Residential Development — the service the real site leads with.
  const onDisk = new Set(readdirSync(join(QUEST_SRC, 'services')));
  const slugs = MANIFEST.services.map((s) => s.slug);
  for (const s of onDisk) {
    if (!slugs.includes(s)) throw new Error(`service ${s} is on disk but not in the manifest`);
  }
  return slugs.map((slug) => {
    const m = main(read('services', slug, 'index.html'));

    const sub = section(m, 'subhero');
    const h1 = text(/<h1>([\s\S]*?)<\/h1>/.exec(sub)[1]);
    const subheroTagline = text(/<p>([\s\S]*?)<\/p>/.exec(sub)[1]);

    const prose = section(m, 'prose');
    // Intro is everything before the first sub-heading. Concrete carries three
    // h3 blocks after it; the other thirteen carry one. Splitting here keeps
    // both shapes on the same code path.
    const intro = matchAll(prose.split(/<h3>/)[0], /<p>([\s\S]*?)<\/p>/g).map(text);

    // The last <ul> in prose is the benefits list on concrete and the
    // "Why choose Quest Construction?" list on the other thirteen. Both are four
    // items and both serve the same purpose in the page.
    const uls = matchAll(prose, /<ul>([\s\S]*?)<\/ul>/g);
    const whyChoose = uls.length ? listItems(uls[uls.length - 1]) : [];

    const procBlock = /<div class="process">([\s\S]*?)<\/div>\s*<\/section>/.exec(m);
    const process = procBlock
      ? [...procBlock[1].matchAll(
          /<span>(\d+)<\/span><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>/g)]
          .map((x) => ({ n: Number(x[1]), title: text(x[2]), body: text(x[3]) }))
      : [];

    const cta = section(m, 'cta');
    const svc = {
      slug,
      name: nameFor(slug),
      shortDesc: shortDescFor(slug),
      h1, subheroTagline, intro, whyChoose, process,
      ctaHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(cta)[1]),
      ctaBody: text(/<p>([\s\S]*?)<\/p>/.exec(cta)[1]),
    };

    const scopeUl = /<h3>Complete Range[\s\S]*?<ul>([\s\S]*?)<\/ul>/.exec(prose);
    if (scopeUl) {
      svc.scope = listItems(scopeUl[1]).map((t) => {
        const i = t.indexOf(':');
        return i > 0
          ? { title: t.slice(0, i).trim(), body: t.slice(i + 1).trim() }
          : { title: t, body: '' };
      });
    }

    const quality = /<h3>Quality Assurance<\/h3>\s*<p>([\s\S]*?)<\/p>/.exec(prose);
    if (quality) svc.quality = text(quality[1]);

    const faqSection = section(m, 'faq');
    if (faqSection) {
      svc.faqs = [...faqSection.matchAll(
        /<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)]
        .map((x) => ({ q: text(x[1]), a: text(x[2]) }));
    }
    return svc;
  });
}

export function extractAreas() {
  const areas = MANIFEST.areas.map((a) => ({
    slug: a.slug, name: a.name, city: a.name.replace(/,\s*AZ$/, ''),
  }));

  // Every area page is byte-identical bar the city name, so one page is read
  // and the city is tokenised back out. The test asserts the token survives —
  // that is what proves the pages really are a shared template.
  const m = main(read('service-areas', 'mesa-az', 'index.html'));
  const tok = (s) => String(s).replace(/Mesa/g, '{{city}}');
  const ps = matchAll(m, /<p>([\s\S]*?)<\/p>/g).map(text);
  const h2s = matchAll(m, /<h2>([\s\S]*?)<\/h2>/g).map(text);
  const long = ps.filter((p) => p.length > 120);
  const find = (re) => h2s.find((h) => re.test(h)) || '';

  return {
    template: {
      h1: tok(text(/<h1>([\s\S]*?)<\/h1>/.exec(m)[1])),
      tagline: tok(ps[0]),
      servicesHeading: tok(find(/Professional Construction Services/)),
      communityHeading: tok(find(/Community We Proudly Serve/)),
      community: tok(long[0]),
      localHeading: tok(find(/Go-To Local/)),
      local: tok(long[1]),
      capabilities: listItems(
        (matchAll(m, /<ul>([\s\S]*?)<\/ul>/g).find((u) => !/Learn more/.test(u)) || ''),
      ),
      commitmentHeading: tok(find(/Commitment to Excellence/)),
      commitment: tok(long[2]),
      ctaHeading: tok(text(/<h2>([\s\S]*?)<\/h2>/.exec(section(m, 'cta'))[1])),
      ctaBody: tok(ps.find((p) => /Contact Quest Construction now/.test(p)) || ''),
    },
    areas,
  };
}

export function extractPages() {
  const home = main(read('index.html'));
  const hero = section(home, 'hero');
  const story = section(home, 'story');
  const homeCta = section(home, 'cta');

  const about = main(read('about-us', 'index.html'));
  const projects = main(read('projects', 'index.html'));
  const gallery = main(read('gallery', 'index.html'));
  const contact = main(read('contact-us', 'index.html'));

  const h1 = (m) => text(/<h1>([\s\S]*?)<\/h1>/.exec(m)[1]);
  const paras = (m) => matchAll(m, /<p>([\s\S]*?)<\/p>/g).map(text);

  return {
    home: {
      heroTitle: text(/<h1>([\s\S]*?)<\/h1>/.exec(hero)[1]),
      heroBody: text(/<p>([\s\S]*?)<\/p>/.exec(hero)[1]),
      servicesHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(home)[1]),
      storyEyebrow: text(/<p class="eyebrow">([\s\S]*?)<\/p>/.exec(story)[1]),
      storyHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(story)[1]),
      story: paras(story).filter((p) => p.length > 80),
      ctaHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(homeCta)[1]),
      ctaBody: paras(homeCta)[0],
    },
    about: {
      h1: h1(about),
      lede: paras(about)[0],
      storyHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(about)[1]),
      story: paras(about).filter((p) => p.length > 100),
    },
    gallery: { h1: h1(gallery), lede: paras(gallery)[0] },
    projects: {
      h1: h1(projects),
      lede: paras(projects)[0],
      items: [...projects.matchAll(/<article>([\s\S]*?)<\/article>/g)].map((a) => ({
        title: text(/<h2>([\s\S]*?)<\/h2>/.exec(a[1])[1]),
        body: text(/<p>([\s\S]*?)<\/p>/.exec(a[1])[1]),
        alt: text(/alt="([^"]*)"/.exec(a[1])?.[1] || ''),
      })),
    },
    contact: {
      h1: h1(contact),
      lede: paras(contact)[0],
      formHeading: text(/<h2>([\s\S]*?)<\/h2>/.exec(contact)[1]),
      fields: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'message', label: 'Leave us a message', type: 'textarea' },
      ],
      helpHeading: "We're here to help",
    },
    sitemap: { h1: 'Sitemap', lede: 'Every page on the Quest Construction site.' },
  };
}

// pathToFileURL, not string interpolation: on Windows argv[1] is a drive path,
// which interpolates to file://C:/... against import.meta.url's file:///C:/...
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync('content', { recursive: true });
  const w = (f, d) => writeFileSync(`content/${f}`, JSON.stringify(d, null, 2) + '\n');
  w('services.json', extractServices());
  w('areas.json', extractAreas());
  w('pages.json', extractPages());
  console.log('wrote content/services.json, content/areas.json, content/pages.json');
}
