// Test fixture, never built to disk. Exercises every hook of the direction
// module contract with the least possible markup, so build.test.mjs can prove
// the harness works without depending on any real direction's design.
export const meta = {
  slug: 'd00-stub', name: 'Stub', indexable: false, fonts: '', preload: '',
};

export const nav = (c) => `<header class="nav">
<a href="${c.url('home')}">${c.site.name}</a>
<a href="${c.url('contact')}">Contact</a>
<a href="${c.site.phoneHref}">${c.site.phoneDisplay}</a>
</header>`;

export const footer = (c) => `<footer>
<p>${c.site.footerBlurb}</p>
<a href="${c.url('sitemap')}">Sitemap</a>
</footer>`;

export const home = (c) => `<h1>${c.pages.home.heroTitle}</h1>`;
export const service = (c) => `<h1>${c.item.h1}</h1><p>${c.item.intro[0]}</p>`;
export const area = (c) => `<h1>${c.item.name}</h1>`;
export const about = (c) => `<h1>${c.pages.about.h1}</h1>`;
export const gallery = (c) => `<h1>${c.pages.gallery.h1}</h1>`;
export const projects = (c) => `<h1>${c.pages.projects.h1}</h1>`;
export const contact = (c) => `<h1>${c.pages.contact.h1}</h1>`;
export const sitemap = (c) => `<h1>${c.pages.sitemap.h1}</h1>`;
