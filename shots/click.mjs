// Drive a real click on the gallery's palette dots via CDP and capture the result.
// Node 24 ships a global WebSocket, so no `ws` dependency is needed.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9412;
const DIR = 'C:/Users/tagal/quest-construction-designs';
const target = process.argv[2] || 'palHivis';
const out = process.argv[3] || `${DIR}/shots/click-hivis.png`;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
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
await sleep(4500); // let the three iframe previews load

// click the dot exactly as a user would, then let the frames reload
const clicked = await send('Runtime.evaluate', {
  expression: `(()=>{const b=document.getElementById(${JSON.stringify(target)});if(!b)return 'NO BUTTON';b.click();
    return document.getElementById('palLabel').textContent+' | '+
      [...document.querySelectorAll('.dcard iframe')].map(f=>f.getAttribute('src')).join(' , ');})()`,
  returnByValue: true,
});
console.log('CLICK ->', clicked.result?.result?.value);

await sleep(5000);
const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);

ws.close();
chrome.kill();
process.exit(0);
