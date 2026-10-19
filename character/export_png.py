"""Render the exported vector poses into RGBA PNG files using Chromium.
This performs SVG→PNG format conversion, retaining genuine transparent alpha.
"""
import base64,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent
output=root/'png';output.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(reduced_motion='reduce')
    page.goto('http://127.0.0.1:8000/character/',wait_until='domcontentloaded')
    page.wait_for_function('window.skeleton')
    for frame in range(660):
        svg=(root/'poses'/f'{frame:04d}.svg').read_text()
        data=page.evaluate('''async source=>{
            const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
            try{const image=new Image();image.src=url;await image.decode();
                const canvas=document.createElement('canvas');canvas.width=600;canvas.height=760;
                canvas.getContext('2d').drawImage(image,0,0);
                return canvas.toDataURL('image/png').split(',')[1];
            }finally{URL.revokeObjectURL(url);}
        }''',svg)
        path=output/f'{frame:04d}.png';path.write_bytes(base64.b64decode(data))
        with Image.open(path) as image:
            assert image.mode=='RGBA'
            box=image.getchannel('A').getbbox()
            assert box and box[0]>0 and box[1]>0 and box[2]<600 and box[3]<760,(frame,box)
        if frame%120==0:print(f'{frame}/660 exported',flush=True)
    browser.close()
print('660 RGBA PNGs exported; all figures are inside the canvas with transparent margins.',flush=True)
