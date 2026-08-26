// The accent bar at the foot of the closing plate, photographed on its own and
// on each palette. It is the one element whose ink flips — near-black on gold
// and orange, white on clay — so a change that looks like depth on the live
// palette can be a contrast failure on another.
//   node ctabar.mjs [width]
import fs from 'node:fs';
import { withPage } from './cdp.mjs';

const width = Number(process.argv[2]) || 1440;
const PALETTES = { orange: '#D07C42', gold: '#D9A93C', clay: '#A8543A' };
const ON = { orange: '#1C1208', gold: '#191307', clay: '#ffffff' };

const manifest = {};

await withPage('../site/index.html', { width, height: 900 }, async (page) => {
  await page.evaluate(`document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))`);

  for (const [name, acc] of Object.entries(PALETTES)) {
    await page.evaluate(`(() => {
      const r = document.documentElement.style;
      r.setProperty('--acc', ${JSON.stringify(acc)});
      r.setProperty('--on-acc', ${JSON.stringify(ON[name])});
      const b = document.querySelector('.cta-bar');
      b.scrollIntoView({block:'center'});
    })()`);
    await new Promise((r) => setTimeout(r, 450));
    const box = JSON.parse(await page.evaluate(`(() => {
      const b = document.querySelector('.cta-bar').getBoundingClientRect();
      // captureScreenshot clips in document coordinates and
      // getBoundingClientRect is viewport-relative — without the scroll
      // offset the clip lands on the cream a screen above the plate.
      return JSON.stringify({x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height});
    })()`));
    // A generous margin, because the point of the change is the shadow the
    // bar throws OUTSIDE itself.
    const pad = 54;
    const clip = {
      x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
      width: box.w + pad * 2, height: box.h + pad * 2, scale: 1,
    };
    fs.writeFileSync(`./bar-${name}.png`, await page.screenshot({ clip }));

    // And again with everything on the bar hidden. Measuring contrast off the
    // first shot finds the glyphs and reports 1:1 against themselves; what is
    // actually wanted is the field they sit on, which is only visible once
    // they are out of the way.
    await page.evaluate(`document.querySelectorAll('.cta-bar>*')
      .forEach(e=>{e.style.visibility='hidden'})`);
    await new Promise((r) => setTimeout(r, 200));
    fs.writeFileSync(`./bar-${name}-bare.png`, await page.screenshot({ clip }));
    await page.evaluate(`document.querySelectorAll('.cta-bar>*')
      .forEach(e=>{e.style.visibility=''})`);

    // Where the bar actually landed inside the PNG. The clip clamps at the
    // document edge, so the margin is not always the pad that was asked for,
    // and a contrast scan that assumes it walks off the bar and onto the dark
    // plate behind — which reads as a contrast failure that is not one.
    // And the band the type actually occupies, rather than a guess at it. Only
    // two things put ink straight onto the bar's own surface: the prompt, and
    // the outlined phone button, which is transparent. The solid button brings
    // its own background, so what is behind it does not matter.
    // Each box in PNG coordinates, grown by a margin, because the question is
    // "is every glyph on a field that carries it" and not "is the whole bar
    // one flat colour". The middle of the bar, where nothing is ever read, is
    // free to carry as much texture as it likes.
    const M = 10;
    const type = JSON.parse(await page.evaluate(`(() => {
      const M = ${M};
      return JSON.stringify([...document.querySelectorAll('.cta-bar .mono, .cta-bar .btn.ghost')]
        .map((e) => { const r = e.getBoundingClientRect(); return {
          x: Math.round(r.left - ${clip.x} + scrollX) - M,
          y: Math.round(r.top - ${clip.y} + scrollY) - M,
          w: Math.round(r.width) + M * 2,
          h: Math.round(r.height) + M * 2,
        }; }));
    })()`));

    manifest[name] = {
      x: Math.round(box.x - clip.x), y: Math.round(box.y - clip.y),
      w: Math.round(box.w), h: Math.round(box.h), type,
    };
    console.log('wrote', `bar-${name}.png`, `${Math.round(box.w)}x${Math.round(box.h)}`,
      `bar at ${manifest[name].x},${manifest[name].y}`);
  }
  fs.writeFileSync('./bar-boxes.json', JSON.stringify(manifest, null, 2));
});
