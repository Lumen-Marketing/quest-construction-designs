// Direction 05 — Ground Break. Deep excavated-earth green ground with cream
// plates dropped onto it, one oversized accent headline per page, and organic
// blob silhouettes cut with a notched corner so the softness stays structural.
// Cards are chunky and hard-bordered; the process runs as concentric arcs.
import { img, preloadImage } from '../lib/images.mjs';
import { icon } from '../lib/icons.mjs';

export const meta = {
  slug: 'd05-ground-break',
  name: 'Ground Break',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@75..125,400..900&family=Chivo:wght@400;500;700;900&family=Martian+Mono:wght@400;600;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;
const TICK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12.5 9.5 18 20 6.5"/></svg>`;

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

// The yard band: five organic tiles, each captioned with a real trade.
const PLANT = [
  ['earthworks.webp', 'Earthworks', 'Grading and site prep'],
  ['rebar.webp', 'Concrete', 'Slabs and foundations'],
  ['framing.webp', 'Framing', 'Structure and roof'],
  ['trade-weld.webp', 'Steel', 'Structural welding'],
  ['trade-electric.webp', 'Rough-in', 'Before the walls close'],
];

export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap in">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
  </a>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="mega"><div class="wrap">
        <p class="mono">Fourteen trades, self-managed</p>
        <div class="megacols">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="mega"><div class="wrap">
        <p class="mono">Eleven Arizona cities</p>
        <div class="megacols">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a href="${c.url('projects')}">Work</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <div class="nright">
    <span class="pill"><i></i> ${esc(c.site.availability)}</span>
    ${btn(c.site.phoneHref, c.site.phoneDisplay)}
    <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
  </div>
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
  <div class="cols">
    <div>
      <a class="brand" href="${c.url('home')}">
        <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
      </a>
      <p class="lead">${esc(c.site.footerBlurb)}</p>
      <p class="mono flift">${esc(c.site.positioning)}</p>
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
  var P={
    orange:['#D07C42','#1C1208','#9A4E1E','#EFA372'],
    clay:  ['#A8543A','#ffffff','#7C3A24','#D98A6A'],
    hivis: ['#D9A93C','#191307','#8A6712','#EFC96B']
  };
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);
    s.setProperty('--acc-dim',p[2]);s.setProperty('--acc-lift',p[3]);}
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

const top = (eyebrow, heading, lede) => `<div class="top rv">
  <div>${eyebrow ? `<p class="mono">${esc(eyebrow)}</p>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p class="tlede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

/** Facts bar — real numbers only, drawn from the content files. */
const facts = (c, extra) => `<div class="facts rv">
  <div class="col"><h4>Building since</h4><b>${c.site.foundingYear}</b><p>family-owned in Arizona</p></div>
  <div class="col"><h4>Trades offered</h4><b>${c.services.length}</b><p>self-managed end to end</p></div>
  <div class="col"><h4>Arizona cities</h4><b>${c.areas.areas.length}</b><p>${esc(extra || 'served across the valley')}</p></div>
  <div class="col"><h4>Reach us</h4><b>${esc(c.site.availability)}</b><p>${esc(c.site.phoneDisplay)}</p></div>
</div>`;

/** Chunky green cards — 05's why-choose and services treatment. */
const chunks = (items) => `<div class="chunks">${items.map((x, i) => `
  <div class="chunk rv" style="--d:${(i % 4) * 0.05}s">
    <span class="badge">${String(i + 1).padStart(2, '0')}</span>
    ${x.title ? `<h3>${esc(x.title)}</h3>` : ''}
    <p>${esc(x.body)}</p>
  </div>`).join('')}</div>`;

/** The fourteen trades as chunky linked cards. */
const trades = (c) => `<div class="chunks trades">${c.services.map((s, i) => `
  <a class="chunk rv" href="${c.url(`services/${s.slug}`)}" style="--d:${(i % 4) * 0.04}s">
    <span class="ic">${icon(s.slug)}</span>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.shortDesc)}</p>
    <span class="go">View trade ${ARROW}</span>
  </a>`).join('')}</div>`;

/** The closing lead magnet — a cream plate on the green with the drawn guide. */
const closing = (c, heading, body) => `
<section class="magnet">
  <div class="wrap">
    <div class="box rv">
      <div class="txt">
        <p class="mono">Next step</p>
        <h2>${esc(heading)}</h2>
        <p>${esc(body)}</p>
        <div class="acts">
          ${btn(c.url('contact'), 'Start a project')}
          ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn dark')}
        </div>
        <p class="fine">${esc(c.site.availability)} — ${esc(c.site.positioning)}.</p>
      </div>
      <div class="vis">
        <span class="plane" aria-hidden="true"></span>
        <div class="guide" aria-hidden="true">
          <p class="g-lbl">Quest Construction</p>
          <h4>From concept to creation</h4>
          <span class="bl"></span>
          <div class="lines"><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail }) => {
  const parts = String(h1).split(/:\s*/);
  const head = parts.length > 1
    ? `<span>${esc(parts[0])}</span><span>${esc(parts.slice(1).join(': '))}</span>`
    : `<span>${esc(h1)}</span>`;
  return `
<section class="subhero">
  <div class="wrap">
    <nav class="crumbs mono" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">/</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <h1 class="rv is-in">${head}</h1>
    <p class="kick rv is-in" style="--d:.08s">${esc(lede)}</p>
    <div class="cta rv is-in" style="--d:.14s">
      <a class="btn" href="${c.url('contact')}">Start a project ${ARROW}</a>
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
    </div>
  </div>
</section>`;
};

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const [lead, tail] = h.heroTitle.split(/:\s*/);

  return `
<section class="hero">
  <div class="shot">${img(c, 'quest/hero.webp', 'A Quest Construction home under construction', { eager: true })}</div>
  <div class="wrap">
    <p class="eyebrow rv is-in">${esc(c.site.positioning)}</p>
    <h1 class="rv is-in" style="--d:.04s"><span>${esc(lead)}</span><span>${esc(tail || c.site.tagline)}</span></h1>
    <p class="kick rv is-in" style="--d:.1s">${esc(h.heroBody)}</p>
    <div class="cta rv is-in" style="--d:.16s">
      <a class="btn" href="${c.url('contact')}">Start a project ${ARROW}</a>
      <a class="btn line" href="${c.url('projects')}">See the work</a>
    </div>
    ${facts(c)}
  </div>
</section>

<section class="proof">
  <div class="wrap in">
    <p class="mono pk">Serving Arizona</p>
    <div class="creds">${c.areas.areas.map((a) =>
      `<a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.city)}</a>`).join('')}</div>
  </div>
  <div class="wrap">
    <div class="plant rv">${PLANT.map(([f, k, sub]) => `
      <figure><span class="fr">${img(c, f, ALT[f])}</span>
        <figcaption><b>${esc(k)}</b>${esc(sub)}</figcaption></figure>`).join('')}</div>
  </div>
</section>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="halo" aria-hidden="true"></span>
      <div class="reel">${QUEST.map(([f, alt]) => img(c, f, alt)).join('')}
        <span class="tag">${esc(h.storyEyebrow)}</span>
      </div>
    </div>
    <div class="rv">
      <p class="mono acdim">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)}</h2>
      ${h.story.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      <ul class="rows">
        <li><span class="k">01</span><div><h3>Family-owned since ${c.site.foundingYear}</h3>
          <p>${esc(c.site.positioning)}.</p></div></li>
        <li><span class="k">02</span><div><h3>${c.services.length} trades under one contractor</h3>
          <p>Planning through final walkthrough, coordinated by the same team.</p></div></li>
        <li><span class="k">03</span><div><h3>Reachable ${esc(c.site.availability)}</h3>
          <p>Call ${esc(c.site.phoneDisplay)} and a person picks up.</p></div></li>
      </ul>
      ${btn(c.url('about'), 'Read our story', 'btn dark')}
    </div>
  </div>
</section>

<section class="offers">
  <div class="wrap">
    ${top('Exclusive offers', 'Exclusive Offers Just For You',
      'Two standing offers, applied at estimate. Ask for the code when you call.')}
    <div class="grid3">
      ${c.site.offers.map((o, i) => `
      <div class="ocard rv${i === 0 ? ' pop' : ''}">
        <span class="badge">${esc(o.amount)}</span>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.body)}</p>
        <button class="btn dark" type="button" data-copy="${esc(o.code)}">Get code ${esc(o.code)}</button>
      </div>`).join('')}
      <div class="ocard shot rv">
        ${img(c, 'quest/story.webp', 'Framing and structural work on a Quest Construction project')}
        <div class="cap"><h3>On the ground</h3>
          <p>Work in progress on an Arizona build.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="content" id="services">
  <div class="wrap">
    ${top('What we build', esc(h.servicesHeading),
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${trades(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('Selected work', esc(c.pages.projects.h1), c.pages.projects.lede)}
    <div class="work">${c.pages.projects.items.map((p, i) => `
      <a class="wcard rv" href="${c.url('projects')}">
        <span class="ph"><span class="tag">${String(i + 1).padStart(2, '0')}</span>
          ${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}</span>
        <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></a>`).join('')}
      <a class="wcard rv" href="${c.url('gallery')}">
        <span class="ph"><span class="tag">04</span>${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}</span>
        <h3>The gallery</h3><p>Every photograph we have from the yard and the finished work.</p></a>
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
<section class="content">
  <div class="wrap">
    ${top('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="slist rv">${s.scope.map((x, i) => `
      <div class="srow"><span class="k">${String(i + 1).padStart(2, '0')}</span>
        <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div>
        <span class="tk">${TICK}</span></div>`).join('')}</div>
  </div>
</section>` : '';

  // Colour-field panels — 05's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="faqs">
  <div class="wrap">
    ${top('Questions', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="fields">${s.faqs.map((f, i) => `
      <details class="field f${(i % 3) + 1} rv"><summary>${esc(f.q)}<span class="sw" aria-hidden="true"></span></summary>
        <p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${subhero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="about">
  <div class="wrap in flip">
    <div class="rv">
      <p class="mono acdim">Overview</p>
      <h2>${esc(s.name)} by ${esc(c.site.name)}</h2>
      ${s.intro.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${btn(c.url('contact'), 'Get an estimate', 'btn dark')}
    </div>
    <div class="pic rv">
      <span class="halo" aria-hidden="true"></span>
      <div class="reel">${img(c, 'quest/spare.webp', `Completed ${s.name.toLowerCase()} work by Quest Construction`)}
        <span class="tag">${esc(s.name)}</span>
      </div>
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('Why Quest', `Why Choose ${esc(c.site.name)}?`,
      'Four things that hold true on every job we run.')}
    ${chunks(s.whyChoose.map((w) => ({ body: w })))}
  </div>
</section>
${scope}

<section class="steps">
  <div class="wrap">
    ${top('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="arcs">${s.process.map((p) => `
      <div class="arc rv" style="--d:${(p.n - 1) * 0.06}s">
        <span class="ring"><i></i><b>${p.n}</b></span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
        <span class="mono stg">Stage ${p.n} of ${s.process.length}</span>
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

<section class="factband">
  <div class="wrap">${facts(c, `including ${esc(a.city)}`)}</div>
</section>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="halo" aria-hidden="true"></span>
      <div class="reel">${img(c, 'neighborhood.webp', `Completed homes on a residential street near ${a.city}, Arizona`)}
        <span class="tag">${esc(a.name)}</span>
      </div>
    </div>
    <div class="rv">
      <p class="mono acdim">The area</p>
      <h2>${fill(t.communityHeading)}</h2>
      <p class="lede">${fill(t.community)}</p>
      <p class="lede">${fill(t.local)}</p>
      <p class="lede">${fill(t.commitment)}</p>
      ${btn(c.url('contact'), `Talk to us about ${a.city}`, 'btn dark')}
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('On site', `What We Run in ${esc(a.city)}`, '')}
    ${chunks(t.capabilities.map((cap) => ({ body: cap })))}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('Services', fill(t.servicesHeading), '')}
    ${trades(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('Nearby', 'Other Areas We Serve', '')}
    <div class="arearow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)} ${ARROW}</a>`).join('')}</div>
  </div>
</section>

${closing(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${subhero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

<section class="factband">
  <div class="wrap">${facts(c)}</div>
</section>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      <span class="halo" aria-hidden="true"></span>
      <div class="reel">${QUEST.map(([f, alt]) => img(c, f, alt)).join('')}
        <span class="tag">Since ${c.site.foundingYear}</span>
      </div>
    </div>
    <div class="rv">
      <p class="mono acdim">${esc(a.storyHeading)}</p>
      <h2>Built on Craftsmanship, Integrity and Trust</h2>
      ${a.story.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${btn(c.url('projects'), 'See our work', 'btn dark')}
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('What we do', 'Fourteen Trades, One Contractor',
      'Every trade below is coordinated by the same team, on the same schedule.')}
    ${trades(c)}
  </div>
</section>

${closing(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  const tile = (f, alt, i) => `<figure class="mt rv" style="--d:${(i % 5) * 0.04}s">
    <span class="fr">${img(c, f, alt)}</span>
    <figcaption class="mono">${String(i + 1).padStart(2, '0')} — ${esc(alt)}</figcaption>
  </figure>`;

  return `${subhero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap">
    ${top('From Quest projects', 'Work We Have Photographed', '')}
  </div>
  <div class="mason">${QUEST.map(([f, alt], i) => tile(f, alt, i)).join('')}</div>
</section>

<section class="content">
  <div class="wrap">
    ${top('The trades we run', 'Placeholder Photography',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
  </div>
  <div class="mason">${SHOTS.map((f, i) => tile(f, ALT[f], i)).join('')}</div>
  <div class="wrap"><p class="mono note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p></div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="content">
  <div class="wrap">
    ${top('Index', 'Selected Work', '')}
    <div class="pcards">${p.items.map((it, i) => `
      <article class="pcard rv" style="--d:${i * 0.05}s">
        <span class="ph">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}
          <span class="tag mono">${String(i + 1).padStart(2, '0')}</span></span>
        <div class="pbody">
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.body)}</p>
          <a class="go" href="${c.url('contact')}">Start something like it ${ARROW}</a>
        </div>
      </article>`).join('')}
      <article class="pcard talk rv" style="--d:.15s">
        <div class="pbody">
          <p class="mono">${esc(c.site.availability)}</p>
          <h3>Your project next</h3>
          <p>Tell us what you are planning and we will walk the scope with you before anything is priced.</p>
          <a class="go" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)} ${ARROW}</a>
        </div>
      </article>
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label><span class="mono">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="mono">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="field-green">
  <span class="plane blob-c" aria-hidden="true"></span>
  <div class="wrap ko">
    <form class="contact-form rv" novalidate>
      <p class="mono">Send a message</p>
      <h2>${esc(p.formHeading)}</h2>
      ${p.fields.map(field).join('')}
      <button class="btn" type="submit">Submit ${ARROW}</button>
      <p class="form-note mono" role="status" aria-live="polite"></p>
    </form>
    <div class="direct rv">
      <p class="mono">${esc(p.helpHeading)}</p>
      <a class="bigphone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <ul class="rows">
        <li><span class="k">01</span><div><h3>Availability</h3><p>${esc(c.site.availability)}</p></div></li>
        <li><span class="k">02</span><div><h3>Building since</h3><p>${c.site.foundingYear}</p></div></li>
        <li><span class="k">03</span><div><h3>Trades offered</h3><p>${c.services.length}</p></div></li>
        <li><span class="k">04</span><div><h3>Areas served</h3><p>${c.areas.areas.length} Arizona cities</p></div></li>
      </ul>
      <figure class="shot">${img(c, 'quest/contact.webp', 'A Quest Construction project in Arizona')}</figure>
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const plate = (n, title, items) => `<div class="plate rv">
    <p class="mono">${esc(n)}</p>
    <h2>${esc(title)}</h2>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)} ${ARROW}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    <div class="plates">
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
