// Screenshot a long page as a series of viewport-sized slices.
// Use this instead of page.mjs when a page stacks several backdrop-filter
// layers — compositing one enormous surface with those hangs the renderer.
//   node slices.mjs ../direction-7-bid-desk.html ./d7 1440 1300
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, prefix, widthArg, stepArg] = process.argv;
const width = Number(widthArg) || 1440;
const step = Number(stepArg) || 1300;
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${width},${step}`,
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
const send = (m, p = {}) => { const i = ++id; return new Promise(res => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); }); };

await send('Page.enable');
await send('Runtime.enable');
await sleep(2500);

// fire every reveal up front so no slice catches a half-faded element
await send('Runtime.evaluate', {
  expression: `document.querySelectorAll('.rv').forEach(function(e){e.classList.add('is-in')});
    JSON.stringify({h:document.body.scrollHeight,w:document.documentElement.scrollWidth})`,
  returnByValue: true,
});
await sleep(900);
const h = (await send('Runtime.evaluate', { expression: 'document.body.scrollHeight', returnByValue: true }))
  .result.result.value;

for (let i = 0, y = 0; y < h; y += step, i++) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0,${y})` });
  await sleep(700);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const out = `${prefix}-${i + 1}.png`;
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('wrote', out, `(y=${y})`);
}

ws.close(); chrome.kill(); process.exit(0);
