// Direction 04 — Grid North. Swiss / International Typographic: one typeface at
// several weights on a visible 12-column grid, flush left, ragged right,
// hairline rules instead of boxes, no radius, no shadows. The accent is the
// only colour on the page. Lists are index tables; the gallery is a photo wall.
import { img, preloadImage } from '../lib/images.mjs';

export const meta = {
  slug: 'd04-grid-north',
  name: 'Grid North',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

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
  ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
  ['quest/hero.webp', 'A Quest Construction home under construction'],
  ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
];

const head2 = (n, heading, lede) => `<div class="head g12 rv">
  <p class="num">${esc(n)}</p>
  <h2>${heading}</h2>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
</div>`;

export function nav(c) {
  const col = (items) => items.map(([href, label], i) =>
    `<a href="${href}"><i>${String(i + 1).padStart(2, '0')}</i>${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap in">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
  </a>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false"><i>01</i>Services</button>
      <div class="mega"><div class="wrap g12">
        <p class="cap">Fourteen trades</p>
        <div class="megacols">${col(c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
      </div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false"><i>02</i>Areas</button>
      <div class="mega"><div class="wrap g12">
        <p class="cap">Eleven Arizona cities</p>
        <div class="megacols">${col(c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
      </div></div>
    </div>
    <a href="${c.url('projects')}"><i>03</i>Projects</a>
    <a href="${c.url('gallery')}"><i>04</i>Gallery</a>
    <a href="${c.url('about')}"><i>05</i>About</a>
    <a href="${c.url('contact')}"><i>06</i>Contact</a>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <p class="cap">${esc(title)}</p>
  <ul>${items.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;
  return `<footer>
<div class="wrap">
  <hr class="rule-h">
  <div class="fcols">
    <div>
      <a class="brand" href="${c.url('home')}">
        <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
      </a>
      <p>${esc(c.site.footerBlurb)}</p>
      <p class="cap">${esc(c.site.positioning)}</p>
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
  <hr class="rule">
  <div class="fbar">
    <p class="cap">&copy; 2026 ${esc(c.site.name)} — since ${c.site.foundingYear}</p>
    <p class="cap"><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></p>
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

/** Numbered rows on the grid — 04's way of listing services. */
const rowIndex = (c, items) => `<div class="rows">${items.map((s, i) => `
  <a class="row rv" href="${c.url(`services/${s.slug}`)}">
    <span class="n">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.shortDesc)}</p>
    <span class="meta">View &rarr;</span>
  </a>`).join('')}</div>`;

const closingCta = (c, heading, body) => `
<section class="magnet">
  <div class="wrap g12">
    <p class="num">Next</p>
    <h2>${esc(heading)}</h2>
    <p class="lede">${esc(body)}</p>
    <div class="acts">
      ${btn(c.url('contact'), 'Get in touch')}
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
    </div>
  </div>
</section>`;

const pageHero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <div class="wrap">
    <nav class="crumbs cap" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">/</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <hr class="rule-h">
    <div class="g12 sh">
      <h1>${esc(h1)}</h1>
      <div class="shr">
        <p class="lede">${esc(lede)}</p>
        <div class="acts">${btn(c.url('contact'), 'Get in touch')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}</div>
      </div>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const wallShots = [
    ['quest/hero.webp', 'A Quest Construction project in Arizona', 'w1'],
    ['quest/story.webp', 'A Quest Construction project under way', 'w2'],
    ['rebar.webp', ALT['rebar.webp'], 'w3'],
    ['framing.webp', ALT['framing.webp'], 'w4'],
    ['crew-slab.webp', ALT['crew-slab.webp'], 'w5'],
  ];

  return `
<section class="hero">
  <div class="wall">
    ${wallShots.map(([f, alt, w], i) => `<figure class="ph ${w}">
      ${img(c, f, alt, i === 0 ? { eager: true } : {})}
      <figcaption>${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('')}
    <div class="say w6">
      <span class="cap">${esc(c.site.positioning)}</span>
      <h1>${esc(h.heroTitle)}</h1>
    </div>
    <a class="act w7" href="${c.url('contact')}">
      <b>Get in touch</b>
      <span class="go"><span class="cap">${esc(c.site.phoneDisplay)}</span><span>&rarr;</span></span>
    </a>
    <div class="say w8">
      <span class="cap">Since ${c.site.foundingYear}</span>
      <p>${esc(h.heroBody)}</p>
    </div>
  </div>
</section>

<section class="proof">
  <div class="wrap">
    <table>
      <caption class="cap">Quest Construction at a glance</caption>
      <tbody>
        <tr><td>Building since</td><td class="v">${c.site.foundingYear}</td></tr>
        <tr><td>Services offered</td><td class="v">${c.services.length}</td></tr>
        <tr><td>Arizona cities served</td><td class="v">${c.areas.areas.length}</td></tr>
        <tr><td>Reach us</td><td class="v">${esc(c.site.availability)} — ${esc(c.site.phoneDisplay)}</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="about">
  <div class="wrap">
    <hr class="rule-h">
    ${head2('01 — Our story', esc(h.storyHeading), '')}
    <div class="g12 twocol">
      <div class="col-a rv">${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
        ${btn(c.url('about'), 'Learn more', 'btn line')}</div>
      <figure class="col-b rv">${img(c, 'quest/story.webp', 'A Quest Construction project under way')}
        <figcaption class="cap">${esc(h.storyEyebrow)}</figcaption></figure>
    </div>
  </div>
</section>

<section class="content" id="services">
  <div class="wrap">
    <hr class="rule-h">
    ${head2('02 — Services', 'Our Expert Construction Services',
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${rowIndex(c, c.services)}
  </div>
</section>

<section class="offers">
  <div class="wrap">
    ${head2('03 — Offers', 'Exclusive Offers Just For You', '')}
    <div class="orows">${c.site.offers.map((o) => `
      <div class="orow rv">
        <span class="oamt">${esc(o.amount)}</span>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.body)}</p>
        <button class="btn line" type="button" data-copy="${esc(o.code)}">GET CODE</button>
      </div>`).join('')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    <hr class="rule-h">
    ${head2('04 — Selected work', esc(c.pages.projects.h1), c.pages.projects.lede)}
    <table class="index rv">
      <thead><tr><th>No.</th><th>Project</th><th>Description</th><th></th></tr></thead>
      <tbody>${c.pages.projects.items.map((p, i) => `
        <tr><td>${String(i + 1).padStart(2, '0')}</td>
          <td><a href="${c.url('projects')}">${esc(p.title)}</a></td>
          <td>${esc(p.body)}</td><td class="r">&rarr;</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
</section>

${closingCta(c, h.ctaHeading, h.ctaBody)}`;
}

export function service(c) {
  const s = c.item;
  const tabs = c.services.map((x) => {
    const on = x.slug === s.slug;
    return `<a href="${c.url(`services/${x.slug}`)}"${on ? ' class="on" aria-current="page"' : ''}>${esc(x.name)}</a>`;
  }).join('');

  // Hairline-ruled columns — 04's why-choose treatment.
  const why = s.whyChoose.map((w, i) => `
    <div class="hcol rv"><span class="num">${String(i + 1).padStart(2, '0')}</span>
      <p>${esc(w)}</p></div>`).join('');

  // Numbered rows on the grid — 04's process treatment.
  const steps = s.process.map((p) => `
    <div class="row prow rv">
      <span class="n">${String(p.n).padStart(2, '0')}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.body)}</p>
      <span class="meta">Stage ${p.n} of 4</span>
    </div>`).join('');

  const scope = s.scope && s.scope.length ? `
<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('03 — Scope', `Complete Range of ${esc(s.name)} Services`, '')}
    <table class="index rv">
      <tbody>${s.scope.map((x, i) => `
        <tr><td>${String(i + 1).padStart(2, '0')}</td><td><b>${esc(x.title)}</b></td>
        <td>${esc(x.body)}</td></tr>`).join('')}</tbody>
    </table>
    ${s.quality ? `<div class="qrule rv"><p class="num">Quality assurance</p><p>${esc(s.quality)}</p></div>` : ''}
  </div>
</section>` : '';

  // Hairline rows, no chrome — 04's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('05 — FAQs', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="hfaq">${s.faqs.map((f, i) => `
      <details class="rv"><summary><span class="num">${String(i + 1).padStart(2, '0')}</span>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${pageHero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('01 — Overview', `${esc(s.name)} Services by ${esc(c.site.name)}`, '')}
    <div class="g12 twocol">
      <div class="col-a rv">${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="col-b">
        <p class="cap">Why choose ${esc(c.site.name)}?</p>
        <div class="hcols">${why}</div>
      </div>
    </div>
  </div>
</section>
${scope}

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('04 — Process', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="rows">${steps}</div>
  </div>
</section>
${faq}

${closingCta(c, s.ctaHeading, s.ctaBody)}`;
}

export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));

  return `${pageHero(c, {
    h1: fill(t.h1), lede: fill(t.tagline), crumb: a.name, trail: 'Service Areas',
  })}

<section class="proof">
  <div class="wrap">
    <table>
      <caption class="cap">${esc(a.name)} — service details</caption>
      <tbody>
        <tr><td>Phone</td><td class="v">${esc(c.site.phoneDisplay)}</td></tr>
        <tr><td>Availability</td><td class="v">${esc(c.site.availability)}</td></tr>
        <tr><td>Building since</td><td class="v">${c.site.foundingYear}</td></tr>
        <tr><td>Services available</td><td class="v">${c.services.length}</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('01 — The area', fill(t.communityHeading), '')}
    <div class="g12 twocol">
      <div class="col-a rv">
        <p>${fill(t.community)}</p><p>${fill(t.local)}</p><p>${fill(t.commitment)}</p>
        ${btn(c.url('contact'), 'Talk to us', 'btn line')}
      </div>
      <div class="col-b">
        <p class="cap">On site</p>
        <div class="hcols">${t.capabilities.map((cap, i) => `
          <div class="hcol rv"><span class="num">${String(i + 1).padStart(2, '0')}</span>
            <p>${esc(cap)}</p></div>`).join('')}</div>
      </div>
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('02 — Services', fill(t.servicesHeading), '')}
    ${rowIndex(c, c.services)}
  </div>
</section>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('03 — Nearby', 'Other Areas We Serve', '')}
    <div class="arearow rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${pageHero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('01 — Our story', esc(a.storyHeading), '')}
    <div class="g12 twocol">
      <div class="col-a rv">${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}
        ${btn(c.url('projects'), 'See our work', 'btn line')}</div>
      <figure class="col-b rv">${img(c, 'quest/story.webp', 'A Quest Construction project under way')}
        <figcaption class="cap">Quest Construction</figcaption></figure>
    </div>
  </div>
</section>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('02 — What we do', 'Fourteen Trades, One Contractor', '')}
    ${rowIndex(c, c.services)}
  </div>
</section>

${closingCta(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  return `${pageHero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('01 — From Quest projects', 'Work We Have Photographed', '')}
  </div>
  <div class="wall gal">${QUEST.map(([f, alt], i) => `
    <figure class="ph"><span class="phin">${img(c, f, alt)}</span>
      <figcaption>${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('')}</div>
</section>

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('02 — Placeholder photography', 'The Trades We Run',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
  </div>
  <div class="wall gal">${SHOTS.map((f, i) => `
    <figure class="ph"><span class="phin">${img(c, f, ALT[f])}</span>
      <figcaption>${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('')}</div>
  <div class="wrap"><p class="cap note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p></div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="content">
  <div class="wrap"><hr class="rule-h">
    ${head2('01 — Index', 'Selected Work', '')}
    <table class="index rv">
      <thead><tr><th>No.</th><th>Project</th><th>Description</th><th></th></tr></thead>
      <tbody>${p.items.map((it, i) => `
        <tr><td>${String(i + 1).padStart(2, '0')}</td><td><b>${esc(it.title)}</b></td>
        <td>${esc(it.body)}</td><td class="r">&rarr;</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="wall gal">${p.items.map((it, i) => `
    <figure class="ph"><span class="phin">${img(c, QUEST[i % 3][0], it.alt || it.title)}</span>
      <figcaption>${esc(it.title)}</figcaption></figure>`).join('')}</div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label><span class="cap">${esc(f.label)}</span><textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label><span class="cap">${esc(f.label)}</span><input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="content">
  <div class="wrap"><hr class="rule-h">
    <div class="g12 twocol">
      <form class="contact-form col-a rv" novalidate>
        <p class="num">01 — Send a message</p>
        <h2>${esc(p.formHeading)}</h2>
        ${p.fields.map(field).join('')}
        <button class="btn acc" type="submit">Submit</button>
        <p class="form-note cap" role="status" aria-live="polite"></p>
      </form>
      <div class="col-b rv">
        <p class="num">02 — Direct</p>
        <a class="bigphone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
        <table class="index">
          <tbody>
            <tr><td>Availability</td><td class="r">${esc(c.site.availability)}</td></tr>
            <tr><td>Building since</td><td class="r">${c.site.foundingYear}</td></tr>
            <tr><td>Services</td><td class="r">${c.services.length}</td></tr>
            <tr><td>Areas served</td><td class="r">${c.areas.areas.length}</td></tr>
          </tbody>
        </table>
        <figure class="shot">${img(c, 'quest/contact.webp', 'A Quest Construction project in Arizona')}</figure>
      </div>
    </div>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const table = (n, title, items) => `
  <hr class="rule-h">
  ${head2(n, esc(title), '')}
  <table class="index rv"><tbody>${items.map(([href, label], i) => `
    <tr><td>${String(i + 1).padStart(2, '0')}</td><td><a href="${href}">${esc(label)}</a></td>
    <td class="r">&rarr;</td></tr>`).join('')}</tbody></table>`;

  return `${pageHero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    ${table('01 — Pages', 'Pages', [
      [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
      [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
      [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
    ])}
    ${table('02 — Services', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${table('03 — Areas', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
