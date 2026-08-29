// Direction 01 — Site Plan. Layered and editorial: a faint engineering grid on
// cream, a hard-edged accent plane, a frameless cut-out object straddling the
// boundary, and a floating badge card over the lot. Pill buttons, generous
// radii, soft layered shadows.
import { img, preloadImage, size } from '../lib/images.mjs';
import { icon } from '../lib/icons.mjs';
import { SHORT_NAME } from '../lib/pages.mjs';
import { scriptMap } from '../lib/palette.mjs';
import {
  shot, shots, cardShot, bannerShot, pageShots, GALLERY, HERO, OFFER_SHOTS,
  STORY, CONTACT,
  CLOSING, PROJECT_SHOTS,
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

export /** A trade name inside a sentence: lowercase, unless the name is an acronym.
 *  ADU is the one that matters — "all about adu" reads as a typo. */
const inSentence = (n) => (n === n.toUpperCase() ? n : n.toLowerCase());

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const grid = (dark) => `<div class="grid-bg${dark ? ' on-dark' : ''}" aria-hidden="true"></div>`;

const shead = (eyebrow, heading, lede) => `<div class="shead rv">
  <div>${eyebrow ? `<p class="mono eyebrow">${esc(eyebrow)}</p>` : ''}<h2>${heading}</h2></div>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : '<div></div>'}
</div>`;

const arrowBtn = (href, label, cls = 'btn') =>
  `<a class="${cls}" href="${href}"><span class="pip"></span>${esc(label)}</a>`;

// The plate that fills the empty cream half of an inner-page banner. Its left
// edge is cut on the same 46px lean as the accent plane beside it, so the two
// interlock rather than sitting side by side, and it bleeds off the right edge
// the way the plane bleeds off the left. No frame — this direction does not put
// photographs in boxes.
const bannerPlate = (c, pair) =>
  `<div class="subhero-shot" aria-hidden="true">${img(c, ...pair)}</div>`;

// One word of the heading in accent. The reference sets a single word of its
// headline in colour and lets the rest sit white; this finds that word in an
// already-escaped heading and wraps it, and does nothing if it is not there —
// so a heading that changes in the content file degrades to plain white rather
// than to broken markup.
const hl = (text, word) => {
  const t = esc(text);
  if (!word) return t;
  const w = esc(word);
  const i = t.indexOf(w);
  return i < 0 ? t : `${t.slice(0, i)}<span class="hl">${w}</span>${t.slice(i + w.length)}`;
};

// The layer behind the type: the light beam the photograph is read through.
// The wordmark used to be ghosted across the band here too — it is the home
// hero's move — but on a photographed ground it read as a smear rather than as
// type, and it fought the heading for the same space. The hero keeps it; down
// here the beam carries the band on its own.
const bannerBack = () => '<div class="subhero-beam" aria-hidden="true"></div>';

// The display band. One word of the page set as large as the line will carry,
// the photographs pulled up over its foot so the type runs behind them, and the
// sentence that would have been a lede justified edge to edge underneath as a
// rule rather than a paragraph.
//
// The size is computed from the word's own length — `118vw / characters` —
// rather than picked per band. A fixed clamp either wraps the long words or
// wastes the line on the short ones; this fills the measure either way, and a
// band whose word changes in a content file keeps filling it.
const bigBand = (c, pairs, eyebrow, word, lede) => `
<section class="sec dark bigband" style="--len:${word.length}">
  ${grid(true)}
  <div class="wrap">
    <p class="mono eyebrow">${esc(eyebrow)}</p>
    <h2 class="bigword">${esc(word)}</h2>
    <div class="shotband n${pairs.length}">${pairs.map(([f, alt]) =>
    `<figure class="rv">${img(c, f, alt)}</figure>`).join('')}</div>
    <p class="justrow mono">${esc(lede)}</p>
  </div>
</section>`;

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

// The service tile, and the one place it is built: the home page, every area
// page and the services hub all print the same fourteen.
//
// The photograph is a plate laminated onto the top of the card, bleeding to
// its edges rather than sitting in a box inside a box, and the icon chip
// breaks its lower edge the way the phone badge breaks the hero photograph.
// That overlap is the whole point — it is what turns two rectangles into a
// stack, and it is what the empty half of the old card was waiting for.
const svcCards = (c, cta) => c.services.map((s, i) => `
    <article class="svc rv${i === 4 ? ' svc--acc' : ''}">
      <span class="svcshot">${img(c, ...cardShot(s.slug))}</span>
      <span class="ic">${icon(s.slug)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.shortDesc)}</p>
      <a class="go" href="${c.url(`services/${s.slug}`)}">${esc(cta)} <i aria-hidden="true">&#8599;</i></a>
      <span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </article>`).join('');

// The one line of copy on the site that is furniture rather than content: the
// label on the accent bar. It lives here because it belongs to the component,
// not to a page, and every page ends on the same one.
const CTA_PROMPT = 'Got a project in need of a builder?';

// The trade marquee. It used to be written by a script on load, which meant the
// fourteen trade names were invisible to a crawler and unreachable without JS —
// so it is rendered here instead, and every name is the link to its own page.
//
// The loop needs two identical halves for the -50% translate to be seamless.
// Only the first is real: every element of the second is aria-hidden and out of
// the tab order, so a keyboard or screen reader meets each trade once, not
// twice, and focus never lands on a copy sitting outside the visible frame.
// They are flattened into one flex row rather than wrapped per half, because a
// wrapper would need display:contents to keep the two widths equal and that is
// a layout trick to solve a problem it introduced.
const stripHalf = (c, dup) => {
  const hide = dup ? ' tabindex="-1" aria-hidden="true"' : '';
  return c.services.map((s) =>
    `<a class="strip-i" href="${c.url(`services/${s.slug}`)}"${hide}>${esc(s.name)}</a>`
    + '<span class="d" aria-hidden="true">&#9670;</span>').join('');
};

const strip = (c) => `
<nav class="strip" aria-label="Our services">
  <div class="strip-in">${stripHalf(c, false)}${stripHalf(c, true)}</div>
</nav>`;

// The closing plate. Every page ends on it, so it is built once — home, service
// and area each carried their own byte-identical copy of this.
//
// The photograph is the whole plate now rather than half of it, dropped behind
// a scrim so the headline sits on the work instead of beside it, and the accent
// runs as a bar across the foot carrying the ask and the two ways to act on it.
// A visitor who has scrolled to the bottom of a page has one thing left to do,
// and the bar is the width of the plate saying so.
const closingCta = (c, heading, body) => `
<section class="cta">
  <div class="wrap cta-in">
    <div class="cta-shot" aria-hidden="true">${img(c, ...shot(CLOSING))}</div>
    <div class="cta-head">
      <div class="cta-copy">
        <h2>${esc(heading)}</h2>
        <p>${esc(body)}</p>
      </div>
      <ul class="cta-trades mono">${c.services.slice(0, 4).map((x) =>
    `<li><a href="${c.url(`services/${x.slug}`)}">${esc(SHORT_NAME[x.slug] || x.name)}</a></li>`).join('')}</ul>
    </div>
    <div class="cta-bar">
      <p class="mono">${esc(CTA_PROMPT)}</p>
      <div class="cta-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost telnum')}
      </div>
    </div>
  </div>
</section>`;

/** Layered dropdown nav — the mockup was anchor-only, so this is new furniture. */
export function nav(c) {
  const col = (items) => items.map(([href, label]) =>
    `<a href="${href}">${esc(label)}</a>`).join('');

  // Thirty-four cities in one undivided run of two columns is a wall: no
  // ordering a visitor can predict, so finding a city means reading all of it.
  // content/areas.json groups them by valley instead, and the panel prints one
  // headed block per region. Inside a block the city stands alone — "Mesa",
  // not "Mesa, AZ" — because the heading has already said where we are.
  //
  // A few cities sit in two regions. Tempe is East Valley to a customer in
  // Mesa and Central Valley to one in Phoenix, so it is printed under both:
  // the menu is a way in, and being found twice costs less than being missed
  // once. Every city belongs to at least one region, and d01.test.mjs fails
  // the build if one falls out of the nav.
  const byslug = new Map(c.areas.areas.map((a) => [a.slug, a]));
  const areaGroups = () => (c.areas.regions || []).map((r) => `<div class="dropgrp">
        <p class="dropgrp-h mono">${esc(r.name)}</p>
        ${r.cities.map((slug) => byslug.get(slug)).filter(Boolean).map((a) =>
    `<a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.city)}</a>`).join('')}
      </div>`).join('');
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
      <div class="dropmenu dropmenu--area" id="menu-areas">${c.hubs
    ? `<a class="dropall" href="${c.url('service-areas')}">All Areas Served</a>` : ''}
        <div class="dropgrps">${areaGroups()}</div>
      </div>
    </div>
    <a href="${c.url('projects')}">Projects</a>
    <a href="${c.url('gallery')}">Gallery</a>
    <a href="${c.url('about')}">About</a>
    <a href="${c.url('contact')}">Contact</a>
    <div class="navcall">
      <span class="mono">Call us &mdash; ${esc(c.site.availability)}</span>
      <a class="telnum" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
    </div>
  </nav>
  <a class="btn acc navtel" href="${c.site.phoneHref}"
    aria-label="Call ${esc(c.site.phoneDisplay)}"><span class="pip"><svg viewBox="0 0 24 24"
    aria-hidden="true" focusable="false"><path
    d="M4 5h5l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v5a15 15 0 0 1-16-16z"/></svg></span><span
    class="navtel-num telnum">${esc(c.site.phoneDisplay)}</span></a>
</div>
</header>`;
}

export function footer(c) {
  // `col2` marks the long lists — the fourteen trades and the eleven cities.
  // They run two-up at every width, not just on the phone: fifteen rows of one
  // link is half a screen of footer before the cities even start.
  //
  // Two trade names carry a parenthesis longer than the name itself, and in a
  // half-width column they wrap to six lines each and undo the saving. The
  // footer prints the short form for those two — the same map the <title> uses,
  // so there is one place to change it and the page's h1 still spells it out.
  const trade = (x) => SHORT_NAME[x.slug] || x.name;
  const col = (title, items, cls = '') => `<div${cls ? ` class="${cls}"` : ''}>
  <h2>${esc(title)}</h2>
  <ul>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  // The cities are the one list long enough to set the footer's height on its
  // own: thirty-four links two-up ran to eighteen rows while Company and
  // Services finished in eight, so a third of the footer was one column of
  // cities beside a lot of nothing. They are grouped by valley here, the same
  // five regions the nav panel uses, and the block runs three columns wide
  // into the space the other lists were not using. It is the shorter footer
  // as well as the legible one — the tallest region is fourteen rows, not
  // eighteen, and the width comes off tracks that were already empty below
  // their eighth link.
  const byslug = new Map(c.areas.areas.map((a) => [a.slug, a]));
  const areaCol = () => `<div class="fareas">
  <h2>Areas Served</h2>
  ${c.hubs ? `<a class="fall" href="${c.url('service-areas')}">All Areas Served</a>` : ''}
  <div class="fgrps">${(c.areas.regions || []).map((r) => `<div class="fgrp">
    <p class="fgrp-h">${esc(r.name)}</p>
    <ul>${r.cities.map((slug) => byslug.get(slug)).filter(Boolean).map((a) =>
    `<li><a href="${c.url(`service-areas/${a.slug}`)}">${esc(a.city)}</a></li>`).join('')}</ul>
  </div>`).join('')}</div>
</div>`;

  return `<footer>
<div class="wrap fg">
  <div class="about">
    <a class="brand" href="${c.url('home')}">
      ${img(c, 'quest/logo.webp', c.site.name, {})}
    </a>
    <p>${esc(c.site.footerBlurb)}</p>
    <p class="mono">${esc(c.site.positioning)}</p>
    ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn acc telnum')}
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
    ...c.services.map((s) => [c.url(`services/${s.slug}`), trade(s)])], 'col2')}
  ${areaCol()}
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

/** Nav toggle, offer-code copy, static-form notice, scroll reveals. */
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
  // Constraint validation, driven by the attributes already on the controls.
  // The form carries novalidate because the browser's own bubbles show one at
  // a time, vanish on the next click, and are not reliably announced — but
  // novalidate only suppresses that UI. checkValidity() and the validity
  // object still work, so the rules stay in the markup where they belong and
  // only the presentation of them is ours.
  document.querySelectorAll('.contact-form').forEach(function(f){
    var flds=[].slice.call(f.querySelectorAll('.fld'));
    var note=f.querySelector('.form-note');
    function ctl(fl){ return fl.querySelector('input,textarea'); }
    // "Invalid input" tells a visitor that they are wrong and not what to do
    // about it. Every message here names the cause and the fix.
    function why(i){
      var v=i.validity;
      if(v.valueMissing) return i.getAttribute('data-missing')||'This one is required.';
      if(v.typeMismatch&&i.type==='email')
        return 'That address is missing its @ or its domain \\u2014 check it and try again.';
      return i.validationMessage;
    }
    function mark(fl,show){
      var i=ctl(fl); if(!i) return true;
      var ok=i.checkValidity(), bad=!ok&&show, e=fl.querySelector('.fld-err');
      fl.classList.toggle('bad',bad);
      i.setAttribute('aria-invalid',bad?'true':'false');
      if(e) e.textContent=bad?why(i):'';
      return ok;
    }
    flds.forEach(function(fl){
      var i=ctl(fl); if(!i) return;
      // On blur, never on keystroke: an email address is invalid for every
      // character of it except the last, and saying so as it is typed is
      // nagging rather than helping.
      i.addEventListener('blur',function(){ mark(fl,true); });
      // Once a field IS showing an error it clears the moment it is fixed.
      i.addEventListener('input',function(){ if(fl.classList.contains('bad')) mark(fl,true); });
    });
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=flds.filter(function(fl){ return !mark(fl,true); });
      if(!note) return;
      if(bad.length){
        // A count, and the caret moved to the first one — with four fields
        // that field is on screen by the time this sentence is read, so a
        // list of anchors would be longer than the form.
        note.className='form-note mono bad';
        note.textContent=bad.length===1
          ? 'One field still needs attention.'
          : bad.length+' fields still need attention.';
        var i=ctl(bad[0]); if(i) i.focus();
        return;
      }
      // Nothing is wired to a mailbox yet, so the honest thing is to say so
      // and hand over a route that does work rather than show a green tick.
      note.className='form-note mono';
      note.innerHTML='This form is not connected yet &#8212; please call '
        +'<a class="telnum" href="${c.site.phoneHref}">${c.site.phoneDisplay}</a> and we will pick up.';
    });
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
(function(){
  // ---- page-transition skeleton ----
  // This is a multi-page site: the browser holds the current page on screen
  // until the next one paints, so on a slow connection a click looks like
  // nothing happened at all. Nothing shows for the first 450ms — a cached
  // static page is finished well inside that, and a skeleton that flashes is
  // worse than no skeleton — and after it the page below the header is
  // replaced by its own outline. The header stays exactly where it is,
  // because the next page has the same one.
  var DELAY=450, FAILSAFE=12000, wait, fail, box, say;
  box=document.createElement('div');
  box.className='skel'; box.setAttribute('aria-hidden','true');
  box.innerHTML='<div class="skel-hero"><div class="wrap">'
    +'<span class="sk sk-crumb"></span><span class="sk sk-h1"></span>'
    +'<span class="sk sk-h1 sk-h1b"></span><span class="sk sk-lede"></span>'
    +'<span class="sk sk-btn"></span></div></div>'
    +'<div class="skel-body"><div class="wrap"><span class="sk sk-eyebrow"></span>'
    +'<span class="sk sk-h2"></span><div class="skel-cards">'
    +'<span class="sk sk-card"></span><span class="sk sk-card"></span>'
    +'<span class="sk sk-card"></span></div></div></div>';
  // The blocks are scenery and are hidden from assistive technology; the wait
  // itself is worth saying, so it is said in words instead.
  say=document.createElement('p'); say.className='skel-say'; say.setAttribute('role','status');
  document.body.appendChild(box); document.body.appendChild(say);
  function hide(){
    clearTimeout(wait); clearTimeout(fail);
    box.classList.remove('on'); say.textContent='';
  }
  function show(){
    box.classList.add('on'); say.textContent='Loading';
    // If the navigation never lands — a dropped connection, a stopped load —
    // the page underneath is still perfectly usable, so give it back.
    fail=setTimeout(hide,FAILSAFE);
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self')) return;
    var u; try{u=new URL(a.href,location.href)}catch(err){return}
    // Another origin, a tel: or a mailto: — whose origin is not this one —
    // and an anchor within this same page: none of those replace the
    // document, so none of them get a skeleton.
    if(u.origin!==location.origin) return;
    if(u.pathname===location.pathname&&u.search===location.search) return;
    clearTimeout(wait); wait=setTimeout(show,DELAY);
  });
  // Escape stops a load in most browsers, so it has to take the skeleton with
  // it or the page is left behind a screen it cannot dismiss.
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') hide(); });
  // Coming back through the bfcache restores the DOM exactly as it was left,
  // skeleton and all. pagehide runs once the outgoing page is already spent.
  addEventListener('pageshow',hide); addEventListener('pagehide',hide);
})();
</script>`;
}

export function script(c) { return `${accentScript()}
${baseScript(c)}`; }

// ---------------------------------------------------------------- page bodies

// The headline is the company name and the promise in one string, and it has
// to stay one string: it is the H1, and "Quest Construction: From Concept to
// Creation" is what the page is about as far as a search engine is concerned.
// Typographically it is two things, though, and setting it as one was giving
// four lines of 65px at a single weight with the colon dangling off the end of
// the second one. Split at the colon, the name takes a smaller line and the
// promise gets the display size — same string, same reading order, two tiers
// instead of none. A heading with no colon falls through unchanged.
const heroTitle = (t) => {
  const i = String(t).indexOf(':');
  const name = i < 0 ? '' : `<span class="h1-name">${esc(t.slice(0, i + 1))}</span>`;
  const rest = (i < 0 ? String(t) : t.slice(i + 1)).trim();
  // One word of the line in accent, which is the banners' move and now the
  // hero's — the last word, because it is the one the sentence lands on and
  // because deriving it means a headline edited in the content file keeps its
  // accent instead of losing it to a hardcoded string that no longer matches.
  const j = rest.lastIndexOf(' ');
  const lit = j < 0 ? `<span class="hl">${esc(rest)}</span>`
    : `${esc(rest.slice(0, j + 1))}<span class="hl">${esc(rest.slice(j + 1))}</span>`;
  return `${name}${lit}`;
};

export function home(c) {
  const h = c.pages.home;

  const cards = svcCards(c, 'View details');

  // The offers are vouchers rather than two dark rectangles with a glow behind
  // the number. A voucher is what they actually are — an amount, terms, and a
  // code you take away — so the component says so: a material band across the
  // head, a torn edge under it with the notches punched out of both sides, and
  // the code on the stub below.
  //
  // All of that was above the seam. Below it was flat colour with three things
  // sitting on top, which is the half Quest was looking at when they said it
  // was flat — the stub had no material of its own at all. It has a ground
  // now, and the amount is printed twice: once at reading size and once
  // enormous behind it, running off the edge. Two copies of one number at two
  // scales is the cheapest depth there is, because the eye reads the pair as
  // near and far rather than as a repeat. See .offer-body.
  const offers = c.site.offers.map((o, i) => `
    <div class="offer rv">
      <div class="offer-shot">${img(c, ...shot(OFFER_SHOTS[i % OFFER_SHOTS.length]))}</div>
      <div class="offer-seam" aria-hidden="true"><i></i></div>
      <div class="offer-body">
        <span class="offer-ghost" aria-hidden="true">${esc(o.amount)}</span>
        <b>${esc(o.amount)}</b>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.body)}</p>
        <button class="btn acc" type="button" data-copy="${esc(o.code)}"
          aria-live="polite">GET CODE</button>
      </div>
    </div>`).join('');

  // A teaser, not the full showcase: the projects page carries every item.
  // It stops at three because Quest has no pergola photograph — the only
  // overhead post-and-beam shot in the library is the finished deck, which the
  // trade card above already spends, and the same picture twice on one page is
  // worse than one card fewer. Raise this the day a pergola photograph lands;
  // the stylesheet already lays out four and five tiles.
  const work = c.pages.projects.items.slice(0, 3).map((p, i) => `
    <a class="pj ${'abcde'[i] || ''} rv" href="${c.url('projects')}">
      ${img(c, ...shot(PROJECT_SHOTS[i % PROJECT_SHOTS.length]))}
      <span class="cap"><span><b>${esc(p.title)}</b><span>${esc(p.body)}</span></span>
      <span class="go" aria-hidden="true">&#8599;</span></span>
    </a>`).join('');

  return `
<section class="hero">
  ${grid(true)}
  <div class="hero-shot">${img(c, ...shot(HERO), { eager: true })}</div>
  <div class="wrap">
    <div class="hero-copy">
      <p class="mono eyebrow">&mdash; ${esc(h.heroEyebrow)}</p>
      <h1>${heroTitle(h.heroTitle)}</h1>
      <p class="lede">${esc(h.heroBody)}</p>
      <div class="hero-acts">
        ${arrowBtn(c.url('contact'), 'Get in touch')}
        ${arrowBtn(c.site.phoneHref, 'Call us', 'btn ghost')}
      </div>
    </div>
    <div class="hero-foot">
      <div class="hero-trust">
        <div><b>${c.site.foundingYear}</b><span>Building since</span></div>
        <div><b>${c.services.length}</b><span>Services</span></div>
        <div><b>${c.areas.areas.length}</b><span>Arizona cities</span></div>
        <div><b>${esc(c.site.availability)}</b><span>Reach us</span></div>
      </div>
      <div class="badge badge-float">
        <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h5l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v5a15 15 0 0 1-16-16z"/></svg></span>
        <span><b class="telnum">${esc(c.site.phoneDisplay)}</b><span>${esc(c.site.availability)} &middot; family owned</span></span>
      </div>
    </div>
  </div>
</section>

${strip(c)}

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

${bigBand(c, pageShots('home', 8), '— On site', 'SLAB TO SHINGLE',
  'Every photograph on this site is from a Quest job. Nothing here is stock.')}

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
    <div class="work${work.match(/class="pj /g).length === 4 ? ' four' : ''}">${work}</div>
  </div>
</section>

${closingCta(c, h.ctaHeading, h.ctaBody)}`;
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
      <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>`).join('');

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
      `Addressing your ${inSentence(s.name)} questions and concerns.`)}
    <div class="faqlist">${s.faqs.map((f) => `
      <details class="rv"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
  </div>
</section>` : '';

  return `
<section class="subhero">
  ${bannerPlate(c, bannerShot('service', s.slug))}
  ${bannerBack()}
  ${grid(true)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <a href="${c.hub('services')}">Services</a> <span aria-hidden="true">/</span>
      <b>${esc(s.name)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${hl(s.h1, s.name)}</h1>
        <p class="lede">${esc(s.subheroTagline)}</p>
        <div class="hero-acts">
          ${arrowBtn(c.url('contact'), 'Get in touch', 'btn acc')}
          ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn ghost telnum')}
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

${tradeCities(c, s)}

${closingCta(c, s.ctaHeading, s.ctaBody)}`;
}

/** Service-area page. d01 renders authored local copy; see content/areas-local.json. */
export function area(c) {
  const a = c.item;
  const t = c.areas.template;
  // Quest photographs jobs, not towns, so the band below is honest about being
  // work from across the service area rather than from this city in particular.
  const ai = c.areas.areas.findIndex((x) => x.slug === a.slug);
  const raw = (s) => String(s).replace(/\{\{city\}\}/g, a.city);
  const fill = (s) => esc(raw(s));
  const local = c.areasLocal[a.slug];

  const cards = svcCards(c, 'Learn more');

  const others = c.areas.areas.filter((x) => x.slug !== a.slug).map((x) =>
    `<a href="${c.url(`service-areas/${x.slug}`)}">${esc(x.name)}</a>`).join('');

  return `
<section class="subhero">
  ${bannerPlate(c, bannerShot('area', ai))}
  ${bannerBack()}
  ${grid(true)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <a href="${c.hub('service-areas')}">Service Areas</a> <span aria-hidden="true">/</span>
      <b>${esc(a.name)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${hl(raw(t.h1), a.city)}</h1>
        <p class="lede">${fill(t.tagline)}</p>
        <div class="hero-acts">
          ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn acc telnum')}
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
        <b class="telnum">${esc(c.site.phoneDisplay)}</b>
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

${cityTrades(c, a)}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Nearby', 'Other <span>Areas</span> We Serve', '')}
    <div class="arealinks rv">${others}</div>
  </div>
</section>

${closingCta(c, raw(t.ctaHeading), raw(t.ctaBody))}`;
}

/** The cities this trade has a page written for. Same contract as cityTrades:
 *  nothing renders until the copy exists. */
function tradeCities(c, s) {
  if (!c.cityServices) return '';
  const byCity = c.serviceAreas?.[s.slug];
  if (!byCity) return '';
  const cities = c.areas.areas.filter((a) => byCity[a.slug]);
  if (!cities.length) return '';
  const short = SHORT_NAME[s.slug] || s.name;
  return `
<section class="sec cream alt">
  ${grid(false)}
  <div class="wrap">
    ${shead('&mdash; By city', `<span>${esc(short)}</span> Where You Are`,
      `What changes about ${esc(inSentence(short))} city by city, written for each one.`)}
    <div class="arealinks trades rv">${cities.map((a) =>
      `<a href="${c.url(`services/${s.slug}/${a.slug}`)}">${esc(short)} in ${esc(a.city)}</a>`).join('')}</div>
  </div>
</section>`;
}

/** The trades that have a page written for this city. Empty until a trade is
 *  authored for it in content/service-areas.json, so the section disappears
 *  rather than rendering an empty heading. */
function cityTrades(c, a) {
  // The demo directions do not build these pages, so they must not link them.
  if (!c.cityServices) return '';
  const trades = c.services.filter((s) => c.serviceAreas?.[s.slug]?.[a.slug]);
  if (!trades.length) return '';
  return `
<section class="sec cream alt">
  ${grid(false)}
  <div class="wrap">
    ${shead(`— In ${esc(a.city)}`, `What We Do in <span>${esc(a.city)}</span>`,
      `Written for ${esc(a.city)} specifically rather than for Arizona in general.`)}
    <div class="arealinks trades rv">${trades.map((s) =>
      `<a href="${c.url(`services/${s.slug}/${a.slug}`)}">${esc(SHORT_NAME[s.slug] || s.name)} in ${esc(a.city)}</a>`).join('')}</div>
  </div>
</section>`;
}

/** Shared inner-page hero for the pages that are not a service or an area.
    No eyebrow: the breadcrumb directly above already names the section, and
    printing "Contact / — Contact" two lines apart reads as a mistake. */
function pageHero(c, { h1, lede, crumb, banner, accent }) {
  return `
<section class="subhero">
  ${bannerPlate(c, banner)}
  ${bannerBack()}
  ${grid(true)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <b>${esc(crumb)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${hl(h1, accent)}</h1>
        <p class="lede">${esc(lede)}</p>
      </div>
    </div>
  </div>
</section>`;
}

export function about(c) {
  const a = c.pages.about;
  return `${pageHero(c, {
    h1: a.h1, lede: a.lede, crumb: 'About Us', banner: bannerShot('about'), accent: 'Quest Construction',
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

${bigBand(c, pageShots('about', 4), '— The work itself', 'FRAMING TO FINISH',
  'Framing, roof, finish. Photographs from our own sites, on our own jobs.')}

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

// ---- justified rows -------------------------------------------------------
// The gallery used to be a CSS `columns` masonry, and a masonry cannot end
// flat: the browser pours the photographs down three columns and whichever
// column draws the last tall frame overruns the other two. On this library —
// thirty-seven portraits, eleven landscapes — that overrun measured about four
// hundred pixels of empty cream under two of the columns.
//
// So the photographs are broken into rows instead, the way a picture editor
// breaks them: every row is filled to the full measure, and within a row each
// frame is given a flex-grow equal to its own aspect ratio. Widths then come
// out proportional to the ratios, so every frame in the row resolves to the
// same height, the row is flush left and flush right, and the last row is as
// full as the first. Nothing is cropped and nothing is scaled by hand — the
// browser does the arithmetic, at any width, from one number per photograph.
//
// Which photographs share a row is the only decision left, and it is made here
// rather than by the browser because it needs to look at the whole sequence.
// A row of k frames comes out (1 - (k-1) * gap) / sum-of-ratios tall as a
// fraction of the measure, so the run is broken to keep that near TARGET —
// exactly, by dynamic programming over the 49 frames, not greedily. Order is
// preserved, which a masonry does not do either: the gallery reads slab,
// framing, roof, dusk, in the order the jobs were built.
const TARGET = 0.30;   // row height as a fraction of the measure — about 380px
const GAPR = 0.014;    // the 18px gap, likewise — see .gal in the stylesheet
const MINROW = 3;
const MAXROW = 5;

function justified(files) {
  const r = files.map((f) => { const [w, h] = size(f); return w / h; });
  const sum = [0];
  r.forEach((x) => sum.push(sum[sum.length - 1] + x));
  // The height a row of files[i..j) resolves to, as a fraction of the measure.
  const height = (i, j) => (1 - (j - i - 1) * GAPR) / (sum[j] - sum[i]);

  const cost = new Array(r.length + 1).fill(Infinity);
  const from = new Array(r.length + 1).fill(-1);
  cost[0] = 0;
  for (let j = 1; j <= r.length; j++) {
    for (let k = MINROW; k <= MAXROW; k++) {
      const i = j - k;
      if (i < 0 || cost[i] === Infinity) continue;
      const d = height(i, j) - TARGET;
      const c = cost[i] + d * d;
      if (c < cost[j]) { cost[j] = c; from[j] = i; }
    }
  }
  if (cost[r.length] === Infinity) {
    throw new Error(`${files.length} photographs will not break into rows of ${MINROW}-${MAXROW}`);
  }
  const rows = [];
  for (let j = r.length; j > 0;) { const i = from[j]; rows.unshift(files.slice(i, j)); j = i; }
  return rows;
}

export function gallery(c) {
  const g = c.pages.gallery;
  return `${pageHero(c, {
    h1: g.h1, lede: g.lede, crumb: 'Gallery', banner: bannerShot('gallery'),
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— From Quest projects', 'Every Photograph Here Is <span>Ours</span>',
      'Two jobs, start to finish: a slab-up addition on a Phoenix-area lot, and a custom home '
      + 'from framing through the last course of shingles.')}
    <div class="gal${GALLERY.length % 2 ? ' odd' : ''}">${justified(GALLERY).map((row) =>
      `<div class="galrow rv">${shots(...row).map(([f, alt]) => {
    const [w, h] = size(f);
    return `<figure style="--ar:${(w / h).toFixed(4)}">${img(c, f, alt)}</figure>`;
  }).join('')}</div>`).join('')}</div>
  </div>
</section>

${closingCta(c, c.pages.home.ctaHeading, c.pages.home.ctaBody)}`;
}

export function projects(c) {
  const p = c.pages.projects;
  return `${pageHero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Project Showcase', banner: bannerShot('projects'), accent: 'Showcase',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('&mdash; Selected work', 'Projects We Have <span>Built</span>',
      'Each one photographed on our own jobs, not staged and not stock.')}
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

${bigBand(c, pageShots('projects', 6), '— More from the same jobs', 'DETAIL SHOTS',
  'The stages of a build that do not get a card of their own.')}

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

  // Every field is the same six parts: a name, a required/optional flag, the
  // control, the standing hint under it, and an empty line waiting for an
  // error. The flag is a word rather than a red asterisk — an asterisk is a
  // convention you have to already know, and a colour is not information to a
  // visitor who cannot see it. The hint and the error are both wired into
  // aria-describedby, so a screen reader reads the field, then what it wants,
  // then what is wrong with it, in that order.
  const field = (f) => {
    const h = HINT[f.name] || {};
    const id = `cf-${f.name}`;
    const help = f.help ? `${id}-help` : '';
    const desc = [help, `${id}-err`].filter(Boolean).join(' ');
    const shared = `id="${id}" name="${f.name}"${f.required ? ' required' : ''}`
      + `${f.missing ? ` data-missing="${esc(f.missing)}"` : ''}`
      + `${h.autocomplete ? ` autocomplete="${h.autocomplete}"` : ''}`
      + `${h.inputmode ? ` inputmode="${h.inputmode}"` : ''}`
      + ` placeholder="${esc(h.placeholder || f.label)}" aria-describedby="${desc}"`;
    const control = f.type === 'textarea'
      ? `<textarea ${shared} rows="5"></textarea>`
      : `<input ${shared} type="${f.type}">`;
    return `
      <div class="fld">
        <label for="${id}">
          <span class="fld-name">${esc(f.label)}</span>
          <span class="fld-flag mono">${f.required ? 'Required' : 'Optional'}</span>
        </label>
        ${control}
        ${f.help ? `<p class="fld-help" id="${help}">${esc(f.help)}</p>` : ''}
        <p class="fld-err mono" id="${id}-err" aria-live="polite"></p>
      </div>`;
  };

  // Email and phone are one question asked twice — how to reach you — so they
  // share a row rather than stacking as two more full-width slabs.
  const byName = Object.fromEntries(p.fields.map((f) => [f.name, f]));
  const paired = ['email', 'phone'].every((n) => byName[n]);
  const body = paired
    ? [field(byName.name), `<div class="cf-pair">${field(byName.email)}${field(byName.phone)}</div>`,
      field(byName.message)].join('')
    : p.fields.map(field).join('');

  // Three facts, all of them already stated elsewhere on the site and all of
  // them derived rather than typed here. They exist to give the card something
  // to say while a visitor decides whether to call: an aside that is a phone
  // number and one photograph is a caption, not a column.
  const facts = [
    `Family-owned, Arizona-based since ${c.site.foundingYear}`,
    `${c.services.length} trades under one contractor`,
    `${c.areas.areas.length} cities across the Valley`,
  ];

  return `${pageHero(c, {
    h1: p.h1, lede: p.lede, crumb: 'Contact', banner: bannerShot('contact'), accent: 'us',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap contact-grid">
    <form class="contact-form rv" novalidate>
      <div class="cf-head">
        <h2>${esc(p.formHeading)}</h2>
        <p>${esc(p.formLede)}</p>
      </div>
      <div class="cf-fields">${body}</div>
      <div class="cf-foot">
        <button class="btn acc" type="submit"><span class="pip"></span>${esc(p.submitLabel)}</button>
        <p class="cf-alt mono">Rather talk? <a class="telnum" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>,
          ${esc(c.site.availability)}</p>
      </div>
      <p class="form-note mono" role="status" aria-live="polite"></p>
    </form>
    <aside class="help-card rv">
      <div class="help-top">
        <h2>${esc(p.helpHeading)}</h2>
        <p class="mono eyebrow">Phone — ${esc(c.site.availability)}</p>
        <a class="phone telnum" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a>
        <p>${esc(c.site.footerBlurb)}</p>
        <ul class="help-facts mono">${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </div>
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

export function serviceIndex(c) {
  const cards = svcCards(c, 'View details');

  return `${pageHero(c, {
    h1: 'Construction Services in Arizona',
    lede: `${c.services.length} trades, one contractor, ${c.site.availability} on the phone. `
      + 'Everything below is self-managed by Quest — no brokered subcontractor chain.',
    crumb: 'Services', banner: bannerShot('serviceIndex'), accent: 'Services',
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
        <a class="acc telnum" href="${c.site.phoneHref}">${esc(c.site.phoneDisplay)}</a> to talk one
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

${band(c, pageShots('serviceIndex', 4), '— The trades in practice', 'Structure, <span>Shell</span>, Finish',
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

/** One trade in one city. Deliberately not a copy of the trade page with a
 *  place name dropped in — that is the doorway pattern. The city-and-trade
 *  copy leads, the shared trade material is a short list rather than the whole
 *  page, and both parent pages are one click away for anyone who wants them. */
export function serviceArea(c) {
  const { service: s, area: a, copy } = c.item;
  const ai = c.areas.areas.findIndex((x) => x.slug === a.slug);
  const short = SHORT_NAME[s.slug] || s.name;

  // The same trade in the other cities. This is the row a visitor who landed on
  // the wrong city needs, and the link graph that stops these pages being
  // orphans reachable only from a sitemap.
  const elsewhere = c.areas.areas
    .filter((x) => x.slug !== a.slug && c.serviceAreas[s.slug]?.[x.slug])
    .map((x) => `<a href="${c.url(`services/${s.slug}/${x.slug}`)}">${esc(x.city)}</a>`)
    .join('');

  return `
<section class="subhero">
  ${bannerPlate(c, bannerShot('area', ai))}
  ${bannerBack()}
  ${grid(true)}
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${c.url('home')}">Home</a> <span aria-hidden="true">/</span>
      <a href="${c.hub('services')}">Services</a> <span aria-hidden="true">/</span>
      <a href="${c.url(`services/${s.slug}`)}">${esc(short)}</a> <span aria-hidden="true">/</span>
      <b>${esc(a.city)}</b>
    </nav>
    <div class="subhero-in">
      <div>
        <h1>${hl(`${short} in ${a.city}, AZ`, a.city)}</h1>
        <p class="lede">${esc(copy.lede)}</p>
        <div class="hero-acts">
          ${arrowBtn(c.site.phoneHref, c.site.phoneDisplay, 'btn acc telnum')}
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
      <p class="mono eyebrow">&mdash; ${esc(short)} in ${esc(a.name)}</p>
      <h2>What is different about <span>${esc(a.city)}</span></h2>
      ${copy.paras.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${arrowBtn(c.url('contact'), `Talk to us about ${esc(inSentence(short))} in ${esc(a.city)}`)}
    </div>
    <div class="localnotes rv">
      <h3>What that means on site</h3>
      <ul>${copy.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
      <div class="localcall">
        <b class="telnum">${esc(c.site.phoneDisplay)}</b>
        <span>${esc(c.site.availability)} &middot; ${esc(a.name)}</span>
      </div>
    </div>
  </div>
</section>

<section class="sec dark">
  ${grid(true)}
  <div class="wrap">
    ${shead(`&mdash; ${esc(short)}`, `How We Run <span>${esc(short)}</span> Work`,
      `The same approach everywhere we build. The full ${esc(inSentence(short))} page has the `
      + 'detail; this is the short version.')}
    <div class="svcpts rv">${s.whyChoose.map((w) => `<p>${esc(w)}</p>`).join('')}</div>
    <div class="arealinks light rv">
      <a href="${c.url(`services/${s.slug}`)}">All about ${esc(inSentence(short))}</a>
      <a href="${c.url(`service-areas/${a.slug}`)}">Everything we do in ${esc(a.city)}</a>
    </div>
  </div>
</section>

${band(c, areaShots(ai), '&mdash; Recent work',
  `Jobs Behind the <span>${esc(a.city)}</span> Crew`,
  `The same crew that answers a ${esc(a.city)} call ran these. Photographs are from Quest jobs `
  + 'across the service area, not staged, and not stock.', 'sec cream alt')}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('&mdash; Elsewhere', `<span>${esc(short)}</span> in Other Cities`, '')}
    <div class="arealinks trades rv">${elsewhere}</div>
  </div>
</section>

${closingCta(c, `${short} in ${a.city}, done properly`,
  `Tell us what you need doing and we will come and look at it. ${c.site.availability}.`)}`;
}

export function areaIndex(c) {
  // A register, not a card grid. Eleven cities on cards is eleven boxes of the
  // same shape holding one clipped sentence each — the reader scans none of it
  // and learns nothing without clicking. As rows they read as an index, which
  // is what this direction is named after, and the disclosure pays for itself:
  // closed, it is a scannable list of where Quest builds; open, it is the whole
  // first paragraph and the four things that actually differ about permitting
  // and housing stock in that city.
  //
  // <details> rather than script: it is a button to a screen reader, it
  // announces its own expanded state, it works from the keyboard, and it is
  // already the FAQ pattern on the service pages. The link out sits in the
  // panel but is in the document whether the row is open or shut, so every
  // city stays one crawlable href from the hub.
  const rows = c.areas.areas.map((a, i) => {
    const local = c.areasLocal[a.slug];
    return `
    <details class="reg rv"${i === 0 ? ' open' : ''}>
      <summary>
        <span class="reg-n mono">${String(i + 1).padStart(2, '0')}</span>
        <span class="reg-name">${esc(a.name)}</span>
        <span class="reg-mark" aria-hidden="true"></span>
      </summary>
      <div class="reg-panel">
        <p>${esc(local.paras[0])}</p>
        <div class="reg-side">
          <ul class="reg-notes mono">${local.notes.slice(0, 4).map((n) =>
    `<li>${esc(n)}</li>`).join('')}</ul>
          <a class="go" href="${c.url(`service-areas/${a.slug}`)}">Building in ${esc(a.city)}
            <i aria-hidden="true">&#8599;</i></a>
        </div>
      </div>
    </details>`;
  }).join('');

  return `${pageHero(c, {
    h1: 'Service Areas Across Arizona',
    lede: `Quest Construction builds in ${c.areas.areas.length} Arizona cities. Each one permits `
      + 'differently and each one has its own housing stock — the pages below say how.',
    crumb: 'Service Areas', banner: bannerShot('areaIndex'), accent: 'Areas',
  })}

<section class="sec cream">
  ${grid(false)}
  <div class="wrap">
    ${shead('— Eleven cities', 'Where <span>Quest</span> Builds',
      'One crew, one licence, one phone number across the East Valley, Phoenix and Pinal County.')}
    <div class="register">${rows}</div>
  </div>
</section>

${band(c, pageShots('areaIndex', 4), '— Across the valley', 'Arizona <span>Jobs</span>, Arizona Photographs',
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
  <h2>${esc(title)}</h2>
  <ul>${items.map(([href, label]) =>
    `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
</div>`;

  return `${pageHero(c, {
    h1: c.pages.sitemap.h1, lede: c.pages.sitemap.lede, crumb: 'Sitemap',
    banner: bannerShot('sitemap'),
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
