"""Convert the clean reference into flat two-color vector paths.
The image was cleaned with image generation; this is format vectorization,
not a claim of an exact automatic matte of the source film.
"""
from pathlib import Path
import json, os
os.environ['MPLCONFIGDIR']='/tmp/skeleton-matplotlib'
import matplotlib
matplotlib.use('Agg')
from matplotlib.figure import Figure
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parent
src=ROOT/'reference-clean.png'
image=np.asarray(Image.open(src).convert('RGBA'))

def rdp(p,epsilon=.8):
    if len(p)<4:return p
    line=p[-1]-p[0];length=np.linalg.norm(line)
    if length<1e-10:
        index=len(p)//2
        return np.vstack((rdp(p[:index+1],epsilon)[:-1],rdp(p[index:],epsilon)))
    dist=np.abs(line[0]*(p[:,1]-p[0,1])-line[1]*(p[:,0]-p[0,0]))/length
    index=int(np.argmax(dist))
    if dist[index]<=epsilon:return p[[0,-1]]
    return np.vstack((rdp(p[:index+1],epsilon)[:-1],rdp(p[index:],epsilon)))

def contours(mask):
    figure=Figure();ax=figure.subplots();cs=ax.contour(mask.astype(float),levels=[.5])
    paths=[]
    for poly in cs.get_paths()[0].to_polygons():
        if len(poly)<4:continue
        area=abs(np.sum(poly[:-1,0]*poly[1:,1]-poly[1:,0]*poly[:-1,1]))/2
        if area<9:continue
        poly=rdp(poly)
        paths.append('M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in poly)+'Z')
    return ''.join(paths)
alpha=image[:,:,3]>127
ivory=(image[:,:,:3].mean(axis=2)>100)&alpha
art={'width':image.shape[1],'height':image.shape[0],'ink':contours(alpha),'bone':contours(ivory),'provenance':'Cleaned reference generated from the source neutral pose, then traced into flat vector paths. Hand articulated; not an exact per-frame extraction.'}
(ROOT/'art.json').write_text(json.dumps(art))
print({k:len(art[k]) for k in ['ink','bone']})
