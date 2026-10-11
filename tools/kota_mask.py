"""Langkah 1 dari 2 untuk Gerbang Kota (metode sama dengan area lain): mengukur lantai yang bisa dilalui dari warna jalan krem dan batu alun-alun.
Butuh opencv-python dan numpy. Jalankan dari folder tools: python3 kota_mask.py lalu python3 kota_obstacles.py"""
import cv2, numpy as np, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
im=cv2.imread(os.path.join(HERE, '..', 'src', 'kota.webp')); im=cv2.resize(im,(1000,640),interpolation=cv2.INTER_AREA)
blur=cv2.medianBlur(im,7); hsv=cv2.cvtColor(blur,cv2.COLOR_BGR2HSV).astype(np.float32)
H=hsv[...,0]*2; S=hsv[...,1]/255; V=hsv[...,2]/255
m=((H>=22)&(H<=40)&(S>=0.34)&(S<=0.74)&(V>=0.76)).astype(np.uint8)
k=lambda n:cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(n,n))
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,k(7)); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,k(9))
n,lab=cv2.connectedComponents(m); seed=lab[361,501]; print('components',n,'seed',seed)
comp=(lab==seed).astype(np.uint8); np.save(os.path.join(OUT, 'comp.npy'),comp)
ov=im.copy(); ov[comp>0]=(0.55*ov[comp>0]+0.45*np.array([0,255,0])).astype(np.uint8)
for x in range(0,1000,100): cv2.putText(ov,str(x),(x+2,12),cv2.FONT_HERSHEY_SIMPLEX,0.4,(255,255,255),1); cv2.line(ov,(x,0),(x,640),(255,255,255),1)
for y in range(0,640,100): cv2.putText(ov,str(y),(2,y+12),cv2.FONT_HERSHEY_SIMPLEX,0.4,(255,255,255),1); cv2.line(ov,(0,y),(1000,y),(255,255,255),1)
cv2.imwrite(os.path.join(OUT, 'mask_overlay.png'),ov); print('share',comp.mean())
