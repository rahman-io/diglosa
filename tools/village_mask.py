"""Langkah 1 dari 2: mengukur lantai yang bisa dilalui dari warna jalan dan batu alun-alun pada lukisan desa.
Butuh opencv-python dan numpy. Jalankan dari folder tools: python3 village_mask.py lalu python3 village_obstacles.py
Hasilnya (tools/out/vil_data.json) disalin ke VIL_OBST dan titik jalan di src/template.html."""
import cv2, numpy as np, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
im=cv2.imread(os.path.join(HERE, '..', 'src', 'village.webp')); im=cv2.resize(im,(1000,640),interpolation=cv2.INTER_AREA)
blur=cv2.medianBlur(im,7); hsv=cv2.cvtColor(blur,cv2.COLOR_BGR2HSV).astype(np.float32)
H=hsv[...,0]*2; S=hsv[...,1]/255; V=hsv[...,2]/255
m=((H>=22)&(H<=40)&(S>=0.34)&(S<=0.74)&(V>=0.76)).astype(np.uint8)
k=lambda n:cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(n,n))
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,k(7)); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,k(9))
n,lab=cv2.connectedComponents(m)
seed=lab[358,501]; print('components',n,'seed label',seed)
comp=(lab==seed).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, 'mask_raw.png'),comp*255)
np.save(os.path.join(OUT, 'comp.npy'),comp)
ov=im.copy(); ov[comp>0]=(0.55*ov[comp>0]+0.45*np.array([0,255,0])).astype(np.uint8)
cv2.imwrite(os.path.join(OUT, 'mask_overlay.png'),ov); print('area share',comp.mean())
