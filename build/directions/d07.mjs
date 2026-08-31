// Direction 07 — Bid Desk. Clean white utility. Bordered cards, generous
// radius, one soft organic silhouette per section, and everything pointing at
// the estimate. The most conversion-shaped of the ten: the deskbar that
// straddles the hero on the homepage becomes the contact form itself.
import { img, preloadImage } from '../lib/images.mjs';
import { ALT, SAMPLER } from '../lib/photos.mjs';
import { icon } from '../lib/icons.mjs';
import { scriptMap } from '../lib/palette.mjs';

export const meta = {
  slug: 'd07-bid-desk',
  name: 'Bid Desk',
  indexable: false,
  fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">`,
  preload: (c) => (c.page.kind === 'home' ? preloadImage(c, 'quest/hero.webp') : ''),
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const btn = (href, label, cls = 'btn') => `<a class="${cls}" href="${href}">${esc(label)}</a>`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`;
const TICK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M4 12.5 9.5 18 20 6.5"/></svg>`;

const SHOTS = SAMPLER;


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
    ${img(c, 'quest/logo.webp', c.site.name, { load: 'eager' })}
  </a>
  <a class="search" href="${c.url('sitemap')}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <span>Find a trade or an area</span>
  </a>
  <nav class="nlinks">
    <div class="drop">
      <button type="button" aria-expanded="false">Services</button>
      <div class="menu"><div class="mcols">${col(
        c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}</div></div>
    </div>
    <div class="drop">
      <button type="button" aria-expanded="false">Areas</button>
      <div class="menu"><div class="mcols">${col(
        c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}</div></div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
  </nav>
  <a class="btn acc navcta" href="${c.url('contact')}">Get an estimate</a>
  <a class="btn line navtel" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
  <button class="burger" type="button" aria-label="Toggle navigation" aria-expanded="false"><span></span></button>
</div>
</header>`;
}

export function footer(c) {
  const col = (title, items) => `<div>
  <h5>${esc(title)}</h5>
  <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
</div>`;
  return `<footer>
<span class="plane" aria-hidden="true"></span>
<div class="wrap in">
  <div class="cols">
    <div>
      <a class="brand" href="${c.url('home')}">
        ${img(c, 'quest/logo.webp', c.site.name, {})}
      </a>
      <p class="lead">${esc(c.site.footerBlurb)}</p>
      <p class="mono flift">${esc(c.site.positioning)}</p>
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
  <div class="bar">
    <span>&copy; 2026 ${esc(c.site.name)} — building since ${c.site.foundingYear}</span>
    <span><a href="${c.site.facebook}" target="_blank" rel="noreferrer">Facebook</a></span>
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

/** The four real figures, as bordered blob bubbles. */
const bubbles = (c) => `<div class="facts rv">
  <div class="bub"><div><b>${c.site.foundingYear}</b><span>Building since</span></div></div>
  <div class="bub"><div><b>${c.services.length}</b><span>Trades offered</span></div></div>
  <div class="bub"><div><b>${c.areas.areas.length}</b><span>AZ cities</span></div></div>
  <div class="bub"><div><b>${esc(c.site.availability)}</b><span>Reachable</span></div></div>
</div>`;

/** The fourteen trades as bordered utility cards. */
const trades = (c) => `<div class="trades">${c.services.map((s, i) => `
  <a class="trade rv" href="${c.url(`services/${s.slug}`)}" style="--d:${(i % 4) * 0.04}s">
    <span class="ic">${icon(s.slug)}</span>
    <div><h3>${esc(s.name)}</h3><p>${esc(s.shortDesc)}</p></div>
    <span class="go">${ARROW}</span>
  </a>`).join('')}</div>`;

/** The closing lead magnet — the utility card, form replaced by real actions. */
const closing = (c, heading, body) => `
<section class="magnet">
  <div class="wrap">
    <div class="box rv">
      <div class="txt">
        <p class="mono">Next step</p>
        <h2>${esc(heading)}</h2>
        <p>${esc(body)}</p>
        <div class="acts">
          <a class="btn acc" href="${c.url('contact')}">Get an estimate ${ARROW}</a>
          ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
        </div>
        <p class="fine">Reachable ${esc(c.site.availability)}. ${esc(c.site.positioning)}.</p>
      </div>
      <div class="toc">
        <h3>What happens next</h3>
        <ol>
          <li><span class="n">1</span><div><b>You call or send a message</b>
            <span>Tell us the scope, the site and roughly when you want to start.</span></div></li>
          <li><span class="n">2</span><div><b>We walk the job</b>
            <span>We look at the work in person before anything is priced.</span></div></li>
          <li><span class="n">3</span><div><b>You get a written estimate</b>
            <span>Itemised, with the sequence of trades and who runs each one.</span></div></li>
        </ol>
        <div class="foot"><span>${esc(c.site.availability)}</span><span>${esc(c.site.phoneDisplay)}</span></div>
      </div>
    </div>
  </div>
</section>`;

const subhero = (c, { h1, lede, crumb, trail }) => `
<section class="subhero">
  <div class="wrap">
    <nav class="crumbs mono" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      ${trail ? `<a href="${c.url('sitemap')}">${esc(trail)}</a> <span aria-hidden="true">/</span>` : ''}
      <b>${esc(crumb)}</b>
    </nav>
    <div class="sh">
      <h1>${esc(h1)}</h1>
      <div class="shr">
        <p class="lede">${esc(lede)}</p>
        <div class="acts">
          <a class="btn acc" href="${c.url('contact')}">Get an estimate ${ARROW}</a>
          ${btn(c.site.phoneHref, c.site.phoneDisplay, 'btn line')}
        </div>
      </div>
    </div>
  </div>
</section>`;

// -------------------------------------------------------------- page bodies

export function home(c) {
  const h = c.pages.home;
  return `
<section class="hero">
  <div class="wrap">
    <div class="stage">
      <div class="shot">
        ${img(c, 'quest/hero.webp', 'A Quest Construction home under construction', { eager: true })}
        <div class="copy">
          <span class="tagpill"><i></i><span>${esc(c.site.positioning)}</span></span>
          <h1>${esc(h.heroTitle.replace(/^Quest Construction:\s*/, ''))}</h1>
          <p class="sub">${esc(h.heroBody)}</p>
        </div>
      </div>
      <div class="deskbar">
        <div class="f"><h4>Trade</h4><p>Any of ${c.services.length} ${ARROW}</p></div>
        <div class="f"><h4>Where</h4><p>${c.areas.areas.length} AZ cities ${ARROW}</p></div>
        <div class="f"><h4>Building since</h4><p>${c.site.foundingYear}</p></div>
        <div class="f"><h4>Availability</h4><p>${esc(c.site.availability)}</p></div>
        <a class="go" href="${c.url('contact')}">Get an estimate ${ARROW}</a>
      </div>
    </div>
  </div>
</section>

<section class="proof">
  <div class="wrap in">
    <span class="pillbox"><b>${c.site.foundingYear}</b><span class="mute">building since</span></span>
    <span class="pillbox"><b>${c.services.length}</b><span class="mute">trades, self-managed</span></span>
    <span class="pillbox"><b>${c.areas.areas.length}</b><span class="mute">Arizona cities served</span></span>
    <span class="pillbox"><b>${esc(c.site.availability)}</b><span class="mute">${esc(c.site.phoneDisplay)}</span></span>
  </div>
</section>

<section class="about">
  <div class="wrap in">
    <div class="rv">
      <p class="mono">${esc(h.storyEyebrow)}</p>
      <h2>${esc(h.storyHeading)} — <em>since ${c.site.foundingYear}</em></h2>
      ${h.story.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${bubbles(c)}
      ${btn(c.url('about'), 'Read our story', 'btn line')}
    </div>
    <div class="cluster rv">
      <figure class="c1">${img(c, QUEST[0][0], QUEST[0][1])}</figure>
      <figure class="c2">${img(c, QUEST[1][0], QUEST[1][1])}</figure>
      <figure class="c3">${img(c, QUEST[2][0], QUEST[2][1])}</figure>
      <div class="note"><b>${esc(c.site.tagline)}</b>
        <span>Planning through final walkthrough, run by one team.</span></div>
    </div>
  </div>
</section>

<section class="offers">
  <div class="wrap">
    ${top('Standing offers', 'Exclusive Offers Just For You',
      'Two standing offers, applied at estimate. Ask for the code when you call.')}
    <div class="grid3">
      ${c.site.offers.map((o, i) => `
      <div class="ocard rv">
        <div class="ph">${img(c, i === 0 ? 'quest/spare.webp' : 'quest/home-windows.webp',
          i === 0 ? ALT['quest/spare.webp'] : ALT['quest/home-windows.webp'])}
          <span class="slot"><i></i>${esc(o.amount)} off</span></div>
        <div class="bd">
          <h3>${esc(o.title)}</h3>
          <p class="where">Code ${esc(o.code)}</p>
          <p>${esc(o.body)}</p>
          <button class="btn acc" type="button" data-copy="${esc(o.code)}">Get code ${esc(o.code)}</button>
        </div>
      </div>`).join('')}
      <div class="ocard rv">
        <div class="ph">${img(c, 'quest/custom-home-wide.webp', ALT['quest/custom-home-wide.webp'])}
          <span class="slot"><i></i>Where we work</span></div>
        <div class="bd">
          <h3>Across the valley</h3>
          <p class="where">${c.areas.areas.length} Arizona cities</p>
          <p>From Phoenix out to Florence, the same crews and the same schedule discipline on every job.</p>
          ${btn(c.url('sitemap'), 'See every area', 'btn line')}
        </div>
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
        <div class="hd"><div><h3>${esc(p.title)}</h3>
          <p class="where mono">Arizona</p></div>
          <span class="badge">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="ph">${img(c, QUEST[i % QUEST.length][0], p.alt || p.title)}</div>
        <div class="rows"><div><h5>Scope</h5><p>${esc(p.title)}</p></div>
          <div><h5>Run by</h5><p>${esc(c.site.name)}</p></div>
          <div><h5>Since</h5><p>${c.site.foundingYear}</p></div></div>
      </a>`).join('')}
    </div>
    <div class="more">${btn(c.url('projects'), 'See the showcase', 'btn line')}</div>
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
    <div class="specrows rv">${s.scope.map((x, i) => `
      <div class="specrow"><span class="n">${String(i + 1).padStart(2, '0')}</span>
        <div><h3>${esc(x.title)}</h3>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div></div>`).join('')}</div>
  </div>
</section>` : '';

  // Plain utility accordion — 07's FAQ treatment.
  const faq = s.faqs && s.faqs.length ? `
<section class="content">
  <div class="wrap">
    ${top('Questions', `${esc(s.name)} Services FAQ`,
      `Addressing your ${s.name.toLowerCase()} questions and concerns.`)}
    <div class="uacc rv">${s.faqs.map((f) => `
      <details><summary>${esc(f.q)}<span class="pm" aria-hidden="true"></span></summary>
        <p>${esc(f.a)}</p></details>`).join('')}</div>
  </div>
</section>` : '';

  return `${subhero(c, { h1: s.h1, lede: s.subheroTagline, crumb: s.name, trail: 'Services' })}

<nav class="filters svctabs" aria-label="All services"><div class="wrap">${tabs}</div></nav>

<section class="about">
  <div class="wrap in">
    <div class="rv">
      <p class="mono">Overview</p>
      <h2>${esc(s.name)} by <em>${esc(c.site.name)}</em></h2>
      ${s.intro.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${btn(c.url('contact'), 'Get an estimate', 'btn acc')}
    </div>
    <div class="checklist rv">
      <h3 class="mono">Why choose ${esc(c.site.name)}?</h3>
      <ul>${s.whyChoose.map((w) => `<li><span class="tk">${TICK}</span>${esc(w)}</li>`).join('')}</ul>
      <div class="foot"><span>${esc(c.site.availability)}</span><span>${esc(c.site.phoneDisplay)}</span></div>
    </div>
  </div>
</section>
${scope}

<section class="content">
  <div class="wrap">
    ${top('How it runs', `Our Unique ${esc(s.name)} Service Process`,
      'Four stages, the same on every job, so you always know what happens next.')}
    <div class="rail">${s.process.map((p) => `
      <div class="spec rv" style="--d:${(p.n - 1) * 0.05}s">
        <div class="hd"><span class="n">${String(p.n).padStart(2, '0')}</span>
          <span class="badge">Stage ${p.n} of ${s.process.length}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
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
  <div class="wrap in">
    <span class="pillbox"><b>${esc(a.name)}</b><span class="mute">served since ${c.site.foundingYear}</span></span>
    <span class="pillbox"><b>${c.services.length}</b><span class="mute">trades available</span></span>
    <span class="pillbox"><b>${esc(c.site.availability)}</b><span class="mute">${esc(c.site.phoneDisplay)}</span></span>
  </div>
</section>

<section class="about">
  <div class="wrap in">
    <div class="rv">
      <p class="mono">The area</p>
      <h2>${fill(t.communityHeading)}</h2>
      <p class="lede">${fill(t.community)}</p>
      <p class="lede">${fill(t.local)}</p>
      <p class="lede">${fill(t.commitment)}</p>
      ${bubbles(c)}
      ${btn(c.url('contact'), `Talk to us about ${a.city}`, 'btn acc')}
    </div>
    <div class="checklist rv">
      <h3 class="mono">What we run in ${esc(a.city)}</h3>
      <ul>${t.capabilities.map((cap) => `<li><span class="tk">${TICK}</span>${esc(cap)}</li>`).join('')}</ul>
      <div class="foot"><span>${esc(a.name)}</span><span>${esc(c.site.phoneDisplay)}</span></div>
    </div>
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

<section class="about">
  <div class="wrap in">
    <div class="rv">
      <p class="mono">${esc(a.storyHeading)}</p>
      <h2>Built on <em>craftsmanship, integrity and trust</em></h2>
      ${a.story.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
      ${bubbles(c)}
      ${btn(c.url('projects'), 'See our work', 'btn line')}
    </div>
    <div class="cluster rv">
      <figure class="c1">${img(c, QUEST[1][0], QUEST[1][1])}</figure>
      <figure class="c2">${img(c, QUEST[2][0], QUEST[2][1])}</figure>
      <figure class="c3">${img(c, QUEST[0][0], QUEST[0][1])}</figure>
      <div class="note"><b>Since ${c.site.foundingYear}</b>
        <span>${esc(c.site.positioning)}.</span></div>
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
  const tile = (f, alt, i) => `<figure class="gt rv" style="--d:${(i % 4) * 0.04}s">
    <span class="ph">${img(c, f, alt)}</span>
    <figcaption><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(alt)}</span></figcaption>
  </figure>`;

  return `${subhero(c, { h1: g.h1, lede: g.lede, crumb: 'Gallery' })}

<section class="content">
  <div class="wrap">
    ${top('From Quest projects', 'Work We Have Photographed', '')}
    <div class="ugrid">${QUEST.map(([f, alt], i) => tile(f, alt, i)).join('')}</div>
  </div>
</section>

<section class="content">
  <div class="wrap">
    ${top('The trades we run', 'Placeholder Photography',
      'Stock photography stands in below until Quest supplies jobsite photographs of its own.')}
    <div class="ugrid">${SHOTS.map((f, i) => tile(f, ALT[f], i)).join('')}</div>
    <p class="mono note">Placeholder photography — to be replaced with Quest Construction jobsite photographs.</p>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${subhero(c, { h1: p.h1, lede: p.lede, crumb: 'Project Showcase' })}

<section class="content">
  <div class="wrap">
    ${top('Index', 'Selected Work', '')}
    <div class="work">${p.items.map((it, i) => `
      <article class="wcard rv" style="--d:${i * 0.05}s">
        <div class="hd"><div><h3>${esc(it.title)}</h3>
          <p class="where mono">Arizona</p></div>
          <span class="badge">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="ph">${img(c, QUEST[i % QUEST.length][0], it.alt || it.title)}</div>
        <div class="bdy"><p>${esc(it.body)}</p>
          <a class="btn line" href="${c.url('contact')}">Start something like it</a></div>
        <div class="rows"><div><h5>Run by</h5><p>${esc(c.site.name)}</p></div>
          <div><h5>Since</h5><p>${c.site.foundingYear}</p></div>
          <div><h5>Reach us</h5><p>${esc(c.site.availability)}</p></div></div>
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

<section class="content">
  <div class="wrap">
    <form class="contact-form deskform rv" novalidate>
      <div class="dhead">
        <p class="mono">${esc(p.helpHeading)}</p>
        <h2>${esc(p.formHeading)}</h2>
      </div>
      <div class="dfields">${p.fields.map(field).join('')}</div>
      <div class="dgo">
        <button class="btn acc" type="submit">Send it ${ARROW}</button>
        <a class="btn line" href="${c.site.phoneHref}">Call ${esc(c.site.phoneDisplay)}</a>
        <p class="form-note mono" role="status" aria-live="polite"></p>
      </div>
    </form>

    <div class="dside">
      <div class="checklist rv">
        <h3 class="mono">Straight to the point</h3>
        <ul>
          <li><span class="tk">${TICK}</span>Reachable ${esc(c.site.availability)} on ${esc(c.site.phoneDisplay)}</li>
          <li><span class="tk">${TICK}</span>Building across Arizona since ${c.site.foundingYear}</li>
          <li><span class="tk">${TICK}</span>${c.services.length} trades under one contractor</li>
          <li><span class="tk">${TICK}</span>${c.areas.areas.length} Arizona cities served</li>
        </ul>
        <div class="foot"><span>${esc(c.site.positioning)}</span></div>
      </div>
      <figure class="cshot rv">${img(c, 'quest/custom-home-gables.webp', 'A Quest Construction project in Arizona')}</figure>
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function sitemap(c) {
  const list = (n, title, items) => `<div class="ulist rv">
    <p class="mono">${esc(n)}</p>
    <h2>${esc(title)}</h2>
    <nav>${items.map(([href, label]) => `<a href="${href}">${esc(label)} ${ARROW}</a>`).join('')}</nav>
  </div>`;

  return `${subhero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
  })}

<section class="content">
  <div class="wrap">
    <div class="ulists">
      ${list('01', 'Pages', [
        [c.url('home'), 'Home'], [c.url('about'), 'About Us'],
        [c.url('projects'), 'Project Showcase'], [c.url('gallery'), 'Gallery'],
        [c.url('contact'), 'Contact'], [c.url('sitemap'), 'Sitemap'],
      ])}
      ${list('02', 'Services', c.services.map((s) => [c.url(`services/${s.slug}`), s.name]))}
      ${list('03', 'Areas Served', c.areas.areas.map((a) => [c.url(`service-areas/${a.slug}`), a.name]))}
    </div>
  </div>
</section>

${closing(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}
