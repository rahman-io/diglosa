"""Extract the four approved IELTS NPC portraits from the generated sheet."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

BASE = Path(__file__).resolve().parent.parent
src = np.asarray(Image.open(BASE / 'art_source' / 'ielts-npc-portraits-v1.png').convert('RGB'))
out = BASE / 'src' / 'portraits'
out.mkdir(exist_ok=True)
panels = {'sera': (0, 512), 'bima': (512, 1024), 'ayu': (1024, 1536), 'rangga': (1536, 2048)}

for name, (x0, x1) in panels.items():
    rgb = src[:, x0:x1].copy()
    likely_bg = ((rgb[:, :, 0] > 180) & (rgb[:, :, 2] > 180) & (rgb[:, :, 1] < 140)) | (rgb.min(axis=2) > 220)
    edge = np.zeros(likely_bg.shape, bool)
    edge[0, :] = edge[-1, :] = edge[:, 0] = edge[:, -1] = True
    background = ndi.binary_propagation(edge, mask=likely_bg)
    alpha = (~background).astype(np.uint8) * 255
    # Remove the pink fringe left by the generated matte around dark hair and clothing.
    halo = (rgb[:, :, 0] > 150) & (rgb[:, :, 2] > 140) & (rgb[:, :, 1] < 135)
    alpha[halo & ndi.binary_dilation(background, iterations=8)] = 0
    solid = ~ndi.binary_dilation(background, iterations=5)
    nearest = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    nearest_rgb = rgb[nearest[0], nearest[1]]
    edge = (~background) & (~solid)
    rgb[edge] = nearest_rgb[edge]
    ys, xs = np.where(alpha)
    crop = np.dstack([rgb[ys.min():ys.max() + 1, xs.min():xs.max() + 1], alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]])
    h, w = crop.shape[:2]
    scale = min(118 / w, 118 / h)
    im = Image.fromarray(crop).resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (128, 128))
    canvas.paste(im, ((128 - im.width) // 2, (128 - im.height) // 2), im)
    canvas.save(out / f'{name}.webp', 'WEBP', quality=88, method=6)

print('Extracted IELTS NPC portraits:', ', '.join(panels))
