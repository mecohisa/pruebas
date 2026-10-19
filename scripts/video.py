#!/usr/bin/env python3
"""Download the reference, make a contact sheet, then extract a selected scene.
No scene timing is assumed. Run `contact` and inspect its output before `extract`.
"""
import argparse, json, pathlib, subprocess, sys
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source'
SOURCE.mkdir(exist_ok=True)
URL = 'https://www.youtube.com/watch?v=61t22VGByok'

def run(*args):
    subprocess.run(list(map(str, args)), check=True)

def video():
    files = [p for p in SOURCE.glob('61t22VGByok.*') if p.suffix in ('.mp4', '.webm', '.mkv')]
    if not files:
        sys.exit('No video downloaded. Run the download command after YouTube access is enabled.')
    return files[0]

def contact(path, step):
    folder = ROOT / 'assets' / 'reference-contact'
    folder.mkdir(parents=True, exist_ok=True)
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', path,
        '-vf', f'fps=1/{step},scale=240:-1', folder / '%04d.jpg')
    frames = sorted(folder.glob('*.jpg'))
    for page in range(0, len(frames), 60):
        batch = frames[page:page+60]
        sheet = Image.new('RGB', (1200, ((len(batch)+4)//5)*210), '#eeede5')
        draw = ImageDraw.Draw(sheet)
        for i, frame in enumerate(batch):
            img = Image.open(frame)
            img.thumbnail((240,180))
            x,y=(i%5)*240,(i//5)*210
            sheet.paste(img,(x,y))
            seconds=(page+i)*step
            draw.text((x+8,y+185), f'{int(seconds//60):02}:{seconds%60:05.2f}', fill='black')
        sheet.save(ROOT / 'assets' / f'contact-{page//60+1:02}.jpg')

def main():
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest='command', required=True)
    sub.add_parser('download')
    c=sub.add_parser('contact');c.add_argument('--step',type=float,default=5)
    e=sub.add_parser('extract');e.add_argument('--start',type=float,required=True);e.add_argument('--duration',type=float,required=True);e.add_argument('--fps',type=float,default=8)
    args=p.parse_args()
    if args.command=='download':
        run(sys.executable,'-m','yt_dlp','--no-playlist','--js-runtimes','node','--write-info-json',
            '-f','bv*[height<=720]+ba/b[height<=720]/best','--merge-output-format','mp4',
            '-o',SOURCE/'%(id)s.%(ext)s',URL)
    elif args.command=='contact':
        if args.step<=0:p.error('--step must be positive')
        contact(video(),args.step)
    else:
        if args.start<0 or args.duration<=0 or args.fps<=0:p.error('Invalid start, duration or fps')
        folder=ROOT/'assets'/'reference-frames'
        if folder.exists():sys.exit('reference-frames already exists; preserve or remove it explicitly before re-extracting.')
        folder.mkdir()
        run('ffmpeg','-hide_banner','-loglevel','error','-ss',args.start,'-i',video(),'-t',args.duration,
            '-vf',f'fps={args.fps}','-start_number','0',folder/'frame-%04d.png')
        frames=sorted(folder.glob('*.png'))
        if not frames:sys.exit('No frames extracted; check the time range.')
        (folder/'manifest.json').write_text(json.dumps({'source':URL,'start_seconds':args.start,
            'duration_seconds':args.duration,'fps':args.fps,
            'frames':[{'file':x.name,'seconds':args.start+i/args.fps} for i,x in enumerate(frames)]},indent=2))
        print(f'{len(frames)} reference frames extracted to {folder}')

if __name__=='__main__':main()
