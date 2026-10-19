"""Pack the 660 transparent PNG poses into 11 TexturePacker-style atlases."""
import base64,json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent
out=root/'spritesheets';out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(reduced_motion='reduce')
    page.goto('http://127.0.0.1:8000/character/',wait_until='domcontentloaded')
    for index in range(11):
        begin=index*60;end=min(660,begin+60)
        data=page.evaluate('''async ({begin,end})=>{
            const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=1524;
            const ctx=canvas.getContext('2d');
            for(let n=begin;n<end;n++){
                const image=new Image();image.src=`png/${String(n).padStart(4,'0')}.png`;await image.decode();
                const i=n-begin;ctx.drawImage(image,(i%10)*200,Math.floor(i/10)*254,200,760/3);
            }
            return canvas.toDataURL('image/png').split(',')[1];
        }''',{'begin':begin,'end':end})
        filename=f'dance-{index:02d}.png';(out/filename).write_bytes(base64.b64decode(data))
        frames={f'{n:04d}.png':{'frame':{'x':((n-begin)%10)*200,'y':((n-begin)//10)*254,'w':200,'h':254},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':200,'h':254},'sourceSize':{'w':200,'h':254},'duration':1001/30} for n in range(begin,end)}
        manifest={'frames':frames,'meta':{'image':filename,'format':'RGBA8888','size':{'w':2000,'h':1524},'scale':'0.333333','fps':30000/1001,'startFrame':begin,'endFrameExclusive':end}}
        (out/f'dance-{index:02d}.json').write_text(json.dumps(manifest,indent=2))
    browser.close()
print('11 transparent spritesheets exported, covering all 660 frames.')
