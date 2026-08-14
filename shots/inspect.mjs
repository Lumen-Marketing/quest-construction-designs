// Dump computed styles for one selector.  node inspect.mjs ../file.html ".deskbar" 1440
import { spawn } from 'node:child_process';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, sel, widthArg] = process.argv;
const width = Number(widthArg) || 1440;
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`, `--window-size=${width},1200`,
  `file:///${DIR}/${file.replace(/^\.\.\//, '')}`], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(p){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}${p}`);if(r.ok)return await r.json();}catch{}await sleep(300);}throw new Error('no devtools');}
const page = (await json('/json/list')).find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
await new Promise(r => ws.addEventListener('open', r));
const send = (m, p = {}) => { const i = ++id; return new Promise(res => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); }); };
await send('Runtime.enable');
await sleep(2200);
const r = await send('Runtime.evaluate', {
  expression: `(()=>{var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'NOT FOUND';
    var c=getComputedStyle(e),b=e.getBoundingClientRect();
    return JSON.stringify({cls:e.className,pos:c.position,left:c.left,width:c.width,
      transform:c.transform,translate:c.translate,rect:[Math.round(b.left),Math.round(b.right)]},null,1);})()`,
  returnByValue: true,
});
console.log(r.result?.result?.value);
ws.close(); chrome.kill(); process.exit(0);
