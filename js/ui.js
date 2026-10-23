/* Banglo Azim 3D — keadaan, kawalan, maklumat objek, tema, gelung animasi */
'use strict';

/* ================= Keadaan & lapisan ================= */
const S={roof:false,cut:false,ceil:true,light:true,furn:true,san:true,label:true,room:null};
buildWalls(PLATE);
function sync(){
  roof.visible=S.roof; ceilG.visible=S.ceil; lightG.visible=S.light; furn.visible=S.furn; san.visible=S.san;
  labels.visible=S.label && !S.roof && !S.room;
  document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',S[b.dataset.layer]?'true':'false'));
}
document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.layer; S[k]=!S[k];
  if(k==='cut'){ buildWalls(S.cut?1.6:PLATE); if(S.cut) S.roof=false; clearSel(); }
  if(k==='roof'&&S.roof&&S.cut){ S.cut=false; buildWalls(PLATE); }
  sync();
}));

/* Tab */
const tabs=[['tb-p','tab-p'],['tb-l','tab-l'],['tb-k','tab-k']];
tabs.forEach(([b,p])=>$(b).addEventListener('click',()=>{ tabs.forEach(([b2,p2])=>{ $(b2).setAttribute('aria-selected',b2===b?'true':'false'); $(p2).hidden=p2!==p; }); }));

/* ================= Pandangan & lawatan bilik ================= */
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const VIEWS={'3d':{p:[CX+11,19,CZ+15],t:[CX,1.2,CZ]},'atas':{p:[CX,30,CZ+0.01],t:[CX,0.5,CZ]},'depan':{p:[CX,3.2,CZ+22],t:[CX,2.0,CZ]}};
let tween=null;
function fly(p,t,fov){ if(reduce){ camera.position.copy(p); controls.target.copy(t); camera.fov=fov; camera.updateProjectionMatrix(); controls.update(); return; }
  tween={p0:camera.position.clone(),t0:controls.target.clone(),f0:camera.fov,p1:p,t1:t,f1:fov,s:performance.now(),d:850}; }
function scaleF(){ return camera.aspect<0.6?2.15:(camera.aspect<0.85?1.75:(camera.aspect<1.2?1.3:1)); }
function tgt(v){ const t=new THREE.Vector3(...v.t); if(camera.aspect<0.85) t.y-=2.2; return t; }
function goView(name){
  S.room=null; $('tour').value=''; controls.minDistance=5; controls.maxDistance=70; controls.maxPolarAngle=1.5;
  document.querySelectorAll('.view').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===name?'true':'false'));
  const v=VIEWS[name], t=tgt(v), p=new THREE.Vector3(...v.p).sub(t).multiplyScalar(scaleF()).add(t);
  fly(p,t,38); sync();
}
function goRoom(id){
  const rm=ROOMS.find(r=>r.id===id); if(!rm) return;
  S.room=id; if(S.roof){ S.roof=false; } if(S.cut){ S.cut=false; buildWalls(PLATE); }
  document.querySelectorAll('.view').forEach(b=>b.setAttribute('aria-pressed','false'));
  const [x1,y1,x2,y2]=rm.full, cx=(x1+x2)/2, cy=(y1+y2)/2;
  const ey=(y1>=3.9-1e-6)? y1+.45 : y2-.45, ex=x1+.45;
  const t=new THREE.Vector3(cx,FFL+1.05,-cy), p=new THREE.Vector3(ex,FFL+1.62,-ey);
  if(rm.id==='balkoni'){ t.set(cx,FFL+1.0,-cy); p.set(cx,FFL+1.6,-6.0); }
  controls.minDistance=0.05; controls.maxDistance=12; controls.maxPolarAngle=Math.PI-0.1;
  fly(p,t,62); sync(); showInfo(roomInfo(rm));
}
document.querySelectorAll('.view').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
const tourSel=$('tour');
ROOMS.forEach(rm=>{ const o=document.createElement('option'); o.value=rm.id; o.textContent=rm.n+' · '+rm.a+' m²'; tourSel.appendChild(o); });
tourSel.addEventListener('change',()=>{ if(tourSel.value) goRoom(tourSel.value); });

/* ================= Maklumat objek (ketik) ================= */
function roomInfo(rm){ const f=FIN[rm.f];
  return {t:rm.n,ref:'M1003 · D1001 · D4001',rows:[['Luas',rm.a+' m²'],['Lantai',f.nama+' — '+f.kod+(rm.f!==rm.f0?' (pilihan anda, bukan lukisan)':'')],
    ['Siling',rm.c?INFO[rm.c].rows[0][1]:'Tiada (terbuka)'],['Tinggi siling',rm.c? (rm.ch===CEILW?'2400 mm dari FFL':'≈2850 mm dari FFL'):'—'],
    ['Aras lantai',rm.lv<.5?'50 mm di bawah FFL (kawasan basah / luar)':'FFL +500 mm dari aras tanah']]}; }
function showInfo(inf){
  $('infoT').textContent=inf.t; $('infoRef').textContent='Rujukan · '+inf.ref;
  $('infoRows').innerHTML=''; for(const [k,v] of inf.rows){ const dt=document.createElement('dt'), dd=document.createElement('dd'); dt.textContent=k; dd.textContent=v; $('infoRows').append(dt,dd); }
  $('info').hidden=false;
}
let selBox=null;
function clearSel(){ if(selBox){ scene.remove(selBox); selBox.geometry.dispose(); selBox=null; } $('info').hidden=true; }
$('infoX').addEventListener('click',clearSel);
function selColor(){ return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--sel').trim()||'#e3a21a'); }
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
function visibleChain(o){ while(o){ if(!o.visible) return false; o=o.parent; } return true; }
function onTap(cx,cy){
  const r=canvas.getBoundingClientRect(); ndc.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(pick,true).filter(h=>visibleChain(h.object));
  if(!hits.length){ clearSel(); return; }
  let o=hits[0].object, target=null, inf=null;
  while(o){ if(o.userData.room){ target=o; inf=roomInfo(o.userData.room); break; } if(o.userData.info){ target=o; const v=o.userData.info; inf=typeof v==='string'?INFO[v]:v; break; } o=o.parent; }
  if(!inf){ clearSel(); return; }
  if(selBox){ scene.remove(selBox); selBox.geometry.dispose(); }
  selBox=new THREE.BoxHelper(target===wallGroup?hits[0].object:target,selColor()); selBox.material.depthTest=false; selBox.renderOrder=20; scene.add(selBox);
  showInfo(inf);
  if(target.userData.room){ $('floorRoom').value=target.userData.room.id; renderFloorSw(); }
}
let down=null;
canvas.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY,t:performance.now()}; });
canvas.addEventListener('pointerup',e=>{ if(!down) return; const d=Math.hypot(e.clientX-down.x,e.clientY-down.y), dt=performance.now()-down.t; down=null; if(d<7&&dt<500) onTap(e.clientX,e.clientY); });

/* ================= Kemasan & warna ================= */
const OPTS={
  roof:{mat:roofMat,list:[['Kelabu arang','#5f6265'],['Merah bata','#93402f'],['Coklat koko','#5e4234'],['Hitam','#2e2f31'],['Biru kelabu','#4b5b70']]},
  wall:{mat:M.wall,list:[['Putih gading','#f2f0eb'],['Kelabu muda','#d8dad7'],['Krim','#efe3c8'],['Hijau sage','#c7d2bd'],['Biru kabus','#d1dce3']]},
  frame:{mat:M.frame,extra:[M.louvre],list:[['Hitam','#2a2d2f'],['Kelabu','#7b8185'],['Putih','#eceeee'],['Champagne','#b49e76']]},
  door:{mat:M.door,list:[['Kayu sederhana','#8b5a36'],['Walnut','#5a3a25'],['Oak cerah','#b98a5a'],['Putih','#ece8e1']]}
};
const choice={roof:0,wall:0,frame:0,door:0};
function applyOpt(k,i){ choice[k]=i; const o=OPTS[k], c=o.list[i][1]; o.mat.color.set(c).convertSRGBToLinear(); (o.extra||[]).forEach(m=>m.color.set(c).convertSRGBToLinear());
  $('n-'+k).textContent=o.list[i][0]; document.querySelectorAll('#sw-'+k+' .sw').forEach((b,j)=>b.setAttribute('aria-pressed',j===i?'true':'false')); }
for(const k in OPTS){ const box=$('sw-'+k);
  OPTS[k].list.forEach(([nm,c],i)=>{ const b=document.createElement('button'); b.type='button'; b.className='sw'; b.style.background=c; b.title=nm; b.setAttribute('aria-label',nm); b.addEventListener('click',()=>applyOpt(k,i)); box.appendChild(b); });
  applyOpt(k,0); }
const floorSel=$('floorRoom');
ROOMS.forEach(rm=>{ const o=document.createElement('option'); o.value=rm.id; o.textContent=rm.n; floorSel.appendChild(o); });
floorSel.value='tamu';
function renderFloorSw(){
  const rm=ROOMS.find(r=>r.id===floorSel.value), box=$('sw-floor'); box.innerHTML='';
  Object.keys(FIN).forEach(k=>{ const f=FIN[k], b=document.createElement('button'); b.type='button'; b.className='sw'; b.style.backgroundImage=`url(${f.tex.userData.url})`;
    b.title=f.nama; b.setAttribute('aria-label',f.nama); b.setAttribute('aria-pressed',rm.f===k?'true':'false');
    b.addEventListener('click',()=>{ setFloor(rm,k); renderFloorSw(); if(!$('info').hidden && $('infoT').textContent===rm.n) showInfo(roomInfo(rm)); }); box.appendChild(b); });
  const f=FIN[rm.f]; $('n-floor').textContent=f.nama+' · '+f.kod+(rm.f===rm.f0?' (ikut lukisan)':' (ditukar)');
}
floorSel.addEventListener('change',renderFloorSw); renderFloorSw();
$('resetFin').addEventListener('click',()=>{ for(const k in OPTS) applyOpt(k,0); ROOMS.forEach(rm=>{ if(rm.f!==rm.f0) setFloor(rm,rm.f0); }); renderFloorSw(); });

/* ================= Tema, saiz, gelung ================= */
function applyTheme(){ const cs=getComputedStyle(document.documentElement);
  const bg=new THREE.Color(cs.getPropertyValue('--scene').trim()||'#dce5e8'); scene.background=bg; scene.fog=new THREE.Fog(bg,55,140);
  M.ground.color.set(cs.getPropertyValue('--ground').trim()||'#9aad85'); if(selBox) selBox.material.color.copy(selColor()); }
applyTheme();
try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme); }catch(e){}
new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
function resize(){ const w=window.innerWidth, h=window.innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
window.addEventListener('resize',resize); resize();
{ const v=VIEWS['3d'], t=tgt(v); camera.position.copy(new THREE.Vector3(...v.p).sub(t).multiplyScalar(scaleF()).add(t)); controls.target.copy(t); }
sync();
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
renderer.setAnimationLoop(()=>{
  if(tween){ const k=Math.min(1,(performance.now()-tween.s)/tween.d), e=ease(k);
    camera.position.lerpVectors(tween.p0,tween.p1,e); controls.target.lerpVectors(tween.t0,tween.t1,e);
    camera.fov=tween.f0+(tween.f1-tween.f0)*e; camera.updateProjectionMatrix(); if(k>=1) tween=null; }
  if(!reduce && S.light) for(const f of fans) f.rotation.y+=0.03;
  controls.update(); renderer.render(scene,camera);
});
