// The browser harness every probe in this folder runs on.
//
// It used to be copy-pasted twelve times — 394 of the 712 lines here were the
// same launch-connect-teardown block, and eleven of the twelve hardcoded one
// machine's absolute path. Each script is now just its probe.
//
// Four traps this block was bitten by, fixed once instead of twelve times:
//
//   Give every run a random port AND its own --user-data-dir. With a fixed
//   port a new launch silently attaches to a leftover Chrome from an earlier
//   run and screenshots the OLD page. A layout bug that was already fixed kept
//   "reproducing" for three rounds because of this.
//
//   img.complete goes true well before the pixels exist, so a fixed wait plus
//   a completeness check reaches the screenshot with photo boxes still blank,
//   and they read as layout bugs. settle() awaits img.decode() on every image
//   after walking the page, which is also what makes probe's old
//   below-the-fold false positive go away.
//
//   Put a deadline on every decode. decode() on a lazy image the scroll pass
//   never brought into view does not reject — it waits for a load that is not
//   coming. One page in the set had five, and the probe answered nothing at
//   all: no output, no error, no timeout, which reads as a hung machine.
//
//   Close the whole browser, not the launcher. Chrome forks a browser process
//   and a renderer per tab; on Windows killing the launcher orphans both. A
//   sweep of eighty pages left thirty live chrome.exe behind and each run got
//   slower until the probe stopped answering — which reads as a hung script,
//   not a leak.
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
/** The repo root, derived rather than hardcoded to one person's disk. */
export const REPO = resolvePath(HERE, '..');
export const CHROME = process.env.CHROME
  || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A target is either an http(s) URL — which is the only way to exercise a page
 * that addresses anything root-absolutely, such as the 404 — or a path
 * relative to this folder, the way every script here has always taken one.
 */
export function targetUrl(target, { acc } = {}) {
  if (/^https?:\/\//.test(target)) return target;
  const href = pathToFileURL(resolvePath(HERE, target)).href;
  return acc ? `${href}?acc=${acc}` : href;
}

/**
 * Walk the whole surface and wait for the pixels, not just the load event.
 *
 * Every decode is raced against a deadline. decode() on a lazy image the
 * scroll pass never brought into view does not reject — it waits for a load
 * that is not coming, forever. One page in the set reliably had five such
 * images, and the probe simply stopped answering: no output, no error, no
 * timeout. A settle that gives up is worth far more than one that is exact.
 */
const SETTLE_EXPR = `(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 600) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
  const deadline = (p, ms) => Promise.race([
    p.catch(() => {}), new Promise(r => setTimeout(r, ms)),
  ]);
  await deadline(
    Promise.all([...document.images].map(i => deadline(i.decode(), 2500))),
    6000,
  );
  await new Promise(r => setTimeout(r, 120));
  return true;
})()`;


/**
 * What went wrong on this page, and what is sticking out past the viewport.
 * Naming the offending elements is far quicker than eyeballing a screenshot of
 * a page that scrolls sideways.
 */
export const DIAGNOSE = `(() => {
  const vw = window.innerWidth;
  const label = (e) => e.tagName.toLowerCase()
    + '.' + String(e.className || '').trim().split(/\s+/).join('.');
  return {
    vw,
    scrollW: document.documentElement.scrollWidth,
    h: document.body.scrollHeight,
    broken: [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.getAttribute('src')),
    wide: [...document.querySelectorAll('body *')]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > vw + 2 || r.left < -2)
          && getComputedStyle(e).position !== 'fixed';
      })
      .slice(0, 15)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return label(e) + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']';
      }),
  };
})()`;

/**
 * Open a page, hand it to `fn`, and always close it down afterwards.
 *
 * @param opts { width, height, acc, wait, scroll }
 *   wait   — ms to settle before the scroll pass (default 1400)
 *   scroll — walk the page and decode its images (default true); turn it off
 *            only for a probe that cares about the initial scroll position
 *   flags  — extra Chrome flags, e.g. --allow-file-access-from-files, which is
 *            what lets a probe script into an iframe it loaded from disk
 */
export async function withPage(target, opts = {}, fn) {
  const {
    width = 1440, height = 1200, acc, wait = 1400, scroll = true, flags = [],
  } = opts;
  const url = targetUrl(target, { acc });
  const port = 9000 + Math.floor(Math.random() * 4000);
  const profile = `${process.env.TEMP || '/tmp'}/cdp-${port}`;

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`, ...flags, url,
  ], { stdio: 'ignore' });
  LIVE.add(chrome.pid);

  let ws;
  try {
    const list = await devtools(port, '/json/list');
    const target0 = list.find((t) => t.type === 'page');
    if (!target0) throw new Error('chrome opened no page');
    ws = new WebSocket(target0.webSocketDebuggerUrl);

    let id = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id); }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push(m.params.entry.text);
      }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
      }
    });
    await new Promise((r) => ws.addEventListener('open', r));

    const send = (method, params = {}) => new Promise((resolveSend) => {
      const n = ++id;
      pending.set(n, resolveSend);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

    const evaluate = async (expression, o = {}) => {
      const r = await send('Runtime.evaluate', {
        expression, returnByValue: true, awaitPromise: false, ...o,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description || 'evaluate threw');
      }
      return r.result?.value;
    };

    const settle = () => evaluate(SETTLE_EXPR, { awaitPromise: true });

    const screenshot = async (o = {}) => {
      const shot = await send('Page.captureScreenshot', { format: 'png', ...o });
      return Buffer.from(shot.data, 'base64');
    };

    const diagnose = () => evaluate(DIAGNOSE);

    // Resize the viewport to the whole page rather than using
    // captureBeyondViewport: the latter hangs on pages that stack several
    // backdrop-filter layers, which several directions do.
    const fullPageShot = async () => {
      const { h } = await diagnose();
      await send('Emulation.setDeviceMetricsOverride', {
        width, height: Math.min(h + 20, 16000), deviceScaleFactor: 1, mobile: false,
      });
      await sleep(900);
      const png = await screenshot();
      await send('Emulation.clearDeviceMetricsOverride');
      return png;
    };

    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');
    await sleep(wait);
    if (scroll) await settle();

    return await fn({
      send, evaluate, settle, screenshot, diagnose, fullPageShot,
      errors, url, width, height,
    });
  } finally {
    LIVE.delete(chrome.pid);
    try { ws?.close(); } catch { /* already gone */ }
    await shutDown(chrome);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* in use */ }
  }
}

/**
 * Browsers this process started and has not yet closed. A probe that throws
 * past the finally, or is interrupted, would otherwise leave one running.
 */
const LIVE = new Set();
process.on('exit', () => {
  for (const pid of LIVE) {
    try { spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* gone */ }
  }
});

/**
 * Chrome's launcher forks a browser process and a renderer per tab, and on
 * Windows killing the launcher orphans both. A sweep of eighty pages left
 * thirty live chrome.exe behind, which is why each successive run got slower
 * until the probe stopped answering at all. Ask Chrome to close first, then
 * take the whole tree down.
 */
async function shutDown(chrome) {
  try { chrome.kill(); } catch { /* already gone */ }
  if (process.platform !== 'win32' || !chrome.pid) return;
  await new Promise((done) => {
    const t = setTimeout(done, 4000);
    const kill = spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    kill.on('exit', () => { clearTimeout(t); done(); });
    kill.on('error', () => { clearTimeout(t); done(); });
  });
}

async function devtools(port, path) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${path}`);
      if (r.ok) return r.json();
    } catch { /* chrome is not up yet */ }
    await sleep(150);
  }
  throw new Error('devtools never came up');
}

/**
 * Every script here prints one JSON blob and ends; this is that ending.
 *
 * It used to call process.exit(0), and every probe calls it from INSIDE the
 * withPage callback — so the exit fired before the finally block, the browser
 * was never closed, and each run left a browser behind. Node leaves once the
 * socket is closed and the browser is gone, which is what the finally does.
 */
export function report(value) {
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 1));
}
