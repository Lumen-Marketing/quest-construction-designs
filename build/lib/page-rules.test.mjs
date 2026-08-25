// The rules used to be reachable only by generating hundreds of pages and
// walking the disk. Behind one interface they take a string, so each one can be
// asserted directly — including the failures, which no gate run ever exercises
// because the committed output is green.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BANNED, HTML_TAG, SKIP_LINK, MAIN_TAG, decode, title, description, canonical,
  documentFindings, linkFindings, headFindings, graphFindings, relativeTarget,
} from './page-rules.mjs';

/** A minimal page that breaks nothing, so each test can break exactly one thing. */
const good = ({ head = '', body = '<h1>Roofing</h1>' } = {}) => `<!doctype html>
${HTML_TAG}
<head>${head}</head>
<body>
${SKIP_LINK}
${MAIN_TAG}
${body}
</main>
</body>
</html>`;

const rules = (findings) => findings.map((f) => f.rule).sort();

test('a well-formed page produces no findings', () => {
  assert.deepEqual(documentFindings(good()), []);
});

test('each structural landmark is required', () => {
  assert.deepEqual(rules(documentFindings(good().replace(MAIN_TAG, '<main>'))), ['landmark']);
  assert.deepEqual(rules(documentFindings(good().replace(SKIP_LINK, ''))), ['skip-link']);
  assert.deepEqual(rules(documentFindings(good().replace(HTML_TAG, '<html>'))), ['lang']);
});

test('exactly one h1 — no more, no fewer', () => {
  assert.deepEqual(rules(documentFindings(good({ body: '<p>none</p>' }))), ['one-h1']);
  assert.deepEqual(rules(documentFindings(good({ body: '<h1>a</h1><h1>b</h1>' }))), ['one-h1']);
});

test('every banned string is caught, one finding each', () => {
  for (const b of BANNED) {
    const found = documentFindings(good({ body: `<h1>x</h1><p>${b}</p>` }));
    assert.ok(found.some((f) => f.rule === 'banned'), `${b} slipped through`);
  }
});

test('an image needs alt, intrinsic size and a loading hint', () => {
  const img = (attrs) => good({ body: `<h1>x</h1><img src="a.webp" ${attrs}>` });
  assert.deepEqual(documentFindings(img('alt="A crew pouring a slab" width="8" height="4" loading="lazy"')), []);
  assert.deepEqual(rules(documentFindings(img('width="8" height="4" loading="lazy"'))), ['img-alt']);
  assert.deepEqual(rules(documentFindings(img('alt="A crew pouring a slab" loading="lazy"'))), ['img-size']);
  assert.deepEqual(rules(documentFindings(img('alt="A crew pouring a slab" width="8" height="4"'))), ['img-loading']);
});

test('alt="" is a correct decorative image, not a missing one', () => {
  const html = good({ body: '<h1>x</h1><img src="a.webp" alt="" width="8" height="4" loading="lazy">' });
  assert.deepEqual(documentFindings(html), []);
});

test('an alt too short to say anything still fails', () => {
  const html = good({ body: '<h1>x</h1><img src="a.webp" alt="ab" width="8" height="4" loading="lazy">' });
  assert.deepEqual(rules(documentFindings(html)), ['img-alt']);
});

test('a dead in-page anchor is caught; a live one is not', () => {
  const opts = { file: 'x.html', resolve: () => null };
  assert.deepEqual(rules(linkFindings('<a href="#main"></a><main id="main"></main>', opts)), []);
  assert.deepEqual(rules(linkFindings('<a href="#nope"></a>', opts)), ['anchor']);
});

test('off-site and non-http schemes are left alone', () => {
  const opts = { file: 'x.html', resolve: () => null };
  const html = '<a href="https://x.test/"></a><a href="tel:+1"></a><a href="mailto:a@b.c"></a>';
  assert.deepEqual(linkFindings(html, opts), []);
});

test('the resolve adapter decides what counts as broken', () => {
  const html = '<a href="somewhere/index.html"></a>';
  assert.deepEqual(rules(linkFindings(html, { file: 'x.html', resolve: () => null })), ['link']);
  assert.deepEqual(linkFindings(html, { file: 'x.html', resolve: () => 'build/verify.mjs' }), []);
});

test('the relative adapter resolves against a real tree', () => {
  assert.ok(relativeTarget('page-rules.mjs', 'build/lib/anything.html'));
  assert.equal(relativeTarget('no-such-file.mjs', 'build/lib/anything.html'), null);
  // a directory is not a page — the relative adapter deliberately refuses one
  assert.equal(relativeTarget('.', 'build/lib/anything.html'), null);
});

test('titles are measured as they render, not as they are escaped', () => {
  assert.equal(decode('Fire &amp; Water'), 'Fire & Water');
  const html = good({ head: '<title>Fire &amp; Water</title>' });
  assert.equal(title(html), 'Fire & Water');
  assert.equal(title(html).length, 12);
});

test('head rules catch an over-long title and a mismatched canonical', () => {
  const url = 'https://questconstruction.com/services/adu/';
  const head = (t, c) => `<title>${t}</title>`
    + '<meta name="description" content="short">'
    + `<link rel="canonical" href="${c}">`
    + '<meta name="robots" content="index,follow">'
    + '<meta property="og:image" content="https://questconstruction.com/assets/og/a.jpg">';

  assert.deepEqual(headFindings(good({ head: head('Short title', url) }), { url }), []);
  assert.deepEqual(
    rules(headFindings(good({ head: head('x'.repeat(61), url) }), { url })), ['title'],
  );
  assert.deepEqual(
    rules(headFindings(good({ head: head('Short title', `${url}wrong/`) }), { url })), ['canonical'],
  );
});

test('a noindex page fails the head rules, which is why the 404 skips them', () => {
  const url = 'https://questconstruction.com/';
  const head = '<title>t</title><meta name="description" content="d">'
    + `<link rel="canonical" href="${url}">`
    + '<meta name="robots" content="noindex,follow">'
    + '<meta property="og:image" content="https://questconstruction.com/assets/og/a.jpg">';
  assert.deepEqual(rules(headFindings(good({ head }), { url })), ['robots']);
});

test('graph rules require a parseable graph that names its own page', () => {
  const url = 'https://questconstruction.com/';
  const ld = (obj) => good({ head: `<script type="application/ld+json">\n${JSON.stringify(obj)}\n</script>` });

  assert.deepEqual(rules(graphFindings(ld({
    '@graph': [{ '@id': `${url}#webpage`, url }, { '@type': 'BreadcrumbList' }],
  }), { url })), []);

  assert.deepEqual(rules(graphFindings(good(), { url })), ['graph']);
  assert.deepEqual(rules(graphFindings(ld({ '@graph': [{ '@type': 'BreadcrumbList' }] }), { url })), ['graph']);
  assert.deepEqual(rules(graphFindings(ld({
    '@graph': [{ '@id': `${url}#webpage`, url: 'https://elsewhere.test/' }, { '@type': 'BreadcrumbList' }],
  }), { url })), ['graph']);
});

test('the head accessors return null rather than throwing on a bare page', () => {
  assert.equal(title('<html></html>'), null);
  assert.equal(description('<html></html>'), null);
  assert.equal(canonical('<html></html>'), null);
});
