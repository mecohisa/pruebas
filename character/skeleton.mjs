import {sample,FRAME_COUNT,FPS,DURATION,KEYFRAMES} from './motion.mjs';
export {sample,FRAME_COUNT,FPS,DURATION,KEYFRAMES};
const parts={
 headFront:{clip:'rect',box:[335,0,335,337],origin:[500,185],scale:.39},
 chest:{clip:'polygon',points:'340,330 665,330 698,400 649,435 659,552 680,630 635,681 365,681 325,630 345,540 355,435 303,400',origin:[500,365],scale:.35},
 pelvis:{clip:'rect',box:[325,724,355,226],origin:[500,860],scale:.35},
 spine:{a:[500,672],b:[500,768],width:130},
 upperL:{a:[345,370],b:[245,640],width:65},lowerL:{a:[245,640],b:[149,814],width:70},
 upperR:{a:[665,370],b:[767,640],width:65},lowerR:{a:[767,640],b:[865,814],width:70},
 thighL:{a:[365,940],b:[205,1128],width:72},shinL:{a:[205,1128],b:[384,1394],width:70},
 thighR:{a:[633,940],b:[796,1128],width:72},shinR:{a:[796,1128],b:[602,1394],width:70},
 handL:{clip:'polygon',points:'130,782 212,782 250,850 247,956 205,1000 188,1050 48,1050 40,945 70,850',origin:[168,814],scale:.34},
 handR:{clip:'polygon',points:'789,782 871,782 931,850 961,945 953,1050 813,1050 796,1000 754,956 751,850',origin:[846,814],scale:.34},
 footL:{clip:'rect',box:[113,1350,368,132],origin:[384,1394],scale:.35},
 footR:{clip:'rect',box:[510,1350,374,132],origin:[602,1394],scale:.35}
};
const LIMBS=new Set(['upperL','lowerL','upperR','lowerR','thighL','shinL','thighR','shinR']);
const SPINE=`<path d="M0-6H100V6H0Z" fill="var(--bone,#deddd5)" stroke="var(--ink,#101010)" stroke-width="2.5"/>${[0,25,50,75].map(x=>`<path transform="translate(${x} 0)" d="M2-7 Q-4-14 5-14 H15 Q23-13 19-7 L19 7 Q23 13 15 14 H5 Q-4 14 2 7Z" fill="var(--bone,#deddd5)" stroke="var(--ink,#101010)" stroke-width="2.5"/>`).join('')}`;
const BONE='<path d="M3-4 Q-1-10-5-5 Q-12-5-9 2 Q-9 9-3 7 Q1 13 5 5 L95 5 Q99 13 103 7 Q111 9 109 2 Q112-5 105-5 Q101-10 97-4Z" fill="var(--bone,#deddd5)" stroke="var(--ink,#101010)" stroke-width="2.5" stroke-linejoin="round"/>';
const round=n=>Number(n.toFixed(4));
const rotate=(v,a)=>{a*=Math.PI/180;return [v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a)];};
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const at=(p,v,a)=>add(p,rotate(v,a));
const theta=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
function capsule(part){const [ax,ay]=part.a,[bx,by]=part.b,r=part.width/2,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len*r,ny=(bx-ax)/len*r;return `<path d="M${ax+nx},${ay+ny} L${bx+nx},${by+ny} A${r},${r} 0 0 0 ${bx-nx},${by-ny} L${ax-nx},${ay-ny} A${r},${r} 0 0 0 ${ax+nx},${ay+ny}Z"/>`;}
function clip(part){if(part.clip==='rect')return `<rect x="${part.box[0]}" y="${part.box[1]}" width="${part.box[2]}" height="${part.box[3]}"/>`;if(part.clip==='polygon')return `<polygon points="${part.points}"/>`;return capsule(part);}
const SIDE_HEAD=`<path d="M-43 13 C-64-2-62-37-35-53 C-13-66 21-61 35-46 Q47-34 44-17 L50-12 44-5 50 0 43 8 47 21 37 26 35 44 Q14 58-9 48 L-12 30Z"/><path d="M12-24 Q-7-35-16-15 Q-18 3-4 5 Q10 2 12-24Z M32-26 Q45-29 40-10 L24-6Q19-15 32-26Z M20 0L12 12 28 9Z" fill="var(--ink,#101010)" stroke="none"/><path d="M-5 29Q18 30 41 17 M0 22L3 37M10 20L13 35M22 17L25 32M33 13L36 26" fill="none" stroke-width="2.6"/>`;
const FIST=`<path d="M-14-5 Q-22 4-14 18 Q-20 28-8 32 L11 32 Q24 25 17 10 Q24 0 14-5 L5 5 Q0-9-8-5Z"/><path d="M-8 12L10 18M-10 20L8 26M0 5L13 9" fill="none" stroke-width="2.2"/>`;
export const ORDER=['thighL','shinL','footL','thighR','shinR','footR','upperL','lowerL','upperR','lowerR','spine','chest','pelvis','handL','handR','fistL','fistR','headFront','headSide'];
export function definitions(art,id='sk'){
 return `<defs><g id="${id}-spine">${SPINE}</g><g id="${id}-bone">${BONE}</g><g id="${id}-art" fill-rule="evenodd"><path d="${art.ink}" fill="var(--ink,#101010)"/><path d="${art.bone}" fill="var(--bone,#deddd5)"/></g>${Object.entries(parts).map(([name,part])=>`<clipPath id="${id}-${name}">${clip(part)}</clipPath>`).join('')}<g id="${id}-headSide" fill="var(--bone,#deddd5)" stroke="var(--ink,#101010)" stroke-width="2.8" stroke-linejoin="round">${SIDE_HEAD}</g><g id="${id}-fist" fill="var(--bone,#deddd5)" stroke="var(--ink,#101010)" stroke-width="2.8" stroke-linejoin="round">${FIST}</g></defs>`;
}
export function geometry(p){
 const values={};
 const segment=(name,a,b)=>{if(LIMBS.has(name)||name==='spine'){values[name]={translate:a,rotate:theta(a,b),scale:[length(a,b)/100,1],tail:'',opacity:1};return;}const part=parts[name];values[name]={translate:a,rotate:theta(a,b),scale:[length(a,b)/length(part.a,part.b),.35],tail:`rotate(${-theta(part.a,part.b)}) translate(${-part.a[0]} ${-part.a[1]})`,opacity:1};};
 const anchor=(name,pos,angle=0)=>{const part=parts[name];values[name]={translate:pos,rotate:angle,scale:[part.scale,part.scale],tail:`translate(${-part.origin[0]} ${-part.origin[1]})`,opacity:1};};
 anchor('headFront',p.head,p.headAngle);values.headFront.opacity=Math.abs(p.face)<.5?1:0;
 values.headSide={translate:p.head,rotate:p.headAngle,scale:[p.face<0?-1:1,1],tail:'',opacity:Math.abs(p.face)>=.5?1:0};
 anchor('chest',p.chest,p.chestAngle);anchor('pelvis',p.pelvis,p.pelvisAngle);
 const sl=at(p.chest,[-55,3],p.chestAngle),sr=at(p.chest,[55,3],p.chestAngle);
 const hl=at(p.pelvis,[-47,27],p.pelvisAngle),hr=at(p.pelvis,[47,27],p.pelvisAngle);
 segment('spine',at(p.chest,[0,111],p.chestAngle),at(p.pelvis,[0,-42],p.pelvisAngle));
 segment('upperL',sl,p.elbowL);segment('lowerL',p.elbowL,p.wristL);segment('upperR',sr,p.elbowR);segment('lowerR',p.elbowR,p.wristR);
 segment('thighL',hl,p.kneeL);segment('shinL',p.kneeL,p.ankleL);segment('thighR',hr,p.kneeR);segment('shinR',p.kneeR,p.ankleR);
 for(const side of ['L','R']){anchor('hand'+side,p['wrist'+side],p['hand'+side]);values['hand'+side].opacity=p['fist'+side]>.5?0:1;anchor('foot'+side,p['ankle'+side],p['foot'+side]);values['fist'+side]={translate:p['wrist'+side],rotate:p['hand'+side],scale:[1,1],tail:'',opacity:p['fist'+side]>.5?1:0};}
 return values;
}
function content(name,id){if(name==='spine')return `<use href="#${id}-spine"/>`;if(LIMBS.has(name))return `<use href="#${id}-bone"/>`;if(name==='headSide')return `<use href="#${id}-headSide"/>`;if(name.startsWith('fist'))return `<use href="#${id}-fist"/>`;return `<g clip-path="url(#${id}-${name})"><use href="#${id}-art"/></g>`;}
function transform(g){return `translate(${g.translate.map(round).join(' ')}) rotate(${round(g.rotate)}) scale(${g.scale.map(round).join(' ')}) ${g.tail}`;}
export function body(pose,id='sk') {const g=geometry(pose);return ORDER.map(name=>`<g data-part="${name}" transform="${transform(g[name])}" opacity="${g[name].opacity}">${content(name,id)}</g>`).join('');}
export function svg(art,pose=sample(120),options={}){const {id='sk',bone='#deddd5',ink='#101010'}=options;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760" style="--bone:${bone};--ink:${ink}" role="img" aria-label="Esqueleto vectorial con fondo transparente"><title>Esqueleto articulado — The Skeleton Dance</title><desc>Reconstrucción vectorial. Solo trazados, grupos y recortes; sin imágenes incrustadas.</desc>${definitions(art,id)}${body(pose,id)}</svg>`;}
export function applyPose(element,pose){const poses=geometry(pose);for(const group of element.querySelectorAll('[data-part]')){const g=poses[group.dataset.part];group.setAttribute('transform',transform(g));group.setAttribute('opacity',g.opacity);}}
export function animatedSVG(art,{bone='#deddd5',ink='#101010',start=0,end=660}={}){
 const frames=Array.from({length:end-start},(_,i)=>geometry(sample(start+i)));frames.push(frames.at(-1));
 const duration=(end-start)/FPS,times=frames.map((_,i)=>round(i/(frames.length-1))).join(';');
 const animate=(type,values)=>`<animateTransform attributeName="transform" type="${type}" values="${values.map(v=>Array.isArray(v)?v.map(round).join(' '):round(v)).join(';')}" keyTimes="${times}" dur="${duration}s" repeatCount="indefinite" calcMode="discrete"/>`;
 const layers=ORDER.map(name=>{const gs=frames.map(x=>x[name]),g=gs[0];return `<g transform="translate(${g.translate})">${animate('translate',gs.map(x=>x.translate))}<animate attributeName="opacity" values="${gs.map(x=>x.opacity).join(';')}" keyTimes="${times}" dur="${duration}s" repeatCount="indefinite" calcMode="discrete"/><g transform="rotate(${g.rotate})">${animate('rotate',gs.map(x=>x.rotate))}<g transform="scale(${g.scale})">${animate('scale',gs.map(x=>x.scale))}<g transform="${g.tail}">${content(name,'anim')}</g></g></g></g>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760" style="--bone:${bone};--ink:${ink}"><title>Baile de un esqueleto — SVG animado autónomo</title><desc>Coreografía reconstruida manualmente desde 44 poses clave; 660 muestras. Animación SVG SMIL. Sin vídeo, fotogramas raster, fondo ni JavaScript externo.</desc>${definitions(art,'anim')}${layers}</svg>`;
}
export class Skeleton {
 constructor(element,art){this.element=element;this.art=art;this.frame=120;this.playing=false;element.setAttribute('viewBox','0 0 600 760');element.innerHTML=definitions(art)+body(sample(120));}
 setFrame(frame){this.frame=frame;applyPose(this.element,sample(frame));}
 setTime(seconds){this.setFrame(seconds*FPS);}
 play({start=0,end=660,rate=1}={}){this.pause();this.playing=true;let first;const tick=now=>{if(!this.playing)return;if(first===undefined)first=now;this.setFrame(start+((now-first)/1000*FPS*rate)%(end-start));this.request=requestAnimationFrame(tick);};this.request=requestAnimationFrame(tick);}
 pause(){this.playing=false;cancelAnimationFrame(this.request);}
 destroy(){this.pause();this.element.replaceChildren();}
}
