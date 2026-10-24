/* Banglo Azim 3D — galeri render dan lawatan 360° (imej Blender Cycles dalam folder render/) */
'use strict';

const GAL={i:0, key:null, list:[], x0:null};
const PV={i:0, r:null, cam:null, scene:null, mesh:null, lon:0, lat:0, fov:75, ptrs:new Map(), pinch:0, run:false, tex:{}};

/* ================= Tukar mod: Model 3D / Galeri / 360° ================= */
function setSheetH(){ const h=document.querySelector('.sheet').getBoundingClientRect().height; document.documentElement.style.setProperty('--sheet-h',Math.round(h)+'px'); }
function openMode(m){
  if(m!=='3d'&&S.walk) stopWalk(true);
  $('galeri').hidden=m!=='galeri'; $('pano').hidden=m!=='pano';
  S.pause=m!=='3d'; document.body.classList.toggle('overlay',m!=='3d');
  document.querySelectorAll('.mode').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m?'true':'false'));
  setSheetH();
  if(m==='galeri'){ buildGal(); showGal(GAL.i); }
  if(m==='pano') startPano(); else stopPano();
}
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>openMode(b.dataset.mode)));
window.addEventListener('resize',()=>{ setSheetH(); if(PV.run) sizePano(); });

/* ================= Galeri ================= */
/* Set gambar ikut gaya: Arkitek = render/; gaya lain = render/gaya/<id>/ (syot RENDER_GAYA / PANO_GAYA sahaja) */
const gayaNow=()=>GAYA.find(g=>g.id===S.gaya)||GAYA[0];
function galSet(){ const g=gayaNow(); return g.id==='arkitek'?RENDERS.map(r=>Object.assign({dir:'render/'},r))
  :RENDER_GAYA.map(f=>Object.assign({dir:'render/gaya/'+g.id+'/'},RENDERS.find(r=>r.f===f))); }
function panoSet(){ const g=gayaNow(); return g.id==='arkitek'?PANOS.map(p=>Object.assign({dir:'render/'},p))
  :PANO_GAYA.map(f=>Object.assign({dir:'render/gaya/'+g.id+'/'},PANOS.find(p=>p.f===f))); }
function buildGal(){
  if(GAL.key===S.gaya) return; GAL.key=S.gaya; GAL.list=galSet(); $('gThumbs').innerHTML='';
  GAL.list.forEach((r,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',r.t);
    const im=document.createElement('img'); im.src=r.dir+'kecil/'+r.f+'.jpg'; im.alt=''; b.appendChild(im);
    b.addEventListener('click',()=>showGal(i)); $('gThumbs').appendChild(b); });
}
function showGal(i){
  const L=GAL.list, n=L.length; GAL.i=(i+n)%n; const r=L[GAL.i], g=gayaNow();
  $('gImg').src=r.dir+r.f+'.jpg'; $('gImg').alt=r.t; $('gT').textContent=r.t;
  $('gMeta').textContent='Render Cycles · '+r.m+' · 23 Okt'+(g.id==='arkitek'?'':' · Gaya '+g.n);
  $('gCount').textContent=(GAL.i+1)+' / '+n;
  $('gThumbs').querySelectorAll('button').forEach((b,j)=>{ b.setAttribute('aria-current',j===GAL.i?'true':'false'); if(j===GAL.i) b.scrollIntoView({block:'nearest',inline:'center'}); });
  const nx=new Image(); nx.src=L[(GAL.i+1)%n].dir+L[(GAL.i+1)%n].f+'.jpg'; // pramuat gambar seterusnya
}
$('gPrev').addEventListener('click',()=>showGal(GAL.i-1));
$('gNext').addEventListener('click',()=>showGal(GAL.i+1));
$('gStage').addEventListener('pointerdown',e=>{ GAL.x0=e.clientX; });
$('gStage').addEventListener('pointerup',e=>{ if(GAL.x0===null) return; const dx=e.clientX-GAL.x0; GAL.x0=null; if(Math.abs(dx)>45) showGal(GAL.i+(dx<0?1:-1)); });
window.addEventListener('keydown',e=>{
  if(!$('galeri').hidden){ if(e.key==='ArrowRight') showGal(GAL.i+1); if(e.key==='ArrowLeft') showGal(GAL.i-1); if(e.key==='Escape') openMode('3d'); }
  else if(!$('pano').hidden&&e.key==='Escape') openMode('3d');
});

/* ================= Lawatan 360° ================= */
let PL=[];
function buildChips(){ PL=panoSet(); $('pChips').innerHTML='';
  PL.forEach((p,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=p.t; b.setAttribute('aria-pressed',i===0?'true':'false');
    b.addEventListener('click',()=>loadPano(i)); $('pChips').appendChild(b); }); }
buildChips();
/* Dipanggil oleh applyGaya (ui.js) */
function onGaya(){ setSheetH(); if(!$('galeri').hidden){ buildGal(); showGal(Math.min(GAL.i,GAL.list.length-1)); }
  const cur=PL[PV.i]&&PL[PV.i].f; buildChips(); if(PV.run){ const j=PL.findIndex(p=>p.f===cur); loadPano(j<0?0:j); } else PV.i=0; }
function startPano(){
  if(!PV.r){
    PV.r=new THREE.WebGLRenderer({canvas:$('pc'),antialias:false}); PV.r.outputEncoding=THREE.sRGBEncoding;
    PV.r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    PV.scene=new THREE.Scene(); PV.cam=new THREE.PerspectiveCamera(PV.fov,1,.1,100);
    const g=new THREE.SphereGeometry(20,64,40); g.scale(-1,1,1);
    PV.mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x111111})); PV.scene.add(PV.mesh);
  }
  PV.run=true; sizePano(); loadPano(PV.i);
  PV.r.setAnimationLoop(()=>{ const la=THREE.MathUtils.degToRad(PV.lat), lo=THREE.MathUtils.degToRad(PV.lon);
    PV.cam.lookAt(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)); PV.r.render(PV.scene,PV.cam); });
}
function stopPano(){ if(PV.r&&PV.run){ PV.r.setAnimationLoop(null); PV.run=false; } }
function sizePano(){ const c=$('pano').getBoundingClientRect(); PV.r.setSize(c.width,c.height,false); PV.cam.aspect=c.width/c.height; PV.cam.updateProjectionMatrix(); }
function loadPano(i){
  PV.i=i; const p=PL[i], key=p.dir+p.f; $('pChips').querySelectorAll('.chip').forEach((b,j)=>b.setAttribute('aria-pressed',j===i?'true':'false'));
  PV.lon=180+p.yaw; PV.lat=-10; PV.fov=75; PV.cam.fov=PV.fov; PV.cam.updateProjectionMatrix();
  const use=t=>{ PV.mesh.material.dispose(); PV.mesh.material=new THREE.MeshBasicMaterial({map:t}); $('pLoad').hidden=true; };
  if(PV.tex[key]){ use(PV.tex[key]); return; }
  $('pLoad').hidden=false; $('pLoad').textContent='Memuatkan panorama…';
  new THREE.TextureLoader().load(key+'.jpg',t=>{ t.encoding=THREE.sRGBEncoding; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; PV.tex[key]=t; if(PV.i===i&&PL[i]===p) use(t); },
    undefined,()=>{ $('pLoad').textContent='Panorama tidak dapat dimuatkan.'; });
}
const pc=$('pc');
pc.addEventListener('pointerdown',e=>{ pc.setPointerCapture(e.pointerId); PV.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY}); PV.pinch=0; pc.style.cursor='grabbing'; });
pc.addEventListener('pointermove',e=>{ const p=PV.ptrs.get(e.pointerId); if(!p) return;
  if(PV.ptrs.size===1){ const k=PV.fov/Math.max(320,pc.clientHeight)*1.2; PV.lon-=(e.clientX-p.x)*k; PV.lat=Math.max(-85,Math.min(85,PV.lat+(e.clientY-p.y)*k)); }
  p.x=e.clientX; p.y=e.clientY;
  if(PV.ptrs.size===2){ const [a,b]=[...PV.ptrs.values()], d=Math.hypot(a.x-b.x,a.y-b.y); if(PV.pinch) zoomPano(PV.pinch/d); PV.pinch=d; } });
const ptrEnd=e=>{ PV.ptrs.delete(e.pointerId); PV.pinch=0; pc.style.cursor='grab'; };
pc.addEventListener('pointerup',ptrEnd); pc.addEventListener('pointercancel',ptrEnd);
pc.addEventListener('wheel',e=>{ e.preventDefault(); zoomPano(e.deltaY>0?1.06:1/1.06); },{passive:false});
function zoomPano(f){ PV.fov=Math.max(35,Math.min(95,PV.fov*f)); PV.cam.fov=PV.fov; PV.cam.updateProjectionMatrix(); }
setSheetH();
