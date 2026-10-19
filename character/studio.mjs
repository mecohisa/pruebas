import {Skeleton,svg,animatedSVG,FPS,KEYFRAMES} from './skeleton.mjs';
import {SEGMENTS} from './motion.mjs';
const $=s=>document.querySelector(s);
const art=await fetch('art.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar art.json');return r.json()});
const actor=new Skeleton($('#character'),art);window.skeleton=actor;
let playing=false,position=120,rate=1,start=0,end=660,previous=0;
$('#segment').innerHTML=SEGMENTS.map((s,i)=>`<option value="${i}">${s.name}</option>`).join('');
$('#pose-grid').innerHTML=KEYFRAMES.map((k,i)=>`<button class="pose-card" data-frame="${k.frame}" aria-label="Ver pose ${i+1}: ${k.label}" aria-pressed="false"><img src="poses/${String(k.frame).padStart(4,'0')}.svg" alt="Esqueleto vectorial: ${k.label}" loading="lazy" width="600" height="760"><span><b>${String(i+1).padStart(2,'0')}</b>${k.time.toFixed(2)} s</span><strong>${k.label}</strong></button>`).join('');
function draw(){actor.setFrame(Math.floor(position));$('#seek').value=Math.floor(position);$('#time').textContent=`${(position/FPS).toFixed(2)} s`;$('#frame-label').textContent=`POSE ${String(Math.floor(position)+1).padStart(3,'0')} / 660`;document.querySelectorAll('.pose-card').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.frame)===Math.floor(position)?'true':'false'));}
function play(value){playing=value;previous=0;$('#play').textContent=value?'Ⅱ':'▷';$('#play').setAttribute('aria-label',value?'Pausar animación':'Reproducir animación');}
function select(frame){play(false);position=Math.max(0,Math.min(659,frame));draw();}
$('#play').addEventListener('click',()=>{if(position<start||position>=end)position=start;play(!playing)});
$('#prev').addEventListener('click',()=>select(Math.floor(position)-1));$('#next').addEventListener('click',()=>select(Math.floor(position)+1));$('#restart').addEventListener('click',()=>{position=start;previous=0;draw()});$('#seek').addEventListener('input',e=>select(Number(e.target.value)));
$('#segment').addEventListener('change',e=>{const s=SEGMENTS[Number(e.target.value)];start=s.start;end=s.end;position=start;draw()});
$('#speed').addEventListener('input',e=>{rate=Number(e.target.value);$('#rate-label').textContent=`${rate}×`});
for(const name of ['bone','ink'])$('#'+name).addEventListener('input',e=>$('#character').style.setProperty('--'+name,e.target.value));
for(const button of document.querySelectorAll('[data-background]'))button.addEventListener('click',()=>{$('#canvas-wrap').className=button.dataset.background;document.querySelectorAll('[data-background]').forEach(b=>b.classList.toggle('active',b===button));});
for(const button of document.querySelectorAll('.pose-card'))button.addEventListener('click',()=>select(Number(button.dataset.frame)));
function options(){return {bone:$('#bone').value,ink:$('#ink').value,start,end};}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('#download-svg').addEventListener('click',()=>download(new Blob([svg(art,currentPose(),options())],{type:'image/svg+xml'}),`skeleton-pose-${String(Math.floor(position)).padStart(4,'0')}.svg`));
import {sample} from './motion.mjs';
function currentPose(){return sample(Math.floor(position))}
$('#download-animated').addEventListener('click',()=>download(new Blob([animatedSVG(art,options())],{type:'image/svg+xml'}),'skeleton-animated.svg'));
$('#download-png').addEventListener('click',async()=>{const url=URL.createObjectURL(new Blob([svg(art,currentPose(),options())],{type:'image/svg+xml'})),image=new Image();try{image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=600;canvas.height=760;canvas.getContext('2d').drawImage(image,0,0);canvas.toBlob(blob=>{if(blob)download(blob,`skeleton-pose-${String(Math.floor(position)).padStart(4,'0')}.png`)});}finally{URL.revokeObjectURL(url)}});
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|BUTTON/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();select(Math.floor(position)+1)}if(e.key==='ArrowLeft'){e.preventDefault();select(Math.floor(position)-1)}if(e.code==='Space'){e.preventDefault();play(!playing)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)play(false)});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');reduce.addEventListener('change',e=>{if(e.matches)play(false)});
function tick(now){if(playing&&previous){position+=Math.min((now-previous)/1000,.1)*FPS*rate;if(position>=end)position=start+(position-start)%(end-start);draw()}previous=now;requestAnimationFrame(tick)}
draw();play(!reduce.matches);requestAnimationFrame(tick);
