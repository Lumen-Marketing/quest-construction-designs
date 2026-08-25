// Direction 02 — Heavy Plant. Poster wordmark with the machine cutting through
// it. A dark ink pill for navigation floating on cream, a giant ghost wordmark,
// numbered discipline cards with photography bleeding in from the right, a
// dark manifesto band, and an expanding slat filmstrip.
import { img, preloadImage } from '../lib/images.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd02-heavy-plant',
  name: 'Heavy Plant',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const grid = (dark) => `<div class="grid-bg${dark ? ' on-dark' : ''}" aria-hidden="true"></div>`;

const shead = (eyebrow, heading, lede) => `<div class="shead rv">
  <div>${eyebrow ? `<p class="mono eyebrow">${esc(eyebrow)}</p>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

const btn = (href, label, cls = 'btn') =>
  `<a class="${cls}" href="${href}"><span class="pip"></span>${esc(label)}</a>`;

const SHOTS = ['rebar.webp', 'framing.webp', 'crew-slab.webp', 'site-steel.webp',
  'mech.webp', 'facade.webp', 'roofline.webp', 'trade-weld.webp',
  'trade-electric.webp', 'kitchen.webp', 'bath.webp', 'earthworks.webp',
  'neighborhood.webp', 'home-dusk.webp'];

const SHOT_ALT = {
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

const shotFor = (i) => SHOTS[i % SHOTS.length];
const altFor = (i) => SHOT_ALT[shotFor(i)];

export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285"
      loading="eager" decoding="async">
  </a>
  <button class="navtoggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav>
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="dropmenu dropmenu--svc">${col(
        c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="dropmenu dropmenu--area">${col(
        c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}"><span class="pip"></span>${esc(c.site.phoneDisplay)}</a>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h5>${esc(title)}</h5>
  <ul>${items.map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;
  return `<footer>
<div class="wrap fg">
  <div class="about">
    <a class="brand" href="${c.url('home')}">
      <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285"
        loading="lazy" decoding="async">
    </a>
    <p>${esc(c.site.footerBlurb)}</p>
    <p class="mono">${esc(c.site.positioning)}</p>
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
<div class="wrap fbar">
  <p class="mono">&copy; 2026 ${esc(c.site.name)} &middot; Since ${c.site.foundingYear}</p>
  <p class="mono"><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></p>
</div>
</footer>`;
}

export function script(c) {
  return `<script>
(function(){
  ${scriptMap()}
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);s.setProperty('--acc-dim',p[2]);}
  var q=new URLSearchParams(location.search).get('acc'); if(q) set(q);
  addEventListener('message',function(e){ if(e.data&&e.data.acc) set(e.data.acc); });
})();
(function(){
  var t=document.querySelector('.navtoggle'), n=document.querySelector('.nav nav');
  if(t&&n){t.addEventListener('click',function(){
    var o=n.classList.toggle('open'); t.setAttribute('aria-expanded',String(o)); t.classList.toggle('on',o);
  });}
  document.querySelectorAll('.drop>button').forEach(function(b){
    b.addEventListener('click',function(e){e.preventDefault();
      var o=b.parentNode.classList.toggle('open'); b.setAttribute('aria-expanded',String(o));});
  });
})();
(function(){
  var el=document.getElementById('fleet'); if(!el) return;
  var items=${JSON.stringify(c.services.map((s) => s.name))};
  var half=items.map(function(t){return '<span>'+t+'</span><i></i>'}).join('');
  el.innerHTML=half+half;
})();
(function(){
  var slats=document.querySelectorAll('.slat');
  slats.forEach(function(s){
    s.addEventListener('mouseenter',function(){
      slats.forEach(function(x){x.classList.remove('is-on')}); s.classList.add('is-on');
    });
  });
})();
(function(){
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',async function(){
      var code=b.getAttribute('data-copy'), old=b.textContent;
      try{await navigator.clipboard.writeText(code);b.textContent='COPIED'}
      catch(e){b.textContent=code}
      setTimeout(function(){b.textContent=old},1600);
    });
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
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},
    {threshold:.1,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();
</script>`;
}

// ------------------------------------------------------------- shared blocks

const fleet = () => `<section class="fleet" aria-hidden="true"><div class="fleet-in" id="fleet"></div></section>`;

const discCards = (c, items) => `<div class="discs">${items.map((s, i) => `
  <article class="disc rv${i % 5 === 2 ? ' disc--acc' : ''}">
    <div class="txt">
      <span class="no">${String(i + 1).padStart(2, '0')} / Service</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
    </div>
    <div class="shot">${img(c, shotFor(i), altFor(i))}</div>
    <a class="disc-link" href="${c.url(`services/${s.slug}`)}">
      <span class="sr">View ${esc(s.name)}</span></a>
  </article>`).join('')}</div>`;

const closingCta = (c, heading, body) => `
<section class="cta">
  <div class="wrap cta-in">
    <div class="inner">
      <h2>${esc(heading)}</h2>
      <p>${esc(body)}</p>
      <div class="hero-acts">
        ${btn(c.url('contact'), 'Get in touch')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn outline')}
      </div>
    </div>
  </div>
</section>`;

const pageHero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  ${grid(false)}
  <div class="mega ghost" aria-hidden="true">QUEST</div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&#9670;</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&#9670;</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <h1>${esc(h1)}</h1>
    <p class="lede">${esc(lede)}</p>
    <div class="hero-acts">
      ${btn(c.url('contact'), 'Get in touch')}
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn outline')}
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  const slats = c.pages.projects.items.map((p, i) => `
    <a class="slat${i === 0 ? ' is-on' : ''}" href="${c.url('projects')}">
      ${img(c, ['quest/story.webp', 'quest/hero.webp', 'quest/spare.webp'][i % 3], p.alt || p.title)}
      <span class="slat-t">${esc(p.title)}</span>
      <span class="go" aria-hidden="true">&#8599;</span>
    </a>`).join('');

  return `
<section class="hero">
  ${grid(false)}
  <div class="mega" aria-hidden="true">QUEST</div>
  <div class="wrap">
    <div class="hero-head">
      <h1>${esc(h.heroTitle)}</h1>
      <div>
        <p class="lede">${esc(h.heroBody)}</p>
        <div class="hero-acts">
          ${btn(c.url('contact'), 'Get in touch')}
          ${btn(c.site.phoneHref, 'Call us', 'btn outline')}
        </div>
      </div>
    </div>
    <div class="hero-stage">
      <figure class="plate-main">
        ${img(c, 'quest/hero.webp', 'A Quest Construction project in Arizona', { eager: true })}
        <span class="tag"><span class="mk"></span><span>
          <b>${esc(c.site.phoneDisplay)}</b>
          <span>${esc(c.site.availability)} &middot; since ${c.site.foundingYear}</span>
        </span></span>
      </figure>
      <div class="slats">${slats}</div>
    </div>
  </div>
</section>

${fleet()}

<section class="mani">
  <div class="wrap">
    <p class="big">${esc(h.storyHeading)} &mdash; <span>${esc(c.site.positioning)}</span></p>
    <div class="cols">${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${btn(c.url('about'), 'Learn more')}
  </div>
</section>

<section class="sec dark" id="services">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Our top services', 'Our Expert <span>Construction</span> Services',
      'Fourteen trades, one contractor, self-managed from first conversation through final walkthrough.')}
    ${discCards(c, c.services)}
  </div>
</section>

<section class="sec">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Exclusive offers', 'Exclusive Offers <span>Just For You</span>', '')}
    <div class="offerbar">${c.site.offers.map((o) => `
      <div class="ob rv">
        <b class="mega-sm">${esc(o.amount)}</b>
        <div>
          <h3>${esc(o.title)}</h3>
          <p>${esc(o.body)}</p>
          <button class="btn acc" type="button" data-copy="${esc(o.code)}">GET CODE</button>
        </div>
      </div>`).join('')}
    </div>
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

  // Ghost-numeral list — 02's why-choose treatment.
  const why = s.whyChoose.map((w, i) => `
    <li class="rv"><span class="gn" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <p>${esc(w)}</p></li>`).join('');

  // Machine-cut numbered band — 02's process treatment.
  const steps = s.process.map((p) => `
    <div class="cutstep rv">
      <span class="cutno">${p.n}</span>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.body)}</p>
    </div>`).join('');

  const scope = s.scope && s.scope.length ? `
<section class="sec">
  ${grid(false)}
  <div class="wrap">
    ${shead('— What we cover', `Complete Range of <span>${esc(s.name)}</span> Services`, '')}
    <dl class="dl rv">${s.scope.map((x) => `
      <div><dt>${esc(x.title)}</dt><dd>${esc(x.body)}</dd></div>`).join('')}
    </dl>
    ${s.quality ? `<div class="qnote rv"><h3>Quality Assurance</h3><p>${esc(s.quality)}</p></div>` : ''}
  </div>
</section>` : '';

  // Skewed bar rows — 02's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— FAQs', `${esc(s.name)} Services <span>FAQ</span>`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="bars-faq">${s.faqs.map((f) => `
      <details class="rv"><summary><span>${esc(f.q)}</span></summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `${pageHero(c, {
    h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services',
  })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="sec">
  ${grid(false)}
  <div class="wrap prose-wrap">
    <div class="prose rv">
      <h2>${esc(s.name)} Services by <span>${esc(c.site.name)}</span></h2>
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <div class="whyblock">
      <h3>Why choose ${esc(c.site.name)}?</h3>
      <ul class="ghostlist">${why}</ul>
    </div>
  </div>
</section>
${scope}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— How it runs', `Our Unique <span>${esc(s.name)}</span> Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="cutband">${steps}</div>
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

${fleet()}

<section class="mani">
  <div class="wrap">
    <p class="big">${fill(t.communityHeading)}</p>
    <div class="cols">
      <p>${fill(t.community)}</p>
      <p>${fill(t.local)}</p>
      <p>${fill(t.commitment)}</p>
    </div>
    ${btn(c.url('contact'), 'Talk to us about your project')}
  </div>
</section>

<section class="sec">
  ${grid(false)}
  <div class="wrap">
    ${shead(`— Serving ${esc(a.name)}`, fill(t.servicesHeading), '')}
    <dl class="dl rv">${t.capabilities.map((cap, i) => `
      <div><dt>${String(i + 1).padStart(2, '0')}</dt><dd>${esc(cap)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Everything we run', `Services in <span>${esc(a.city)}</span>`, '')}
    ${discCards(c, c.services)}
  </div>
</section>

<section class="sec">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Nearby', 'Other <span>Areas</span> We Serve', '')}
    <div class="chips rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${pageHero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

${fleet()}

<section class="mani">
  <div class="wrap">
    <p class="big">${esc(a.storyHeading)} &mdash; <span>since ${c.site.foundingYear}</span></p>
    <div class="cols">${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${btn(c.url('projects'), 'See our work')}
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— What we do', 'Fourteen Trades, <span>One</span> Contractor', '')}
    ${discCards(c, c.services)}
  </div>
</section>

${closingCta(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  // Staggered plant-yard grid — 02's gallery treatment.
  const yard = SHOTS.map((f, i) => `
    <figure class="yd yd--${(i % 4) + 1} rv">${img(c, f, SHOT_ALT[f])}</figure>`).join('');

  return `${pageHero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="sec">
  ${grid(false)}
  <div class="wrap">
    ${shead('— From Quest projects', 'Work <span>We</span> Have Photographed', '')}
    <div class="yard">${[
      ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
      ['quest/hero.webp', 'A Quest Construction home under construction'],
      ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
    ].map(([f, alt]) => `<figure class="yd yd--1 rv">${img(c, f, alt)}</figure>`).join('')}</div>
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Placeholder photography', 'The <span>Trades</span> We Run',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="yard">${yard}</div>
    <p class="mono note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  // Wide banded rows — 02's projects treatment.
  const rows = p.items.map((it, i) => `
    <article class="band rv">
      <span class="bno">${String(i + 1).padStart(2, '0')}</span>
      <div class="bshot">${img(c, ['quest/story.webp', 'quest/hero.webp', 'quest/spare.webp'][i % 3], it.alt || it.title)}</div>
      <div class="btxt"><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></div>
    </article>`).join('');

  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="sec">
  ${grid(false)}
  <div class="wrap"><div class="bands">${rows}</div></div>
</section>

${fleet()}

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label>${esc(f.label)}<textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label>${esc(f.label)}<input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="sec">
  ${grid(false)}
  <div class="wrap plate2">
    <form class="contact-form rv" novalidate>
      <h2>${esc(p.formHeading)}</h2>
      ${p.fields.map(field).join('')}
      <button class="btn acc" type="submit"><span class="pip"></span>Submit</button>
      <p class="form-note mono" role="status" aria-live="polite"></p>
    </form>
    <aside class="side rv">
      <h2>${esc(p.helpHeading)}</h2>
      <dl class="dl">
        <div><dt>Phone</dt><dd><a href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a></dd></div>
        <div><dt>Hours</dt><dd>${esc(c.site.availability)}</dd></div>
        <div><dt>Building since</dt><dd>${c.site.foundingYear}</dd></div>
        <div><dt>Areas served</dt><dd>${c.areas.areas.length} Arizona cities</dd></div>
      </dl>
      <div class="sideshot">${img(c, 'quest/contact.webp', 'A Quest Construction project in Arizona')}</div>
    </aside>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  // Ghost-numeral columns — 02's sitemap treatment.
  const col = (title, items) => `<div class="gcol rv">
  <h3>${esc(title)}</h3>
  <ol>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ol>
</div>`;

  return `${pageHero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="sec">
  ${grid(false)}
  <div class="wrap gcols">
    ${col('Pages', [
      [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
      [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
      [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
    ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
