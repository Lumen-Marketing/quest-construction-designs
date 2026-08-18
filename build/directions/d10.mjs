// Direction 10 — Cross Cut. Industrial heavy-equipment B2B: every section
// boundary is a diagonal slash, photography runs full-bleed inside those
// slashes, and machinery breaks out across the cut edges. Graphite and steel,
// one accent, cool high-contrast photography. Glossy and corporate, not 06.
import { img, preloadImage } from '../lib/images.mjs';

export const meta = {
  slug: 'd10-cross-cut',
  name: 'Cross Cut',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Titillium+Web:wght@400;600;700;900&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;
const CHEV = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="m7 4 8 8-8 8"/></svg>`;

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}${ARROW}</a>`;

// Decorative cut-outs: no alt text on purpose, and hidden from the tree. Sized
// from content/images.json so nothing shifts while they load.
const RIG = (c) => `<img class="rig" src="${c.asset('loader.webp')}" alt="" aria-hidden="true" decoding="async" loading="lazy" width="1361" height="1087">`;
const PLANT = (c) => `<img src="${c.asset('excavator.webp')}" alt="" aria-hidden="true" decoding="async" loading="lazy" width="1385" height="871">`;

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

export function nav(c) {
  const col = (items) => items.map(([href, label], i) =>
    `<a href="${href}"><i>${String(i + 1).padStart(2, '0')}</i>${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="in">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
  </a>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="flyout"><div class="fin">
        <p class="tag acc">Fourteen trades</p>
        <div class="fcolsx">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="flyout"><div class="fin">
        <p class="tag acc">Eleven Arizona cities</p>
        <div class="fcolsx">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  ${btn(c.url('contact'), 'Request a quote')}
  <a class="btn navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h4>${esc(title)}</h4>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  return `<footer class="foot">
<span class="hatch" aria-hidden="true"></span>
<div class="wrap">
  <div class="big">
    <h2>Ready when you are.<br>Call and a person picks up.</h2>
    <a class="tel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  </div>
  <div class="fcols">
    <div>
      <a class="brand" href="${c.url('home')}">
        <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
      </a>
      <p>${esc(c.site.footerBlurb)}</p>
      <p class="tag acc ftag">${esc(c.site.positioning)}</p>
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
    <span>&copy; 2026 ${esc(c.site.name)} — building since ${c.site.foundingYear}</span>
    <span><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></span>
  </div>
</div>
</footer>`;
}

export function script(c) {
  return `<script>
(function(){
  var P={orange:['#D07C42','#1C1208','#9A4E1E'],clay:['#A8543A','#ffffff','#7C3A24'],hivis:['#D9A93C','#191307','#8A6712']};
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);s.setProperty('--acc-dim',p[2]);}
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
      if(n) n.textContent='This form is not connected yet \\u2014 please call ${c.site.phoneDisplay} and we will pick up.';});
  });
})();
(function(){
  var els=document.querySelectorAll('.rv,.check');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target)}})},
    {threshold:.08,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e)});
})();
</script>`;
}

// -------------------------------------------------------------- shared parts

const head = (tag, heading, lede) => `<div class="head rv">
  <div>${tag ? `<p class="tag acc">${esc(tag)}</p>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p class="hlede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

/** The notched credential wall — six plates, every figure real. */
const wall = (c, first) => {
  const items = first ? [first] : [];
  items.push(
    [c.site.foundingYear, 'Building since'],
    [String(c.services.length), 'Trades offered'],
    [String(c.areas.areas.length), 'Arizona cities'],
    [c.site.availability, 'Reachable'],
    [c.site.regionName, 'Region served'],
  );
  if (!first) items.push([c.site.phoneDisplay, 'Direct line']);
  return `<div class="wall rv">${items.map(([b, s]) => `
    <div class="plate"><b>${esc(b)}</b><hr><span>${esc(s)}</span></div>`).join('')}</div>`;
};

/** Notched steel plates — 10's why-choose treatment. */
const whys = (items) => `<div class="wall whys rv">${items.map((x, i) => `
  <div class="plate wide" style="--d:${(i % 4) * 0.05}s">
    <b class="no">${String(i + 1).padStart(2, '0')}</b><hr>
    ${x.title ? `<h3>${esc(x.title)}</h3>` : ''}
    <p>${esc(x.body)}</p>
  </div>`).join('')}</div>`;

/** The fourteen trades as a chevron capability list, two columns. */
const trades = (c) => `<ul class="olist tlist rv">${c.services.map((s, i) => `
  <li><a href="${c.url(`services/${s.slug}`)}">${CHEV}
    <div><span class="no">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(s.name)}</h3><p>${esc(s.shortDesc)}</p></div></a></li>`).join('')}</ul>`;

/** The ticking checklist, used as every page's closing band. */
const closing = (c, heading, body) => `
<section class="magnet">
  <span class="hatch dk" aria-hidden="true"></span>
  <div class="wrap in">
    <div class="rv">
      <p class="tag">Next step</p>
      <h2>${esc(heading)}</h2>
      <p class="sub">${esc(body)}</p>
      <div class="cta">
        ${btn(c.url('contact'), 'Request a quote')}
        <a class="btn ghost dark" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}${ARROW}</a>
      </div>
      <p class="fine">Reachable ${esc(c.site.availability)}. ${esc(c.site.positioning)}.</p>
    </div>
    <ul class="check">
      <li><span class="tick"></span>We walk the job before anything is priced</li>
      <li><span class="tick"></span>One written estimate, itemised by trade</li>
      <li><span class="tick"></span>The same team from planning to final walkthrough</li>
      <li><span class="tick"></span>${c.services.length} trades, self-managed — no chasing subs</li>
      <li><span class="tick"></span>${c.areas.areas.length} Arizona cities on the round</li>
      <li class="more">Call ${esc(c.site.phoneDisplay)} — ${esc(c.site.availability)}</li>
    </ul>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail, shot, shotAlt }) => `
<section class="subhero">
  <span class="hatch" aria-hidden="true"></span>
  <div class="shot">${img(c, shot || 'site-steel.webp', shotAlt || ALT['site-steel.webp'])}</div>
  <div class="wrap in">
    <nav class="crumbs tag" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">/</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <h1>${esc(h1)}</h1>
    <p class="lead">${esc(lede)}</p>
    <div class="cta">
      ${btn(c.url('contact'), 'Request a quote')}
      <a class="btn ghost" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}${ARROW}</a>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const [lead, tail] = h.heroTitle.split(/:\s*/);

  return `
<section class="hero">
  <span class="hatch" aria-hidden="true"></span>
  <div class="shot">${img(c, 'quest/hero.webp', 'A Quest Construction home under construction', { eager: true })}</div>
  <span class="glow" aria-hidden="true"></span>
  <div class="in">
    <div class="copy">
      <p class="tag">${esc(c.site.positioning)}</p>
      <h1>${esc(lead)}<em>${esc(tail || c.site.tagline)}</em></h1>
      <p class="lead">${esc(h.heroBody)}</p>
      <div class="cta">
        ${btn(c.url('contact'), 'Request a quote')}
        <a class="btn ghost" href="${c.url('projects')}">See the work${ARROW}</a>
      </div>
    </div>
  </div>
  ${RIG(c)}
  <div class="flash"><b>${esc(c.site.availability)}</b><span>Reachable</span></div>
</section>

<section class="proof">
  <span class="hatch" aria-hidden="true"></span>
  <div class="wrap">${wall(c)}</div>
</section>

<section class="about">
  <div class="band">
    ${img(c, 'quest/story.webp', QUEST[1][1])}
    <div class="stamp">
      <p class="tag">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)}</h2>
    </div>
  </div>
  <div class="wrap">
    <div class="slab rv">
      <div>
        ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
        <p>Fourteen trades under one contractor, coordinated by the same team from
        planning through the final walkthrough — and a telephone that a person answers.</p>
      </div>
      <div class="facts">
        <div><span>Building since</span><b>${c.site.foundingYear}</b></div>
        <div><span>Trades offered</span><b>${c.services.length}</b></div>
        <div><span>Arizona cities</span><b>${c.areas.areas.length}</b></div>
        <div><span>Reachable</span><b>${esc(c.site.availability)}</b></div>
        <div><span>Direct line</span><b>${esc(c.site.phoneDisplay)}</b></div>
      </div>
    </div>
  </div>
</section>

<section class="offers">
  <span class="hatch" aria-hidden="true"></span>
  <div class="wrap in">
    <div class="rv">
      <p class="tag acc">Standing offers</p>
      <h2>Exclusive Offers Just For You</h2>
      <ul class="olist">
        ${c.site.offers.map((o, i) => `
        <li>${CHEV}<div>
          <span class="no">${String(i + 1).padStart(2, '0')} — ${esc(o.amount)}</span>
          <h3>${esc(o.title)}</h3>
          <p>${esc(o.body)}</p>
          <button class="btn ghost" type="button" data-copy="${esc(o.code)}">Get code ${esc(o.code)}</button>
        </div></li>`).join('')}
        <li class="chips">${c.areas.areas.map((a) =>
          `<span>${esc(a.city)}</span>`).join('')}</li>
      </ul>
    </div>
    <div class="plant rv">
      <span class="halo" aria-hidden="true"></span>
      ${PLANT(c)}
      <p class="cap">Plant on site — ${esc(c.site.regionName)}</p>
    </div>
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('What we build', esc(h.servicesHeading),
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${trades(c)}
  </div>
</section>

<section class="work">
  <div class="wrap">
    <div class="head rv">
      <div><p class="tag acc">Selected work</p><h2>${esc(c.pages.projects.h1)}</h2></div>
      ${btn(c.url('projects'), 'See the showcase', 'btn ghost')}
    </div>
  </div>
  <div class="wrap filmwrap">
    <div class="film">${c.pages.projects.items.map((p, i) => `
      <div class="pane">${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}
        <div class="lab"><p class="tag">${String(i + 1).padStart(2, '0')}</p>
          <h3>${esc(p.title)}</h3><p class="meta">${esc(p.body)}</p></div>
        <a href="${c.url('projects')}" aria-label="${esc(p.title)}"></a></div>`).join('')}
      <div class="pane">${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}
        <div class="lab"><p class="tag">04</p>
          <h3>The gallery</h3><p class="meta">Every photograph we have from the yard and the finished work.</p></div>
        <a href="${c.url('gallery')}" aria-label="Gallery"></a></div>
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
<section class="work">
  <div class="wrap">
    ${head('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="specs rv">${s.scope.map((x, i) => `
      <div class="spec"><span class="no">${String(i + 1).padStart(2, '0')}</span>
        <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div></div>`).join('')}</div>
  </div>
</section>` : '';

  // Expanding cut panes — 10's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="work">
  <div class="wrap">
    ${head('Questions', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="cutpanes rv">${s.faqs.map((f, i) => `
      <details${i === 0 ? ' open' : ''}>
        <summary><span class="no">${String(i + 1).padStart(2, '0')}</span>${esc(f.q)}<span class="pm" aria-hidden="true"></span></summary>
        <p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${subhero(c, {
    h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services',
    shot: 'quest/spare.webp', shotAlt: `Completed ${s.name.toLowerCase()} work by Quest Construction`,
  })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="proof flat">
  <span class="hatch" aria-hidden="true"></span>
  <div class="wrap">${wall(c, [s.name, 'This trade'])}</div>
</section>

<section class="work">
  <div class="wrap">
    ${head('Overview', `${esc(s.name)} by ${esc(c.site.name)}`, '')}
    <div class="slab rv">
      <div>${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="facts">
        <div><span>Trade</span><b>${esc(s.name)}</b></div>
        <div><span>Building since</span><b>${c.site.foundingYear}</b></div>
        <div><span>Areas served</span><b>${c.areas.areas.length}</b></div>
        <div><span>Reachable</span><b>${esc(c.site.availability)}</b></div>
      </div>
    </div>
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('Why Quest', `Why Choose ${esc(c.site.name)}?`,
      'Four things that hold true on every job we run.')}
    ${whys(s.whyChoose.map((w) => ({ body: w })))}
  </div>
</section>
${scope}

<section class="work">
  <div class="wrap">
    ${head('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="slashsteps rv">${s.process.map((p) => `
      <div class="sstep" style="--d:${(p.n - 1) * 0.05}s">
        <span class="mark">${CHEV}<b>${String(p.n).padStart(2, '0')}</b></span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
        <span class="tag stg">Stage ${p.n} of ${s.process.length}</span>
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
    shot: 'neighborhood.webp',
    shotAlt: `Completed homes on a residential street near ${a.city}, Arizona`,
  })}

<section class="proof flat">
  <span class="hatch" aria-hidden="true"></span>
  <div class="wrap">${wall(c, [a.name, 'This area'])}</div>
</section>

<section class="work">
  <div class="wrap">
    ${head('The area', fill(t.communityHeading), '')}
    <div class="slab rv">
      <div>
        <p>${fill(t.community)}</p>
        <p>${fill(t.local)}</p>
        <p>${fill(t.commitment)}</p>
      </div>
      <div class="facts">
        <div><span>City</span><b>${esc(a.city)}</b></div>
        <div><span>Region</span><b>${esc(c.site.regionName)}</b></div>
        <div><span>Trades available</span><b>${c.services.length}</b></div>
        <div><span>Reachable</span><b>${esc(c.site.availability)}</b></div>
        <div><span>Direct line</span><b>${esc(c.site.phoneDisplay)}</b></div>
      </div>
    </div>
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('On site', `What We Run in ${esc(a.city)}`, '')}
    ${whys(t.capabilities.map((cap) => ({ body: cap })))}
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('Services', fill(t.servicesHeading), '')}
    ${trades(c)}
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('Nearby', 'Other Areas We Serve', '')}
    <div class="arearow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
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
  <span class="hatch" aria-hidden="true"></span>
  <div class="wrap">${wall(c)}</div>
</section>

<section class="about">
  <div class="band">
    ${img(c, 'quest/hero.webp', QUEST[0][1])}
    <div class="stamp">
      <p class="tag">${esc(a.storyHeading)}</p>
      <h2>Built on Craftsmanship</h2>
    </div>
  </div>
  <div class="wrap">
    <div class="slab rv">
      <div>${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="facts">
        <div><span>Building since</span><b>${c.site.foundingYear}</b></div>
        <div><span>Trades offered</span><b>${c.services.length}</b></div>
        <div><span>Arizona cities</span><b>${c.areas.areas.length}</b></div>
        <div><span>Reachable</span><b>${esc(c.site.availability)}</b></div>
      </div>
    </div>
  </div>
</section>

<section class="work">
  <div class="wrap">
    ${head('What we do', 'Fourteen Trades, One Contractor',
      'Every trade below is coordinated by the same team, on the same schedule.')}
    ${trades(c)}
  </div>
</section>

${closing(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  // The filmstrip only holds so many panes before each is a sliver, so the
  // gallery runs several strips of four rather than one strip of seventeen.
  const all = [...QUEST, ...SHOTS.map((f) => [f, ALT[f]])];
  const strips = [];
  for (let i = 0; i < all.length; i += 4) strips.push(all.slice(i, i + 4));

  return `${subhero(c, {
    h1: g.h1, lede: g.lede, crumb: 'Gallery',
    shot: 'framing.webp', shotAlt: ALT['framing.webp'],
  })}

<section class="work">
  <div class="wrap">
    ${head('The reel', 'Work We Have Photographed',
      'The first three frames are Quest projects. The rest is stock photography, standing in until Quest supplies its own.')}
  </div>
  ${strips.map((strip, si) => `
  <div class="wrap filmwrap">
    <div class="film rv">${strip.map(([f, alt], i) => `
      <figure class="pane">${img(c, f, alt)}
        <figcaption class="lab"><p class="tag">${String(si * 4 + i + 1).padStart(2, '0')}</p>
          <h3>${esc(alt)}</h3></figcaption></figure>`).join('')}</div>
  </div>`).join('')}
  <div class="wrap"><p class="tag note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p></div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Project Showcase',
    shot: 'quest/hero.webp', shotAlt: QUEST[0][1],
  })}

<section class="work">
  <div class="wrap">
    ${head('Index', 'Selected Work', '')}
  </div>
  ${p.items.map((it, i) => `
  <div class="pband rv" style="--d:${i * 0.05}s">
    ${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}
    <div class="wrap pbin">
      <p class="tag acc">${String(i + 1).padStart(2, '0')} — ${esc(c.site.regionName)}</p>
      <h3>${esc(it.title)}</h3>
      <p>${esc(it.body)}</p>
      ${btn(c.url('contact'), 'Start something like it', 'btn ghost')}
    </div>
  </div>`).join('')}
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label class="wide"><span class="tag">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="tag">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Contact',
    shot: 'quest/contact.webp', shotAlt: 'A Quest Construction project in Arizona',
  })}

<section class="work">
  <div class="wrap">
    <div class="slab formslab">
      <form class="contact-form rv" novalidate>
        <p class="tag acc">${esc(p.helpHeading)}</p>
        <h2>${esc(p.formHeading)}</h2>
        <div class="ffields">${p.fields.map(field).join('')}</div>
        <div class="cta">
          <button class="btn" type="submit">Send it${ARROW}</button>
          <a class="btn ghost" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}${ARROW}</a>
        </div>
        <p class="form-note tag" role="status" aria-live="polite"></p>
      </form>
      <div class="facts rv">
        <div><span>Reachable</span><b>${esc(c.site.availability)}</b></div>
        <div><span>Direct line</span><b>${esc(c.site.phoneDisplay)}</b></div>
        <div><span>Building since</span><b>${c.site.foundingYear}</b></div>
        <div><span>Trades offered</span><b>${c.services.length}</b></div>
        <div><span>Arizona cities</span><b>${c.areas.areas.length}</b></div>
        <div><span>Region</span><b>${esc(c.site.regionName)}</b></div>
      </div>
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const plate = (n, title, items) => `<div class="plate col rv">
    <b class="no">${esc(n)}</b><hr>
    <h3>${esc(title)}</h3>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}${ARROW}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
    shot: 'site-steel.webp', shotAlt: ALT['site-steel.webp'],
  })}

<section class="work">
  <div class="wrap">
    <div class="platecols">
      ${plate('01', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ])}
      ${plate('02', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
      ${plate('03', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
