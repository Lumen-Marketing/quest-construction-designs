"""Writes the smaller copies of every photograph, and the list of them.

    python tools/responsive-images.py        (needs Pillow with WebP)

A 190px gallery thumbnail was downloading a 1125x1500 original, and a phone
fetched the same master a 1440px desktop did. For each photograph under
assets/quest/ and assets/stock/ this writes a copy 480 and 960 pixels wide,
where that copy is meaningfully smaller than the original, to
assets/w480/<path> and assets/w960/<path>, and records which exist in
content/image-variants.json. build/lib/images.mjs reads that file to write a
srcset; build/lib/images.test.mjs holds it to the files on disk.

Run it after adding a photograph and after `node build/measure-images.mjs`.
The copies are resized and re-encoded only. The stock placeholders' licences
allow that; do not crop or recolour them here (see content/outsourced.json).
"""
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (480, 960)
# The house setting for photographs on the web: LANCZOS, quality 78.
QUALITY = 78
PHOTO = re.compile(r"(quest|stock)/[^/]+\.webp")
# A copy earns its place by being smaller. Most of the library is 1125px wide
# phone photography, where a 960 copy came out within a tenth of the original
# and would have added 15MB to the repository to save nothing worth having.
# One that does not beat this is deleted rather than shipped.
WORTH_IT = 0.85


def main():
    sizes = json.loads((ROOT / "content" / "images.json").read_text(encoding="utf-8"))
    variants = {}
    written = 0
    for rel, (w, h) in sorted(sizes.items()):
        if not PHOTO.fullmatch(rel) or rel == "quest/logo.webp":
            continue
        # A copy within a tenth of the original's width saves almost nothing
        # and is one more file to keep in step.
        want = [x for x in WIDTHS if x <= w * 0.9]
        if not want:
            continue
        src = ROOT / "assets" / rel
        kept = []
        with Image.open(src) as im:
            im.load()
            icc = im.info.get("icc_profile")
            for x in want:
                out = ROOT / "assets" / f"w{x}" / rel
                if not (out.exists() and out.stat().st_mtime >= src.stat().st_mtime):
                    out.parent.mkdir(parents=True, exist_ok=True)
                    copy = im.resize((x, round(h * x / w)), Image.LANCZOS)
                    opts = {"quality": QUALITY, "method": 6}
                    if icc:
                        opts["icc_profile"] = icc
                    copy.save(out, "WEBP", **opts)
                    written += 1
                if out.stat().st_size < src.stat().st_size * WORTH_IT:
                    kept.append(x)
                else:
                    out.unlink()
        if kept:
            variants[rel] = kept
    path = ROOT / "content" / "image-variants.json"
    path.write_text(json.dumps(variants, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"{len(variants)} photographs, {written} copies written")


if __name__ == "__main__":
    main()
