// Direction 08 — Machine Age. Art Deco: symmetrical about a centre line,
// strong verticals, stepped ziggurat frames, hairline double rules in brass.
// Charcoal and brass, Limelight for display and Jost for text — the palette
// and the lettering of the era that built the skyscrapers.
import { img, preloadImage } from '../lib/images.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd08-machine-age',
  name: 'Machine Age',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Limelight&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;
const RULE = `<div class="drule short" aria-hidden="true"><i></i></div>`;

// Roman numerals, because the whole direction is 1930s signage.
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV'];

const SHOTS = ['rebar.webp', 'framing.webp', 'crew-slab.webp', 'site-steel.webp',
  'mech.webp', 'facade.webp', 'roofline.webp', 'trade-weld.webp',
  'trade-electric.webp', 'kitchen.webp', 'bath.webp', 'earthworks.webp',
  'neighborhood.webp', 'home-dusk.webp'];

const ALT = {
  'rebar.webp': 'Reinforcing steel placed before a pour',
  'framing.webp': 'Timber framing going up on a residential build',
  'crew-slab.webp': 'A crew working a freshly poured slab',
  'site-steel.webp': 'Structural steel standing on site',
  'mech.webp': 'Mechanical rough-in before the walls close',
  'facade.webp': 'A rendered and painted exterior facade',
  'roofline.webp': 'A finished roofline against a clear sky',
  'trade-weld.webp': 'Welding structural steel on site',
  'trade-electric.webp': 'Electrical rough-in on a remodel',
  'kitchen.webp': 'A completed kitchen remodel',
  'bath.webp': 'A completed bathroom remodel',
  'earthworks.webp': 'Earthworks and grading on a site',
  'neighborhood.webp': 'Completed homes on a residential street',
  'home-dusk.webp': 'A finished home at dusk',
};

const QUEST = [
  ['quest/hero.webp', 'A Quest Construction home under construction'],
  ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
  ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
];

const FRIEZE = [
  ['earthworks.webp', 'Earthworks'],
  ['rebar.webp', 'Concrete'],
  ['framing.webp', 'Framing'],
  ['trade-weld.webp', 'Steel'],
  ['facade.webp', 'Finishes'],
];

export function nav(c) {
  const col = (items) => items.map(([href, label], i) =>
    `<a href="${href}"><i>${ROMAN[i % ROMAN.length]}</i>${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap in">
  <div class="l">
    <div class="drop">
      <button class="n" type="button" aria-expanded="false">Services</button>
      <div class="zpanel"><div class="wrap">
        <p class="lbl ctr">Fourteen trades</p>
        ${RULE}
        <div class="zcols">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button class="n" type="button" aria-expanded="false">Areas</button>
      <div class="zpanel"><div class="wrap">
        <p class="lbl ctr">Eleven Arizona cities</p>
        ${RULE}
        <div class="zcols">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a class="n" href="${c.url('projects')}">Works</a>
  </div>
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    ${img(c, 'quest/logo.webp', c.site.name, { load: 'eager' })}
  </a>
  <div class="r">
    <a class="n" href="${c.url('gallery')}">Gallery</a>
    <a class="n" href="${c.url('about')}">About</a>
    <a class="n navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
    ${btn(c.url('contact'), 'Enquire')}
  </div>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
  <nav class="mnav">
    <a href="${c.url('projects')}">Works</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
    <a href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </nav>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h5>${esc(title)}</h5>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  return `<footer>
<div class="wrap">
  <a class="brand" href="${c.url('home')}">
    ${img(c, 'quest/logo.webp', c.site.name, {})}
  </a>
  <p class="lead">${esc(c.site.footerBlurb)}</p>
  ${RULE}
  <p class="lbl">${esc(c.site.positioning)}</p>
  <div class="fcta">${btn(c.site.phoneHref, c.site.phoneDisplay)}
    ${btn(c.url('contact'), 'Send a message', 'btn line')}</div>
  <div class="cols">
    ${col('Company', [
      [c.url('about'), 'About Us'], [c.url('projects'), 'Project Showcase'],
      [c.url('gallery'), 'Gallery'], [c.url('contact'), 'Contact'],
      [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
  <div class="bar">
    <span>&copy; 2026 ${esc(c.site.name)} — since ${c.site.foundingYear}</span>
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
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);s.setProperty('--acc-dim',p[2]);
    s.setProperty('--acc-on-dark',p[3]);}
  var q=new URLSearchParams(location.search).get('acc'); if(q) set(q);
  addEventListener('message',function(e){ if(e.data&&e.data.acc) set(e.data.acc); });
})();
(function(){
  var b=document.querySelector('.burger'), n=document.querySelector('.mnav');
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
      if(n) n.textContent='This form is not connected yet \\u2014 please call ${c.site.phoneDisplay} and we will pick up.';});
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

const head = (label, heading, sub) => `<div class="head ctr rv">
  <p class="lbl">${esc(label)}</p>
  ${RULE}
  <h2>${heading}</h2>
  ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
</div>`;

/** The chevron-divided figures rail — every figure drawn from the content. */
const figures = (c, first) => {
  const items = [
    first || ['Est.', c.site.foundingYear, 'Building since'],
    ['', c.services.length, 'Trades offered'],
    ['', c.areas.areas.length, 'Arizona cities'],
    ['', c.site.availability, 'Reachable'],
    ['', c.site.phoneDisplay, 'By telephone'],
  ];
  return `<div class="in">${items.map(([, k, v], i) => `
    ${i ? '<span class="chev" aria-hidden="true"></span>' : ''}
    <div class="it"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`;
};

/** Symmetrical brass lozenges — 08's why-choose treatment. */
const lozenges = (items) => `<div class="lozes">${items.map((x, i) => `
  <div class="loze rv" style="--d:${(i % 4) * 0.05}s">
    <span class="dia"><i>${ROMAN[i % ROMAN.length]}</i></span>
    ${x.title ? `<h3>${esc(x.title)}</h3>` : ''}
    <p>${esc(x.body)}</p>
  </div>`).join('')}</div>`;

/** The fourteen trades as a symmetrical ruled roster. */
const roster = (c) => `<div class="roster rv">${c.services.map((s, i) => `
  <a href="${c.url(`services/${s.slug}`)}">
    <span class="rn">${ROMAN[i]}</span>
    <span class="nm">${esc(s.name)}</span>
    <span class="ds">${esc(s.shortDesc)}</span>
    <span class="go">${ARROW}</span>
  </a>`).join('')}</div>`;

/** The centred ornamental panel, used as every page's closing band. */
const closing = (c, heading, body) => `
<section class="magnet">
  <span class="sun" aria-hidden="true"></span>
  <div class="wrap">
    <div class="panel rv">
      <p class="lbl">Next</p>
      ${RULE}
      <h2>${esc(heading)}</h2>
      <p>${esc(body)}</p>
      <div class="acts">
        ${btn(c.url('contact'), 'Send a message')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
      </div>
      <div class="cols">
        <div><b>${esc(c.site.availability)}</b><span>We answer the telephone at any hour.</span></div>
        <div><b>Since ${c.site.foundingYear}</b><span>${esc(c.site.positioning)}.</span></div>
        <div><b>${c.services.length} trades</b><span>All coordinated by one contractor.</span></div>
      </div>
    </div>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <span class="sun" aria-hidden="true"></span>
  <div class="wrap ctr">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&#9670;</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&#9670;</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <h1>${esc(h1)}</h1>
    ${RULE}
    <p class="sub">${esc(lede)}</p>
    <div class="acts">
      ${btn(c.url('contact'), 'Enquire')}
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const [lead, tail] = h.heroTitle.split(/:\s*/);

  return `
<section class="hero">
  <span class="sun" aria-hidden="true"></span>
  <div class="in">
    <p class="lbl">${esc(c.site.positioning)}</p>
    ${RULE}
    <h1><span>${esc(lead)}</span><span class="acc">${esc(tail || c.site.tagline)}</span></h1>
    <p class="sub">${esc(h.heroBody)}</p>
    <div class="acts">
      ${btn(c.url('contact'), 'Enquire')}
      ${btn(c.url('projects'), 'View the works', 'btn line')}
    </div>
    <div class="rail">
      <div><span class="k">${c.site.foundingYear}</span><span class="v">Building since</span></div>
      <div><span class="k">${c.services.length}</span><span class="v">Trades offered</span></div>
      <div><span class="k">${c.areas.areas.length}</span><span class="v">Arizona cities</span></div>
      <div><span class="k">${esc(c.site.availability)}</span><span class="v">Reachable</span></div>
    </div>
  </div>
  <div class="elev">
    ${img(c, 'quest/hero.webp', 'A Quest Construction home under construction', { eager: true })}
    <div class="plate"><b>${esc(c.site.tagline)}</b><span>Arizona</span></div>
  </div>
</section>

<section class="proof">
  <div class="wrap">${figures(c)}</div>
</section>

<section class="about">
  <div class="wrap">
    ${head(esc(h.storyEyebrow), esc(h.storyHeading), '')}
    <div class="in">
      <div class="col l rv"><p>${esc(h.story[0])}</p></div>
      <div class="frame rv">
        <div class="arch">${QUEST.map(([f, alt]) => img(c, f, alt)).join('')}</div>
        <span class="rc">Est. ${c.site.foundingYear}</span>
      </div>
      <div class="col r rv">
        <p>Fourteen trades under one contractor, coordinated by the same team from
        planning through the final walkthrough.</p>
        <p>Reachable ${esc(c.site.availability)} on ${esc(c.site.phoneDisplay)} — a person
        answers, not a queue.</p>
      </div>
    </div>
    <div class="cta ctr">${btn(c.url('about'), 'Read our story', 'btn line')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('On site', 'The Sequence of a Build', '')}
    <div class="frieze rv">${FRIEZE.map(([f, name], i) => `
      <figure><span class="ph">${img(c, f, ALT[f])}</span>
        <figcaption><span class="rn">${ROMAN[i]}</span><span class="nm">${esc(name)}</span></figcaption>
      </figure>`).join('')}</div>
  </div>
</section>

<section class="offers">
  <div class="wrap">
    ${head('Standing offers', 'Exclusive Offers Just For You',
      'Two standing offers, applied at estimate. Ask for the code when you telephone.')}
    <div class="arches">
      <div class="arch-card rv">
        <span class="rn"><i>I</i></span>
        <span class="ph zig">${img(c, 'kitchen.webp', ALT['kitchen.webp'])}</span>
        <div class="bd">
          <h3>${esc(c.site.offers[0].title)}</h3>
          <p>${esc(c.site.offers[0].body)}</p>
          <dl><div><dt>Value</dt><dd>${esc(c.site.offers[0].amount)}</dd></div>
            <div><dt>Code</dt><dd>${esc(c.site.offers[0].code)}</dd></div></dl>
          <button class="btn dark go" type="button" data-copy="${esc(c.site.offers[0].code)}">Get code</button>
        </div>
      </div>
      <div class="arch-card mid rv">
        <span class="rn"><i>II</i></span>
        <span class="ph zig">${img(c, 'quest/story.webp', QUEST[1][1])}</span>
        <div class="bd">
          <h3>${esc(c.site.offers[1].title)}</h3>
          <p>${esc(c.site.offers[1].body)}</p>
          <dl><div><dt>Value</dt><dd>${esc(c.site.offers[1].amount)}</dd></div>
            <div><dt>Code</dt><dd>${esc(c.site.offers[1].code)}</dd></div></dl>
          <button class="btn dark go" type="button" data-copy="${esc(c.site.offers[1].code)}">Get code</button>
        </div>
      </div>
      <div class="arch-card rv">
        <span class="rn"><i>III</i></span>
        <span class="ph zig">${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}</span>
        <div class="bd">
          <h3>Where We Build</h3>
          <p>From Phoenix out to Florence, the same crews and the same schedule discipline on every job.</p>
          <dl><div><dt>Cities</dt><dd>${c.areas.areas.length}</dd></div>
            <div><dt>Region</dt><dd>${esc(c.site.regionName)}</dd></div></dl>
          ${btn(c.url('sitemap'), 'See every area', 'btn dark go')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('What we build', esc(h.servicesHeading),
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${roster(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Selected work', esc(c.pages.projects.h1), c.pages.projects.lede)}
    <div class="tiles">${c.pages.projects.items.map((p, i) => `
      <a class="tile rv" href="${c.url('projects')}">
        <span class="ph">${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}</span>
        <span class="cap"><b>${esc(p.title)}</b><span>${ROMAN[i]}</span></span>
      </a>`).join('')}
      <a class="tile rv" href="${c.url('gallery')}">
        <span class="ph">${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}</span>
        <span class="cap"><b>The Gallery</b><span>IV</span></span>
      </a>
    </div>
    <div class="after ctr">${btn(c.url('projects'), 'See the showcase', 'btn line')}</div>
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
<section class="content">
  <div class="wrap">
    ${head('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="ledger rv">${s.scope.map((x, i) => `
      <div class="lrow"><span class="rn">${ROMAN[i]}</span>
        <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div></div>`).join('')}</div>
  </div>
</section>` : '';

  // An ornamental centred panel — 08's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="content">
  <div class="wrap">
    ${head('Enquiries', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="panel qpanel rv">
      ${s.faqs.map((f, i) => `
      <details${i === 0 ? ' open' : ''}>
        <summary><span class="rn">${ROMAN[i]}</span>${esc(f.q)}</summary>
        ${RULE}
        <p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `${subhero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="about">
  <div class="wrap">
    ${head('Overview', `${esc(s.name)} by ${esc(c.site.name)}`, '')}
    <div class="in">
      <div class="col l rv"><p>${esc(s.intro[0])}</p></div>
      <div class="frame rv">
        <div class="arch">${img(c, 'quest/spare.webp', `Completed ${s.name.toLowerCase()} work by Quest Construction`)}</div>
        <span class="rc">${esc(s.name)}</span>
      </div>
      <div class="col r rv">${s.intro.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="cta ctr">${btn(c.url('contact'), 'Request an estimate')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Why Quest', `Why Choose ${esc(c.site.name)}?`,
      'Four things that hold true on every job we run.')}
    ${lozenges(s.whyChoose.map((w) => ({ body: w })))}
  </div>
</section>
${scope}

<section class="content">
  <div class="wrap">
    ${head('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="zsteps">${s.process.map((p) => `
      <div class="zstep rv" style="--d:${(p.n - 1) * 0.05}s">
        <span class="cap zig-sm"><i>${ROMAN[p.n - 1]}</i></span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
        <span class="stg">Stage ${p.n} of ${s.process.length}</span>
      </div>`).join('')}</div>
  </div>
</section>
${faq}

${closing(c, s.ctaHeading, s.ctaBody)}`;
}

export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));

  return `${subhero(c, {
    h1: fill(t.h1), lede: fill(t.tagline), crumb: a.name, trail: 'Service Areas',
  })}

<section class="proof">
  <div class="wrap">${figures(c, ['', a.name, 'This area'])}</div>
</section>

<section class="about">
  <div class="wrap">
    ${head('The area', fill(t.communityHeading), '')}
    <div class="in">
      <div class="col l rv"><p>${fill(t.community)}</p></div>
      <div class="frame rv">
        <div class="arch">${img(c, 'neighborhood.webp', `Completed homes on a residential street near ${a.city}, Arizona`)}</div>
        <span class="rc">${esc(a.name)}</span>
      </div>
      <div class="col r rv"><p>${fill(t.local)}</p><p>${fill(t.commitment)}</p></div>
    </div>
    <div class="cta ctr">${btn(c.url('contact'), `Enquire about ${a.city}`)}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('On site', `What We Run in ${esc(a.city)}`, '')}
    ${lozenges(t.capabilities.map((cap) => ({ body: cap })))}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Services', fill(t.servicesHeading), '')}
    ${roster(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Nearby', 'Other Areas We Serve', '')}
    <div class="arearow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('')}</div>
  </div>
</section>

${closing(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${subhero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

<section class="proof">
  <div class="wrap">${figures(c)}</div>
</section>

<section class="about">
  <div class="wrap">
    ${head(esc(a.storyHeading), 'Built on Craftsmanship', '')}
    <div class="in">
      <div class="col l rv"><p>${esc(a.story[0])}</p></div>
      <div class="frame rv">
        <div class="arch">${QUEST.map(([f, alt]) => img(c, f, alt)).join('')}</div>
        <span class="rc">Est. ${c.site.foundingYear}</span>
      </div>
      <div class="col r rv">${a.story.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="cta ctr">${btn(c.url('projects'), 'See our work', 'btn line')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('What we do', 'Fourteen Trades, One Contractor',
      'Every trade below is coordinated by the same team, on the same schedule.')}
    ${roster(c)}
  </div>
</section>

${closing(c, 'Build with a team that answers the telephone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  const tile = (f, alt, i) => `<figure class="tile rv" style="--d:${(i % 4) * 0.04}s">
    <span class="ph">${img(c, f, alt)}</span>
    <span class="cap"><b>${esc(alt)}</b><span>${ROMAN[i % ROMAN.length]}</span></span>
  </figure>`;

  return `${subhero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap">
    ${head('From Quest projects', 'Work We Have Photographed', '')}
    <div class="tiles">${QUEST.map(([f, alt], i) => tile(f, alt, i)).join('')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('The trades we run', 'Placeholder Photography',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="tiles">${SHOTS.map((f, i) => tile(f, ALT[f], i)).join('')}</div>
    <p class="lbl note ctr">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="content">
  <div class="wrap">
    ${head('Index', 'Selected Work', '')}
    <div class="arches">${p.items.map((it, i) => `
      <article class="arch-card${i === 1 ? ' mid' : ''} rv" style="--d:${i * 0.05}s">
        <span class="rn"><i>${ROMAN[i]}</i></span>
        <span class="ph zig">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}</span>
        <div class="bd">
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.body)}</p>
          <dl><div><dt>Run by</dt><dd>${esc(c.site.name)}</dd></div>
            <div><dt>Region</dt><dd>${esc(c.site.regionName)}</dd></div></dl>
          ${btn(c.url('contact'), 'Enquire', 'btn dark go')}
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label class="wide"><span class="lbl">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="lbl">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="magnet">
  <span class="sun" aria-hidden="true"></span>
  <div class="wrap">
    <form class="contact-form panel rv" novalidate>
      <p class="lbl">${esc(p.helpHeading)}</p>
      ${RULE}
      <h2>${esc(p.formHeading)}</h2>
      <div class="ffields">${p.fields.map(field).join('')}</div>
      <div class="acts">
        <button class="btn" type="submit">Send it</button>
        <a class="btn line" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      </div>
      <p class="form-note lbl" role="status" aria-live="polite"></p>
      <div class="cols">
        <div><b>${esc(c.site.availability)}</b><span>We answer the telephone at any hour.</span></div>
        <div><b>Since ${c.site.foundingYear}</b><span>${esc(c.site.positioning)}.</span></div>
        <div><b>${c.areas.areas.length} cities</b><span>Across ${esc(c.site.regionName)}.</span></div>
      </div>
    </form>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('On the job', 'Where To Find Us', '')}
    <div class="frieze rv">${FRIEZE.map(([f, name], i) => `
      <figure><span class="ph">${img(c, f, ALT[f])}</span>
        <figcaption><span class="rn">${ROMAN[i]}</span><span class="nm">${esc(name)}</span></figcaption>
      </figure>`).join('')}</div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const col = (n, title, items) => `<div class="ocol rv">
    <p class="lbl">${esc(n)}</p>
    <h2>${esc(title)}</h2>
    ${RULE}
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    <div class="ocols">
      ${col('I', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ])}
      ${col('II', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
      ${col('III', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
