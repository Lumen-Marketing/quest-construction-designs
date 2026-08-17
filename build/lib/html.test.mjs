import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decode, stripTags, text, matchAll, section } from './html.mjs';

test('decode resolves the entities the archive actually contains', () => {
  assert.equal(decode('you&#x27;ll'), "you'll");
  assert.equal(decode('Consultation &amp; Estimate'), 'Consultation & Estimate');
  assert.equal(decode('a &lt;b&gt; c'), 'a <b> c');
  assert.equal(decode('&quot;x&quot;'), '"x"');
  assert.equal(decode('Learn more &#8594;'), 'Learn more →');
  assert.equal(decode('plain'), 'plain');
});

test('stripTags removes markup but keeps the words apart', () => {
  assert.equal(stripTags('<p>one</p><p>two</p>').replace(/\s+/g, ' ').trim(), 'one two');
  assert.equal(stripTags('<a href="x">link</a>').trim(), 'link');
});

test('text strips, decodes and collapses whitespace', () => {
  assert.equal(text('  <p>you&#x27;ll   see</p>\n<p>it</p> '), "you'll see it");
});

test('matchAll returns every capture of a global pattern', () => {
  const html = '<li>a</li><li>b</li><li>c</li>';
  assert.deepEqual(matchAll(html, /<li>(.*?)<\/li>/g), ['a', 'b', 'c']);
});

test('matchAll returns an empty array when nothing matches', () => {
  assert.deepEqual(matchAll('<p>x</p>', /<li>(.*?)<\/li>/g), []);
});

test('section extracts one section element by class, and null when absent', () => {
  const html = '<section class="section prose"><h2>Hi</h2></section><section class="cta">Go</section>';
  assert.match(section(html, 'prose'), /<h2>Hi<\/h2>/);
  assert.match(section(html, 'cta'), /Go/);
  assert.equal(section(html, 'nope'), null);
});
