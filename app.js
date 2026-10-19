const $ = s => document.querySelector(s);
const canvas = $('#stage'), ctx = canvas.getContext('2d', {alpha:false});
const audio = $('#audio'), cache = new Map();
let meta, position=0, shown=-1, playing=false, audible=false, rate=1, last=0, busy=false, seekVersion=0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = $('#load-state');
function clock(t){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function frameURL(n){return `assets/dance/${String(n).padStart(4,'0')}.webp`;}
function image(n){
  if(cache.has(n)) return cache.get(n).promise;
  const record={bitmap:null,promise:null};
  record.promise=fetch(frameURL(n)).then(r=>{if(!r.ok)throw Error(`Fotograma ${n}: HTTP ${r.status}`);return r.blob();}).then(createImageBitmap).then(bitmap=>{record.bitmap=bitmap;return bitmap;}).catch(error=>{cache.delete(n);throw error;});
  cache.set(n,record);
  return record.promise;
}
function preload(n){
  // Retain a short window instead of decoding all 660 images into memory.
  const keep=new Set(Array.from({length:32},(_,i)=>(n-4+i+meta.count)%meta.count));
  for(const [key,value] of cache){if(!keep.has(key)&&value.bitmap){value.bitmap.close();cache.delete(key);}}
  for(let i=1;i<=12;i++)image((n+i)%meta.count).catch(()=>{});
}
function updateUI(n){
  $('#seek').value=n;
  $('#time').textContent=`${clock(position)} / ${clock(meta.duration)}`;
  $('#frame-number').textContent=`FOTOGRAMA ${String(n+1).padStart(3,'0')} / ${meta.count}`;
  document.querySelectorAll('.card').forEach(card=>card.setAttribute('aria-pressed',Number(card.dataset.frame)===n?'true':'false'));
}
function paint(n,bitmap){ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);shown=n;updateUI(n);}
async function seek(n){
  const version=++seekVersion;
  n=Math.max(0,Math.min(meta.count-1,Math.round(n)));
  position=n/meta.fps;
  if(audible)audio.currentTime=position;
  last=0;
  try{const bitmap=await image(n);if(version!==seekVersion)return;paint(n,bitmap);preload(n);}catch(error){fail(error);}
}
function setPlaying(value){
  playing=value;
  $('#play').textContent=playing?'Ⅱ':'▷';
  $('#play').setAttribute('aria-label',playing?'Pausar animación':'Reproducir animación');
  last=0;
  if(audible){if(playing)audio.play().catch(()=>{audible=false;audio.pause();soundUI();});else audio.pause();}
}
function soundUI(){ $('#sound').textContent=audible?'SONIDO: SÍ':'SONIDO: NO';$('#sound').setAttribute('aria-pressed',String(audible));$('#sound').setAttribute('aria-label',audible?'Desactivar sonido':'Activar sonido'); }
function fail(error){setPlaying(false);state.textContent='NO SE PUDO CARGAR UN FOTOGRAMA';console.error(error);}
async function tick(now){
  requestAnimationFrame(tick);
  if(!meta)return;
  if(playing&&last){
    if(audible&&!audio.paused){position=audio.currentTime;if(position>=meta.duration){position=0;audio.currentTime=0;}}
    else position=(position+Math.min((now-last)/1000,.1)*rate)%meta.duration;
  }
  last=now;
  const n=Math.min(meta.count-1,Math.floor(position*meta.fps+1e-7));
  if(n===shown||busy)return;
  busy=true;
  const version=seekVersion;
  try{const bitmap=await image(n);if(version===seekVersion){paint(n,bitmap);preload(n);}}catch(error){fail(error);}finally{busy=false;}
}
async function init(){
  try{
    const response=await fetch('assets/manifest.json');if(!response.ok)throw Error('No se pudo cargar el manifiesto');meta=await response.json();
    canvas.width=meta.width;canvas.height=meta.height;$('#seek').max=meta.count-1;
    $('#cards').innerHTML=meta.poses.map(p=>`<button class="card" data-frame="${p.frame}" aria-pressed="false" aria-label="Ver pose: ${p.label}"><img src="${p.file}" alt="Fotograma original: ${p.label}" loading="lazy" width="1296" height="1080"><span class="card-meta"><span>${p.label}</span><small>${clock(p.originalSeconds)}</small></span></button>`).join('');
    document.querySelectorAll('.card').forEach(card=>card.addEventListener('click',()=>{setPlaying(false);seek(Number(card.dataset.frame));}));
    $('#play').addEventListener('click',()=>setPlaying(!playing));
    $('#restart').addEventListener('click',()=>seek(0));
    $('#seek').addEventListener('input',e=>{setPlaying(false);seek(Number(e.target.value));});
    function step(delta){setPlaying(false);seek(Math.min(meta.count-1,Math.max(0,Math.round(position*meta.fps)+delta)));}
    $('#prev').addEventListener('click',()=>step(-1));$('#next').addEventListener('click',()=>step(1));
    $('#speed').addEventListener('change',e=>{rate=Number(e.target.value);audio.playbackRate=rate;});
    $('#sound').addEventListener('click',async()=>{
      if(audible){position=audio.currentTime;audible=false;audio.pause();}
      else{audio.currentTime=position;audio.playbackRate=rate;audible=true;if(playing){try{await audio.play();}catch{audible=false;state.textContent='PULSA REPRODUCIR PARA ACTIVAR AUDIO';}}}soundUI();
    });
    audio.addEventListener('ended',()=>{position=0;audio.currentTime=0;if(playing&&audible)audio.play().catch(()=>{audible=false;soundUI();});});
    document.addEventListener('keydown',e=>{if(/INPUT|SELECT|BUTTON/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}if(e.code==='Space'){e.preventDefault();setPlaying(!playing);}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
    reduced.addEventListener('change',e=>{if(e.matches)setPlaying(false);});
    await seek(0);state.textContent='SECUENCIA ORIGINAL · EN BUCLE';setPlaying(!reduced.matches);requestAnimationFrame(tick);
    // Read-only diagnostics for browser verification.
    window.dance={get frame(){return shown;},get playing(){return playing;},get cacheSize(){return cache.size;},get count(){return meta.count;}};
  }catch(error){fail(error);}
}
init();
