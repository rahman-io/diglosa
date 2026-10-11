"""Langkah 2 dari 2: membuat lingkaran penghalang (VIL_OBST) dan titik jalan tiap tempat, lalu memeriksa keterhubungannya
dengan cara yang sama seperti pencari jalur di game. Jalankan setelah village_mask.py."""
import cv2, numpy as np, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out')
from collections import deque
comp=np.load(os.path.join(OUT, 'comp.npy')).astype(np.uint8)
# connectors: Rani's pad joins the path below it; fill small holes (plaza stones)
cv2.ellipse(comp,(488,241),(40,15),0,0,360,1,-1)
cv2.line(comp,(488,244),(500,292),1,34)
cv2.line(comp,(292,162),(326,218),1,48); cv2.line(comp,(326,218),(350,250),1,48)   # the bridge's east end joins the loop path
cv2.ellipse(comp,(500,360),(133,82),0,0,360,1,-1)   # the whole village square is walkable
comp=cv2.morphologyEx(comp,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
H,W=comp.shape
STEP,R,RING=12,7,26
dist_to_walk=cv2.distanceTransform((1-comp).astype(np.uint8),cv2.DIST_L2,5)        # distance from a blocked pixel to the nearest walkable pixel
obst=[]
for y in range(0,H+1,STEP):
    for x in range(0,W+1,STEP):
        xi,yi=min(x,W-1),min(y,H-1)
        if comp[yi,xi]==0 and dist_to_walk[yi,xi]<=RING: obst.append([x,y,R])
ring=len(obst)
for y in range(0,H+1,40):
    for x in range(0,W+1,40):
        xi,yi=min(x,W-1),min(y,H-1)
        if comp[yi,xi]==0 and dist_to_walk[yi,xi]>48: obst.append([x,y,30])      # coarse cover far from the paths: nothing can spawn out there
print('obstacles',len(obst),'(ring',ring,')')
# the engine's own free test on its 10-unit grid (margin 5) to place and verify the go points
NPC_R=28
ENT={'npc':(501,352),'sumur':(172,425),'kilat':(268,160),'gema':(795,255),'huruf':(794,452),'teka':(487,222),'portal':(875,105),'exit':(501,598)}
solid=obst+[[ENT['npc'][0],ENT['npc'][1],NPC_R]]
S=np.array(solid,dtype=np.float32)
def free(x,y,m=5): return bool(((S[:,0]-x)**2+(S[:,1]-y)**2 >= (S[:,2]+m)**2).all())
NX,NY=101,65
ok=np.zeros((NY,NX),bool)
for j in range(NY):
    for i in range(NX):
        ok[j,i]=free(i*10,j*10)
def comp_labels():
    lab=-np.ones((NY,NX),int); c=0
    for j in range(NY):
        for i in range(NX):
            if ok[j,i] and lab[j,i]<0:
                q=deque([(i,j)]); lab[j,i]=c
                while q:
                    a,b=q.popleft()
                    for da in(-1,0,1):
                        for db in(-1,0,1):
                            if not(da or db): continue
                            na,nb=a+da,b+db
                            if 0<=na<NX and 0<=nb<NY and ok[nb,na] and lab[nb,na]<0 and (not(da and db) or (ok[b,na] and ok[nb,a])): lab[nb,na]=c; q.append((na,nb))
                c+=1
    return lab,c
lab,nc=comp_labels(); print('connected walkable regions on the engine grid:',nc, 'sizes',[int((lab==k).sum()) for k in range(nc)][:6])
def nearest_ok(x,y,want_lab=None):
    best=None;bd=1e9
    for j in range(NY):
        for i in range(NX):
            if ok[j,i] and (want_lab is None or lab[j,i]==want_lab):
                d=np.hypot(i*10-x,j*10-y)
                if d<bd: bd=d;best=(i*10,j*10)
    return best,bd
main=lab[int(round(560/10)),int(round(501/10))]; print('main region label at the start point:',main, 'ok there:',ok[56,50])
want={'npc':(501,405),'sumur':(228,452),'kilat':(322,192),'gema':(795,288),'huruf':(745,452),'teka':(488,243),'portal':(858,150),'exit':(501,570)}
go={}
for k,(x,y) in want.items():
    p,d=nearest_ok(x,y,main); go[k]=p; print(f'{k:7s} wanted ({x},{y}) -> go {p} (moved {d:.0f})')
json.dump({'obst':obst,'ent':ENT,'go':{k:list(v) for k,v in go.items()}},open(os.path.join(OUT, 'vil_data.json'),'w'))
# overlay for a visual check
im=cv2.imread(os.path.join(HERE, '..', 'src', 'village.webp')); im=cv2.resize(im,(1000,640),interpolation=cv2.INTER_AREA)
ov=im.copy()
for x,y,r in obst: cv2.circle(ov,(x,y),r,(40,40,230),-1)
ov=cv2.addWeighted(im,0.55,ov,0.45,0)
for k,(x,y) in ENT.items(): cv2.circle(ov,(x,y),9,(255,255,255),2); cv2.putText(ov,k,(x-18,y-14),cv2.FONT_HERSHEY_SIMPLEX,0.5,(255,255,255),2)
for k,(x,y) in go.items(): cv2.circle(ov,(int(x),int(y)),5,(0,255,255),-1)
cv2.imwrite(os.path.join(OUT, 'obst_overlay.png'),ov)
