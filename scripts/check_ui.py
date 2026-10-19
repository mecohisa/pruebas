from pathlib import Path
import base64, io, json, math, time
from PIL import Image, ImageChops, ImageStat
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
errors=[];results={};failures=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1150},device_scale_factor=1)
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda r:failures.append(f'{r.status} {r.url}') if r.status>=400 else None)
    response=page.goto('http://127.0.0.1:8000',wait_until='domcontentloaded')
    assert response.status==200
    page.wait_for_function('window.dance && dance.frame >= 0')
    page.get_by_role('button',name='Pausar animación',exact=True).click()
    page.wait_for_timeout(100)
    before=page.evaluate('dance.frame');page.wait_for_timeout(200)
    assert before==page.evaluate('dance.frame');results['pause']='passed'
    assert page.locator('.card').count()==8
    page.evaluate("document.querySelectorAll('.card img').forEach(i=>i.loading='eager')")
    page.wait_for_function("[...document.querySelectorAll('.card img')].every(i=>i.complete&&i.naturalWidth===1296)")
    assert page.locator('.card img').first.evaluate('i=>Math.abs(i.clientWidth/i.clientHeight-1.2)<.02')
    results['eight_original_pngs']='passed'
    # Compare actual canvas output against independently extracted source PNGs.
    fidelity={}
    for n in [0,60,120,200,300,400,450,600]:
        page.locator(f'.card[data-frame="{n}"]').click()
        page.wait_for_function('(n)=>dance.frame===n',arg=n)
        data=page.locator('#stage').evaluate("c=>c.toDataURL('image/png').split(',')[1]")
        actual=Image.open(io.BytesIO(base64.b64decode(data))).convert('RGB')
        source=Image.open(root/f'assets/poses/{n:04d}.png').convert('RGB').resize(actual.size,Image.Resampling.LANCZOS)
        rms=ImageStat.Stat(ImageChops.difference(source,actual)).rms
        error=sum(x*x for x in rms)/3
        psnr=10*math.log10(255**2/error) if error else 99
        assert psnr>35,(n,psnr)
        fidelity[str(n)]=round(psnr,2)
        if n in [120,400]:actual.save(root/f'evidence/canvas-{n:04d}.png')
    results['canvas_vs_source_psnr_db']=fidelity
    page.locator('.card[data-frame="120"]').click();page.wait_for_function('dance.frame===120')
    page.screenshot(path=str(root/'evidence/desktop.png'),full_page=True)
    page.get_by_role('button',name='Fotograma siguiente',exact=True).click();page.wait_for_function('dance.frame===121');page.wait_for_timeout(150);assert page.evaluate('dance.frame')==121
    page.get_by_role('button',name='Fotograma anterior',exact=True).click();page.wait_for_function('dance.frame===120')
    results['frame_step']='passed'
    page.locator('#seek').evaluate("e=>{e.value='659';e.dispatchEvent(new Event('input',{bubbles:true}))}")
    page.wait_for_function('dance.frame===659');results['seek_last_frame']='passed'
    page.get_by_role('button',name='Reproducir animación',exact=True).click()
    page.wait_for_timeout(400);assert page.evaluate('dance.frame')<30
    results['loop_boundary']='passed'
    page.get_by_role('button',name='Pausar animación',exact=True).click()
    page.get_by_role('button',name='Reiniciar animación',exact=True).click();page.wait_for_function('dance.frame===0')
    assert page.locator('#time').inner_text()=='00:00 / 00:22';results['restart']='passed'
    page.select_option('#speed','1.5')
    page.get_by_role('button',name='Reproducir animación',exact=True).click()
    page.wait_for_timeout(1100)
    assert 35<page.evaluate('dance.frame')<65;results['playback_speed']='passed'
    page.get_by_role('button',name='Activar sonido',exact=True).click()
    page.wait_for_function('!document.querySelector("#audio").paused && document.querySelector("#audio").currentTime>0')
    page.wait_for_timeout(300)
    drift=page.evaluate('Math.abs(dance.frame/(30000/1001)-document.querySelector("#audio").currentTime)')
    assert drift<.2,drift;results['audio_sync_drift_seconds']=round(drift,3)
    page.get_by_role('button',name='Desactivar sonido',exact=True).click()
    page.get_by_role('button',name='Pausar animación',exact=True).click()
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.card[data-frame="120"]').click();page.wait_for_function('dance.frame===120')
    page.screenshot(path=str(root/'evidence/mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth');results['mobile_no_horizontal_overflow']='passed'
    reduced=browser.new_page(reduced_motion='reduce')
    reduced.goto('http://127.0.0.1:8000',wait_until='domcontentloaded');reduced.wait_for_function('window.dance')
    assert not reduced.evaluate('dance.playing');results['reduced_motion']='passed'
    # Walk all assets to detect corrupt or incomplete extraction outputs.
    for n in range(660):
        with Image.open(root/f'assets/dance/{n:04d}.webp') as im:
            im.load();assert im.size==(864,720)
    results['all_660_frames_decode']='passed'
    assert not errors,errors;assert not failures,failures
    results['javascript_errors']=errors;results['http_errors']=failures
    browser.close()
(root/'evidence/checks.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
