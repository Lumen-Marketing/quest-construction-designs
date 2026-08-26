// Direction 01 — Site Plan. Layered and editorial: a faint engineering grid on
// cream, a hard-edged accent plane, a frameless cut-out machine straddling the
// boundary, and a floating badge card over the lot. Pill buttons, generous
// radii, soft layered shadows.
import { img, preloadImage } from '../lib/images.mjs';
import { icon } from '../lib/icons.mjs';
import { scriptMap } from '../lib/palette.mjs';
import {
  shot, shots, GALLERY, HERO, STORY, CONTACT, PROJECT_SHOTS,
  serviceShots, areaShots,
} from '../lib/photos.mjs';

export const meta = {
  slug: 'd01-site-plan',
  name: 'Site Plan',
  indexable: true,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, HERO) : ''),
};

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const grid = (dark) => `<div class="grid-bg${dark ? ' on-dark' : ''}" aria-hidden="true"></div>`;

const shead = (eyebrow, heading, lede) => `<div class="shead rv">
  <div>${eyebrow ? `<p class="mono eyebrow">${esc(eyebrow)}</p>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

const arrowBtn = (href, label, cls = 'btn') =>
  `<a class="${cls}" href="${href}"><span class="pip"></span>${esc(label)}</a>`;

// A band of Quest's own jobsite photographs. Square tiles, because the library
// is two phone shoots and runs both portrait and landscape — a fixed 3:2 crop
// takes the roof off half of them, and a square takes the same bite out of
// either orientation.
const band = (c, pairs, eyebrow, heading, lede = '', cls = 'sec cream') => `
<section class="${cls}">
  ${grid(cls.includes('dark'))}
  <div class="wrap">
    ${shead(eyebrow, heading, lede)}
    <div class="shotband n${pairs.length}">${pairs.map(([f, alt]) =>
      `<figure class="rv">${img(c, f, alt)}</figure>`).join('')}</div>
  </div>
</section>`;

/** Layered dropdown nav — the mockup was anchor-only, so this is new furniture. */
export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    ${img(c, 'quest/logo.webp', c.site.name, { load: 'eager' })}
  </a>
  <button class="navtoggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <nav>
    <div class="drop">
      <button type="button" aria-expanded="false" aria-haspopup="true"
        aria-controls="menu-services">Services</button>
      <div class="dropmenu dropmenu--svc" id="menu-services">${col([
        ...(c.hubs ? [[c.url('services'), 'All Services']] : []),
        ...c.services.map((s) => [c.url(`services/${s.slug}`), s.name])])}</div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false" aria-haspopup="true"
        aria-controls="menu-areas">Areas Served</button>
      <div class="dropmenu dropmenu--area" id="menu-areas">${col([
        ...(c.hubs ? [[c.url('service-areas'), 'All Areas Served']] : []),
        ...c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name])])}</div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
    <div class="navcall">
      <span class="mono">Call us &mdash; ${esc(c.site.availability)}</span>
      <a href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
    </div>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}"
    aria-label="Call ${esc(c.site.phoneDisplay)}"><span class="pip"><svg viewBox="0 0 24 24"
    aria-hidden="true" focusable="false"><path
    d="M4 5h5l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v5a15 15 0 0 1-16-16z"/></svg></span><span
    class="navtel-num">${esc(c.site.phoneDisplay)}</span></a>
</div>
</header>`;
}

export function footer(c) {
  // `col2` marks the long lists — the fourteen trades and the eleven cities.
  // They are the two that go two-up in the phone footer rather than running
  // to a screen and a half of one link per row.
  const col = (title, items, cls = '') => `<div${cls ? ` class="${cls}"` : ''}>
  <h2>${esc(title)}</h2>
  <ul>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  return `<footer>
<div class="wrap fg">
  <div class="about">
    <a class="brand" href="${c.url('home')}">
      ${img(c, 'quest/logo.webp', c.site.name, {})}
    </a>
    <p>${esc(c.site.footerBlurb)}</p>
    <p class="mono">${esc(c.site.positioning)}</p>
    ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn acc')}
  </div>
  ${col('Company', [
    [c.url('about'), 'About Us'],
    [c.url('projects'), 'Project Showcase'],
    [c.url('gallery'), 'Gallery'],
    [c.url('contact'), 'Contact'],
    [c.url('sitemap'), 'Sitemap'],
  ])}
  ${col('Services', [
    ...(c.hubs ? [[c.url('services'), 'All Services']] : []),
    ...c.services.map((s) => [c.url(`services/${s.slug}`), s.name])], 'col2')}
  ${col('Areas Served', [
    ...(c.hubs ? [[c.url('service-areas'), 'All Areas Served']] : []),
    ...c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name])], 'col2')}
</div>
<div class="wrap fbar">
  <p class="mono">&copy; 2026 ${esc(c.site.name)} &middot; Since ${c.site.foundingYear}</p>
  <p class="mono"><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></p>
</div>
</footer>`;
}

/** Live accent swap. Chooser furniture — the standalone site bakes one in. */
export function accentScript() {
  return `<script>
(function(){
  ${scriptMap()}
  function set(k){var p=P[k];if(!p)return;var s=document.documentElement.style;
    s.setProperty('--acc',p[0]);s.setProperty('--on-acc',p[1]);s.setProperty('--acc-dim',p[2]);
    s.setProperty('--acc-on-dark',p[3]);}
  var q=new URLSearchParams(location.search).get('acc'); if(q) set(q);
  addEventListener('message',function(e){ if(e.data&&e.data.acc) set(e.data.acc); });
})();
</script>`;
}

/** Nav toggle, offer-code copy, static-form notice, marquee, scroll reveals. */
export function baseScript(c) {
  return `<script>
(function(){
  var t=document.querySelector('.navtoggle'), n=document.querySelector('.nav nav');
  // The phone drawer is a sheet over the page, so opening it has to stop the
  // page behind from scrolling too — otherwise a flick anywhere on the menu
  // scrolls the article underneath and the menu appears to jump.
  function setNav(o){
    if(!t||!n)return;
    n.classList.toggle('open',o); t.classList.toggle('on',o);
    t.setAttribute('aria-expanded',String(o));
    document.documentElement.classList.toggle('nav-open',o);
  }
  if(t&&n){
    t.addEventListener('click',function(){ setNav(!n.classList.contains('open')); });
    // A rotation to landscape can put the layout back on the desktop nav with
    // the sheet still latched open — and with the scroll lock still on.
    addEventListener('resize',function(){
      if(innerWidth>940&&n.classList.contains('open')) setNav(false);
    });
  }
  var drops=[].slice.call(document.querySelectorAll('.drop'));
  function shut(d){ if(!d.classList.contains('open'))return;
    d.classList.remove('open'); var b=d.querySelector('button');
    if(b) b.setAttribute('aria-expanded','false'); }
  function shutAll(except){ drops.forEach(function(d){ if(d!==except) shut(d); }); }
  drops.forEach(function(d){
    var b=d.querySelector('button'); if(!b)return;
    b.addEventListener('click',function(e){
      e.preventDefault();
      var o=!d.classList.contains('open');
      shutAll(d); d.classList.toggle('open',o); b.setAttribute('aria-expanded',String(o));
    });
  });
  // A menu you can open but not dismiss is a trap on touch, and Escape is
  // the only way out for a keyboard once focus is inside one.
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    var open=drops.filter(function(d){return d.classList.contains('open')});
    if(open.length){
      open.forEach(function(d){ var b=d.querySelector('button'); shut(d); if(b&&d.contains(document.activeElement)) b.focus(); });
      return;
    }
    // Nothing expanded inside it, so Escape dismisses the whole phone sheet.
    if(n&&n.classList.contains('open')){ setNav(false); if(t) t.focus(); }
  });
  document.addEventListener('pointerdown',function(e){
    if(!e.target.closest('.drop')) shutAll(null);
  });
  document.addEventListener('focusin',function(e){
    if(!e.target.closest('.drop')) shutAll(null);
  });
})();
(function(){
  // On a phone the trade rail is one row that scrolls sideways rather than
  // five wrapped ones. The trade being read is often past the right edge, so
  // bring it into view — but only when the rail is actually scrollable, or
  // this scrolls the whole page down to the rail on a desktop.
  var rail=document.querySelector('.svctabs .wrap'), on=rail&&rail.querySelector('a.on');
  if(!on||rail.scrollWidth<=rail.clientWidth+1) return;
  // Measured against the rail rather than off offsetLeft: the rail is not a
  // positioned element, so offsetLeft is relative to the body and lands the
  // chip flush against the screen edge instead of inside the gutter.
  var d=on.getBoundingClientRect().left-rail.getBoundingClientRect().left-14;
  rail.scrollLeft=Math.max(0,rail.scrollLeft+d);
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
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var n=f.querySelector('.form-note');
      if(n) n.textContent='This form is not connected yet \\u2014 please call ${c.site.phoneDisplay} and we will pick up.';
    });
  });
})();
(function(){
  var el=document.getElementById('strip'); if(!el) return;
  var items=${JSON.stringify(c.services.map((s) => s.name))};
  var half=items.map(function(t){return '<span>'+t+'</span><span class="d">&#9670;</span>'}).join('');
  el.innerHTML=half+half;
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

export function script(c) { return `${accentScript()}
${baseScript(c)}`; }

// ---------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;

  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">View details <i aria-hidden="true">&#8599;</i></a>
      <span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </article>`).join('');

  const offers = c.site.offers.map((o) => `
    <div class="offer rv">
      <b>${esc(o.amount)}</b>
      <h3>${esc(o.title)}</h3>
      <p>${esc(o.body)}</p>
      <button class="btn acc" type="button" data-copy="${esc(o.code)}"
        aria-live="polite">GET CODE</button>
    </div>`).join('');

  const work = c.pages.projects.items.map((p, i) => `
    <a class="pj ${'abc'[i]} rv" href="${c.url('projects')}">
      ${img(c, ...shot(PROJECT_SHOTS[i % PROJECT_SHOTS.length]))}
      <span class="cap"><span><b>${esc(p.title)}</b><span>${esc(p.body)}</span></span>
      <span class="go" aria-hidden="true">&#8599;</span></span>
    </a>`).join('');

  return `
<section class="hero">
  ${grid(false)}
  <div class="hero-panel" aria-hidden="true"></div>
  <div class="hero-ghost" aria-hidden="true">QUEST</div>
  <div class="wrap">
    <div class="hero-copy">
      <h1>${esc(h.heroTitle)}</h1>
      <p class="lede">${esc(h.heroBody)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, 'Call us', 'btn ghost')}
      </div>
      <div class="hero-trust">
        <div><b>${c.site.foundingYear}</b><span>Building since</span></div>
        <div><b>${c.services.length}</b><span>Services</span></div>
        <div><b>${c.areas.areas.length}</b><span>Arizona cities</span></div>
        <div><b>${esc(c.site.availability)}</b><span>Reach us</span></div>
      </div>
    </div>
  </div>
  ${img(c, ...shot(HERO), { cls: 'machine', eager: true })}
  <div class="badge badge-float">
    <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h5l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v5a15 15 0 0 1-16-16z"/></svg></span>
    <span><b>${esc(c.site.phoneDisplay)}</b><span>${esc(c.site.availability)} &middot; family owned</span></span>
  </div>
</section>

<section class="strip" aria-hidden="true"><div class="strip-in" id="strip"></div></section>

<section class="sec dark" id="services">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Our Top Services', `Our Expert <span>Construction</span> Services`,
      'Fourteen trades, one contractor. Everything below is self-managed from first conversation through final walkthrough.')}
    <div class="svcs">${cards}</div>
  </div>
</section>

<section class="sec cream">
  ${grid(false)}
  <div class="wrap split">
    <div class="story-shot rv">${img(c, ...shot(STORY))}</div>
    <div class="rv">
      <p class="mono eyebrow">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)}</h2>
      ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${arrowBtn(c.url('about'), 'Learn more')}
    </div>
  </div>
</section>

${band(c, shots(
  'quest/slab-blockwall.webp', 'quest/framing-clouds.webp', 'quest/framing-roof.webp',
  'quest/sheathing-panel.webp', 'quest/roof-shingles.webp', 'quest/custom-home-gables.webp',
  'quest/home-windows.webp', 'quest/porch-dusk.webp',
), '— On site', 'Slab to <span>Shingle</span>, Photographed',
  'Every photograph on this site is from a Quest job. Nothing here is stock.', 'sec cream alt')}

<section class="sec dark" id="offers">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Exclusive offers', 'Exclusive Offers <span>Just For You</span>', '')}
    <div class="offers">${offers}</div>
  </div>
</section>

<section class="sec cream" id="work">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Selected work', `${esc(c.pages.projects.h1)}`, c.pages.projects.lede)}
    <div class="work">${work}</div>
  </div>
</section>

<section class="cta">
  <div class="bars" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap cta-in">
    <div class="cta-copy">
      <h2>${esc(h.ctaHeading)}</h2>
      <p>${esc(h.ctaBody)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost')}
      </div>
    </div>
  </div>
</section>`;
}

/** Service page — hero, tabs, intro, why-choose badges, process, FAQ, CTA. */
export function service(c) {
  const s = c.item;

  const tabs = c.services.map((x) => {
    const on = x.slug === s.slug;
    return `<a href="${c.url(`services/${x.slug}`)}"${on ? ' class="on" aria-current="page"' : ''}>${esc(x.name)}</a>`;
  }).join('');

  const why = s.whyChoose.map((w, i) => `
    <div class="wc rv"><span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <p>${esc(w)}</p></div>`).join('');

  const steps = s.process.map((p) => `
    <div class="step rv"><div class="n">${p.n}</div>
      <h4>${esc(p.title)}</h4><p>${esc(p.body)}</p></div>`).join('');

  const scope = s.scope && s.scope.length ? `
<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— What we cover', `Complete Range of <span>${esc(s.name)}</span> Services`, '')}
    <div class="scope">${s.scope.map((x) => `
      <article class="sc rv"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join('')}
    </div>
    ${s.quality ? `<div class="quality rv"><h3>Quality Assurance</h3><p>${esc(s.quality)}</p></div>` : ''}
  </div>
</section>` : '';

  const faq = s.faqs && s.faqs.length ? `
<section class="sec cream faq">
  ${grid(false)}
  <div class="wrap">
    ${shead('— FAQs', `${esc(s.name)} Services <span>FAQ</span>`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="faqlist">${s.faqs.map((f) => `
      <details class="rv"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `
<section class="subhero">
  ${grid(false)}
  <div class="subhero-panel" aria-hidden="true"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <a href="${c.hub('services')}">Services</a> <span aria-hidden="true">/</span>
      <b>${esc(s.name)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <span class="ic big">${icon(s.slug)}</span>
        <h1>${esc(s.h1)}</h1>
        <p class="lede">${esc(s.subheroTagline)}</p>
        <div class="hero-acts">
          ${arrowBtn(c.url('contact'), 'Get in touch')}
          ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost')}
        </div>
      </div>
    </div>
  </div>
</section>

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="sec cream">
  ${grid(false)}
  <div class="wrap prose-wrap">
    <div class="prose rv">
      <h2>${esc(s.name)} Services by <span>${esc(c.site.name)}</span></h2>
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <div class="wcs">
      <h3>Why choose ${esc(c.site.name)}?</h3>
      <div class="wcgrid">${why}</div>
    </div>
  </div>
</section>
${scope}
${band(c, serviceShots(s.slug), '— On the job',
  `<span>${esc(s.name)}</span> Work We Have Photographed`,
  'Photographs from Quest jobs. Where a stage of this trade is not in the camera roll yet, '
  + 'the nearest one is, and the caption says what it shows.', 'sec cream alt')}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— How it runs', `Our Unique <span>${esc(s.name)}</span> Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="steps">${steps}</div>
  </div>
</section>
${faq}

<section class="cta">
  <div class="bars" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap cta-in">
    <div class="cta-copy">
      <h2>${esc(s.ctaHeading)}</h2>
      <p>${esc(s.ctaBody)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost')}
      </div>
    </div>
  </div>
</section>`;
}

/** Service-area page. d01 renders authored local copy; see content/areas-local.json. */
export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  // Quest photographs jobs, not towns, so the band below is honest about being
  // work from across the service area rather than from this city in particular.
  const ai = c.areas.areas.findIndex((x) => x.slug === a.slug);
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));
  const local = c.areasLocal[a.slug];

  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">Learn more <i aria-hidden="true">&#8599;</i></a>
      <span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </article>`).join('');

  const others = c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
    `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('');

  return `
<section class="subhero">
  ${grid(false)}
  <div class="subhero-panel" aria-hidden="true"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <a href="${c.hub('service-areas')}">Service Areas</a> <span aria-hidden="true">/</span>
      <b>${esc(a.name)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${fill(t.h1)}</h1>
        <p class="lede">${fill(t.tagline)}</p>
        <div class="hero-acts">
          ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn')}
          ${arrowBtn(c.url('contact'), 'Email us', 'btn ghost')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sec cream">
  ${grid(false)}
  <div class="wrap split">
    <div class="rv">
      <p class="mono eyebrow">— ${esc(a.name)}</p>
      <h2>Building in <span>${esc(a.city)}</span></h2>
      ${local.paras.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${arrowBtn(c.url('contact'), 'Talk to us about your project')}
    </div>
    <div class="localnotes rv">
      <h3>What that means on site</h3>
      <ul>${local.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
      <div class="localcall">
        <b>${esc(c.site.phoneDisplay)}</b>
        <span>${esc(c.site.availability)} &middot; ${esc(a.name)}</span>
      </div>
    </div>
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead(`— Serving ${esc(a.name)}`, fill(t.servicesHeading), fill(t.community))}
    <div class="svcs">${cards}</div>
  </div>
</section>

${band(c, areaShots(ai), '— Recent work',
  `Jobs Behind the <span>${esc(a.city)}</span> Crew`,
  `The same crew that answers a ${esc(a.city)} call ran these. Photographs are from Quest jobs `
  + 'across the service area, not staged, and not stock.', 'sec cream alt')}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Nearby', 'Other <span>Areas</span> We Serve', '')}
    <div class="arealinks rv">${others}</div>
  </div>
</section>

<section class="cta">
  <div class="bars" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap cta-in">
    <div class="cta-copy">
      <h2>${fill(t.ctaHeading)}</h2>
      <p>${fill(t.ctaBody)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost')}
      </div>
    </div>
  </div>
</section>`;
}

/** Shared inner-page hero for the pages that are not a service or an area.
    No eyebrow: the breadcrumb directly above already names the section, and
    printing "Contact / — Contact" two lines apart reads as a mistake. */
function pageHero(c, { h1, lede, crumb }) {
  return `
<section class="subhero">
  ${grid(false)}
  <div class="subhero-panel" aria-hidden="true"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <b>${esc(crumb)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${esc(h1)}</h1>
        <p class="lede">${esc(lede)}</p>
      </div>
    </div>
  </div>
</section>`;
}

const closingCta = (c, heading, body) => `
<section class="cta">
  <div class="bars" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap cta-in">
    <div class="cta-copy">
      <h2>${esc(heading)}</h2>
      <p>${esc(body)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost')}
      </div>
    </div>
  </div>
</section>`;

export function about(c) {
  const a = c.pages.about;
  return `${pageHero(c, {
    h1: a.h1, lede: a.lede, crumb: 'About Us',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap split">
    <div class="story-shot rv">${img(c, ...shot(STORY))}</div>
    <div class="rv">
      <p class="mono eyebrow">Our Story</p>
      <h2>${esc(a.storyHeading)}</h2>
      ${a.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${arrowBtn(c.url('projects'), 'See our work')}
    </div>
  </div>
</section>

${band(c, shots(
  'quest/story.webp', 'quest/framing-palms.webp', 'quest/roof-ridge.webp', 'quest/home-dusk.webp',
), '— The work itself', 'What a Quest <span>Job</span> Looks Like',
  'Framing, roof, finish. Photographs from our own sites.', 'sec cream alt')}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— What we do', 'Fourteen Trades, <span>One</span> Contractor',
      'Everything Quest offers, self-managed from first conversation through final walkthrough.')}
    <div class="arealinks light rv">${c.services.map((s) =>
      `<a href="${c.url(`services/${s.slug}`)}">${esc(s.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  return `${pageHero(c, {
    h1: g.h1, lede: g.lede, crumb: 'Gallery',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— From Quest projects', 'Every Photograph Here Is <span>Ours</span>',
      'Two jobs, start to finish: a slab-up addition on a Phoenix-area lot, and a custom home '
      + 'from framing through the last course of shingles.')}
    <div class="gal">${shots(...GALLERY).map(([f, alt]) =>
      `<figure class="rv">${img(c, f, alt)}</figure>`).join('')}</div>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${pageHero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Project Showcase',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    <div class="pjs">${p.items.map((it, i) => `
      <article class="pjcard rv">
        <div class="pjshot">${img(c, ...shot(PROJECT_SHOTS[i % PROJECT_SHOTS.length]))}</div>
        <div class="pjbody">
          <span class="n mono">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(it.title)}</h3>
          <p>${esc(it.body)}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

${band(c, shots(
  'quest/slab-poured.webp', 'quest/framing-long-wall.webp', 'quest/framing-header.webp',
  'quest/deck-joists.webp', 'quest/roof-desert.webp', 'quest/gable-window.webp',
), '— More from the same jobs', 'Detail <span>Shots</span>',
  'The stages that do not get a card of their own.', 'sec cream alt')}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Related', 'Services <span>Behind</span> This Work',
      'Every showcase above draws on the same trades, run by the same team.')}
    <div class="arealinks light rv">${c.services.slice(0, 6).map((s) =>
      `<a href="${c.url(`services/${s.slug}`)}">${esc(s.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  // A lead form that the browser cannot autofill loses submissions, and a
  // placeholder repeating its own label tells the visitor nothing. Keyed by
  // field name so the content file stays about words rather than attributes.
  const HINT = {
    name: { autocomplete: 'name', placeholder: 'First and last name' },
    email: { autocomplete: 'email', inputmode: 'email', placeholder: 'you@example.com' },
    phone: { autocomplete: 'tel', inputmode: 'tel', placeholder: 'Best number to reach you' },
    message: { placeholder: 'What are you looking to build?…' },
  };
  const attrs = (f) => {
    const h = HINT[f.name] || {};
    return [
      h.autocomplete ? ` autocomplete="${h.autocomplete}"` : '',
      h.inputmode ? ` inputmode="${h.inputmode}"` : '',
      ` placeholder="${esc(h.placeholder || f.label)}"`,
    ].join('');
  };

  const field = (f) => f.type === 'textarea'
    ? `<label>${esc(f.label)}<textarea name="${f.name}" rows="5"${attrs(f)}></textarea></label>`
    : `<label>${esc(f.label)}<input name="${f.name}" type="${f.type}"${attrs(f)}></label>`;

  return `${pageHero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Contact',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap contact-grid">
    <form class="contact-form rv" novalidate>
      <h2>${esc(p.formHeading)}</h2>
      ${p.fields.map(field).join('')}
      <button class="btn acc" type="submit"><span class="pip"></span>Submit</button>
      <p class="form-note mono" role="status" aria-live="polite"></p>
    </form>
    <aside class="help-card rv">
      <h2>${esc(p.helpHeading)}</h2>
      <p class="mono eyebrow">Phone — ${esc(c.site.availability)}</p>
      <a class="phone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <p>${esc(c.site.footerBlurb)}</p>
      <div class="help-shot">${img(c, ...shot(CONTACT))}</div>
    </aside>
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Where we work', 'Serving <span>Eleven</span> Arizona Cities', '')}
    <div class="arealinks light rv">${c.areas.areas.map((a) =>
      `<a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.name)}</a>`).join('')}</div>
  </div>
</section>`;
}

// ------------------------------------------------------- section landing pages
// Only the standalone site carries these: /services/ and /service-areas/ are
// the two URLs a visitor types by truncating, and the two pages an answer
// engine wants when it is asked what a contractor does and where.

/** First sentence of a paragraph, for a card blurb. */
const firstSentence = (s) => {
  const m = /^[\s\S]*?[.!?](?=\s|$)/.exec(String(s).trim());
  return (m ? m[0] : String(s)).trim();
};

export function serviceIndex(c) {
  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">View details <i aria-hidden="true">&#8599;</i></a>
      <span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </article>`).join('');

  return `${pageHero(c, {
    h1: 'Construction Services in Arizona',
    lede: `${c.services.length} trades, one contractor, ${c.site.availability} on the phone. `
      + 'Everything below is self-managed by Quest — no brokered subcontractor chain.',
    crumb: 'Services',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap prose-wrap">
    <div class="prose rv">
      <h2>One contractor for the <span>whole</span> job</h2>
      <p>Quest Construction has built and remodelled Arizona homes since ${c.site.foundingYear}.
        The ${c.services.length} services below cover a project end to end — the structure that
        gets built, the shell that closes it in, and the finishes that make it a home — so a
        single team carries the job from first conversation through final walkthrough.</p>
      <p>Every service runs the same four-stage process, and every one is available across the
        ${c.areas.areas.length} Arizona cities we serve. Call
        <a class="acc" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a> to talk one
        through, or start with the trade you already know you need.</p>
    </div>
    <div class="wcs">
      <h3>Where to start</h3>
      <div class="wcgrid">
        <div class="wc rv"><span class="n" aria-hidden="true">01</span>
          <p>Building new? Start with custom home building, residential development or framing.</p></div>
        <div class="wc rv"><span class="n" aria-hidden="true">02</span>
          <p>Adding space? Casitas and ADUs are their own permitting track — we run both.</p></div>
        <div class="wc rv"><span class="n" aria-hidden="true">03</span>
          <p>Reworking what is there? Full remodel covers kitchens, baths, cabinets, floors and tops.</p></div>
        <div class="wc rv"><span class="n" aria-hidden="true">04</span>
          <p>Protecting the shell? Roofing, stucco, siding and windows are the exterior envelope.</p></div>
      </div>
    </div>
  </div>
</section>

${band(c, shots(
  'quest/framing-clouds.webp', 'quest/slab-poured.webp',
  'quest/roof-shingles.webp', 'quest/home-windows.webp',
), '— The trades in practice', 'Structure, <span>Shell</span>, Finish',
  'Four stages of a Quest job, in that order.', 'sec cream alt')}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— Every trade', `All <span>${c.services.length}</span> Services`,
      'Each page carries the scope, the process and the questions we get asked most.')}
    <div class="svcs">${cards}</div>
  </div>
</section>

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Where we work', 'Available in <span>Every</span> City We Serve', '')}
    <div class="arealinks rv">${c.areas.areas.map((a) =>
      `<a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function areaIndex(c) {
  const cards = c.areas.areas.map((a) => {
    const local = c.areasLocal[a.slug];
    return `
    <a class="sc citycard rv" href="${c.url(`service-areas/${a.slug}`)}">
      <h3>${esc(a.name)}</h3>
      <p>${esc(firstSentence(local.paras[0]))}</p>
      <span class="go">Building in ${esc(a.city)} <i aria-hidden="true">&#8599;</i></span>
    </a>`;
  }).join('');

  return `${pageHero(c, {
    h1: 'Service Areas Across Arizona',
    lede: `Quest Construction builds in ${c.areas.areas.length} Arizona cities. Each one permits `
      + 'differently and each one has its own housing stock — the pages below say how.',
    crumb: 'Service Areas',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Eleven cities', 'Where <span>Quest</span> Builds',
      'One crew, one licence, one phone number across the East Valley, Phoenix and Pinal County.')}
    <div class="scope scope--3">${cards}</div>
  </div>
</section>

${band(c, shots(
  'quest/framing-palms.webp', 'quest/custom-home-wide.webp',
  'quest/roof-desert.webp', 'quest/porch-dusk.webp',
), '— Across the valley', 'Arizona <span>Jobs</span>, Arizona Photographs',
  'Palms on one job, open desert on the next — both ours.', 'sec cream alt')}

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead('— In every city', 'The Same <span>Fourteen</span> Trades',
      `Everything Quest offers is available in all ${c.areas.areas.length} cities above.`)}
    <div class="arealinks light rv">${c.services.map((s) =>
      `<a href="${c.url(`services/${s.slug}`)}">${esc(s.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, 'Tell us where the job is',
  `${c.site.positioning} — reachable ${c.site.availability} on ${c.site.phoneDisplay}.`)}`;
}

export function sitemap(c) {
  const col = (title, items) => `<div class="rv">
  <h3>${esc(title)}</h3>
  <ul>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  return `${pageHero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap smap">
    ${col('Pages', [
      [c.url('home'), 'Home'],
      [c.url('about'), 'About Us'],
      [c.url('projects'), 'Project Showcase'],
      [c.url('gallery'), 'Gallery'],
      [c.url('contact'), 'Contact'],
      [c.url('sitemap'), 'Sitemap'],
    ])}
    ${col('Services', [
      ...(c.hubs ? [[c.url('services'), 'All Services']] : []),
      ...c.services.map((s) => [c.url(`services/${s.slug}`), s.name])])}
    ${col('Areas Served', [
      ...(c.hubs ? [[c.url('service-areas'), 'All Areas Served']] : []),
      ...c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name])])}
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
