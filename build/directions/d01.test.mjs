import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage, allPagesFor } from '../build.mjs';
import * as d01 from './d01.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const services = JSON.parse(readFileSync('content/services.json', 'utf8'));
const areas = JSON.parse(readFileSync('content/areas.json', 'utf8')).areas;

test('direction 01 is the one indexable direction', () => {
  assert.equal(d01.meta.slug, 'd01-site-plan');
  assert.equal(d01.meta.indexable, true);
});

test('the navbar links every service and every area, from any depth', () => {
  const html = renderPage({ mod: d01, key: 'services/adu' });
  for (const s of services) {
    assert.ok(html.includes(`../../services/${s.slug}/index.html`), `nav missing service ${s.slug}`);
  }
  for (const a of areas) {
    assert.ok(html.includes(`../../service-areas/${a.slug}/index.html`), `nav missing area ${a.slug}`);
  }
});

test('the navbar carries the real phone number as a tel link', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.ok(html.includes('(602) 399-6455'));
});

test('the footer states the real founding year and no invented figures', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Since 2005'));
  assert.doesNotMatch(html, /est\.\s*2010|340\+|\b96%|4\.9\b|87 reviews/);
});

test('the mobile nav toggle and dropdowns are present and labelled', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /class="navtoggle"[^>]*aria-label="Toggle navigation"/);
  assert.equal((html.match(/class="dropmenu/g) || []).length, 2);
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 3);
});

test('the home page carries all fourteen service cards with icons', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  for (const s of services) assert.ok(html.includes(`<h3>${esc(s.name)}</h3>`), `card ${s.slug}`);
  const cards = html.match(/<article class="svc[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, 14);
  for (const card of cards) {
    assert.match(card, /<span class="ic"><svg viewBox="0 0 24 24"/, 'card without an icon');
    assert.match(card, /class="go" href="[^"]*services\//, 'card without a link');
  }
});

test('the home page carries both real offers with their codes', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('data-copy="WELCOME10"'));
  assert.ok(html.includes('data-copy="REFER100"'));
});

test('the home page shows the three real projects', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('Residential Framing'));
  assert.ok(html.includes('Home Construction'));
  assert.ok(html.includes('Concrete Work'));
  assert.equal((html.match(/class="pj /g) || []).length, 3);
});

test('the hero states only facts drawn from the real content', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.match(html, /<b>2005<\/b><span>Building since<\/span>/);
  assert.match(html, /<b>14<\/b><span>Services<\/span>/);
  assert.match(html, /<b>11<\/b><span>Arizona cities<\/span>/);
});

test('the LCP hero image is eager and preloaded, and only on the home page', () => {
  const home = renderPage({ mod: d01, key: 'home' });
  assert.match(home, /fetchpriority="high"/);
  assert.match(home, /<link rel="preload" as="image"/);
  const inner = renderPage({ mod: d01, key: 'about' });
  assert.doesNotMatch(inner, /<link rel="preload" as="image"/);
});

test('the marquee is fed the real service names', () => {
  const html = renderPage({ mod: d01, key: 'home' });
  assert.ok(html.includes('"Window Installation"'), 'marquee missing real service names');
});

test('every service page renders its unique intro, why-choose bullets and process', () => {
  for (const s of services) {
    const html = renderPage({ mod: d01, key: `services/${s.slug}` });
    assert.ok(html.includes(esc(s.intro[0])), `${s.slug} intro missing`);
    for (const w of s.whyChoose) assert.ok(html.includes(esc(w)), `${s.slug} bullet missing`);
    for (const p of s.process) {
      assert.ok(html.includes(esc(p.title)), `${s.slug} step ${p.n} title`);
      assert.ok(html.includes(esc(p.body)), `${s.slug} step ${p.n} body`);
    }
    assert.ok(html.includes(esc(s.ctaHeading)), `${s.slug} cta`);
  }
});

test('only the concrete page renders an FAQ block and a scope list', () => {
  const concrete = renderPage({ mod: d01, key: 'services/concrete' });
  assert.match(concrete, /class="faqlist"/);
  assert.equal((concrete.match(/<details class="rv">/g) || []).length, 6);
  assert.match(concrete, /class="scope"/);
  assert.match(concrete, /Quality Assurance/);
  const roofing = renderPage({ mod: d01, key: 'services/roofing' });
  assert.doesNotMatch(roofing, /class="faqlist"/);
  assert.doesNotMatch(roofing, /class="scope"/);
});

test('the service tab rail marks the current service and links the rest', () => {
  const html = renderPage({ mod: d01, key: 'services/roofing' });
  assert.ok(html.includes('aria-current="page"'), 'active service is not marked');
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.ok(html.includes('../../services/stucco/index.html'));
});

test('every service and area page carries a breadcrumb trail', () => {
  for (const key of ['services/roofing', 'service-areas/mesa-az']) {
    const html = renderPage({ mod: d01, key });
    assert.match(html, /<nav class="crumbs" aria-label="Breadcrumb">/, `${key} breadcrumb`);
  }
});

test('every area page carries authored local copy, unique per city', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  const seen = new Set();
  for (const a of areas) {
    const entry = local[a.slug];
    assert.ok(entry, `no local copy for ${a.slug}`);
    const words = entry.paras.join(' ').split(/\s+/).length;
    assert.ok(words >= 120, `${a.slug} local copy too thin (${words} words)`);
    assert.ok(entry.notes.length >= 3, `${a.slug} has too few notes`);
    for (const p of entry.paras) {
      assert.ok(!seen.has(p), `${a.slug} reuses a paragraph from another city`);
      seen.add(p);
    }
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    for (const p of entry.paras) {
      assert.ok(html.includes(esc(p)), `${a.slug} does not render its local copy`);
    }
  }
});

test('the local copy carries its unverified warning for Quest to review', () => {
  const local = JSON.parse(readFileSync('content/areas-local.json', 'utf8'));
  assert.match(local._README, /UNVERIFIED/);
  assert.match(local._README, /review this file before launch/);
});

test('area pages resolve the city token everywhere and name their own city', () => {
  for (const a of areas) {
    const html = renderPage({ mod: d01, key: `service-areas/${a.slug}` });
    assert.doesNotMatch(html, /\{\{city\}\}/, `${a.slug} has an unresolved token`);
    assert.ok(html.includes(esc(a.city)), `${a.slug} never names its city`);
  }
});

test('each area page links the other ten areas', () => {
  const html = renderPage({ mod: d01, key: 'service-areas/mesa-az' });
  const cloud = /<div class="arealinks rv">([\s\S]*?)<\/div>/.exec(html)[1];
  assert.equal((cloud.match(/<a /g) || []).length, 10);
  assert.ok(!cloud.includes('mesa-az'), 'an area links to itself in the nearby cloud');
});

test('the contact page renders the whole form and the real phone number', () => {
  const html = renderPage({ mod: d01, key: 'contact' });
  assert.match(html, /<form class="contact-form rv"/);
  for (const n of ['name', 'email', 'phone', 'message']) {
    assert.ok(html.includes(`name="${n}"`), `contact form missing field ${n}`);
  }
  assert.match(html, /<textarea name="message"/);
  assert.match(html, /<button class="btn acc" type="submit">/);
  assert.ok(html.includes('href="tel:16023996455"'));
  assert.match(html, /aria-live="polite"/);
});

test('the gallery separates real Quest photography from stock placeholders', () => {
  const html = renderPage({ mod: d01, key: 'gallery' });
  const imgs = html.match(/<img[^>]+>/g) || [];
  assert.ok(imgs.length >= 15, `gallery has only ${imgs.length} images`);
  assert.match(html, /From Quest projects/);
  assert.match(html, /Placeholder photography/);
  assert.ok(!html.includes('plans.webp'));
});

test('the projects page shows the three real projects with their real photographs', () => {
  const html = renderPage({ mod: d01, key: 'projects' });
  for (const t of ['Residential Framing', 'Home Construction', 'Concrete Work']) {
    assert.ok(html.includes(t), `projects missing ${t}`);
  }
  assert.equal((html.match(/class="pjcard rv"/g) || []).length, 3);
  // The real site paired these photographs with these projects; keep the pairing.
  assert.ok(html.includes('quest/story.webp'));
  assert.ok(html.includes('quest/hero.webp'));
  assert.ok(html.includes('quest/spare.webp'));
});

test('the about page renders both real story paragraphs', () => {
  const html = renderPage({ mod: d01, key: 'about' });
  const about = JSON.parse(readFileSync('content/pages.json', 'utf8')).about;
  for (const p of about.story) assert.ok(html.includes(esc(p)), 'about story paragraph missing');
});

test('the sitemap links all thirty-one pages', () => {
  const html = renderPage({ mod: d01, key: 'sitemap' });
  for (const s of services) {
    assert.ok(html.includes(`../services/${s.slug}/index.html`), `sitemap missing ${s.slug}`);
  }
  for (const a of areas) {
    assert.ok(html.includes(`../service-areas/${a.slug}/index.html`), `sitemap missing ${a.slug}`);
  }
  for (const p of ['about-us', 'projects', 'gallery', 'contact-us']) {
    assert.ok(html.includes(`../${p}/index.html`), `sitemap missing ${p}`);
  }
});

test('every one of the thirty-one pages renders a non-trivial body', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: d01, key });
    const body = /<main id="main">([\s\S]*?)<\/main>/.exec(html)[1];
    assert.ok(body.length > 1500, `${key} body is only ${body.length} chars`);
    assert.match(body, /<h1>/, `${key} has no h1`);
    assert.equal((body.match(/<h1>/g) || []).length, 1, `${key} has more than one h1`);
  }
});

test('every rendered image carries alt text and intrinsic dimensions', () => {
  for (const key of allPagesFor()) {
    const html = renderPage({ mod: d01, key });
    for (const tag of html.match(/<img[^>]+>/g) || []) {
      assert.match(tag, /alt="[^"]*"/, `${key}: image without alt: ${tag}`);
      assert.match(tag, /width="\d+"/, `${key}: image without width: ${tag}`);
      assert.match(tag, /height="\d+"/, `${key}: image without height: ${tag}`);
    }
  }
});
