// Open the first nav dropdown and report whether it is actually visible.
import { spawn } from 'node:child_process';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIR = 'C:/Users/tagal/quest-construction-designs';
const [, , file, widthArg] = process.argv;
const width = Number(widthArg) || 1440;
const PORT = 9000 + Math.floor(Math.random() * 4000);
const PROFILE = `${process.env.TEMP || '/tmp'}/cdp-${PORT}`;
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars',`--user-data-dir=${PROFILE}`,
  `--remote-debugging-port=${PORT}`,`--window-size=${width},1200`,
  `file:///${DIR}/${file.replace(/^\.\.\//,'')}`],{stdio:'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(p){for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${PORT}${p}`);if(r.ok)return await r.json();}catch{}await sleep(300);}throw new Error('no devtools');}
const page = (await json('/json/list')).find(p => p.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id=0; const pending=new Map();
ws.addEventListener('message', e=>{const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
await new Promise(r=>ws.addEventListener('open',r));
const send=(m,p={})=>{const i=++id;return new Promise(res=>{pending.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}));});};
await send('Runtime.enable');
await sleep(2000);
const r = await send('Runtime.evaluate', {
  expression: `(()=>{var d=document.querySelector('.drop');if(!d)return 'NO DROP';
    d.classList.add('open');
    var panel=d.querySelector('.mega,.panel,.menu,.zpanel,.pinned,.flyout');
    if(!panel)return 'NO PANEL';
    var b=panel.getBoundingClientRect();
    var links=panel.querySelectorAll('a').length;
    var nav=document.querySelector('.nav'),ns=getComputedStyle(nav);
    // is the panel's midpoint actually hit-testable, or clipped away?
    var el=document.elementFromPoint(Math.round(b.left+b.width/2),Math.round(b.top+8));
    return JSON.stringify({navOverflow:ns.overflowX+'/'+ns.overflowY,
      panel:{top:Math.round(b.top),h:Math.round(b.height),w:Math.round(b.width),links:links},
      hit:el?el.tagName.toLowerCase()+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:''):null});})()`,
  returnByValue: true,
});
console.log(file, r.result?.result?.value);
ws.close(); chrome.kill(); process.exit(0);
