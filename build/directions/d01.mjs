// Direction 01 — Site Plan. Layered and editorial: a faint engineering grid on
// cream, a hard-edged accent plane, a frameless cut-out machine straddling the
// boundary, and a floating badge card over the lot. Pill buttons, generous
// radii, soft layered shadows.
import { img, preloadImage } from '../lib/images.mjs';
import { icon } from '../lib/icons.mjs';

export const meta = {
  slug: 'd01-site-plan',
  name: 'Site Plan',
  indexable: true,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'excavator.webp') : ''),
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

/** Layered dropdown nav — the mockup was anchor-only, so this is new furniture. */
export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');
  return `<header class="nav">
<div class="wrap">
  <a class="brand" href="${c.url('home')}" aria-label="${esc(c.site.name)} home">
    <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
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
      <button type="button" aria-expanded="false">Areas Served</button>
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
  <ul>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  return `<footer>
<div class="wrap fg">
  <div class="about">
    <a class="brand" href="${c.url('home')}">
      <img src="${c.asset('quest/logo.webp')}" alt="${esc(c.site.name)}" width="1261" height="285">
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
  ${col('Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
  ${col('Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
</div>
<div class="wrap fbar">
  <p class="mono">&copy; 2026 ${esc(c.site.name)} &middot; Since ${c.site.foundingYear}</p>
  <p class="mono"><a href="${c.site.instagram}" target="_blank" rel="noreferrer">Instagram</a></p>
</div>
</footer>`;
}

/** Accent swap, nav toggle, offer-code copy, static-form notice, scroll reveals. */
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
  var t=document.querySelector('.navtoggle'), n=document.querySelector('.nav nav');
  if(t&&n){t.addEventListener('click',function(){
    var o=n.classList.toggle('open'); t.setAttribute('aria-expanded',String(o));
    t.classList.toggle('on',o);
  });}
  document.querySelectorAll('.drop>button').forEach(function(b){
    b.addEventListener('click',function(e){
      e.preventDefault();
      var d=b.parentNode, o=d.classList.toggle('open');
      b.setAttribute('aria-expanded',String(o));
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

// ---------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;

  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">View details <i>&#8599;</i></a>
      <span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </article>`).join('');

  const offers = c.site.offers.map((o) => `
    <div class="offer rv">
      <b>${esc(o.amount)}</b>
      <h3>${esc(o.title)}</h3>
      <p>${esc(o.body)}</p>
      <button class="btn acc" type="button" data-copy="${esc(o.code)}">GET CODE</button>
    </div>`).join('');

  const shots = ['quest/hero.webp', 'framing.webp', 'crew-slab.webp'];
  const work = c.pages.projects.items.map((p, i) => `
    <a class="pj ${'abc'[i]} rv" href="${c.url('projects')}">
      ${img(c, shots[i % shots.length], p.alt || p.title)}
      <span class="cap"><span><b>${esc(p.title)}</b><span>${esc(p.body)}</span></span>
      <span class="go">&#8599;</span></span>
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
  ${img(c, 'excavator.webp', 'A tracked excavator on a Quest Construction site', { cls: 'machine', eager: true })}
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
    <div class="story-shot rv">${img(c, 'quest/story.webp', 'A Quest Construction project under way')}</div>
    <div class="rv">
      <p class="mono eyebrow">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)}</h2>
      ${h.story.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${arrowBtn(c.url('about'), 'Learn more')}
    </div>
  </div>
</section>

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
      <a href="${c.url('sitemap')}">Services</a> <span aria-hidden="true">/</span>
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
  const fill = (s) => esc(String(s).replace(/\{\{city\}\}/g, a.city));
  const local = c.areasLocal[a.slug];

  const cards = c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">Learn more <i>&#8599;</i></a>
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
      <a href="${c.url('sitemap')}">Service Areas</a> <span aria-hidden="true">/</span>
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

export const about = () => '';
export const gallery = () => '';
export const projects = () => '';
export const contact = () => '';
export const sitemap = () => '';
