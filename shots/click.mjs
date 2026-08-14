// Drive a real click on the gallery's palette dots via CDP and capture the result.
// Node 24 ships a global WebSocket, so no `ws` dependency is needed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// random port + throwaway profile: a fixed port silently reattaches to a stale
// Chrome from an earlier run and reports the OLD page's state
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;
const DIR = 'C:/Users/tagal/quest-construction-designs';
const target = process.argv[2] || 'palHivis';
const out = process.argv[3] || `${DIR}/shots/click-hivis.png`;

const chrome = spawn(CHROME, [
  // file-access flag lets us read --acc from inside each preview iframe, which
  // is the only real proof the swap landed rather than just the src changing
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, '--window-size=1440,1400',
  `file:///${DIR}/index.html`,
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function json(path) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(300);
  }
  throw new Error('devtools never came up');
}

const pages = await json('/json/list');
const page = pages.find(p => p.type === 'page' && p.url.includes('index.html'));
if (!page) throw new Error('gallery page not found');

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener('open', r));

function send(method, params = {}) {
  const mid = ++id;
  return new Promise(res => { pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
}

await send('Page.enable');
await send('Runtime.enable');

// wait for the gallery's own script to lay the deck out first — scrolling before
// that means scrollHeight is still short and the lower cards never intersect
await sleep(3000);

// previews are lazy — scroll the whole deck so all seven iframes spawn
await send('Runtime.evaluate', {
  expression: `(async()=>{const h=document.body.scrollHeight;
    for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}
    window.scrollTo(0,0);})()`,
  awaitPromise: true,
});
await sleep(7000);

const before = await send('Runtime.evaluate', {
  expression: `document.querySelectorAll('.dcard iframe').length`, returnByValue: true,
});
console.log('previews loaded:', before.result?.result?.value);

// click the dot exactly as a user would, then let the frames reload
const clicked = await send('Runtime.evaluate', {
  expression: `(()=>{const b=document.getElementById(${JSON.stringify(target)});if(!b)return 'NO BUTTON';b.click();
    return document.getElementById('palLabel').textContent;})()`,
  returnByValue: true,
});
console.log('CLICK ->', clicked.result?.result?.value);

await sleep(8000);

// the real check: what --acc is actually live inside each preview document
const applied = await send('Runtime.evaluate', {
  expression: `(()=>{try{return JSON.stringify([...document.querySelectorAll('.dcard')].map(c=>{
      const f=c.querySelector('iframe'); if(!f) return c.querySelector('h2').textContent+': NO FRAME';
      const d=f.contentDocument;
      const acc=d?getComputedStyle(d.documentElement).getPropertyValue('--acc').trim():'?';
      return c.querySelector('h2').textContent+': '+acc;
    }),null,1);}catch(e){return 'ERROR: '+e.message}})()`,
  returnByValue: true,
});
console.log('live --acc per preview ->', applied.result?.result?.value);
const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);

ws.close();
chrome.kill();
process.exit(0);
