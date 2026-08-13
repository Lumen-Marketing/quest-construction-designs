"""Search Wikimedia Commons for freely-licensed machine photos.

Usage:  python search.py "wheel loader"  ["bulldozer" ...]
Prints  LICENSE | WIDTHxHEIGHT | title | thumb-url  for CC0 / CC BY / PD hits.
"""
import sys, json, urllib.parse, urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "QuestConstructionMockups/1.0 (contact: build@questconstruction.com)"
OK = ("cc0", "public domain", "cc by", "cc-by", "pdm")


def search(term, limit=18):
    q = {
        "action": "query", "generator": "search",
        "gsrsearch": f"filetype:bitmap {term}",
        "gsrnamespace": "6", "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": "1800", "format": "json",
    }
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(q),
                                 headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        data = json.load(r)
    for page in (data.get("query", {}).get("pages") or {}).values():
        ii = (page.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata", {})
        lic = (meta.get("LicenseShortName", {}).get("value") or "?").strip()
        if not any(k in lic.lower() for k in OK):
            continue
        w, h = ii.get("width", 0), ii.get("height", 0)
        if w < 1200:
            continue
        print(f"{lic:<22} | {w}x{h:<6} | {page['title'][5:]:<58} | {ii.get('thumburl','')}")


if __name__ == "__main__":
    for t in sys.argv[1:]:
        print(f"\n===== {t} =====")
        try:
            search(t)
        except Exception as e:
            print("  ! failed:", e)
