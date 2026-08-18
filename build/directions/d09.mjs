// Direction 09 — Site Notice. Punk / xerox cut-and-paste: everything on the
// page is something physically stuck to a hoarding — flyers stapled at angles,
// torn paper, strips of tape, typewriter captions, and photographs blown out
// on a bad photocopier. Loud, but the body copy always lands on clean paper.
import { img, preloadImage } from '../lib/images.mjs';

export const meta = {
  slug: 'd09-site-notice',
  name: 'Site Notice',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Courier+Prime:wght@400;700&family=Special+Elite&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;
const STAPLES = `<span class="staple s1"></span><span class="staple s2"></span>`;

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
      <div class="pinned"><div class="wrap"><div class="sheetdrop">
        ${STAPLES}
        <p class="mono">Fourteen trades &mdash; all self-managed</p>
        <div class="pcols">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="pinned"><div class="wrap"><div class="sheetdrop">
        ${STAPLES}
        <p class="mono">Eleven Arizona cities</p>
        <div class="pcols">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div></div>
    </div>
    <a href="${c.url('projects')}">Work</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h5 class="mono">${esc(title)}</h5>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  return `<footer>
<div class="wrap">
  <p class="big">Get it <em>built</em>.</p>
  <div class="cols">
    <div>
      <a class="brand" href="${c.url('home')}">
        <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
      </a>
      <p class="lead">${esc(c.site.footerBlurb)}</p>
      <p class="mono facc">${esc(c.site.positioning)}</p>
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn acc')}
    </div>
    ${col('Company', [
      [c.url('about'), 'About Us'], [c.url('projects'), 'Project Showcase'],
      [c.url('gallery'), 'Gallery'], [c.url('contact'), 'Contact'],
      [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
  <div class="bar mono">
    <span>&copy; 2026 ${esc(c.site.name)} &mdash; since ${c.site.foundingYear}</span>
    <span><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></span>
  </div>
</div>
</footer>`;
}

export function script(c) {
  return `<script>
(function(){
  var P={orange:['#D07C42','#1C1208','#8B471B'],clay:['#A8543A','#ffffff','#7C3A24'],hivis:['#D9A93C','#191307','#8A6712']};
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

const head = (kick, heading, lede) => `<div class="head rv">
  <div>${kick ? `<span class="cut acc kick">${esc(kick)}</span>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p>${esc(lede)}</p>` : '<div></div>'}
</div>`;

/** The torn strip of facts — every value real, `xx` between them. */
const strip = (c, extra) => {
  const bits = [
    `Since <b>${c.site.foundingYear}</b>`,
    `<b>${c.services.length}</b> trades`,
    `<b>${c.areas.areas.length}</b> Arizona cities`,
    `<b>${esc(c.site.availability)}</b>`,
    `<b>${esc(c.site.phoneDisplay)}</b>`,
  ];
  if (extra) bits.unshift(`<b>${esc(extra)}</b>`);
  return `<div class="strip-clip"><div class="strip"><div class="wrap in">
    ${bits.map((b, i) => `${i ? '<span class="x">&times;&times;</span>' : ''}<span>${b}</span>`).join('')}
  </div></div></div>`;
};

/** A torn strip, `xx` separated — 09's why-choose treatment. */
const torn = (items) => `<div class="tornlist rv">${items.map((x, i) => `
  ${i ? '<span class="xx" aria-hidden="true">&times;&times;</span>' : ''}
  <span class="ti"><b>${String(i + 1).padStart(2, '0')}</b>${esc(x.body)}</span>`).join('')}</div>`;

/** The fourteen trades as a taped-up directory on clean paper. */
const directory = (c) => `<div class="directory rv">
  ${STAPLES}
  <p class="mono dhead">Directory of trades &mdash; ${c.site.name} &mdash; ${c.site.regionName}</p>
  <div class="drows">${c.services.map((s, i) => `
    <a href="${c.url(`services/${s.slug}`)}">
      <span class="n">${String(i + 1).padStart(2, '0')}</span>
      <span class="nm">${esc(s.name)}</span>
      <span class="ds">${esc(s.shortDesc)}</span>
      <span class="go">&rarr;</span>
    </a>`).join('')}</div>
</div>`;

/** The NOTICE poster, used as every page's closing band. */
const closing = (c, heading, body) => `
<section class="magnet">
  <div class="wrap">
    <div class="notice rv">
      <span class="tape t1"></span><span class="tape t2"></span>
      <p class="band">Site Notice</p>
      <div class="in">
        <div>
          <h2>${esc(heading)}</h2>
          <p>${esc(body)}</p>
          <div class="acts">
            ${btn(c.url('contact'), 'Send a message', 'btn acc')}
            ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
          </div>
          <p class="fine">${esc(c.site.availability)} &mdash; ${esc(c.site.positioning)}.</p>
        </div>
        <div class="cols">
          <div><b>${esc(c.site.availability)}</b><span>Call ${esc(c.site.phoneDisplay)} and a person picks up.</span></div>
          <div><b>${c.site.foundingYear}</b><span>Building across ${esc(c.site.regionName)} since then.</span></div>
          <div><b>${c.services.length}</b><span>Trades, all run by the same contractor.</span></div>
        </div>
      </div>
      <div class="tabs" aria-hidden="true">${Array.from({ length: 8 }, (_, i) =>
        `<span style="--r:${(i % 3) - 1}deg">${esc(c.site.phoneDisplay)}</span>`).join('')}</div>
    </div>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <div class="wrap">
    <div class="posted rv is-in">
      <span class="tape t1"></span><span class="tape t2"></span>
      <nav class="crumbs mono" aria-label="Breadcrumb">
        <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&times;&times;</span>
        ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&times;&times;</span>` : ''}
        <b>${esc(crumb)}</b>
      </nav>
      <h1>${esc(h1)}</h1>
      <p>${esc(lede)}</p>
      <div class="acts">
        ${btn(c.url('contact'), 'Get a quote', 'btn acc')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
      </div>
      <span class="stamp">${esc(c.site.availability)}</span>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const words = h.heroTitle.replace(/^Quest Construction:\s*/, '').split(' ');

  return `
<section class="hero">
  <div class="wrap">
    <div class="poster">
      <div class="in">
        <div class="say">
          <span class="cut acc kick">${esc(c.site.positioning)}</span>
          <h1>
            <span>${esc(words.slice(0, 2).join(' '))}</span>
            <span class="l2"><span class="cut">${esc(words[2] || '')}</span></span>
            <span class="l3">${esc(words.slice(3).join(' '))}</span>
          </h1>
          <p>${esc(h.heroBody)}</p>
          <div class="acts">
            ${btn(c.url('contact'), 'Get a quote', 'btn acc')}
            ${btn(c.url('projects'), 'See the work', 'btn line')}
          </div>
        </div>
        <div class="shot">
          <span class="tape t1"></span><span class="tape t2"></span>
          <span class="xr">${img(c, 'quest/hero.webp', 'A Quest Construction home under construction', { eager: true })}</span>
          <span class="stamp">Est. ${c.site.foundingYear}</span>
        </div>
      </div>
    </div>
  </div>
</section>

${strip(c)}

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      ${STAPLES}
      <span class="xr">${img(c, 'quest/story.webp', QUEST[1][1])}</span>
      <span class="note"><b>${c.site.foundingYear}</b><span>Family-owned, ${esc(c.site.regionName)}</span></span>
    </div>
    <div class="sheet rv">
      <span class="cut out kick">${esc(h.storyEyebrow)}</span>
      <h2>${esc(h.storyHeading)}</h2>
      <p class="lede">${esc(h.story[0])}</p>
      <ul>
        <li><span class="n">01</span><div><h3>Family-owned since ${c.site.foundingYear}</h3>
          <p>${esc(c.site.positioning)}.</p></div></li>
        <li><span class="n">02</span><div><h3>${c.services.length} trades, one contractor</h3>
          <p>Planning through final walkthrough, coordinated by the same team.</p></div></li>
        <li><span class="n">03</span><div><h3>Reachable ${esc(c.site.availability)}</h3>
          <p>Call ${esc(c.site.phoneDisplay)} and a person picks up.</p></div></li>
      </ul>
      ${btn(c.url('about'), 'Read our story')}
    </div>
  </div>
</section>

<section class="offers">
  <div class="wrap">
    <div class="head rv">
      <div><span class="cut acc kick">Standing offers</span><h2>Exclusive Offers Just For You</h2></div>
      <p>Two standing offers, applied at estimate. Ask for the code when you call.</p>
    </div>
    <div class="flyers">
      ${c.site.offers.map((o, i) => `
      <div class="flyer${i === 1 ? ' pop' : ''} rv">
        ${STAPLES}
        <span class="xr">${img(c, i === 0 ? 'kitchen.webp' : 'bath.webp',
          i === 0 ? ALT['kitchen.webp'] : ALT['bath.webp'])}</span>
        <span class="n">${esc(o.amount)}</span>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.body)}</p>
        <dl><div><dt>Code</dt><dd>${esc(o.code)}</dd></div>
          <div><dt>Applies</dt><dd>At estimate</dd></div></dl>
        <div class="tear"><span class="ph">${esc(c.site.phoneDisplay)}</span>
          <button class="btn" type="button" data-copy="${esc(o.code)}">Get code</button></div>
      </div>`).join('')}
      <div class="flyer rv">
        ${STAPLES}
        <span class="xr">${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}</span>
        <span class="n">${c.areas.areas.length}</span>
        <h3>Where We Work</h3>
        <p>From Phoenix out to Florence, the same crews and the same schedule discipline on every job.</p>
        <dl><div><dt>Cities</dt><dd>${c.areas.areas.length}</dd></div>
          <div><dt>Region</dt><dd>${esc(c.site.regionName)}</dd></div></dl>
        <div class="tear"><span class="ph">${esc(c.site.availability)}</span>
          ${btn(c.url('sitemap'), 'See areas')}</div>
      </div>
    </div>
  </div>
</section>

<section class="content" id="services">
  <div class="wrap">
    ${head('What we build', esc(h.servicesHeading),
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${directory(c)}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Selected work', esc(c.pages.projects.h1), c.pages.projects.lede)}
    <div class="sheet-grid rv"><div class="g">${c.pages.projects.items.map((p, i) => `
      <a class="frame" href="${c.url('projects')}">
        <span class="no">${String(i + 1).padStart(2, '0')}</span>
        <span class="xr">${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}</span>
        <span class="cap">${esc(p.title)}<i>${esc(c.site.regionName)}</i></span>
      </a>`).join('')}
      <a class="frame" href="${c.url('gallery')}">
        <span class="no">04</span>
        <span class="xr">${img(c, 'neighborhood.webp', ALT['neighborhood.webp'])}</span>
        <span class="cap">The gallery<i>Every photograph</i></span>
      </a>
    </div></div>
    <div class="after">
      <p class="mono">Contact sheet &mdash; ${esc(c.site.name)}</p>
      ${btn(c.url('projects'), 'See the showcase', 'btn line')}
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
    ${head('Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <div class="sheetpaper rv">
      ${STAPLES}
      <div class="srows">${s.scope.map((x, i) => `
        <div class="srow"><span class="n">${String(i + 1).padStart(2, '0')}</span>
          <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div></div>`).join('')}</div>
    </div>
  </div>
</section>` : '';

  // Typewriter Q&A on clean paper — 09's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="content">
  <div class="wrap">
    ${head('Questions', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="qa rv">
      ${STAPLES}
      <p class="mono qhead">Frequently asked &mdash; typed up, pinned up</p>
      ${s.faqs.map((f, i) => `
      <details${i === 0 ? ' open' : ''}>
        <summary><span class="q">Q${i + 1}</span>${esc(f.q)}</summary>
        <p><span class="q">A${i + 1}</span>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `${subhero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

${strip(c, s.name)}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      ${STAPLES}
      <span class="xr">${img(c, 'quest/spare.webp', `Completed ${s.name.toLowerCase()} work by Quest Construction`)}</span>
      <span class="note"><b>${esc(s.name)}</b><span>By ${esc(c.site.name)}</span></span>
    </div>
    <div class="sheet rv">
      <span class="cut out kick">Overview</span>
      <h2>${esc(s.name)} by ${esc(c.site.name)}</h2>
      ${s.intro.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${btn(c.url('contact'), 'Get a quote')}
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Why Quest', `Why Choose ${esc(c.site.name)}?`,
      'Four things that hold true on every job we run.')}
    ${torn(s.whyChoose.map((w) => ({ body: w })))}
  </div>
</section>
${scope}

<section class="content">
  <div class="wrap">
    ${head('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="cards">${s.process.map((p) => `
      <div class="card rv" style="--d:${(p.n - 1) * 0.05}s">
        ${STAPLES}
        <span class="n">${String(p.n).padStart(2, '0')}</span>
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

${strip(c, a.name)}

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      ${STAPLES}
      <span class="xr">${img(c, 'neighborhood.webp', `Completed homes on a residential street near ${a.city}, Arizona`)}</span>
      <span class="note"><b>${esc(a.city)}</b><span>${esc(c.site.regionName)}</span></span>
    </div>
    <div class="sheet rv">
      <span class="cut out kick">The area</span>
      <h2>${fill(t.communityHeading)}</h2>
      <p class="lede">${fill(t.community)}</p>
      <p class="lede">${fill(t.local)}</p>
      <p class="lede">${fill(t.commitment)}</p>
      ${btn(c.url('contact'), `Get a quote in ${a.city}`)}
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('On site', `What We Run in ${esc(a.city)}`, '')}
    ${torn(t.capabilities.map((cap) => ({ body: cap })))}
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('Services', fill(t.servicesHeading), '')}
    ${directory(c)}
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

${strip(c)}

<section class="about">
  <div class="wrap in">
    <div class="pic rv">
      ${STAPLES}
      <span class="xr">${img(c, 'quest/story.webp', QUEST[1][1])}</span>
      <span class="note"><b>${c.site.foundingYear}</b><span>Family-owned, ${esc(c.site.regionName)}</span></span>
    </div>
    <div class="sheet rv">
      <span class="cut out kick">${esc(a.storyHeading)}</span>
      <h2>Built on Craftsmanship</h2>
      ${a.story.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${btn(c.url('projects'), 'See our work')}
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('What we do', 'Fourteen Trades, One Contractor',
      'Every trade below is coordinated by the same team, on the same schedule.')}
    ${directory(c)}
  </div>
</section>

${closing(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  const frame = (f, alt, i) => `<figure class="frame">
    <span class="no">${String(i + 1).padStart(2, '0')}</span>
    <span class="xr">${img(c, f, alt)}</span>
    <span class="cap">${esc(alt)}<i>${esc(c.site.name)}</i></span>
  </figure>`;

  return `${subhero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap">
    ${head('From Quest projects', 'Work We Have Photographed', '')}
    <div class="sheet-grid rv"><div class="g">${QUEST.map(([f, alt], i) => frame(f, alt, i)).join('')}</div></div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${head('The trades we run', 'Placeholder Photography',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="sheet-grid rv"><div class="g">${SHOTS.map((f, i) => frame(f, ALT[f], i)).join('')}</div></div>
    <p class="mono note">Placeholder photography &mdash; to be replaced with Quest Construction jobsite photographs.</p>
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
    <div class="flyers">${p.items.map((it, i) => `
      <article class="flyer${i === 1 ? ' pop' : ''} rv" style="--d:${i * 0.05}s">
        ${STAPLES}
        <span class="xr">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}</span>
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.body)}</p>
        <dl><div><dt>Run by</dt><dd>${esc(c.site.name)}</dd></div>
          <div><dt>Region</dt><dd>${esc(c.site.regionName)}</dd></div></dl>
        <div class="tear"><span class="ph">${esc(c.site.phoneDisplay)}</span>
          ${btn(c.url('contact'), 'Enquire')}</div>
      </article>`).join('')}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label class="wide"><span class="mono">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="mono">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

${strip(c)}

<section class="magnet">
  <div class="wrap">
    <form class="contact-form notice rv" novalidate>
      <span class="tape t1"></span><span class="tape t2"></span>
      <p class="band">${esc(p.helpHeading)}</p>
      <div class="in">
        <div>
          <h2>${esc(p.formHeading)}</h2>
          <div class="ffields">${p.fields.map(field).join('')}</div>
          <div class="acts">
            <button class="btn acc" type="submit">Send it</button>
            <a class="btn line" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
          </div>
          <p class="form-note mono" role="status" aria-live="polite"></p>
        </div>
        <div class="cols">
          <div><b>${esc(c.site.availability)}</b><span>Call ${esc(c.site.phoneDisplay)} and a person picks up.</span></div>
          <div><b>${c.site.foundingYear}</b><span>Building across ${esc(c.site.regionName)} since then.</span></div>
          <div><b>${c.services.length}</b><span>Trades, all run by the same contractor.</span></div>
          <div><b>${c.areas.areas.length}</b><span>Arizona cities on the round.</span></div>
        </div>
      </div>
      <div class="tabs" aria-hidden="true">${Array.from({ length: 8 }, (_, i) =>
        `<span style="--r:${(i % 3) - 1}deg">${esc(c.site.phoneDisplay)}</span>`).join('')}</div>
    </form>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const pin = (n, title, items, r) => `<div class="pin rv" style="--r:${r}deg">
    ${STAPLES}
    <span class="n">${esc(n)}</span>
    <h2>${esc(title)}</h2>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    <div class="pinboard">
      ${pin('01', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ], -1.5)}
      ${pin('02', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]), 1)}
      ${pin('03', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]), -0.8)}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
