"""Matte each candidate and report whether the subject runs off the frame.

The previous hero looked wrong because the source photo had already cropped the
boom — so the cut-out could never be whole. Edge contact is measurable, so
measure it instead of eyeballing.
"""
import sys, urllib.request, pathlib
import numpy as np
from PIL import Image
from rembg import remove, new_session
S = new_session("isnet-general-use")
from scipy import ndimage

CANDS = {
 "excavator-side":   ("CC0","https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Excavator_side.jpg/1920px-Excavator_side.jpg"),
 "dozer-blade":      ("CC0","https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Tractor_with_bulldozer_blade.jpg/1920px-Tractor_with_bulldozer_blade.jpg"),
 "kobelco":          ("CC BY 3.0 DE","https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Kobelco_SK_210LC_excavator%2C_side_view.JPG/1920px-Kobelco_SK_210LC_excavator%2C_side_view.JPG"),
 "cat-m315c":        ("CC BY 3.0 DE","https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Caterpillar_M315C_excavator.JPG/1920px-Caterpillar_M315C_excavator.JPG"),
 "yanmar":           ("CC BY 3.0 DE","https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Side_view_of_a_Yanmar_excavator.jpg/1920px-Side_view_of_a_Yanmar_excavator.jpg"),
 "deere-exc":        ("CC BY 2.0","https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Excavator_%28John_Deere%29.jpg/1920px-Excavator_%28John_Deere%29.jpg"),
 "cat-950gc":        ("CC BY-SA 4.0","https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/CATERPILLAR_950_GC_Wheel_Loader_01.jpg/1920px-CATERPILLAR_950_GC_Wheel_Loader_01.jpg"),
 "komatsu-wa380":    ("CC BY-SA 4.0","https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Komatsu_WA380-20210601-RM-160906.jpg/1920px-Komatsu_WA380-20210601-RM-160906.jpg"),
 "case-580":         ("CC BY 2.0","https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Case_580_Super_L_backhoe_loader_-_1.jpg/1920px-Case_580_Super_L_backhoe_loader_-_1.jpg"),
 "doosan":           ("CC BY-SA 4.0","https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Doosan_DX85R-3_excavator_in_Remiremont%2C_France_-_2022-05-03_-_01.jpg/1920px-Doosan_DX85R-3_excavator_in_Remiremont%2C_France_-_2022-05-03_-_01.jpg"),
}

for name,(lic,url) in CANDS.items():
    raw = pathlib.Path(f"src_{name}.jpg")
    try:
        if not raw.exists():
            req=urllib.request.Request(url,headers={'User-Agent':'quest-mockup/1.0 (design research)'})
            raw.write_bytes(urllib.request.urlopen(req,timeout=90).read())
        im = Image.open(raw).convert("RGB")
        # the 1024-square model blows its allocation on full-size Commons files
        if im.width > 1400:
            im = im.resize((1400, round(im.height*1400/im.width)), Image.LANCZOS)
    except Exception as e:
        print(f"{name:16s} DOWNLOAD FAILED {e}"); continue

    try:
        out = remove(im, session=S, post_process_mask=True).convert("RGBA")
    except Exception as e:
        print(f"{name:16s} MATTE FAILED ({type(e).__name__})"); continue
    a = np.array(out); al = a[:,:,3]; al[al<12]=0
    lbl,n = ndimage.label(al>0)
    if n==0: print(f"{name:16s} EMPTY MATTE"); continue
    if n>1:
        keep = 1+np.argmax(ndimage.sum(al>0, lbl, range(1,n+1)))
        al[lbl!=keep]=0
    a[:,:,3]=al
    H,W = al.shape
    m = al>0
    # how much of each border the subject sits on = how badly it is cropped
    edges = {"top":m[0,:].mean(),"bottom":m[-1,:].mean(),"left":m[:,0].mean(),"right":m[:,-1].mean()}
    bad = {k:round(v*100) for k,v in edges.items() if v>0.02}
    ys,xs = np.nonzero(al)
    crop = Image.fromarray(a).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    crop.save(f"cand_{name}.png")
    verdict = "WHOLE" if not bad else f"CROPPED {bad}"
    print(f"{name:16s} {crop.width:5d}x{crop.height:<5d} cover {100*m.mean():4.1f}%  {verdict:34s} {lic}")
