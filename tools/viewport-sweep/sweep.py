# -*- coding: utf-8 -*-
"""Render every kind of page in the built site at real viewport sizes and
report anything that leaves the screen.

    python tools/viewport-sweep/sweep.py            # both passes
    python tools/viewport-sweep/sweep.py widths     # the width ladder only
    python tools/viewport-sweep/sweep.py devices    # device geometries only

Needs Chrome and nothing else. It serves `site/` over HTTP on a loopback port
rather than opening it from disk, because the 404 page links its stylesheet and
its navigation with root-absolute paths — correct for a page served at an
arbitrary URL, and unresolvable on file://, where it reads as a 404 page with
no CSS at all.

Chrome will not open a window narrower than 500px, so the phone widths are
driven through an iframe: an iframe has a viewport of its own and the media
queries inside it answer to the iframe's width.

What it reports, and why each one is separate:

  h-scroll        the document is wider than the window. The bug everyone
                  means by "not responsive".
  overflow        an element's box crosses the left or right edge without
                  anything scrolling it. What causes h-scroll, named.
  clipped         text wider than its box, inside something that cuts it off.
                  A long word, an email, a display heading sized wrong. The
                  clipping-ancestor test matters: without it every rotated
                  pseudo-element reports, because a 6px square turned 45deg
                  paints 3px wider than its layout box and is not clipped.
  bleed           anything leaving the viewport at all, with the ancestor
                  responsible. Read, not counted: the marquee and the service
                  tab rail are meant to run off the edge, and a section with
                  overflow:hidden is how the grid overlays are drawn.
  small targets   interactive boxes under 44px. The site's own bar is 24px,
                  which is WCAG 2.2 AA; 44px is the Apple HIG figure and is
                  reported for information.
  tiny text       under 11.5px, which the stylesheet says is the floor for a
                  phone.
"""
import functools
import http.server
import io
import json
import os
import re
import socketserver
import subprocess
import sys
import threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = os.path.join(ROOT, 'site')
PORT = 8899

CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

# One page of every kind the builder makes, not every page: the layouts repeat,
# and the two that do not — the widest trade name and the 404 — are named here.
PAGES = [
    'index.html',
    'about-us/index.html',
    'projects/index.html',
    'gallery/index.html',
    'contact-us/index.html',
    'services/index.html',
    'services/demolition/index.html',
    'services/full-remodel-kitchen-bathroomcabinets-flooring-counter-tops/index.html',
    'services/roofing/index.html',
    'service-areas/index.html',
    'service-areas/mesa-az/index.html',
    'service-areas/apache-junction-az/index.html',
    'services/roofing/phoenix-az/index.html',
    'blog/index.html',
    'blog/what-a-monsoon-does-to-an-arizona-roof/index.html',
    'sitemap/index.html',
    '404.html',
]

# Every stylesheet breakpoint, the widths either side of it, and the ends: the
# smallest phone still in use and a 4K desktop.
WIDTHS = [320, 360, 375, 390, 414, 430, 480, 520, 540, 600, 620, 640, 700,
          768, 820, 860, 900, 940, 1024, 1080, 1180, 1280, 1366, 1440, 1600,
          1920, 2560]

# Real geometries. The landscape rows are the ones a width ladder cannot reach:
# the hero is sized against the viewport height, so 844x390 is a different page
# from 844x1000.
DEVICES = [
    (320, 568, 'iPhone SE 1 portrait'),
    (360, 640, 'small Android portrait'),
    (390, 844, 'iPhone 14 portrait'),
    (430, 932, 'iPhone Pro Max portrait'),
    (568, 320, 'iPhone SE 1 landscape'),
    (640, 360, 'small Android landscape'),
    (844, 390, 'iPhone 14 landscape'),
    (932, 430, 'iPhone Pro Max landscape'),
    (768, 1024, 'iPad portrait'),
    (1024, 768, 'iPad landscape'),
    (820, 1180, 'iPad Air portrait'),
    (1180, 820, 'iPad Air landscape'),
    (1280, 800, 'small laptop'),
    (1440, 900, 'laptop'),
    (1920, 1080, 'desktop'),
    (2560, 1440, '1440p'),
    (3840, 2160, '4K'),
]


def chrome():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    raise SystemExit('no Chrome found; add its path to CHROME_CANDIDATES')


def serve():
    handler = functools.partial(QuietHandler, directory=SITE)
    httpd = socketserver.TCPServer(('127.0.0.1', PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def render(driver_file, params, w, h):
    """Write the driver into site/, run Chrome at it, take the JSON back."""
    src = io.open(os.path.join(HERE, driver_file), encoding='utf-8').read()
    inject = '<script>' + ''.join(
        'window.%s=%s;' % (k, json.dumps(v)) for k, v in params.items()
    ) + '</script>\n<script>\n'
    html = src.replace('<script>\n', inject, 1)
    path = os.path.join(SITE, '__sweep.html')
    io.open(path, 'w', encoding='utf-8', newline='').write(html)
    try:
        p = subprocess.run(
            [chrome(), '--headless=new', '--disable-gpu', '--no-sandbox',
             '--hide-scrollbars', '--force-device-scale-factor=1',
             '--window-size=%d,%d' % (max(w + 40, 900), max(h + 120, 700)),
             '--virtual-time-budget=120000', '--dump-dom',
             'http://127.0.0.1:%d/__sweep.html' % PORT],
            capture_output=True, timeout=600)
        dom = p.stdout.decode('utf-8', 'replace')
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
    m = re.search(r'<pre id="probe-result"[^>]*>(.*?)</pre>', dom, re.S)
    if not m:
        return None
    return json.loads(m.group(1).replace('&quot;', '"').replace('&lt;', '<')
                      .replace('&gt;', '>').replace('&amp;', '&'))


def widths_pass():
    print('--- width ladder: %d widths x %d pages ---' % (len(WIDTHS), len(PAGES)))
    bad = 0
    targets, tiny = {}, {}
    for w in WIDTHS:
        res = render('driver.html', {'__PAGES__': PAGES, '__WIDTH__': w,
                                     '__HEIGHT__': 900}, w, 900)
        if res is None:
            print('%5d  SWEEP FAILED' % w)
            bad += 1
            continue
        hits = 0
        for page, r in res.items():
            if 'error' in r:
                print('%5d  %-50s ERROR %s' % (w, page, r['error']))
                bad += 1
                continue
            flags = []
            if r['scrollWidth'] > r['innerWidth'] + 1:
                flags.append('h-scroll %d>%d' % (r['scrollWidth'], r['innerWidth']))
            for x in r['overflow']:
                flags.append('overflow %s' % x['el'])
            for x in r['clipped']:
                flags.append('clipped %s %r' % (x['el'], x['t']))
            if flags:
                hits += 1
                bad += 1
                print('%5d  %-50s %s' % (w, page, '; '.join(flags)))
            if w <= 620:
                for x in r['smallTargets']:
                    cur = targets.get(x['el'])
                    if cur is None or x['h'] < cur[1]:
                        targets[x['el']] = (x['w'], x['h'], w)
                for x in r['smallText']:
                    tiny[x['el']] = x['px']
        print('%5d  %s' % (w, 'clean' if not hits else '%d pages affected' % hits))
        sys.stdout.flush()

    print('\n  interactive boxes under 44px on a phone '
          '(the site\'s own bar is 24px, WCAG 2.2 AA):')
    for k, v in sorted(targets.items(), key=lambda kv: kv[1][1]):
        print('    %-26s %4dx%-4d %s' % (k, v[0], v[1],
                                         'UNDER 24' if v[1] < 24 else ''))
    print('  text under 11.5px on a phone: %s' % (tiny or 'none'))
    return bad


def devices_pass():
    print('\n--- device geometries: %d sizes x %d pages ---'
          % (len(DEVICES), len(PAGES)))
    bad = 0
    for w, h, name in DEVICES:
        res = render('driver-bleed.html', {'__PAGES__': PAGES, '__WIDTH__': w,
                                           '__HEIGHT__': h}, w, h)
        if res is None:
            print('%-26s %5dx%-5d SWEEP FAILED' % (name, w, h))
            bad += 1
            continue
        scroll, texty, deco = [], [], 0
        for page, r in res.items():
            if 'error' in r:
                print('  ERROR %s %s' % (page, r['error']))
                bad += 1
                continue
            if r['scrollWidth'] > r['w'] + 1:
                scroll.append(page)
            for b in r['bleed']:
                if b['hasText'] and b['lost'] > 2:
                    texty.append((page, b))
                else:
                    deco += 1
        bad += len(scroll)
        print('%-26s %5dx%-5d  h-scroll:%-3d  off-screen text:%-3d  bleeds:%d'
              % (name, w, h, len(scroll), len(texty), deco))
        for page, b in texty[:5]:
            print('      %-38s %-16s lost=%-5d in %s'
                  % (page[:38], b['el'], b['lost'], b['clipper']))
        sys.stdout.flush()
    print('\n  off-screen text is expected in two places and nowhere else: the'
          '\n  marquee (nav.strip, a continuous scroller) and the service tab'
          '\n  rail (.svctabs .wrap, overflow-x:auto with snap and an edge'
          '\n  fade). Anything else in that column is a finding.')
    return bad


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if not os.path.isdir(SITE):
        raise SystemExit('no site/ — run node build/site/build-site.mjs first')
    httpd = serve()
    try:
        bad = 0
        if which in ('all', 'widths'):
            bad += widths_pass()
        if which in ('all', 'devices'):
            bad += devices_pass()
    finally:
        httpd.shutdown()
    print('\n%s' % ('CLEAN' if bad == 0 else '%d findings' % bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
