"""Langkah 2 dari 2 untuk Menara Waktu: lantai yang ditelusuri tangan (lantai bulat, lima walkway, pelataran), lingkaran penghalang (WKT_OBST),
titik jalan tiap tempat, dan pemeriksaan keterhubungan dengan cara yang sama seperti pencari jalur di game."""
import cv2, numpy as np, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out')
from collections import deque
comp=np.zeros((640,1000),np.uint8)   # this interior is traced by hand: the walkways are too pale to separate by colour alone
# hand-traced floor: the round centre floor, the five flagstone walkways and the clearings at their ends
cv2.ellipse(comp,(495,350),(147,88),0,0,360,1,-1)
def pl(pts,w): cv2.polylines(comp,[np.array(pts,np.int32)],False,1,w)
pl([(495,270),(500,222)],100)                                   # north: to the clock door
pl([(400,312),(340,284),(290,264),(235,258)],64); pl([(235,258),(228,205),(222,165)],52)   # north-west: to the gear passage
pl([(592,308),(650,270),(720,248),(790,264)],64)                # north-east: to the bell chamber yard
pl([(790,268),(840,232),(886,188)],48)                          # the ramp up to the sealed portal
pl([(362,374),(300,388)],56)                                    # west: to the clock-face pool
pl([(632,374),(706,384)],56)                                    # east: to the pendulum pit
pl([(495,430),(500,468)],110)                                   # south: to the tower door
cv2.ellipse(comp,(500,455),(58,20),0,0,360,1,-1)
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
ENT={'npc':(495,348),'sumur':(165,425),'kilat':(225,180),'gema':(715,195),'huruf':(790,425),'teka':(500,165),'portal':(905,75),'exit':(500,545)}
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
main=lab[int(round(455/10)),int(round(500/10))]; print('main region label at the start point:',main, 'ok there:',ok[46,50])
want={'npc':(495,400),'sumur':(310,388),'kilat':(232,250),'gema':(700,240),'huruf':(705,385),'teka':(500,225),'portal':(885,190),'exit':(500,462)}
go={}
for k,(x,y) in want.items():
    p,d=nearest_ok(x,y,main); go[k]=p; print(f'{k:7s} wanted ({x},{y}) -> go {p} (moved {d:.0f})')
json.dump({'obst':obst,'ent':ENT,'go':{k:list(v) for k,v in go.items()}},open(os.path.join(OUT, 'wkt_data.json'),'w'))
# overlay for a visual check
im=cv2.imread(os.path.join(HERE, '..', 'src', 'waktu.webp')); im=cv2.resize(im,(1000,640),interpolation=cv2.INTER_AREA)
ov=im.copy()
for x,y,r in obst: cv2.circle(ov,(x,y),r,(40,40,230),-1)
ov=cv2.addWeighted(im,0.55,ov,0.45,0)
for k,(x,y) in ENT.items(): cv2.circle(ov,(x,y),9,(255,255,255),2); cv2.putText(ov,k,(x-18,y-14),cv2.FONT_HERSHEY_SIMPLEX,0.5,(255,255,255),2)
for k,(x,y) in go.items(): cv2.circle(ov,(int(x),int(y)),5,(0,255,255),-1)
cv2.imwrite(os.path.join(OUT, 'obst_overlay.png'),ov)
