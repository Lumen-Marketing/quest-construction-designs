// Direction 03 — Split Bay. Dark and deliberately flat: chamfered clip-path
// corners, no radius, a hard 90-degree grid, grayscale photography, accent on
// whole surfaces only. Services are an index of oversized rows; the process is
// a ruled timeline; the gallery is a chamfered bento.
import { img, preloadImage } from '../lib/images.mjs';
import { ALT, SAMPLER } from '../lib/photos.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd03-split-bay',
  name: 'Split Bay',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const eyebrow = (t) => `<p class="eyebrow mono">${esc(t)}</p>`;

const shead = (eye, heading, lede) => `<div class="shead rv">
  <div>${eye ? eyebrow(eye) : ''}<h2>${heading}</h2></div>
  ${lede ? `<p>${esc(lede)}</p>` : '<div></div>'}
</div>`;

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

const SHOTS = SAMPLER;


const QUEST = [
  ['quest/story.webp', 'Framing and structural work on a Quest Construction project'],
  ['quest/hero.webp', 'A Quest Construction home under construction'],
  ['quest/spare.webp', 'A finished interior with new windows on a Quest Construction project'],
];

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
  <a class="btn acc navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
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
  <div>
    <a class="brand fmark" href="${c.url('home')}">
      ${img(c, 'quest/logo.webp', c.site.name, {})}
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
  <p class="mono"><a href="${c.site.facebook}" target="_blank" rel="noreferrer">Facebook</a></p>
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
  var peek=document.querySelector('.peek'), rows=document.querySelectorAll('.row[data-shot]');
  if(!peek||!rows.length) return;
  var im=peek.querySelector('img');
  rows.forEach(function(r){
    r.addEventListener('mouseenter',function(){
      im.src=r.getAttribute('data-shot'); im.alt=r.getAttribute('data-alt')||''; peek.classList.add('on');
    });
    r.addEventListener('mouseleave',function(){peek.classList.remove('on')});
  });
  addEventListener('mousemove',function(e){
    peek.style.transform='translate('+e.clientX+'px,'+e.clientY+'px) translate(-50%,-50%)';
  },{passive:true});
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

// -------------------------------------------------------------- shared parts

/** Oversized index rows — 03's way of listing anything. */
const rowList = (c, items) => `
<div class="peek" aria-hidden="true">${img(c, 'quest/slab-poured.webp', '', { decorative: true })}</div>
<div class="rows">${items.map((s, i) => `
  <a class="row rv" href="${c.url(`services/${s.slug}`)}"
     data-shot="${c.asset(SHOTS[i % SHOTS.length])}" data-alt="${esc(ALT[SHOTS[i % SHOTS.length]])}">
    <span class="k">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(s.name)}</h3>
    <span class="tail"><span class="mono">${esc(s.shortDesc)}</span><span class="arw">&#8599;</span></span>
  </a>`).join('')}</div>`;

const closingCta = (c, heading, body) => `
<section class="cta">
  <div class="cta-bg" aria-hidden="true">${img(c, 'quest/framing-header.webp', ALT['quest/framing-header.webp'])}</div>
  <div class="wrap">
    <h2>${esc(heading)}</h2>
    <div class="side"><p>${esc(body)}</p>
      <div class="acts">${btn(c.url('contact'), 'Get in touch', 'btn acc')}
      ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}</div>
    </div>
  </div>
</section>`;

const pageHero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <div class="wrap">
    <nav class="crumbs mono" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">&rsaquo;</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">&rsaquo;</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <div class="subhero-in">
      <h1>${esc(h1)}</h1>
      <div>
        <p class="sub">${esc(lede)}</p>
        <div class="acts">${btn(c.url('contact'), 'Get in touch', 'btn acc')}
        ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}</div>
      </div>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  return `
<section class="hero">
  <div class="hero-l">
    <h1>${esc(h.heroTitle)}</h1>
    <p class="sub">${esc(h.heroBody)}</p>
    <div class="acts">
      ${btn(c.url('contact'), 'Get in touch', 'btn acc')}
      ${btn(c.site.phoneHref, 'Call us', 'btn ondark')}
    </div>
    <div class="hstats">
      <div><b>${c.site.foundingYear}</b><em>Building since</em></div>
      <div><b>${c.services.length}</b><em>Services</em></div>
      <div><b>${c.areas.areas.length}</b><em>Arizona cities</em></div>
      <div><b>${esc(c.site.availability)}</b><em>Reach us</em></div>
    </div>
  </div>
  <div class="hero-r">${img(c, 'quest/hero.webp', 'A Quest Construction project in Arizona', { eager: true })}</div>
</section>

<section class="stmt">
  <div class="wrap">
    <p>${esc(h.storyHeading)} &mdash; <span>${esc(c.site.positioning)}</span></p>
    <div class="meta mono">
      <span>${esc(h.storyEyebrow)}</span>
      <span>${esc(c.site.availability)}</span>
      <span>${esc(c.site.phoneDisplay)}</span>
    </div>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    ${shead('What we do', `Our Expert <span>Construction</span> Services`,
      'Fourteen trades, one contractor. Hover a row to see the work.')}
    ${rowList(c, c.services)}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('Our story', 'Founded on <span>Craftsmanship</span>', '')}
    <div class="split2">
      <div class="vid rv">
        ${img(c, 'quest/story.webp', 'A Quest Construction project under way')}
        <span class="cap mono">${esc(h.storyEyebrow)}</span>
      </div>
      <div class="rv">
        ${h.story.map((p) => `<p class="big">${esc(p)}</p>`).join('')}
        ${btn(c.url('about'), 'Learn more', 'btn acc')}
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('Offers', 'Exclusive Offers <span>Just For You</span>', '')}
    <div class="offer2">${c.site.offers.map((o) => `
      <div class="oc rv">
        <b>${esc(o.amount)}</b>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.body)}</p>
        <button class="btn acc" type="button" data-copy="${esc(o.code)}">GET CODE</button>
      </div>`).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('Selected work', `${esc(c.pages.projects.h1)}`, c.pages.projects.lede)}
    <div class="bento">${c.pages.projects.items.map((p, i) => `
      <a class="tile ${i === 0 ? 'wide' : ''} rv" href="${c.url('projects')}">
        ${img(c, QUEST[i % 3][0], p.alt || p.title)}
        <span class="lbl"><b>${esc(p.title)}</b><span>${esc(p.body)}</span></span>
      </a>`).join('')}</div>
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

  // Flat 2x2 blocks — 03's why-choose treatment.
  const why = s.whyChoose.map((w, i) => `
    <div class="blk rv"><span class="k mono">${String(i + 1).padStart(2, '0')}</span><p>${esc(w)}</p></div>`).join('');

  // Chamfered plates — 03's process treatment.
  const steps = s.process.map((p) => `
    <div class="plate3 rv"><span class="k mono">Stage ${p.n}</span>
      <h4>${esc(p.title)}</h4><p>${esc(p.body)}</p></div>`).join('');

  const scope = s.scope && s.scope.length ? `
<section class="sec">
  <div class="wrap">
    ${shead('Scope', `Complete Range of <span>${esc(s.name)}</span> Services`, '')}
    <div class="blocks">${s.scope.map((x) => `
      <div class="blk rv"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join('')}</div>
    ${s.quality ? `<div class="qbar rv"><h3>Quality Assurance</h3><p>${esc(s.quality)}</p></div>` : ''}
  </div>
</section>` : '';

  // Chamfered toggles — 03's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="sec">
  <div class="wrap">
    ${shead('FAQs', `${esc(s.name)} Services <span>FAQ</span>`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="chamf">${s.faqs.map((f) => `
      <details class="rv"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${pageHero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="sec">
  <div class="wrap split2">
    <div class="rv">
      <h2 class="mid">${esc(s.name)} Services by <span>${esc(c.site.name)}</span></h2>
      ${s.intro.map((p) => `<p class="big">${esc(p)}</p>`).join('')}
    </div>
    <div>
      ${eyebrow('Why choose Quest')}
      <div class="blocks two">${why}</div>
    </div>
  </div>
</section>
${scope}

<section class="stmt">
  <div class="wrap">
    ${eyebrow('How it runs')}
    <p>Our Unique ${esc(s.name)} <span>Service Process</span></p>
    <div class="plates">${steps}</div>
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

<section class="stmt">
  <div class="wrap">
    ${eyebrow(a.name)}
    <p>${fill(t.communityHeading)}</p>
    <div class="meta mono">
      <span>${esc(c.site.phoneDisplay)}</span>
      <span>${esc(c.site.availability)}</span>
      <span>Since ${c.site.foundingYear}</span>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split2">
    <div class="rv">
      <p class="big">${fill(t.community)}</p>
      <p class="big">${fill(t.local)}</p>
      <p class="big">${fill(t.commitment)}</p>
      ${btn(c.url('contact'), 'Talk to us', 'btn acc')}
    </div>
    <div>
      ${eyebrow('On site')}
      <div class="blocks">${t.capabilities.map((cap, i) => `
        <div class="blk rv"><span class="k mono">${String(i + 1).padStart(2, '0')}</span>
          <p>${esc(cap)}</p></div>`).join('')}</div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead(`Serving ${a.name}`, fill(t.servicesHeading), '')}
    ${rowList(c, c.services)}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('Nearby', 'Other <span>Areas</span> We Serve', '')}
    <div class="flat rv">${c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
      `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('')}</div>
  </div>
</section>

${closingCta(c, fill(t.ctaHeading), fill(t.ctaBody))}`;
}

export function about(c) {
  const a = c.pages.about;
  return `${pageHero(c, { h1: a.h1, lede: a.lede, crumb: 'About Us' })}

<section class="stmt">
  <div class="wrap">
    ${eyebrow('Our story')}
    <p>${esc(a.storyHeading)} &mdash; <span>since ${c.site.foundingYear}</span></p>
  </div>
</section>

<section class="sec">
  <div class="wrap split2">
    <div class="vid rv">
      ${img(c, 'quest/story.webp', 'A Quest Construction project under way')}
      <span class="cap mono">Quest Construction</span>
    </div>
    <div class="rv">
      ${a.story.map((p) => `<p class="big">${esc(p)}</p>`).join('')}
      ${btn(c.url('projects'), 'See our work', 'btn acc')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('What we do', 'Fourteen Trades, <span>One</span> Contractor', '')}
    ${rowList(c, c.services)}
  </div>
</section>

${closingCta(c, 'Build with a team that answers the phone',
  `${c.site.positioning} — reachable ${c.site.availability}.`)}`;
}

export function gallery(c) {
  const g = c.pages.gallery;
  return `${pageHero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="sec">
  <div class="wrap">
    ${shead('From Quest projects', 'Work <span>We</span> Have Photographed', '')}
    <div class="bento">${QUEST.map(([f, alt], i) => `
      <figure class="tile ${i === 0 ? 'wide' : ''} rv">${img(c, f, alt)}
        <span class="lbl"><b>${esc(alt)}</b></span></figure>`).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${shead('Placeholder photography', 'The <span>Trades</span> We Run',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="bento">${SHOTS.map((f, i) => `
      <figure class="tile ${i % 5 === 0 ? 'tall' : ''} rv">${img(c, f, ALT[f])}
        <span class="lbl"><b>${esc(ALT[f])}</b></span></figure>`).join('')}</div>
    <p class="mono note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  // Split-bay pairs — 03's projects treatment.
  const bays = p.items.map((it, i) => `
    <article class="bay rv">
      <div class="bay-l">
        <span class="k mono">Project ${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.body)}</p>
      </div>
      <div class="bay-r">${img(c, QUEST[i % 3][0], it.alt || it.title)}</div>
    </article>`).join('');

  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="sec"><div class="wrap"><div class="bays">${bays}</div></div></section>

<section class="sec">
  <div class="wrap">
    ${shead('Related', 'Services <span>Behind</span> This Work', '')}
    ${rowList(c, c.services.slice(0, 6))}
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function contact(c) {
  const p = c.pages.contact;
  const field = (f) => f.type === 'textarea'
    ? `<label>${esc(f.label)}<textarea name="${f.name}" rows="5" placeholder="${esc(f.label)}"></textarea></label>`
    : `<label>${esc(f.label)}<input name="${f.name}" type="${f.type}" placeholder="${esc(f.label)}"></label>`;

  return `${pageHero(c, { h1: p.h1, lede: p.lede, crumb: 'Contact' })}

<section class="sec">
  <div class="wrap split2">
    <form class="contact-form rv" novalidate>
      <h2 class="mid">${esc(p.formHeading)}</h2>
      ${p.fields.map(field).join('')}
      <button class="btn acc" type="submit">Submit</button>
      <p class="form-note mono" role="status" aria-live="polite"></p>
    </form>
    <aside class="rv">
      ${eyebrow('Direct')}
      <a class="bigphone" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
      <div class="blocks">
        <div class="blk"><span class="k mono">Hours</span><p>${esc(c.site.availability)}</p></div>
        <div class="blk"><span class="k mono">Since</span><p>${c.site.foundingYear}</p></div>
        <div class="blk"><span class="k mono">Areas</span><p>${c.areas.areas.length} Arizona cities</p></div>
        <div class="blk"><span class="k mono">Services</span><p>${c.services.length} trades</p></div>
      </div>
      <div class="vid rv">${img(c, 'quest/custom-home-gables.webp', 'A Quest Construction project in Arizona')}</div>
    </aside>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  // Flat ruled columns — 03's sitemap treatment.
  const col = (title, items) => `<div class="rv">
  ${eyebrow(title)}
  <ul class="ruled">${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  return `${pageHero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="sec">
  <div class="wrap cols3">
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
