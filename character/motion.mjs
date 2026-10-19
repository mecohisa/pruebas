// Key poses manually reconstructed from one skeleton in the supplied 22 s clip.
// Coordinates are editable landmark positions in a 600 × 760 transparent canvas.
const D = {
 head:[300,142], headAngle:0, face:0, chest:[300,218], chestAngle:0,
 pelvis:[300,398], pelvisAngle:0,
 elbowL:[218,320],wristL:[188,393],elbowR:[382,320],wristR:[412,393],
 kneeL:[195,500],ankleL:[278,605],kneeR:[405,500],ankleR:[322,605],
 footL:0,footR:0,handL:0,handR:0,fistL:0,fistR:0
};
const make=changes=>({...structuredClone(D),...changes});
const diamond=make({});
const narrow=make({head:[300,112],chest:[300,188],pelvis:[300,368],elbowL:[240,290],wristL:[228,370],elbowR:[360,290],wristR:[372,370],kneeL:[260,485],kneeR:[340,485]});
const tall=make({...narrow,head:[300,88],chest:[300,164],pelvis:[300,344]});
const lean=make({head:[225,168],headAngle:-14,face:-.4,chest:[290,220],chestAngle:-18,pelvis:[300,405],kneeL:[165,505],kneeR:[435,505],elbowL:[185,292],wristL:[195,370],elbowR:[410,275],wristR:[420,370]});
const waist={elbowL:[215,315],wristL:[280,350],elbowR:[390,240],wristR:[370,330],fistL:1,fistR:1,handL:-70,handR:60};
const run=make({...waist,head:[315,118],headAngle:-14,face:1,chest:[300,200],chestAngle:-16,pelvis:[300,375],pelvisAngle:-20,kneeL:[255,485],ankleL:[290,605],kneeR:[435,435],ankleR:[465,520],footR:70,footL:-5});
const lift=make({...run,kneeR:[415,355],ankleR:[345,450],footR:-10});
const kick=make({...run,head:[315,105],chest:[300,187],pelvis:[310,360],kneeL:[280,480],ankleL:[330,605],kneeR:[445,335],ankleR:[525,310],footR:-70});
const fold=make({...run,head:[320,92],chest:[310,173],pelvis:[320,350],kneeL:[175,380],ankleL:[300,412],footL:30,kneeR:[410,475],ankleR:[435,605],footR:0});
const jump=make({head:[300,100],chest:[300,176],pelvis:[300,350],elbowL:[215,270],wristL:[200,345],elbowR:[385,270],wristR:[400,345],kneeL:[155,425],ankleL:[230,500],kneeR:[445,425],ankleR:[370,500],footL:25,footR:-25});
const sway=make({head:[300,128],chest:[310,210],chestAngle:-17,pelvis:[340,398],pelvisAngle:-8,kneeL:[315,510],ankleL:[265,605],kneeR:[370,510],ankleR:[330,605],elbowL:[270,325],wristL:[295,430],elbowR:[405,325],wristR:[410,420]});
const sideKick=make({head:[300,124],chest:[300,205],chestAngle:8,pelvis:[270,385],pelvisAngle:12,kneeL:[160,425],ankleL:[105,505],footL:-75,kneeR:[310,505],ankleR:[345,605],elbowL:[240,320],wristL:[200,380],handL:35,elbowR:[365,320],wristR:[320,430],handR:55});
const squat=make({head:[300,335],chest:[300,411],pelvis:[300,535],elbowL:[170,385],wristL:[180,450],elbowR:[430,385],wristR:[420,450],kneeL:[150,505],ankleL:[235,605],kneeR:[450,505],ankleR:[365,605],fistL:1,fistR:1,handL:-15,handR:15});
function mirror(p){const q=structuredClone(p);for(const k of ['head','chest','pelvis'])q[k]=[600-p[k][0],p[k][1]];for(const k of ['headAngle','face','chestAngle','pelvisAngle'])q[k]=-p[k];for(const name of ['elbow','wrist','knee','ankle']){q[name+'L']=[600-p[name+'R'][0],p[name+'R'][1]];q[name+'R']=[600-p[name+'L'][0],p[name+'L'][1]];}for(const name of ['foot','hand']){q[name+'L']=-p[name+'R'];q[name+'R']=-p[name+'L'];}q.fistL=p.fistR;q.fistR=p.fistL;return q;}
const start=make({...lift,head:[300,140],chest:[300,218],pelvis:[300,390],elbowL:[220,230],wristL:[210,285],elbowR:[380,230],wristR:[390,285]});
const labels=['Impulso','Elevación','Piernas juntas','Inclinación lateral','Rombo','Estiramiento','Rombo abierto','Estiramiento alto','Rombo frontal','Rodilla arriba','Patada frontal','Pierna plegada','Paso de carrera','Salto abierto','Rombo de enlace','Pierna plegada','Paso de carrera','Piernas cruzadas','Rombo frontal','Salto amplio','Balanceo derecho','Patada izquierda','Balanceo izquierdo','Patada derecha','Balanceo derecho','Patada izquierda larga','Descenso','Agachada','Agachada profunda','Subida','Estiramiento','Pierna plegada inversa','Carrera inversa','Cruce inverso','Rombo frontal','Salto amplio','Carrera inversa','Cruce inverso','Rodilla plegada inversa','Salto de enlace','Rombo abierto','Paso cruzado final','Patada izquierda final','Patada derecha final'];
const poses=[start,make({...lift,head:[300,135],chest:[300,212],pelvis:[300,390],fistL:0,elbowL:[215,295],wristL:[220,365]}),narrow,lean,diamond,tall,diamond,tall,diamond,lift,kick,fold,run,jump,diamond,fold,run,make({...lift,head:[315,105],chest:[300,185],pelvis:[300,355],kneeR:[300,400],ankleR:[240,435],footR:15}),diamond,jump,sway,sideKick,mirror(sway),mirror(sideKick),sway,make({...sideKick,kneeL:[120,450],ankleL:[85,540]}),make({...squat,head:[300,220],chest:[300,296],pelvis:[300,455],elbowL:[180,320],wristL:[195,390],elbowR:[420,320],wristR:[405,390],kneeL:[185,500],kneeR:[415,500]}),squat,make({...squat,head:[300,365],chest:[300,433],pelvis:[300,558],headAngle:12,kneeL:[145,555],kneeR:[455,555],ankleL:[265,615],ankleR:[335,615]}),make({...squat,head:[300,250],chest:[300,326],pelvis:[300,500],elbowL:[190,385],wristL:[190,455],elbowR:[410,385],wristR:[410,455],kneeL:[185,550],kneeR:[415,550],ankleL:[278,610],ankleR:[322,610],fistL:0,fistR:0}),tall,mirror(fold),mirror(run),mirror(lift),diamond,jump,mirror(run),mirror(lift),mirror(fold),make({...lift,face:-.6,headAngle:12,head:[300,125],chest:[300,200],chestAngle:8,pelvis:[300,380],pelvisAngle:4,elbowL:[210,260],wristL:[205,330],elbowR:[390,260],wristR:[385,330],fistL:0,fistR:0,kneeL:[245,490],ankleL:[195,605]}),diamond,make({...sideKick,kneeL:[210,485],ankleL:[190,550],footL:-35}),sideKick,mirror(sideKick)];
export const FPS=30000/1001;
export const FRAME_COUNT=660;
export const DURATION=FRAME_COUNT/FPS;
export const KEYFRAMES=poses.map((pose,i)=>({frame:i*15,time:i*15/FPS,label:labels[i],pose}));
export const SEGMENTS=[{name:'Coreografía completa',start:0,end:660},{name:'Rombo y estiramiento',start:60,end:135},{name:'Pasos y patadas',start:135,end:300},{name:'Balanceos',start:300,end:390},{name:'Agachada y subida',start:390,end:465},{name:'Carrera inversa',start:465,end:600}];
export function sample(frame){
 frame=Math.max(0,Math.min(FRAME_COUNT-1,frame));const i=Math.min(KEYFRAMES.length-1,Math.floor(frame/15)),a=KEYFRAMES[i].pose,b=KEYFRAMES[Math.min(i+1,KEYFRAMES.length-1)].pose,t=(frame-i*15)/15;
 const p={};for(const [key,value]of Object.entries(a)){if(Array.isArray(value))p[key]=value.map((x,j)=>x+(b[key][j]-x)*t);else if(['face','fistL','fistR'].includes(key))p[key]=t<.5?value:b[key];else p[key]=value+(b[key]-value)*t;}return p;
}
