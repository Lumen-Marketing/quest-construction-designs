// Direction 11 — Plant Room. The modern industrial-technology landing page:
// soft off-white ground, everything on generous radii, photography living in
// rounded plates rather than hard rectangles, and a floating pill navigation
// that sits ON the hero photograph instead of above it.
//
// Furniture nobody else in the set uses: dial rings for the figures, tinted
// photo tiles with a category pill, a six-up icon card grid with the two real
// offers inverted inside it, a numbered accordion as the lead magnet, and a
// marquee wordmark closing the footer.
import { img, preloadImage } from '../lib/images.mjs';
import { icon } from '../lib/icons.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd11-plant-room',
  name: 'Plant Room',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>`;

/** The house button: a pill with the arrow in its own circular cap. */
const btn = (href, label, cls = 'btn') =>
  `<a class="${cls}" href="${href}"><span>${esc(label)}</span><i>${ARROW}</i></a>`;

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
  'cranes.webp': 'Cranes standing over a site',
  'commercial.webp': 'A commercial building under construction',
  'planning.webp': 'Planning a build before work starts',
  'worker.webp': 'A tradesman on a Quest Construction job',
};

const QUEST = [
  ['quest/hero.webp', 'A Quest Construction home under construction'],
  ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
  ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
];

/** The three tinted phase tiles — the reference's "what we build" row. */
const PHASES = [
  ['Planning', 'planning.webp', 'Consultation & Planning',
    'We walk the job, understand what you are after, and put a schedule and a written price against it.'],
  ['On site', 'crew-slab.webp', 'Groundwork & Structure',
    'Concrete, framing and structural steel, sequenced so no trade is waiting on the one before it.'],
  ['Handover', 'kitchen.webp', 'Finishes & Walkthrough',
    'Paint, cabinetry, counters and glazing, closed out with a walkthrough before we call it done.'],
];

// ------------------------------------------------------------------ chrome

export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="in">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    ${img(c, 'quest/logo.webp', c.site.name, { load: 'eager' })}
  </a>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="flyout"><div class="fin">
        <p class="eyebrow">Fourteen trades, self-managed</p>
        <div class="fgrid">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="flyout"><div class="fin">
        <p class="eyebrow">Eleven Arizona cities</p>
        <div class="fgrid">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <a class="btn sm" href="${c.url('contact')}"><span>Get a free quote</span><i>${ARROW}</i></a>
  <a class="btn sm navtel" href="${c.site.phoneHref}"><span>${esc(c.site.phoneDisplay)}</span><i>${ARROW}</i></a>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h4>${esc(title)}</h4>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  const word = `<span>${esc(c.site.name)}</span><b aria-hidden="true">&#10038;</b>`;
  return `<footer class="foot">
<div class="wrap">
  <div class="fcols">
    <div class="fbrand">
      <a class="brand" href="${c.url('home')}">
        ${img(c, 'quest/logo.webp', c.site.name, {})}
      </a>
      <p>${esc(c.site.footerBlurb)}</p>
      <a class="ftel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <p class="fine">${esc(c.site.positioning)} &mdash; reachable ${esc(c.site.availability)}.</p>
    </div>
    ${col('Company', [
      [c.url('about'), 'About Us'], [c.url('projects'), 'Project Showcase'],
      [c.url('gallery'), 'Gallery'], [c.url('contact'), 'Contact'],
      [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
  <div class="bar">
    <span>&copy; 2026 ${esc(c.site.name)} &mdash; building since ${c.site.foundingYear}</span>
    <a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a>
  </div>
</div>
<div class="marquee" aria-hidden="true"><div class="track">${word.repeat(8)}</div></div>
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
      try{await navigator.clipboard.writeText(code);b.textContent='Copied'}
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

// ------------------------------------------------------------- shared parts

/** Centred section head — this direction centres, which none of 04-10 do. */
const head = (eyebrow, heading, lede) => `<div class="shead rv">
  ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
  <h2>${heading}</h2>
  ${lede ? `<p class="slede">${esc(lede)}</p>` : ''}
</div>`;

/** Dial rings — the figures, each drawn as a ring with the value inside it. */
const dials = (c) => {
  const items = [
    [c.site.foundingYear, 'Building since', 78],
    [String(c.services.length), 'Trades self-managed', 92],
    [String(c.areas.areas.length), 'Arizona cities', 66],
    [c.site.availability, 'Reachable', 100],
  ];
  return `<div class="dials rv">${items.map(([v, l, p], i) => `
  <div class="dial" style="--p:${p};--d:${i * 0.07}s">
    <span class="ring"><b>${esc(v)}</b></span>
    <span class="dlab">${esc(l)}</span>
  </div>`).join('')}</div>`;
};

/** Tinted photo tiles with a category pill — the "what we build" row. */
const tiles = (c) => `<div class="tiles">${PHASES.map(([pill, file, title, body], i) => `
  <article class="tile rv" style="--d:${i * 0.08}s">
    ${img(c, file, ALT[file] || title)}
    <span class="pill">${esc(pill)}</span>
    <div class="tcap"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>
  </article>`).join('')}</div>`;

/** Six-up icon card grid. Cards flagged `dark` invert. */
const iconwall = (cards) => `<div class="iconwall">${cards.map((x, i) => `
  <article class="icard${x.dark ? ' dark' : ''} rv" style="--d:${(i % 3) * 0.07}s">
    <span class="chip">${x.icon || icon('framing')}</span>
    ${x.title ? `<h3>${esc(x.title)}</h3>` : ''}
    <p>${esc(x.body)}</p>
    ${x.code ? `<button class="codebtn" type="button" data-copy="${esc(x.code)}">Copy code ${esc(x.code)}</button>` : ''}
  </article>`).join('')}</div>`;

/** Numbered accordion. Used as the lead magnet and again for FAQs. */
const accordion = (rows) => `<div class="qacc rv">${rows.map((r, i) => `
  <details${i === 0 ? ' open' : ''}>
    <summary><span class="ano">${String(i + 1).padStart(2, '0')}</span><span class="atitle">${esc(r.q)}</span><span class="pm" aria-hidden="true"></span></summary>
    <div class="abody"><p>${esc(r.a)}</p></div>
  </details>`).join('')}</div>`;

/** The fourteen trades as rounded link rows with an icon chip. */
const trades = (c) => `<div class="trades">${c.services.map((s, i) => `
  <a class="trow rv" href="${c.url(`services/${s.slug}`)}" style="--d:${(i % 4) * 0.05}s">
    <span class="chip sm">${icon(s.slug)}</span>
    <span class="tt"><b>${esc(s.name)}</b><em>${esc(s.shortDesc)}</em></span>
    <i class="go">${ARROW}</i>
  </a>`).join('')}</div>`;

/** Circular thumbnail rail — the gallery teaser. */
const avrail = (c, href, label) => `<div class="avrail rv">
  <div class="avs">${SHOTS.slice(0, 7).map((f, i) => `
    <span class="av${i === 2 ? ' on' : ''}">${img(c, f, ALT[f])}</span>`).join('')}</div>
  <a class="avlink" href="${href}"><span>${esc(label)}</span><i>${ARROW}</i></a>
</div>`;

/** The closing band, on every page. */
const closing = (c, heading, body) => `
<section class="closer">
  <div class="wrap">
    <div class="cbox rv">
      <span class="glow" aria-hidden="true"></span>
      <p class="eyebrow">Next step</p>
      <h2>${esc(heading)}</h2>
      <p class="clede">${esc(body)}</p>
      <div class="cta">
        ${btn(c.url('contact'), 'Get a free quote')}
        <a class="btn ghost" href="${c.site.phoneHref}"><span>${esc(c.site.phoneDisplay)}</span><i>${ARROW}</i></a>
      </div>
      <p class="fine">A person answers, ${esc(c.site.availability)}. Family-owned since ${c.site.foundingYear}.</p>
    </div>
  </div>
</section>`;

/** Inner-page hero: the same rounded plate, half the height. */
const subhero = (c, { h1, lede, crumb, trail, shot, shotAlt }) => `
<section class="subhero">
  <div class="wrap">
    <div class="plate rv">
      ${img(c, shot || 'site-steel.webp', shotAlt || ALT['site-steel.webp'], { eager: true })}
      <div class="pin">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&#8250;</span>
          ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&#8250;</span>` : ''}
          <b>${esc(crumb)}</b>
        </nav>
        <h1>${esc(h1)}</h1>
        <p class="lead">${esc(lede)}</p>
        <div class="cta">
          ${btn(c.url('contact'), 'Get a free quote', 'btn light')}
          <a class="btn ghost on-dark" href="${c.site.phoneHref}"><span>${esc(c.site.phoneDisplay)}</span><i>${ARROW}</i></a>
        </div>
      </div>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const [lead, tail] = h.heroTitle.split(/:\s*/);

  const offerCards = c.site.offers.map((o) => ({
    dark: true, icon: icon('concrete'),
    title: `${o.amount} — ${o.title}`, body: o.body, code: o.code,
  }));
  const assurance = [
    { icon: icon('custom-home-building'), title: 'One contractor, fourteen trades',
      body: 'Nothing is handed off to a stranger halfway through. The team that starts the job finishes it.' },
    { icon: icon('framing'), title: 'A written estimate, itemised',
      body: 'You see what every trade costs before a tool comes out of the van. No moving numbers.' },
    { icon: icon('roofing'), title: `Reachable ${c.site.availability}`,
      body: `Call ${c.site.phoneDisplay} and a person picks up — not a queue and not a form.` },
    { icon: icon('window-installation'), title: `Arizona since ${c.site.foundingYear}`,
      body: `${c.site.positioning}, working across ${c.areas.areas.length} cities in ${c.site.regionName}.` },
  ];

  return `
<section class="hero">
  <div class="wrap">
    <div class="plate">
      ${img(c, 'quest/hero.webp', QUEST[0][1], { eager: true })}
      <div class="pin">
        <span class="chip-note">Family-owned since ${c.site.foundingYear} <a href="${c.url('about')}">Our story ${ARROW}</a></span>
        <h1>${esc(lead)}<em>${esc(tail || c.site.tagline)}</em></h1>
        <p class="lead">${esc(h.heroBody)}</p>
        <div class="cta">
          ${btn(c.url('contact'), 'Get a free quote', 'btn light')}
          <a class="btn ghost on-dark" href="${c.url('projects')}"><span>See the work</span><i>${ARROW}</i></a>
        </div>
      </div>
      <figure class="reel">
        <span class="rno"><b>01</b>/03</span>
        <span class="rshot">${img(c, 'quest/story.webp', QUEST[1][1])}<i class="play">${PLAY}</i></span>
        <figcaption>Framing week on a Quest job. A site film goes here.</figcaption>
      </figure>
      <a class="seal" href="${c.url('contact')}" aria-label="Get in touch">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <path id="sealpath" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" fill="none"></path>
          <text><textPath href="#sealpath">GET IN TOUCH &#183; GET IN TOUCH &#183; </textPath></text>
        </svg>
        <i>${ARROW}</i>
      </a>
    </div>
  </div>
</section>

<section class="proof">
  <div class="wrap">${dials(c)}</div>
</section>

<section class="build">
  <div class="wrap">
    ${head('How a job runs', esc(h.storyHeading), 'Full-service construction: the same team handles every phase, in order, with one person accountable for the schedule.')}
    ${tiles(c)}
    <div class="story rv">
      ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p>Fourteen trades sit under one contractor here, which is why the schedule holds:
      there is nobody to chase and nobody to blame.</p>
    </div>
  </div>
</section>

<section class="panel">
  <div class="wrap">
    <div class="pbox">
      ${head('What you get', 'Everything the Job Needs, Under One Roof',
        'Our commitment to quality, safety and communication is what keeps Arizona homeowners calling back.')}
      ${iconwall([...assurance.slice(0, 2), offerCards[0], offerCards[1], ...assurance.slice(2)])}
    </div>
  </div>
</section>

<section class="magnet">
  <div class="wrap">
    <div class="mbox rv">
      <div class="mcopy">
        <p class="eyebrow acc">Before you commit</p>
        <h2>What actually happens after you call</h2>
        <p class="clede">Four questions we get asked before every job, answered before you have to ask them.</p>
        ${btn(c.url('contact'), 'Start the conversation', 'btn light')}
      </div>
      ${accordion([
        { q: 'How is the estimate put together?',
          a: 'We walk the job first. Nothing is priced off a photograph. You get one written estimate, itemised by trade, so you can see where the money goes and what happens if you change your mind about a finish.' },
        { q: 'Who is actually on my site?',
          a: `Our own people. All ${c.services.length} trades are self-managed, so the crew that starts your job is the crew that finishes it and there is one person accountable for the schedule.` },
        { q: 'How long does a project take?',
          a: 'That depends on scope and on permitting, and we will tell you honestly rather than optimistically. The schedule goes in the estimate, and you hear from us when it moves.' },
        { q: 'What if something goes wrong at 9pm?',
          a: `You call ${c.site.phoneDisplay}. We are reachable ${c.site.availability} and a person answers.` },
      ])}
      <figure class="mshot">
        ${img(c, 'mech.webp', ALT['mech.webp'])}
        <figcaption><b>${esc(c.site.regionName)}</b><span>${c.areas.areas.length} cities on the round</span></figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="build">
  <div class="wrap">
    ${head('Fourteen trades', esc(h.servicesHeading),
      'Pick the trade you need. Every one of them is run by the same team, on the same schedule.')}
    ${trades(c)}
  </div>
</section>

<section class="show">
  <div class="wrap">
    <div class="sgrid">
      <div class="scol rv">
        <p class="eyebrow acc">Selected work</p>
        <h2>${esc(c.pages.projects.h1)}</h2>
        <p class="clede">${esc(c.pages.projects.lede)}</p>
        <div class="softs">${c.pages.projects.items.map((p, i) => `
          <article class="soft s${i % 3}">
            <span class="sno">${String(i + 1).padStart(2, '0')}</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.body)}</p>
          </article>`).join('')}</div>
        ${btn(c.url('projects'), 'See the showcase', 'btn ghost')}
      </div>
      <div class="tall rv">
        ${img(c, 'quest/spare.webp', QUEST[2][1])}
        <div class="floatp">
          <p class="fptitle">On the books</p>
          <div><span>Trades</span><b>${c.services.length}</b></div>
          <div><span>Cities</span><b>${c.areas.areas.length}</b></div>
          <div><span>Since</span><b>${c.site.foundingYear}</b></div>
        </div>
      </div>
    </div>
    ${avrail(c, c.url('gallery'), 'Open the gallery')}
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
<section class="build">
  <div class="wrap">
    ${head('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="softs wide rv">${s.scope.map((x, i) => `
      <article class="soft s${i % 3}">
        <span class="sno">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(x.title)}</h3>
        ${x.body ? `<p>${esc(x.body)}</p>` : ''}
      </article>`).join('')}</div>
  </div>
</section>` : '';

  const faq = s.faqs && s.faqs.length ? `
<section class="panel">
  <div class="wrap"><div class="pbox">
    ${head('Questions', `${esc(s.name)} FAQ`, `The things people ask us before booking ${s.name.toLowerCase()} work.`)}
    ${accordion(s.faqs)}
  </div></div>
</section>` : '';

  return `${subhero(c, {
    h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services',
    shot: 'quest/spare.webp',
    shotAlt: `Completed ${s.name.toLowerCase()} work by Quest Construction`,
  })}

<nav class="tabrail" aria-label="All services"><div class="wrap"><div class="trail">${tabs}</div></div></nav>

<section class="proof flat">
  <div class="wrap">${dials(c)}</div>
</section>

<section class="build">
  <div class="wrap">
    ${head('Overview', `${esc(s.name)} by ${esc(c.site.name)}`, '')}
    <div class="story rv">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </div>
</section>

<section class="panel">
  <div class="wrap"><div class="pbox">
    ${head('Why Quest', `Why Choose ${esc(c.site.name)}?`, 'Four things that hold true on every job we run.')}
    ${iconwall(s.whyChoose.map((w, i) => ({
      dark: i === 1, icon: icon(s.slug), body: w,
    })))}
  </div></div>
</section>
${scope}

<section class="build">
  <div class="wrap">
    ${head('How it runs', `Our ${esc(s.name)} Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <ol class="steps rv">${s.process.map((p) => `
      <li style="--d:${(p.n - 1) * 0.07}s">
        <span class="snum">${String(p.n).padStart(2, '0')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
      </li>`).join('')}</ol>
  </div>
</section>
${faq}

<section class="build">
  <div class="wrap">
    ${head('Other trades', 'The Rest of What We Do', '')}
    ${trades(c)}
  </div>
</section>

${closing(c, s.ctaHeading, s.ctaBody)}`;
}

export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));

  return `${subhero(c, {
    h1: fill(t.h1), lede: fill(t.tagline), crumb: a.name, trail: 'Service Areas',
    shot: 'neighborhood.webp',
    shotAlt: `Completed homes on a residential street near ${a.city}, Arizona`,
  })}

<section class="proof flat">
  <div class="wrap">${dials(c)}</div>
</section>

<section class="build">
  <div class="wrap">
    ${head('The area', fill(t.communityHeading), '')}
    <div class="story rv">
      <p>${fill(t.community)}</p>
      <p>${fill(t.local)}</p>
      <p>${fill(t.commitment)}</p>
    </div>
    ${tiles(c)}
  </div>
</section>

<section class="panel">
  <div class="wrap"><div class="pbox">
    ${head('On site', `What We Run in ${esc(a.city)}`, '')}
    ${iconwall(t.capabilities.map((cap, i) => ({
      dark: i === 2, icon: icon(c.services[i % c.services.length].slug),
      title: cap, body: `Available across ${a.name} and the surrounding ${c.site.regionName} valley, ${c.site.availability}.`,
    })))}
  </div></div>
</section>

<section class="build">
  <div class="wrap">
    ${head('Services', fill(t.servicesHeading), '')}
    ${trades(c)}
  </div>
</section>

<section class="build">
  <div class="wrap">
    ${head('Nearby', 'Other Areas We Serve', '')}
    <div class="chiprow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}${ARROW}</a>`).join('')}</div>
  </div>
</section>

${closing(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${subhero(c, {
    h1: a.h1, lede: a.lede, crumb: 'About Us',
    shot: 'quest/story.webp', shotAlt: QUEST[1][1],
  })}

<section class="proof flat">
  <div class="wrap">${dials(c)}</div>
</section>

<section class="build">
  <div class="wrap">
    ${head(esc(a.storyHeading), 'Built on Craftsmanship', '')}
    <div class="story rv">${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${tiles(c)}
  </div>
</section>

<section class="show">
  <div class="wrap">
    <div class="sgrid">
      <div class="scol rv">
        <p class="eyebrow acc">The shape of it</p>
        <h2>One Contractor, Fourteen Trades</h2>
        <p class="clede">Nothing on your job is subcontracted out to a stranger. That is the whole
        difference, and it is why the schedule holds.</p>
        <div class="softs">
          <article class="soft s0"><span class="sno">01</span><h3>Self-managed trades</h3>
            <p>All ${c.services.length} of them, coordinated by the same team from the first walk to the last walkthrough.</p></article>
          <article class="soft s1"><span class="sno">02</span><h3>${esc(c.site.regionName)} coverage</h3>
            <p>${c.areas.areas.length} cities on the regular round, ${esc(c.site.availability)} on the phone.</p></article>
        </div>
        ${btn(c.url('contact'), 'Talk to us', 'btn ghost')}
      </div>
      <div class="tall rv">
        ${img(c, 'quest/hero.webp', QUEST[0][1])}
        <div class="floatp">
          <p class="fptitle">On the books</p>
          <div><span>Founded</span><b>${c.site.foundingYear}</b></div>
          <div><span>Trades</span><b>${c.services.length}</b></div>
          <div><span>Cities</span><b>${c.areas.areas.length}</b></div>
        </div>
      </div>
    </div>
    ${avrail(c, c.url('gallery'), 'Open the gallery')}
  </div>
</section>

<section class="build">
  <div class="wrap">
    ${head('What we do', 'Every Trade We Self-Perform', '')}
    ${trades(c)}
  </div>
</section>

${closing(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  const all = [...QUEST, ...SHOTS.map((f) => [f, ALT[f]])];
  return `${subhero(c, {
    h1: g.h1, lede: g.lede, crumb: 'Gallery',
    shot: 'framing.webp', shotAlt: ALT['framing.webp'],
  })}

<section class="build">
  <div class="wrap">
    ${head('The reel', 'Work We Have Photographed',
      'The first three frames are Quest projects. The rest is stock photography, standing in until Quest supplies its own.')}
    <div class="mosaic">${all.map(([f, alt], i) => `
      <figure class="mtile rv m${i % 6}" style="--d:${(i % 4) * 0.05}s">
        ${img(c, f, alt)}
        <figcaption><span class="pill">${String(i + 1).padStart(2, '0')}</span>${esc(alt)}</figcaption>
      </figure>`).join('')}</div>
    <p class="note">Placeholder photography &mdash; to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Project Showcase',
    shot: 'quest/hero.webp', shotAlt: QUEST[0][1],
  })}

<section class="build">
  <div class="wrap">
    ${head('Index', 'Selected Work', '')}
    <div class="pjs">${p.items.map((it, i) => `
      <article class="pj rv" style="--d:${i * 0.07}s">
        <div class="pshot">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}
          <span class="pill">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="pbody">
          <p class="eyebrow acc">${esc(c.site.regionName)}</p>
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.body)}</p>
          ${btn(c.url('contact'), 'Start something like it', 'btn ghost')}
        </div>
      </article>`).join('')}</div>
    ${avrail(c, c.url('gallery'), 'More photographs')}
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label class="wide"><span>${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="Tell us about the project"></textarea></label>`
    : `<label><span>${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Contact',
    shot: 'quest/contact.webp', shotAlt: 'A Quest Construction project in Arizona',
  })}

<section class="build">
  <div class="wrap">
    <div class="cwrap">
      <form class="contact-form rv" novalidate>
        <p class="eyebrow acc">${esc(p.helpHeading)}</p>
        <h2>${esc(p.formHeading)}</h2>
        <div class="ffields">${p.fields.map(field).join('')}</div>
        <div class="cta">
          <button class="btn" type="submit"><span>Send it</span><i>${ARROW}</i></button>
          <a class="btn ghost" href="${c.site.phoneHref}"><span>${esc(c.site.phoneDisplay)}</span><i>${ARROW}</i></a>
        </div>
        <p class="form-note" role="status" aria-live="polite"></p>
      </form>
      <aside class="cside rv">
        ${iconwall([
          { icon: icon('adu'), title: 'Call the direct line',
            body: `${c.site.phoneDisplay} — reachable ${c.site.availability}, and a person picks up.` },
          { dark: true, icon: icon('concrete'), title: 'Where we work',
            body: `${c.areas.areas.length} cities across ${c.site.regionName}, from the first walk to the final walkthrough.` },
          { icon: icon('painting'), title: 'What to have ready',
            body: 'Rough scope, a budget range and when you would like to start. Photographs help but we will still walk it.' },
        ])}
      </aside>
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const card = (n, title, items) => `<div class="smcard rv">
    <span class="sno">${esc(n)}</span>
    <h3>${esc(title)}</h3>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}<i>${ARROW}</i></a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
    shot: 'site-steel.webp', shotAlt: ALT['site-steel.webp'],
  })}

<section class="build">
  <div class="wrap">
    <div class="smgrid">
      ${card('01', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ])}
      ${card('02', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
      ${card('03', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
