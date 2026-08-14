// Full-page screenshot of one direction file over CDP.
//   node page.mjs ../direction-4-soft-site.html ./d4.png [width] [acc]
// Chrome enforces a ~500px minimum window width, so for a true phone
// viewport render the page inside a narrow iframe instead (see mob.mjs).
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, out, widthArg, acc] = process.argv;
const width = Number(widthArg) || 1440;
// Random port AND a throwaway profile per invocation. A fixed port silently
// reattaches to a stale Chrome from an earlier run and screenshots the OLD
// page — which is exactly how a fixed layout kept "failing" verification.
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;

const url = `file:///${DIR}/${file.replace(/^\.\.\//, '')}` + (acc ? `?acc=${acc}` : '');

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${width},1200`,
  url,
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function json(path) {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}${path}`); if (r.ok) return await r.json(); } catch {}
    await sleep(300);
  }
  throw new Error('devtools never came up');
}

const pages = await json('/json/list');
const page = pages.find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener('open', r));
const send = (method, params = {}) => {
  const mid = ++id;
  return new Promise(res => { pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
};

await send('Page.enable');
await send('Runtime.enable');
await sleep(2200);

// scroll the whole page so every IntersectionObserver reveal has fired
await send('Runtime.evaluate', {
  expression: `(async()=>{const h=document.body.scrollHeight;
    for(let y=0;y<h;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}
    window.scrollTo(0,0);})()`,
  awaitPromise: true,
});
await sleep(1400);

// report anything that failed to load, then shoot the full page
// name the actual elements sticking out past the viewport, not just the fact of it
const diag = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')),
    h:document.body.scrollHeight, w:document.documentElement.scrollWidth,
    wide:[...document.querySelectorAll('body *')].filter(function(e){
      var r=e.getBoundingClientRect();
      return r.width>0 && (r.right>window.innerWidth+2 || r.left<-2) &&
             getComputedStyle(e).position!=='fixed';
    }).slice(0,12).map(function(e){var r=e.getBoundingClientRect();
      return e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ').join('.')+
             ' ['+Math.round(r.left)+'..'+Math.round(r.right)+']';})
  })`,
  returnByValue: true,
});
console.log(file, '->', diag.result?.result?.value);

// Resize the viewport to the whole page rather than using captureBeyondViewport —
// the latter hangs on pages that stack several backdrop-filter layers.
const pageH = Math.min(JSON.parse(diag.result.result.value).h + 20, 16000);
await send('Emulation.setDeviceMetricsOverride', {
  width, height: pageH, deviceScaleFactor: 1, mobile: false,
});
await sleep(900);

const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);

ws.close(); chrome.kill(); process.exit(0);
