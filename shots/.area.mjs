import { withPage } from './cdp.mjs';
const w = Number(process.argv[2]);
await withPage('https://quest-construction-site.vercel.app/', { width: w, height: 800, wait: 1500 }, async (p) => {
  console.log(w, await p.evaluate(`(() => {
    const out = [];
    document.querySelectorAll('.drop').forEach((d, i) => {
      d.classList.add('open');
      const panel = d.querySelector('.dropmenu');
      const pb = panel.getBoundingClientRect();
      const as = [...panel.querySelectorAll('a')];
      const spill = as.filter((a) => a.scrollWidth > a.clientWidth + 1)
        .map((a) => a.textContent.trim().slice(0,28) + ' ' + a.scrollWidth + '>' + a.clientWidth);
      // Do any two links actually paint over each other?
      const clash = [];
      for (let x = 0; x < as.length; x++) for (let y = x + 1; y < as.length; y++) {
        const A = as[x].getBoundingClientRect(), B = as[y].getBoundingClientRect();
        // compare painted text extent, not the box
        const aR = A.left + as[x].scrollWidth, bL = B.left;
        if (A.top < B.bottom && B.top < A.bottom && aR > bL + 2 && A.left < B.left) {
          clash.push(as[x].textContent.trim().slice(0,24) + ' >< ' + as[y].textContent.trim().slice(0,24));
        }
      }
      out.push({ i, vw: innerWidth, panelW: Math.round(pb.width),
        track: getComputedStyle(panel).gridTemplateColumns, spill, clash });
    });
    return JSON.stringify(out);
  })()`));
});
