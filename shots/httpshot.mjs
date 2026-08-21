// Full-page screenshot of a URL served over HTTP, plus the console log.
//   node httpshot.mjs http://localhost:8099/404.html ./out.png [width]
//
// page.mjs builds a file:// URL, which cannot check the standalone site's 404:
// that page addresses everything root-absolutely (it is served in place of
// whatever URL was requested, so a relative path would resolve against the
// missing one) and under file:// a leading slash means the drive root.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [, , url, out, widthArg] = process.argv;
const width = Number(widthArg) || 1440;
// Random port AND a throwaway profile per invocation, for the same reason
// page.mjs does it: a fixed port reattaches to a stale Chrome and shoots the
// old page.
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${width},1200`,
  url,
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(path) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
      if (r.ok) return r.json();
    } catch { /* chrome is not up yet */ }
    await sleep(120);
  }
  throw new Error('chrome never came up');
}

const targets = await json('/json/list');
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const problems = [];

ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
    problems.push(m.params.entry.text);
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    problems.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  }
});
await new Promise((r) => ws.addEventListener('open', r));

const send = (method, params = {}) => new Promise((r) => {
  const n = ++id;
  pending.set(n, r);
  ws.send(JSON.stringify({ id: n, method, params }));
});

await send('Log.enable');
await send('Runtime.enable');
await send('Page.enable');
await sleep(1400);

// Scroll the whole page so lazy images decode before the capture.
await send('Runtime.evaluate', {
  awaitPromise: true,
  expression: `(async()=>{
    const h=document.documentElement.scrollHeight;
    for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}
    window.scrollTo(0,0);
    await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
  })()`,
});

const report = await send('Runtime.evaluate', {
  returnByValue: true,
  expression: `(()=>({
    title: document.title,
    h: document.documentElement.scrollHeight,
    vw: document.documentElement.clientWidth,
    scrollW: (()=>{window.scrollTo(9999,0);const x=window.scrollX;window.scrollTo(0,0);
      return window.innerWidth + x;})(),
    broken: [...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.currentSrc||i.src),
    fonts: [...document.fonts].map(f=>f.family+' '+f.weight+' '+f.status),
  }))()`,
});

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(JSON.stringify({ ...report.result.value, consoleErrors: problems }, null, 1));
console.log(`wrote ${out}`);

ws.close();
chrome.kill();
process.exit(0);
