// Parsing helpers for the scraped Quest archive. Deliberately regex-based:
// the source is machine-generated, uniformly structured HTML, and pulling in a
// DOM parser would break the repo's zero-dependency rule for no gain.

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#x27;': "'", '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
  '&#8594;': '→', '&rarr;': '→', '&#8212;': '—', '&mdash;': '—',
  '&#8211;': '–', '&ndash;': '–', '&#9670;': '◆',
};

// Headings count things in words, not digits, and a typed word goes stale
// silently: "Serving Eleven Arizona Cities" sat on the contact page through
// three rounds of new city pages and was wrong by twenty-three of them. Every
// counted word on the site comes from here now, so the sentence cannot drift
// from the list it describes.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
  'eighty', 'ninety'];

/** A count as an English word: 15 -> 'fifteen', 34 -> 'thirty-four'. */
export function words(n) {
  if (n < 20) return WORDS[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${WORDS[n % 10]}` : '');
  return String(n);
}

/** The same, capitalised for a heading. */
export const Words = (n) => words(n).replace(/^./, (c) => c.toUpperCase());

export function decode(s) {
  return String(s).replace(/&(?:#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m) => {
    if (ENTITIES[m]) return ENTITIES[m];
    const hex = /^&#x([0-9a-fA-F]+);$/.exec(m);
    if (hex) return String.fromCodePoint(parseInt(hex[1], 16));
    const dec = /^&#(\d+);$/.exec(m);
    if (dec) return String.fromCodePoint(Number(dec[1]));
    return m;
  });
}

export function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, ' ');
}

export function text(s) {
  return decode(stripTags(s)).replace(/\s+/g, ' ').trim();
}

export function matchAll(html, re, group = 1) {
  return [...String(html).matchAll(re)].map((m) => m[group]);
}

export function section(html, className) {
  const re = new RegExp(
    `<section[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</section>`,
  );
  const m = re.exec(String(html));
  return m ? m[1] : null;
}
