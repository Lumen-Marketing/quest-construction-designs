// True 390px phone render. Chrome will not open a window narrower than ~500px,
// so the page goes inside a 390px iframe and we shoot that instead.
//   node mob.mjs ../direction-4-soft-site.html ./m4.png [height]
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, out, heightArg] = process.argv;
const height = Number(heightArg) || 6000;
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;

const wrapper = `${DIR}/shots/.mob-${PORT}.html`;
fs.writeFileSync(wrapper, `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#2a2a28}
iframe{width:390px;height:${height}px;border:0;display:block;margin:0}</style>
<iframe src="../${file.replace(/^\.\.\//, '')}"></iframe>`);

const chrome = spawn(CHROME, [
  // without --allow-file-access-from-files the wrapper cannot script into the
  // iframe, so reveals never fire and the shot comes back blank below the fold
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, '--window-size=390,1000',
  `file:///${wrapper}`,
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(p) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}${p}`); if (r.ok) return await r.json(); } catch {}
    await sleep(300);
  }
  throw new Error('devtools never came up');
}
const page = (await json('/json/list')).find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener('open', r));
const send = (m, p = {}) => { const i = ++id; return new Promise(res => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); }); };

await send('Page.enable');
await send('Runtime.enable');
await sleep(3000);

// reveals inside the iframe fire on the IFRAME's own scroll position, so drive it directly
const diag = await send('Runtime.evaluate', {
  expression: `(async()=>{try{
    var w=document.querySelector('iframe').contentWindow,d=w.document;
    d.querySelectorAll('.rv').forEach(function(e){e.classList.add('is-in')});
    // nothing scrolls inside a tall iframe, so lazy images would never fire
    [].forEach.call(d.images,function(i){i.loading='eager'});
    // wait for every frame to actually DECODE, not just for a fixed delay —
    // i.complete goes true well before the pixels exist, which is how blank
    // photo boxes kept reaching the screenshot and reading as layout bugs
    await Promise.all([].map.call(d.images,function(i){
      return i.decode?i.decode().catch(function(){}):Promise.resolve();}));
    await new Promise(r=>setTimeout(r,400));
    return JSON.stringify({
      pageH:d.body.scrollHeight, scrollW:d.documentElement.scrollWidth, vw:w.innerWidth,
      sideways:d.documentElement.scrollWidth>w.innerWidth+1,
      broken:[].filter.call(d.images,function(i){return !i.complete||i.naturalWidth===0})
               .map(function(i){return i.getAttribute('src')}),
      wide:[].slice.call(d.querySelectorAll('body *')).filter(function(e){
        var b=e.getBoundingClientRect();
        return b.width>0 && (b.right>w.innerWidth+2 || b.left<-2) &&
               w.getComputedStyle(e).position!=='fixed';
      }).slice(0,12).map(function(e){var b=e.getBoundingClientRect();
        return e.tagName.toLowerCase()+'.'+String(e.className||'').trim().split(/\\s+/).join('.')+
               ' ['+Math.round(b.left)+'..'+Math.round(b.right)+']';})
    });}catch(e){return 'ERROR: '+e.message}})()`,
  awaitPromise: true, returnByValue: true,
});
console.log(file, '->', diag.result?.result?.value);

// captureBeyondViewport does not reliably paint content far below the fold, so
// the outer window is walked down the whole surface first to force it.
await send('Runtime.evaluate', {
  expression: `(async()=>{var h=document.body.scrollHeight;
    for(var y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r));}
    window.scrollTo(0,0);await new Promise(r=>setTimeout(r,300));})()`,
  awaitPromise: true,
});

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);

fs.unlinkSync(wrapper);
ws.close(); chrome.kill(); process.exit(0);
