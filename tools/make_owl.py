"""Pack the approved transparent owl poses into aligned game frames (Pillow, numpy, scipy)."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as nd
BASE=Path(__file__).resolve().parent.parent
im=np.array(Image.open(BASE/'art_source/owl-poses-v1.png').convert('RGBA'))
labels,_=nd.label(im[:,:,3]>128)
# The two flight poses touch at their outer feather tips; split along the gutter.
y,x=np.indices(labels.shape)
seam=np.where(y<205,1245,1208)
regions=[labels==2,labels==3,(labels==1)&(x<seam),(labels==1)&(x>=seam),labels==7,labels==4,labels==5,labels==6]
centers=[(210,200),(602,200),(1020,218),(1510,230),(240,620),(660,620),(1050,610),(1510,610)]
names=['idle','blink','up','out','down','land','talk','happy']
out=BASE/'src/owl';out.mkdir(exist_ok=True)
for name,region,(cx,cy) in zip(names,regions,centers):
    # Preserve soft antialiased edges belonging to each connected figure.
    mask=nd.binary_dilation(region,iterations=2)
    if name in ('up','out'):mask &= (x<seam) if name=='up' else (x>=seam)
    rgba=im.copy();rgba[:,:,3]=np.where(mask,rgba[:,:,3],0)
    frame=Image.new('RGBA',(640,540))
    frame.paste(Image.fromarray(rgba),(320-cx,220-cy))
    frame.resize((320,270),Image.Resampling.LANCZOS).save(out/(name+'.webp'),'WEBP',quality=88,method=6)
    if name=='idle':
        Image.fromarray(rgba).crop((90,65,345,320)).resize((128,128),Image.Resampling.LANCZOS).save(out/'head.webp','WEBP',quality=88,method=6)
print('Built eight aligned owl frames and dialog portrait')
