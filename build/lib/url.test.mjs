import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN, PAGE_KEYS, outPath, resolver } from './url.mjs';

test('there are thirty-one page keys', () => {
  assert.equal(PAGE_KEYS.length, 31);
});

test('outPath maps a page key to its file inside the direction folder', () => {
  assert.equal(outPath('home'), 'index.html');
  assert.equal(outPath('about'), 'about-us/index.html');
  assert.equal(outPath('contact'), 'contact-us/index.html');
  assert.equal(outPath('services/adu'), 'services/adu/index.html');
  assert.equal(outPath('service-areas/mesa-az'), 'service-areas/mesa-az/index.html');
});

test('url() from the home page points down into subfolders', () => {
  const { url } = resolver('d01-site-plan', 'home');
  assert.equal(url('home'), 'index.html');
  assert.equal(url('services/adu'), 'services/adu/index.html');
  assert.equal(url('contact'), 'contact-us/index.html');
});

test('url() from a two-deep page climbs back out correctly', () => {
  const { url } = resolver('d01-site-plan', 'services/adu');
  assert.equal(url('home'), '../../index.html');
  assert.equal(url('services/roofing'), '../../services/roofing/index.html');
  assert.equal(url('service-areas/mesa-az'), '../../service-areas/mesa-az/index.html');
  assert.equal(url('contact'), '../../contact-us/index.html');
});

test('url() from a one-deep page climbs one level', () => {
  const { url } = resolver('d01-site-plan', 'about');
  assert.equal(url('home'), '../index.html');
  assert.equal(url('services/adu'), '../services/adu/index.html');
});

test('asset() reaches repo-root shared assets from every depth', () => {
  assert.equal(resolver('d01-site-plan', 'home').asset('rebar.webp'), '../assets/rebar.webp');
  assert.equal(resolver('d01-site-plan', 'about').asset('rebar.webp'), '../../assets/rebar.webp');
  assert.equal(resolver('d01-site-plan', 'services/adu').asset('og/rebar.jpg'),
    '../../../assets/og/rebar.jpg');
});

test('local() reaches the direction-local stylesheet', () => {
  assert.equal(resolver('d01-site-plan', 'home').local('assets/styles.css'), 'assets/styles.css');
  assert.equal(resolver('d01-site-plan', 'about').local('assets/styles.css'),
    '../assets/styles.css');
  assert.equal(resolver('d01-site-plan', 'services/adu').local('assets/styles.css'),
    '../../assets/styles.css');
});

test('root() reaches repo-root files that sit beside the direction folders', () => {
  assert.equal(resolver('d01-site-plan', 'home').root('favicon.svg'), '../favicon.svg');
  assert.equal(resolver('d01-site-plan', 'services/adu').root('favicon.svg'),
    '../../../favicon.svg');
});

test('canonical URLs are absolute, directory-form and origin-prefixed', () => {
  assert.equal(resolver('d01-site-plan', 'home').canonical, `${ORIGIN}/d01-site-plan/`);
  assert.equal(resolver('d01-site-plan', 'services/adu').canonical,
    `${ORIGIN}/d01-site-plan/services/adu/`);
  assert.equal(resolver('d01-site-plan', 'about').canonical,
    `${ORIGIN}/d01-site-plan/about-us/`);
});

test('abs() resolves any page key, not just the current one', () => {
  const r = resolver('d01-site-plan', 'services/adu');
  assert.equal(r.abs('home'), `${ORIGIN}/d01-site-plan/`);
  assert.equal(r.abs('service-areas/mesa-az'), `${ORIGIN}/d01-site-plan/service-areas/mesa-az/`);
});

test('an unknown page key throws rather than emitting a silently broken link', () => {
  const { url } = resolver('d01-site-plan', 'home');
  assert.throws(() => url('services/does-not-exist'), /unknown page key/);
  assert.throws(() => outPath('nope'), /unknown page key/);
});

test('every page key round-trips through outPath without collision', () => {
  const seen = new Set();
  for (const k of PAGE_KEYS) {
    const p = outPath(k);
    assert.ok(!seen.has(p), `two keys map to ${p}`);
    seen.add(p);
  }
  assert.equal(seen.size, 31);
});
