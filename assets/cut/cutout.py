"""Knock the background out of a photo and save a tightly-trimmed RGBA PNG.

Produces the true foreground subjects the layered heroes need — a machine or a
worker with no rectangular frame, so it can sit on top of a colour panel and
break past its edge instead of being another box next to a box.

Usage:  python cutout.py <in.jpg> <out.png> [--alpha-floor N] [--max-w N]
"""
import sys, pathlib
import numpy as np
from PIL import Image
from rembg import remove, new_session

SESSION = new_session("isnet-general-use")


def cutout(src: str, dst: str, alpha_floor: int = 12, max_w: int = 1700, largest: bool = False) -> None:
    im = Image.open(src).convert("RGB")
    out = remove(im, session=SESSION, post_process_mask=True).convert("RGBA")

    a = np.array(out)
    alpha = a[:, :, 3]

    # Kill the halo of near-transparent pixels the matte leaves behind; without
    # this the subject carries a grey fringe once it sits on a colour panel.
    alpha[alpha < alpha_floor] = 0
    a[:, :, 3] = alpha

    if largest:
        # The matte happily keeps every unrelated object it finds — offcut lumber,
        # ground debris. Keep only the biggest connected blob so the subject
        # arrives alone and the trim box is actually tight around it.
        from scipy import ndimage
        lbl, n = ndimage.label(alpha > 0)
        if n > 1:
            keep = 1 + np.argmax(ndimage.sum(alpha > 0, lbl, range(1, n + 1)))
            alpha[lbl != keep] = 0
            a[:, :, 3] = alpha
            print(f"  dropped {n - 1} stray fragment(s)")

    ys, xs = np.nonzero(alpha)
    if len(xs) == 0:
        raise SystemExit(f"nothing survived the matte for {src}")
    out = Image.fromarray(a).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    if out.width > max_w:
        h = round(out.height * max_w / out.width)
        out = out.resize((max_w, h), Image.LANCZOS)

    out.save(dst, "PNG", optimize=True)
    kb = pathlib.Path(dst).stat().st_size / 1024
    covered = 100 * (np.array(out)[:, :, 3] > 0).mean()
    print(f"{dst}  {out.width}x{out.height}  {kb:.0f}KB  subject covers {covered:.0f}% of its box")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    floor = 12
    maxw = 1700
    for i, a in enumerate(sys.argv):
        if a == "--alpha-floor":
            floor = int(sys.argv[i + 1])
        if a == "--max-w":
            maxw = int(sys.argv[i + 1])
    cutout(args[0], args[1], floor, maxw, "--largest" in sys.argv)
