#!/usr/bin/env python3
"""Extract the uploaded clip into a faithful frame sequence; never invent poses."""
import argparse, json, pathlib, subprocess
from zipfile import ZipFile, ZIP_DEFLATED
ROOT=pathlib.Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('clip',type=pathlib.Path)
a=p.parse_args()
clip=a.clip.resolve()
def run(*args):subprocess.run(list(map(str,args)),check=True)
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames,duration','-of','json',str(clip)]))['streams'][0]
assert (info['width'],info['height'])==(1920,1080),'This crop is calibrated for the supplied 1920×1080 clip.'
frames=ROOT/'assets'/'dance';frames.mkdir(parents=True,exist_ok=True)
run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',clip,'-map','0:v:0','-vf','crop=1296:1080:312:0,scale=864:720:flags=lanczos','-fps_mode','passthrough','-c:v','libwebp','-quality','92','-compression_level','4','-start_number','0',frames/'%04d.webp')
keys=[(0,'La entrada'),(60,'Rodillas en rombo'),(120,'De frente'),(200,'Paso cruzado'),(300,'El contratiempo'),(400,'A ras del suelo'),(450,'Vuelta al compás'),(600,'Últimos pasos')]
poses=ROOT/'assets'/'poses';poses.mkdir(parents=True,exist_ok=True)
for frame,label in keys:
    run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',clip,'-vf',f'select=eq(n\\,{frame}),crop=1296:1080:312:0','-fps_mode','vfr','-frames:v','1',poses/f'{frame:04d}.png')
run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',clip,'-vn','-c:a','copy',ROOT/'assets'/'soundtrack.m4a')
num,den=map(int,info['r_frame_rate'].split('/'));fps=num/den
count=int(info['nb_frames'])
assert len(list(frames.glob('*.webp')))==count
manifest={'source':'Skeleton Dance - clip 2m38s-3m00s.mp4','sourceStartSeconds':158,'width':864,'height':720,'crop':{'x':312,'y':0,'width':1296,'height':1080},'fps':fps,'fpsNumerator':num,'fpsDenominator':den,'count':count,'duration':count/fps,'pattern':'assets/dance/{frame:04d}.webp','poses':[{'frame':f,'label':label,'file':f'assets/poses/{f:04d}.png','clipSeconds':f/fps,'originalSeconds':158+f/fps} for f,label in keys]}
(ROOT/'assets'/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
with ZipFile(ROOT/'assets'/'poses-originales.zip','w',ZIP_DEFLATED) as archive:
    for file in sorted(poses.glob('*.png')): archive.write(file,file.name)
    archive.write(ROOT/'assets'/'manifest.json','manifest.json')
print(json.dumps({'frames':count,'duration':count/fps,'poses':len(keys)},indent=2))
