/* Banglo Azim 3D — mod jalan: kamera orang pertama pada paras mata, kayu bedik (telefon), WASD (komputer), perlanggaran dinding */
'use strict';

const EYE=1.6, RAD=.22, SPEED=1.45;
const W={x:19.5,y:4.8,yaw:Math.PI,pitch:0,eh:EYE,keys:{},jx:0,jy:0,joyId:null,look:null,obs:null,zone:''};

/* Halangan: dinding (kecuali bukaan pintu), pagar, tiang, perabot, kemudahan tapak */
function walkObstacles(){
  const segs=[], boxes=COLS.map(([x,y])=>[x-.1,y-.1,x+.1,y+.1]);
  for(const [x1,y1,x2,y2,ops] of WALLS){ const horiz=Math.abs(y2-y1)<1e-6, a0=horiz?Math.min(x1,x2):Math.min(y1,y2), a1=horiz?Math.max(x1,x2):Math.max(y1,y2), f=horiz?y1:x1;
    const gaps=(ops||[]).filter(o=>o.sill===0).map(o=>[a0+o.c-o.w/2+.04,a0+o.c+o.w/2-.04]).sort((p,q)=>p[0]-q[0]);
    let cur=a0-T/2; const add=(s,e)=>{ if(e-s>.01) segs.push(horiz?[s,f,e,f,T/2]:[f,s,f,e,T/2]); };
    for(const [s,e] of gaps){ add(cur,s); cur=e; } add(cur,a1+T/2); }
  for(const [x1,y1,x2,y2] of RAILS) segs.push([x1,y1,x2,y2,.03]);
  for(const grp of [furn,san]) for(const ch of grp.children){ const b=new THREE.Box3().setFromObject(ch); if(b.isEmpty()||b.max.y-b.min.y<.25||b.min.y>2.2) continue;
    boxes.push([b.min.x,-b.max.z,b.max.x,-b.min.z]); }
  for(const u of UTIL) if(u.k==='tank'||u.k==='pump'||u.k==='well'||u.k==='ist') { const h=(u.d||1)/2+.1; boxes.push([u.x-h,u.y-h,u.x+h,u.y+h]); }
  for(const t of TREES) boxes.push([t.x-.25,t.y-.25,t.x+.25,t.y+.25]);
  return {segs,boxes};
}
function floorAt(x,y){
  const s=stairAt(x,y); if(s!==null) return s;
  const rm=inRoom(x,y); if(rm) return rm.lv;
  if(x>=15&&x<=16.2&&y>=3.9&&y<=7.8) return .06;
  if(x>=-.675&&x<=16.8&&y>=-.675&&y<=8.475&&!(x>15.675&&y<3.3)) return .05;
  return 0;
}
function zoneAt(x,y){
  const rm=inRoom(x,y); if(rm) return rm.n;
  if(stairAt(x,y)!==null) return y>6?'Tangga yard':'Tangga lanai';
  if(x>=15&&x<=16.2&&y>=3.9&&y<=7.8) return 'Teres';
  let ins=false; for(let i=0,j=LOT.length-1;i<LOT.length;j=i++){ const [xi,yi]=LOT[i],[xj,yj]=LOT[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins; }
  return ins?'Laman':'Luar lot';
}
function collide(x,y){
  for(let it=0;it<3;it++){
    for(const [x1,y1,x2,y2,r] of W.obs.segs){ const dx=x2-x1, dy=y2-y1, L2=dx*dx+dy*dy; let t=L2?((x-x1)*dx+(y-y1)*dy)/L2:0; t=Math.max(0,Math.min(1,t));
      const px=x1+dx*t, py=y1+dy*t, ex=x-px, ey=y-py, d=Math.hypot(ex,ey), R=RAD+r;
      if(d<R&&d>1e-6){ x=px+ex/d*R; y=py+ey/d*R; } }
    for(const [x1,y1,x2,y2] of W.obs.boxes){ const px=Math.max(x1,Math.min(x2,x)), py=Math.max(y1,Math.min(y2,y)), ex=x-px, ey=y-py, d=Math.hypot(ex,ey);
      if(d<RAD&&d>1e-6){ x=px+ex/d*RAD; y=py+ey/d*RAD; } }
  }
  return [x,y];
}
function tryMove(nx,ny){
  [nx,ny]=collide(nx,ny);
  if(Math.hypot(nx-SUN_T.x,ny+SUN_T.z)>45) return false;
  const h0=floorAt(W.x,W.y), h1=floorAt(nx,ny);
  if(h1-h0>.13||h0-h1>.6) return false;
  W.x=nx; W.y=ny; return true;
}

/* ================= Masuk & keluar ================= */
const walkUI=$('walk'), joy=$('joy'), joyK=$('joyK');
function startWalk(){
  clearSel(); tween=null; S.room=null; $('tour').value='';
  if(S.cut){ S.cut=false; buildWalls(PLATE); }
  S.walk=true; S.roof=true; sync();
  if(!W.obs) W.obs=walkObstacles();
  W.x=19.5; W.y=4.8; W.yaw=Math.PI; W.pitch=-.04; W.eh=floorAt(W.x,W.y)+EYE;
  controls.enabled=false; camera.fov=70; camera.updateProjectionMatrix();
  document.querySelectorAll('.view').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view==='jalan'?'true':'false'));
  document.body.classList.add('walking'); walkUI.hidden=false; W.zone=''; placeCam();
  $('walkHint').hidden=false; setTimeout(()=>{ $('walkHint').hidden=true; },6000);
}
function stopWalk(silent){
  S.walk=false; W.keys={}; W.jx=W.jy=0; W.look=null; joyK.style.transform='';
  controls.enabled=true; document.body.classList.remove('walking'); walkUI.hidden=true;
  if(!silent) goView('3d');
}
$('walkX').addEventListener('click',()=>stopWalk(false));
function placeCam(){
  camera.position.set(W.x,W.eh,-W.y);
  const cp=Math.cos(W.pitch); camera.lookAt(W.x+Math.cos(W.yaw)*cp,W.eh+Math.sin(W.pitch),-(W.y+Math.sin(W.yaw)*cp));
  const z=zoneAt(W.x,W.y); if(z!==W.zone){ W.zone=z; $('walkRoom').textContent=z; }
}

/* ================= Input: kayu bedik, seret pandang, papan kekunci ================= */
joy.addEventListener('pointerdown',e=>{ W.joyId=e.pointerId; joy.setPointerCapture(e.pointerId); joyMove(e); e.stopPropagation(); });
joy.addEventListener('pointermove',e=>{ if(e.pointerId===W.joyId) joyMove(e); });
const joyEnd=e=>{ if(e.pointerId!==W.joyId) return; W.joyId=null; W.jx=W.jy=0; joyK.style.transform=''; };
joy.addEventListener('pointerup',joyEnd); joy.addEventListener('pointercancel',joyEnd);
function joyMove(e){ const r=joy.getBoundingClientRect(), R=r.width/2-14; let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
  const d=Math.hypot(dx,dy); if(d>R){ dx*=R/d; dy*=R/d; } W.jx=dx/R; W.jy=dy/R; joyK.style.transform=`translate(${dx}px,${dy}px)`; }
canvas.addEventListener('pointerdown',e=>{ if(!S.walk) return; W.look={id:e.pointerId,x:e.clientX,y:e.clientY}; });
window.addEventListener('pointermove',e=>{ if(!S.walk||!W.look||e.pointerId!==W.look.id) return;
  const k=2.4/Math.max(320,Math.min(window.innerWidth,window.innerHeight));
  W.yaw+=(e.clientX-W.look.x)*k; W.pitch=Math.max(-1.2,Math.min(1.2,W.pitch+(e.clientY-W.look.y)*k)); W.look.x=e.clientX; W.look.y=e.clientY; });
window.addEventListener('pointerup',e=>{ if(W.look&&e.pointerId===W.look.id) W.look=null; });
const KEYS={KeyW:'f',ArrowUp:'f',KeyS:'b',ArrowDown:'b',KeyA:'l',KeyD:'r',ArrowLeft:'tl',ArrowRight:'tr',ShiftLeft:'run',ShiftRight:'run'};
window.addEventListener('keydown',e=>{ if(!S.walk) return; if(e.key==='Escape'){ stopWalk(false); return; } const k=KEYS[e.code]; if(k){ W.keys[k]=true; e.preventDefault(); } });
window.addEventListener('keyup',e=>{ const k=KEYS[e.code]; if(k) W.keys[k]=false; });
window.addEventListener('blur',()=>{ W.keys={}; });

TICK.push(dt=>{
  if(!S.walk) return;
  const K=W.keys; if(K.tl) W.yaw+=1.6*dt; if(K.tr) W.yaw-=1.6*dt;
  let fwd=(K.f?1:0)-(K.b?1:0)-W.jy, side=(K.r?1:0)-(K.l?1:0)+W.jx;
  const m=Math.hypot(fwd,side); if(m>1){ fwd/=m; side/=m; }
  if(m>.02){ const sp=SPEED*(K.run?1.8:1)*dt, cy=Math.cos(W.yaw), sy=Math.sin(W.yaw);
    const dx=(cy*fwd+sy*side)*sp, dy=(sy*fwd-cy*side)*sp;
    if(!tryMove(W.x+dx,W.y+dy)){ if(!tryMove(W.x+dx,W.y)) tryMove(W.x,W.y+dy); } }
  const target=floorAt(W.x,W.y)+EYE; W.eh+=(target-W.eh)*Math.min(1,dt*10);
  placeCam();
});
if(!matchMedia('(pointer: coarse)').matches) $('walkHint').textContent='W A S D atau anak panah untuk berjalan, Shift untuk laju. Seret untuk memandang. Esc untuk keluar.';
