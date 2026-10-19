import io,json,base64,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image,ImageChops,ImageStat
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent
errors=[];http_errors=[];result={}
for frame in range(660):
    xml=ET.fromstring((root/'poses'/f'{frame:04d}.svg').read_text())
    assert not any(e.tag.endswith('image') for e in xml.iter())
    for element in xml.iter():
        if 'href' in element.attrib:assert element.attrib['href'].startswith('#')
    with Image.open(root/'png'/f'{frame:04d}.png') as im:
        assert im.mode=='RGBA' and im.size==(600,760)
        alpha=im.getchannel('A');box=alpha.getbbox()
        assert alpha.getpixel((0,0))==0 and alpha.getpixel((599,759))==0
        assert box and 0<box[0]<box[2]<600 and 0<box[1]<box[3]<760
result['660_self_contained_vector_poses']='passed'
result['660_pngs_with_true_alpha_and_no_clipped_edges']='passed'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:http_errors.append(f'{r.status} {r.url}') if r.status>=400 else None)
    page.goto('http://127.0.0.1:8000/',wait_until='domcontentloaded')
    page.wait_for_function('window.skeleton')
    assert page.url.endswith('/character/')
    assert page.get_by_role('button',name='Reproducir animación',exact=True).count()==1
    result['reduced_motion']='passed'
    assert page.locator('video, canvas').count()==0
    assert page.locator('#character image').count()==0
    assert page.locator('[data-part]').count()==19
    result['articulated_vector_without_video_or_raster_images']='passed'
    page.evaluate("document.querySelectorAll('.pose-card img').forEach(i=>i.loading='eager')")
    page.wait_for_function("[...document.querySelectorAll('.pose-card img')].every(i=>i.complete&&i.naturalWidth===600)")
    assert page.locator('.pose-card').count()==44
    result['44_key_poses_load']='passed'
    page.get_by_role('button',name='Reproducir animación',exact=True).click();before=page.locator('#character').inner_html();page.wait_for_timeout(300)
    assert before!=page.locator('#character').inner_html()
    page.get_by_role('button',name='Pausar animación',exact=True).click();before=page.locator('#character').inner_html();page.wait_for_timeout(200)
    assert before==page.locator('#character').inner_html();result['play_and_pause']='passed'
    page.locator('#seek').evaluate("e=>{e.value='120';e.dispatchEvent(new Event('input'))}")
    assert page.evaluate('skeleton.frame')==120
    page.get_by_role('button',name='Pose siguiente',exact=True).click();assert page.evaluate('skeleton.frame')==121
    page.get_by_role('button',name='Pose anterior',exact=True).click();assert page.evaluate('skeleton.frame')==120
    result['seek_and_single_frame_step']='passed'
    page.screenshot(path=str(root/'evidence/studio-desktop.png'),full_page=True)
    page.locator('.pose-card[data-frame="405"]').click();assert page.evaluate('skeleton.frame')==405
    result['select_key_pose']='passed'
    page.select_option('#segment','1');assert page.evaluate('skeleton.frame')==60
    page.get_by_role('button',name='Reiniciar animación',exact=True).click();assert page.evaluate('skeleton.frame')==60
    page.locator('#speed').evaluate("e=>{e.value='1.5';e.dispatchEvent(new Event('input'))}")
    assert page.locator('#rate-label').inner_text()=='1.5×'
    result['segment_and_rate_controls']='passed'
    page.get_by_role('button',name='Fondo violeta',exact=True).click()
    page.locator('#bone').evaluate("e=>{e.value='#ffaa77';e.dispatchEvent(new Event('input'))}")
    assert page.locator('#character').evaluate("e=>e.style.getPropertyValue('--bone')")=='#ffaa77'
    with page.expect_download() as download:page.locator('#download-png').click()
    exported=Image.open(download.value.path()).convert('RGBA')
    assert exported.getpixel((0,0))[3]==0
    assert any(r==255 and g==170 and b==119 and a==255 for (r,g,b,a) in exported.getdata())
    result['png_export_preserves_alpha_and_custom_color']='passed'
    with page.expect_download() as download:page.locator('#download-svg').click()
    exported_svg=Path(download.value.path()).read_text();ET.fromstring(exported_svg)
    assert '--bone:#ffaa77' in exported_svg and '<image' not in exported_svg
    result['svg_pose_export']='passed'
    with page.expect_download() as download:page.locator('#download-animated').click()
    animated=Path(download.value.path()).read_text();ET.fromstring(animated)
    assert '<animateTransform' in animated and '<image' not in animated
    result['selected_sequence_animated_svg_export']='passed'
    page.locator('#bone').evaluate("e=>{e.value='#deddd5';e.dispatchEvent(new Event('input'))}")
    page.get_by_role('button',name='Fondo de cuadrícula',exact=True).click()
    page.set_viewport_size({'width':390,'height':844})
    page.locator('#seek').evaluate("e=>{e.value='120';e.dispatchEvent(new Event('input'))}")
    page.screenshot(path=str(root/'evidence/studio-mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    result['mobile_no_horizontal_overflow']='passed'
    # Standalone animation must run without the web app or any JavaScript.
    standalone=browser.new_page(viewport={'width':600,'height':760})
    standalone.goto('http://127.0.0.1:8000/character/skeleton-animated.svg',wait_until='load')
    images=[];differences={}
    for frame in [0,120,150,405]:
        standalone.evaluate('(t)=>{const s=document.documentElement;s.pauseAnimations();s.setCurrentTime(t)}',(frame+.5)/(30000/1001))
        standalone.wait_for_timeout(80)
        im=Image.open(io.BytesIO(standalone.screenshot(omit_background=True))).convert('RGBA')
        source=Image.open(root/'png'/f'{frame:04d}.png').convert('RGBA')
        error=sum(ImageStat.Stat(ImageChops.difference(source,im)).mean)/4
        assert error<1.5,(frame,error)
        differences[str(frame)]=round(error,4);images.append(im.tobytes())
        im.save(root/'evidence'/f'asset-{frame:04d}.png')
    assert len(set(images))==4
    result['standalone_smil_animation_matches_png_exports']=differences
    assert not errors,errors;assert not http_errors,http_errors
    result['javascript_errors']=errors;result['http_errors']=http_errors
    browser.close()
(root/'evidence/checks.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
