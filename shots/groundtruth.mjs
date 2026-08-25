// What a glyph is REALLY sitting on, measured from the rendered pixels.
//   node shots/groundtruth.mjs ../d06-red-iron/index.html ".blk.tall .n" clay
//
// getComputedStyle can only report an ancestor's background colour. When the
// ground is painted by a sibling layer — a photograph under a gradient scrim —
// that number is not what anyone sees. acctext.mjs marks those findings
// `layered` and leaves the ratio null; this settles them.
//
// It screenshots the element's own box, treats pixels near the text colour as
// type and everything else as ground, and reports the ratio against the mean
// ground as well as the single worst pixel. Over a photograph the worst pixel
// is always about 1:1 somewhere — judge by the mean, and by eye.
import { withPage, report } from './cdp.mjs';

const [, , page, selector, acc = 'clay'] = process.argv;
if (!page || !selector) {
  console.error('usage: node shots/groundtruth.mjs <page> "<selector>" [acc]');
  process.exit(1);
}

await withPage(page, { acc, flags: ['--allow-file-access-from-files'] }, async (p) => {
  const box = JSON.parse(await p.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('no element matches ' + ${JSON.stringify(selector)});
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return JSON.stringify({
      x: r.x, y: r.y, w: r.width, h: r.height,
      sx: window.scrollX, sy: window.scrollY,
      color: getComputedStyle(el).color,
    });
  })()`));
  await new Promise((r) => setTimeout(r, 700));
  const png = await p.screenshot({
    clip: { x: box.x + box.sx, y: box.y + box.sy, width: box.w, height: box.h, scale: 1 },
  });
  const b64 = png.toString('base64');
  const out = await p.evaluate(`(async () => {
    const img = new Image();
    img.src = 'data:image/png;base64,${b64}';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const chan = (v) => { const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    const lum = (r, g, b) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
    const glyph = [${JSON.stringify(box.color)}].join('').match(/\\d+/g).slice(0, 3).map(Number);
    const gl = lum(...glyph);
    // Pixels close to the glyph colour are the type; everything else is ground.
    let n = 0, worst = 99, sum = 0, count = 0;
    for (let i = 0; i < d.length; i += 4) {
      const near = Math.abs(d[i] - glyph[0]) < 26 && Math.abs(d[i + 1] - glyph[1]) < 26
        && Math.abs(d[i + 2] - glyph[2]) < 26;
      if (near) { n++; continue; }
      const l = lum(d[i], d[i + 1], d[i + 2]);
      sum += l; count++;
      const [hi, lo] = [gl, l].sort((a, b) => b - a);
      const ratio = (hi + 0.05) / (lo + 0.05);
      if (ratio < worst) worst = ratio;
    }
    const meanL = sum / count;
    const [hi, lo] = [gl, meanL].sort((a, b) => b - a);
    return JSON.stringify({
      glyph: glyph.join(','), glyphLum: +gl.toFixed(3),
      typePixels: n, groundPixels: count,
      meanGroundLum: +meanL.toFixed(3),
      ratioVsMeanGround: +((hi + 0.05) / (lo + 0.05)).toFixed(2),
      worstSinglePixel: +worst.toFixed(2),
    }, null, 1);
  })()`, { awaitPromise: true });
  report(JSON.parse(out));
});
