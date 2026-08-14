// Fast layout probe — no screenshot. Reports broken images and any element
// sticking out past the viewport, which is the usual cause of a page that
// scrolls sideways.   node probe.mjs ../direction-7-bid-desk.html [width]
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${width},1200`,
  `file:///${DIR}/${file.replace(/^\.\.\//, '')}`,
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
const send = (method, params = {}) => {
  const mid = ++id;
  return new Promise(res => { pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
};

await send('Runtime.enable');
await sleep(2500);

const r = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    vw:window.innerWidth, scrollW:document.documentElement.scrollWidth, h:document.body.scrollHeight,
    broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')),
    wide:[...document.querySelectorAll('body *')].map(function(e){
      var b=e.getBoundingClientRect();
      return {e:e, r:b};
    }).filter(function(o){
      return o.r.width>0 && (o.r.right>window.innerWidth+2 || o.r.left<-2) &&
             getComputedStyle(o.e).position!=='fixed';
    }).slice(0,15).map(function(o){
      return o.e.tagName.toLowerCase()+'.'+String(o.e.className||'').trim().split(/\\s+/).join('.')+
             ' ['+Math.round(o.r.left)+' .. '+Math.round(o.r.right)+']';
    })
  },null,1)`,
  returnByValue: true,
});
console.log(r.result?.result?.value ?? JSON.stringify(r));
ws.close(); chrome.kill(); process.exit(0);
