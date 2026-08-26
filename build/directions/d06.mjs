// Direction 06 - Job Book. A builder's capability document: asymmetric and
// left-aligned throughout, photographs given their own frame at full size,
// cool neutral grounds so the clay accent reads as a mark rather than a wash,
// and modest radii. One grotesque, Archivo, at four weights.
import { img, preloadImage } from '../lib/images.mjs';
import { ALT, SAMPLER } from '../lib/photos.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd06-red-iron',
  name: 'Job Book',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;

const SHOTS = SAMPLER;


const QUEST = [
  ['quest/hero.webp', 'A Quest Construction home under construction'],
  ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
  ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
];

// Four short trades for the credential strip. Every value is real.
const creds = (c) => `<div class="creds rv is-in">
  <div><b>${c.site.foundingYear}</b><span>Building since</span></div>
  <div><b>${c.services.length}</b><span>Trades offered</span></div>
  <div><b>${c.areas.areas.length}</b><span>Arizona cities</span></div>
  <div><b>${esc(c.site.availability)}</b><span>Reachable</span></div>
  <div><b>AZ</b><span>Family-owned</span></div>
</div>`;

export function nav(c) {
  const slabs = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap in">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    ${img(c, 'quest/logo.webp', c.site.name, { load: 'eager' })}
  </a>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="panel"><div class="wrap">
        <p class="cnd">Fourteen trades</p>
        <div class="slabs">${slabs(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="panel"><div class="wrap">
        <p class="cnd">Eleven Arizona cities</p>
        <div class="slabs">${slabs(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a href="${c.url('projects')}">Work</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn navtel')}
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h5 class="cnd">${esc(title)}</h5>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  return `<footer>
<div class="slab" aria-hidden="true"></div>
<div class="wrap in">
  <p class="big">Build <em>hard</em>.</p>
  <div class="cols">
    <div>
      <a class="brand" href="${c.url('home')}">
        ${img(c, 'quest/logo.webp', c.site.name, {})}
      </a>
      <p class="lead">${esc(c.site.footerBlurb)}</p>
      <p class="cnd flift">${esc(c.site.positioning)}</p>
      ${btn(c.site.phoneHref, c.site.phoneDisplay)}
    </div>
    ${col('Company', [
      [c.url('about'), 'About Us'], [c.url('projects'), 'Project Showcase'],
      [c.url('gallery'), 'Gallery'], [c.url('contact'), 'Contact'],
      [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
  <div class="bar cnd">
    <span>&copy; 2026 ${esc(c.site.name)}. Building since ${c.site.foundingYear}.</span>
    <span><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></span>
  </div>
</div>
</footer>`;
}

export function script(c) {
  return `<script>
(function(){
  ${scriptMap()}
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);
    s.setProperty('--acc-dim',p[2]);s.setProperty('--acc-on-dark',p[3]);}
  var q=new URLSearchParams(location.search).get('acc'); if(q) set(q);
  addEventListener('message',function(e){ if(e.data&&e.data.acc) set(e.data.acc); });
})();
(function(){
  var b=document.querySelector('.burger'), n=document.querySelector('.nlinks');
  if(b&&n){b.addEventListener('click',function(){
    var o=n.classList.toggle('open'); b.setAttribute('aria-expanded',String(o));});}
  document.querySelectorAll('.drop>button').forEach(function(x){
    x.addEventListener('click',function(e){e.preventDefault();
      var o=x.parentNode.classList.toggle('open'); x.setAttribute('aria-expanded',String(o));});
  });
})();
(function(){
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',async function(){
      var code=b.getAttribute('data-copy'), old=b.textContent;
      try{await navigator.clipboard.writeText(code);b.textContent='COPIED'}
      catch(e){b.textContent=code}
      setTimeout(function(){b.textContent=old},1600);});
  });
})();
(function(){
  document.querySelectorAll('.contact-form').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();
      var n=f.querySelector('.form-note');
      if(n) n.textContent='This form is not connected yet. Please call ${c.site.phoneDisplay} and we will pick up.';});
  });
})();
(function(){
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target)}})},
    {threshold:.08,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e)});
})();
</script>`;
}

// -------------------------------------------------------------- shared parts

// The eyebrow argument is deliberately ignored. Every section carried one,
// which is the templated rhythm that makes a page read as generated. Callers
// still pass it so the copy stays in source control if it is ever wanted.
const head = (eyebrow, heading, lede) => `<div class="head rv">
  <div><h2>${heading}</h2></div>
  ${lede ? `<p class="hlede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

/** The why-choose treatment. */
const paras = (items) => `<div class="paras">${items.map((x, i) => `
  <div class="para rv" style="--d:${(i % 4) * 0.05}s">
    ${x.title ? `<h3>${esc(x.title)}</h3>` : ''}
    <p>${esc(x.body)}</p>
  </div>`).join('')}</div>`;

/** The fourteen trades, grouped.
 *  Fourteen identical cards in a four-up grid is a template, and it tells the
 *  reader nothing about how the work relates. These are the four stages of a
 *  build in the order they happen, which is also how the crews are organised.
 *  A trade added to content/ that is not listed here still renders, under the
 *  last group, so the page cannot silently drop a service. */
const TRADE_GROUPS = [
  ['What gets built', ['custom-home-building', 'residential-development', 'casita', 'adu']],
  ['What holds it up', ['framing', 'concrete', 'roofing']],
  ['What closes it in', ['stucco', 'siding', 'window-installation',
    'deck-building-uses-trex-system']],
  ['What finishes it', ['dry-wall', 'painting',
    'full-remodel-kitchen-bathroomcabinets-flooring-counter-tops']],
];

const tradeSlabs = (c) => {
  const groups = TRADE_GROUPS.map(([name, slugs]) => ({
    name,
    items: slugs.map((sl) => c.services.find((x) => x.slug === sl)).filter(Boolean),
  }));
  const placed = new Set(groups.flatMap((g) => g.items.map((s) => s.slug)));
  const rest = c.services.filter((s) => !placed.has(s.slug));
  if (rest.length) groups[groups.length - 1].items.push(...rest);

  return `<div class="tindex">${groups.filter((g) => g.items.length).map((g, i) => `
  <div class="tgroup rv" style="--d:${(i % 2) * 0.06}s">
    <h3>${esc(g.name)}</h3>
    <ul>${g.items.map((s) => `
      <li><a href="${c.url(`services/${s.slug}`)}"><b>${esc(s.name)}</b><span>${esc(s.shortDesc)}</span></a></li>`).join('')}
    </ul>
  </div>`).join('')}</div>`;
};

/** The diagonal marquee, reused on every page as the closing band. */
const marquee = (c) => {
  const run = c.areas.areas.map((a) =>
    `<span><i>&#9670;</i>${esc(a.name)}</span>`).join('');
  // The bar is rotated and over-scaled, so it needs a clipping parent of its
  // own: body{overflow-x:hidden} does not stop it widening the document.
  return `<div class="tickwrap" aria-hidden="true"><div class="ticker"><div class="t">${run}${run}</div></div></div>`;
};

const closing = (c, heading, body) => `
<section class="magnet">
  <div class="slab" aria-hidden="true"></div>
  <div class="wrap in">
    <div class="rv">
      <h2>${esc(heading)}</h2>
      <p>${esc(body)}</p>
      <div class="acts">
        ${btn(c.url('contact'), 'Start a project')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
      </div>
      <p class="fine">${esc(c.site.availability)}. ${esc(c.site.positioning)}.</p>
    </div>
    <div class="plaque" aria-hidden="true">
      <span class="bar1"></span><span class="tri"></span>
      <h4>From concept<br><em>to creation</em></h4>
      <div class="rules"><i></i><i></i><i></i></div>
    </div>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <span class="wedge" aria-hidden="true"></span>
  <div class="wrap in">
    <nav class="crumbs cnd" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&#9670;</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&#9670;</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <h1>${esc(h1)}</h1>
    <p class="slede">${esc(lede)}</p>
    <div class="acts">
      ${btn(c.url('contact'), 'Start a project')}
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const words = h.heroTitle.replace(/^Quest Construction:\s*/, '').split(' ');
  const a = words.slice(0, 2).join(' ');
  const b = words.slice(2, 3).join(' ');
  const d = words.slice(3).join(' ');

  return `
<section class="hero">
  <div class="film">${QUEST.map(([f, alt], i) =>
    img(c, f, alt, i === 0 ? { eager: true } : {})).join('')}</div>
  <span class="wedge" aria-hidden="true"></span>
  <div class="wrap in">
    <div class="say">
      <p class="kicker cnd">${esc(c.site.positioning)}</p>
      <h1><span class="a">${esc(a)}</span><span class="b">${esc(b)}</span><span class="c">${esc(d)}</span></h1>
      <p>${esc(h.heroBody)}</p>
      <div class="acts">
        <a class="btn" href="${c.url('contact')}">Start a project ${ARROW}</a>
        <a class="btn line" href="${c.url('projects')}">See the work</a>
      </div>
    </div>
  </div>
</section>

<section class="credband">${creds(c)}</section>

${marquee(c)}

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="ht cut-l">${img(c, 'quest/story.webp', 'Framing and structural work on a Quest Construction project')}</span>
    </div>
    <div class="say rv">
      <h2>${esc(h.storyHeading)}</h2>
      ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      <ol>
        <li><div><h3>Family-owned since ${c.site.foundingYear}</h3>
          <p>${esc(c.site.positioning)}.</p></div></li>
        <li><div><h3>${c.services.length} trades, one contractor</h3>
          <p>Planning through final walkthrough, coordinated by the same team.</p></div></li>
        <li><div><h3>Reachable ${esc(c.site.availability)}</h3>
          <p>Call ${esc(c.site.phoneDisplay)} and a person picks up.</p></div></li>
      </ol>
      ${btn(c.url('about'), 'Read our story')}
    </div>
  </div>
</section>

<section class="offers">
  <span class="bar" aria-hidden="true"></span>
  <div class="wrap">
    <div class="head rv">
      <div><h2>Exclusive Offers Just For You</h2></div>
      <p>Two standing offers, applied at estimate. Ask for the code when you call.</p>
    </div>
    <div class="mosaic">
      <div class="blk tall rv">
        <span class="ht tint">${img(c, 'quest/slab-poured.webp', ALT['quest/slab-poured.webp'])}</span>
        <div class="body">
          <span class="n">${esc(c.site.offers[0].amount)}</span>
          <h3>${esc(c.site.offers[0].title)}</h3>
          <p>${esc(c.site.offers[0].body)}</p>
          <button class="btn dark" type="button" data-copy="${esc(c.site.offers[0].code)}">Get code ${esc(c.site.offers[0].code)}</button>
        </div>
      </div>
      <div class="blk pop rv">
        <div class="body">
          <span class="n">${esc(c.site.offers[1].amount)}</span>
          <h3>${esc(c.site.offers[1].title)}</h3>
          <p>${esc(c.site.offers[1].body)}</p>
          <button class="btn dark" type="button" data-copy="${esc(c.site.offers[1].code)}">Get code ${esc(c.site.offers[1].code)}</button>
        </div>
      </div>
      <div class="blk rv">
        <div class="body">
          <span class="n">${c.services.length}</span>
          <h3>Trades under one roof</h3>
          <ul>${c.services.slice(0, 5).map((s) => `<li>${esc(s.name)}</li>`).join('')}</ul>
          <a class="btn" href="${c.url('sitemap')}">All ${c.services.length} trades</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="content" id="services">
  <div class="wrap">
    ${head('What we build', esc(h.servicesHeading),
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${tradeSlabs(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Selected work', esc(c.pages.projects.h1), c.pages.projects.lede)}
    <div class="collage">
      ${c.pages.projects.items.map((p, i) => `
      <figure class="pc ${'abc'[i]} rv">
        <span class="ht">${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}</span>
        <figcaption><b>${esc(p.title)}</b><span>${esc(p.body)}</span></figcaption>
      </figure>`).join('')}
      <figure class="pc d rv">
        <span class="ht tint">${img(c, 'quest/custom-home-wide.webp', ALT['quest/custom-home-wide.webp'])}</span>
        <figcaption><b>Finished streets</b><span>Completed homes across Arizona</span></figcaption>
      </figure>
    </div>
    <div class="foot">
      ${btn(c.url('projects'), 'See the work')}
    </div>
  </div>
</section>

${closing(c, h.ctaHeading, h.ctaBody)}`;
}

export function service(c) {
  const s = c.item;
  const tabs = c.services.map((x) => {
    const on = x.slug === s.slug;
    return `<a href="${c.url(`services/${x.slug}`)}"${on ? ' class="on" aria-current="page"' : ''}>${esc(x.name)}</a>`;
  }).join('');

  const scope = s.scope && s.scope.length ? `
<section class="content bone2">
  <div class="wrap">
    ${head('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="slist rv">${s.scope.map((x, i) => `
      <div class="srow">
        <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div></div>`).join('')}</div>
  </div>
</section>` : '';

  // The FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="content">
  <div class="wrap">
    ${head('Questions', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="qslabs">${s.faqs.map((f, i) => `
      <details class="qslab rv">
        <summary>${esc(f.q)}<span class="pm" aria-hidden="true"></span></summary>
        <p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${subhero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="about">
  <div class="wrap in flip">
    <div class="pic rv">
      <span class="ht cut-r">${img(c, 'quest/spare.webp', ALT['quest/spare.webp'])}</span>
    </div>
    <div class="say rv">
      <h2>${esc(s.name)} by <em>${esc(c.site.name)}</em></h2>
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${btn(c.url('contact'), 'Start a project')}
    </div>
  </div>
</section>

<section class="content bone2">
  <div class="wrap">
    ${head('Why Quest', `Why Choose ${esc(c.site.name)}?`,
      'Four things that hold true on every job we run.')}
    ${paras(s.whyChoose.map((w) => ({ body: w })))}
  </div>
</section>
${scope}

<section class="content">
  <div class="wrap">
    ${head('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="rslabs">${s.process.map((p) => `
      <div class="rslab rv" style="--d:${(p.n - 1) * 0.06}s">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
      </div>`).join('')}</div>
  </div>
</section>
${faq}

${marquee(c)}
${closing(c, s.ctaHeading, s.ctaBody)}`;
}

export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));

  return `${subhero(c, {
    h1: fill(t.h1), lede: fill(t.tagline), crumb: a.name, trail: 'Service Areas',
  })}

<section class="credband">${creds(c)}</section>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="ht cut-l">${img(c, 'quest/custom-home-wide.webp', ALT['quest/custom-home-wide.webp'])}</span>
    </div>
    <div class="say rv">
      <h2>${fill(t.communityHeading)}</h2>
      <p>${fill(t.community)}</p>
      <p>${fill(t.local)}</p>
      <p>${fill(t.commitment)}</p>
      ${btn(c.url('contact'), `Talk to us about ${a.city}`)}
    </div>
  </div>
</section>

<section class="content bone2">
  <div class="wrap">
    ${head('On site', `What We Run in ${esc(a.city)}`, '')}
    ${paras(t.capabilities.map((cap) => ({ body: cap })))}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Services', fill(t.servicesHeading), '')}
    ${tradeSlabs(c)}
  </div>
</section>

<section class="content bone2">
  <div class="wrap">
    ${head('Nearby', 'Other Areas We Serve', '')}
    <div class="arearow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('')}</div>
  </div>
</section>

${marquee(c)}
${closing(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${subhero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

<section class="credband">${creds(c)}</section>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="ht cut-l">${img(c, 'quest/story.webp', 'Framing and structural work on a Quest Construction project')}</span>
    </div>
    <div class="say rv">
      <p class="cnd">${esc(a.storyHeading)}</p>
      <h2>Built on <em>craftsmanship</em></h2>
      ${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${btn(c.url('projects'), 'See our work')}
    </div>
  </div>
</section>

<section class="content bone2">
  <div class="wrap">
    ${head('What we do', 'Fourteen Trades, One Contractor',
      'Every trade below is coordinated by the same team, on the same schedule.')}
    ${tradeSlabs(c)}
  </div>
</section>

${marquee(c)}
${closing(c, 'Build with a team that answers the phone',
  `${c.site.positioning}, reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  const plate = (f, alt, i) => `<figure class="gp rv" style="--r:${(i % 3) - 1}deg;--d:${(i % 4) * 0.04}s">
    <span class="ht${i % 4 === 3 ? ' tint' : ''}">${img(c, f, alt)}</span>
    <figcaption><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(alt)}</span></figcaption>
  </figure>`;

  return `${subhero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap">
    ${head('From Quest projects', 'Work We Have Photographed', '')}
    <div class="gcollage">${QUEST.map(([f, alt], i) => plate(f, alt, i)).join('')}</div>
  </div>
</section>

<section class="content bone2">
  <div class="wrap">
    ${head('The trades we run', 'Placeholder Photography',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="gcollage">${SHOTS.map((f, i) => plate(f, ALT[f], i)).join('')}</div>
    <p class="cnd note">Placeholder photography, to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${marquee(c)}
${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="content">
  <div class="wrap">
    ${head('Index', 'Selected Work', '')}
    <div class="opara">${p.items.map((it, i) => `
      <article class="op rv" style="--d:${i * 0.06}s">
        <span class="ht${i === 1 ? ' tint' : ''}">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}</span>
        <div class="obody">
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.body)}</p>
          <a class="btn" href="${c.url('contact')}">Start a project</a>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

${marquee(c)}
${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label><span class="cnd">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="cnd">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="bandform">
  <span class="slab" aria-hidden="true"></span>
  <div class="wrap in">
    <form class="contact-form rv" novalidate>
      <h2>${esc(p.formHeading)}</h2>
      ${p.fields.map(field).join('')}
      <button class="btn" type="submit">Submit ${ARROW}</button>
      <p class="form-note cnd" role="status" aria-live="polite"></p>
    </form>
    <div class="direct rv">
      <p class="cnd">${esc(p.helpHeading)}</p>
      <a class="bigphone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <ol>
        <li><span class="n">01</span><div><h3>Availability</h3><p>${esc(c.site.availability)}</p></div></li>
        <li><span class="n">02</span><div><h3>Building since</h3><p>${c.site.foundingYear}</p></div></li>
        <li><span class="n">03</span><div><h3>Trades offered</h3><p>${c.services.length}</p></div></li>
        <li><span class="n">04</span><div><h3>Areas served</h3><p>${c.areas.areas.length} Arizona cities</p></div></li>
      </ol>
      <figure class="cshot"><span class="ht cut-r">${img(c, 'quest/custom-home-gables.webp', 'A Quest Construction project in Arizona')}</span></figure>
    </div>
  </div>
</section>

${marquee(c)}
${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const marq = (n, title, items, r) => `<div class="mcol rv" style="--r:${r}deg">
    <p class="cnd">${esc(n)}</p>
    <h2>${esc(title)}</h2>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    <div class="marqcols">
      ${marq('01', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ], -1.4)}
      ${marq('02', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]), 1)}
      ${marq('03', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]), -0.8)}
    </div>
  </div>
</section>

${marquee(c)}
${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
