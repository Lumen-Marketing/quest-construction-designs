// The browser harness every probe in this folder runs on.
//
// It used to be copy-pasted twelve times — 394 of the 712 lines here were the
// same launch-connect-teardown block, and eleven of the twelve hardcoded one
// machine's absolute path. Each script is now just its probe.
//
// Two traps this block was bitten by, fixed once instead of twelve times:
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
import { spawn } from 'node:child_process';
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

/** Walk the whole surface and wait for the pixels, not just the load event. */
const SETTLE_EXPR = `(async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 600) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
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
    try { ws?.close(); } catch { /* already gone */ }
    chrome.kill();
  }
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

/** Every script here prints one JSON blob and exits; this is that ending. */
export function report(value) {
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 1));
  process.exit(0);
}
