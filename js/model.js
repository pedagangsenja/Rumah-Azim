/* Banglo Azim 3D — binaan model 3D */
'use strict';

for(const k in FIN) FIN[k].tex=makeTex(FIN[k]);


/* ================= Pembantu geometri ================= */
const pick=[];
const house=new THREE.Group(); scene.add(house);
function boxPlan(x1,y1,x2,y2,z1,z2,mat,g,shadow=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2-x1),z2-z1,Math.abs(y2-y1)),mat);
  m.position.set((x1+x2)/2,(z1+z2)/2,-(y1+y2)/2); m.castShadow=m.receiveShadow=shadow; g.add(m); return m;
}
function bx(g,w,h,d,mat,x,y,z){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; g.add(m); return m; }
function cyl(g,rt,rb,h,mat,x,y,z,seg=20){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; }
const FACE={'x+':0,'x-':Math.PI,'y+':Math.PI/2,'y-':-Math.PI/2};
function item(parent,px,py,lv,face,info){ const g=new THREE.Group(); g.position.set(px,lv,-py); g.rotation.y=FACE[face||'x+']; g.userData.info=info; parent.add(g); pick.push(g); return g; }
function tagged(parent,info){ const g=new THREE.Group(); g.userData.info=info; parent.add(g); pick.push(g); return g; }

/* Tapak */
const ground=new THREE.Mesh(new THREE.CircleGeometry(90,48),M.ground);
ground.rotation.x=-Math.PI/2; ground.position.set(CX,0,CZ); ground.receiveShadow=true; scene.add(ground);
boxPlan(-0.9,-0.9,17.1,8.7,-0.02,0.05,M.apron,house);
[[0.9,0,13.8,7.8],[0,0,0.9,6.6],[13.8,0,15,4.25],[13.8,5.2,15,7.8]].forEach(r=>boxPlan(r[0],r[1],r[2],r[3],0.05,0.44,M.plinth,house)); // plinth, ruang dibiarkan untuk anak tangga
boxPlan(5.1,7.8,8.4,8.55,0.05,0.44,M.plinth,house);

/* ================= Bilik & lantai (luas ikut M1003) ================= */
ROOMS.forEach(rm=>{ rm.f0=rm.f; rm.meshes=[]; rm.full=rm.full||rm.r[0]; });
function texFor(key,w,d){ const f=FIN[key], t=f.tex.clone(); t.needsUpdate=true; t.repeat.set(w/f.pw,d/f.ph); return t; }
for(const rm of ROOMS){
  for(const [x1,y1,x2,y2] of rm.r){
    const top=new THREE.MeshStandardMaterial({map:texFor(rm.f,x2-x1,y2-y1),roughness:FIN[rm.f].rough,metalness:0});
    const m=new THREE.Mesh(new THREE.BoxGeometry(x2-x1,rm.lv-0.44,y2-y1),[M.side,M.side,top,M.side,M.side,M.side]);
    m.position.set((x1+x2)/2,(0.44+rm.lv)/2,-(y1+y2)/2); m.receiveShadow=true; m.userData.room=rm; house.add(m); pick.push(m);
    rm.meshes.push({m,top,w:x2-x1,d:y2-y1});
  }
}
function setFloor(rm,key){ rm.f=key; for(const o of rm.meshes){ if(o.top.map) o.top.map.dispose(); o.top.map=texFor(key,o.w,o.d); o.top.roughness=FIN[key].rough; o.top.needsUpdate=true; } }

/* Anak tangga — di dalam lanai menurun ke teres, dan di dalam yard menurun ke apron */
const steps=tagged(house,'STEPS');
for(let i=0;i<4;i++){ boxPlan(13.8+0.3*i,4.25,14.1+0.3*i,5.2,0.05,0.35-0.1*i,M.apron,steps); }
for(let i=0;i<4;i++){ boxPlan(0,6.6+0.3*i,0.9,6.9+0.3*i,0.05,0.35-0.1*i,M.apron,steps); }

/* ================= Dinding & bukaan ================= */
let wallGroup=null;
function buildWalls(top){
  if(wallGroup){ house.remove(wallGroup); const i=pick.indexOf(wallGroup); if(i>=0) pick.splice(i,1);
    wallGroup.traverse(o=>{ if(o.geometry) o.geometry.dispose(); const j=pick.indexOf(o); if(j>=0) pick.splice(j,1); }); }
  const g=tagged(house,'WALL');
  for(const [x1,y1,x2,y2,ops] of WALLS){
    const horiz=Math.abs(y2-y1)<1e-6, a0=horiz?Math.min(x1,x2):Math.min(y1,y2);
    const len=Math.abs(horiz?x2-x1:y2-y1), fx=horiz?y1:x1, L=len+T, st=a0-T/2;
    const piece=(s,e,z1,z2,mat=M.wall,th=T,grp=g)=>{
      if(e-s<0.004||z2-z1<0.004) return;
      const a1=st+s, a2=st+e;
      return horiz? boxPlan(a1,fx-th/2,a2,fx+th/2,z1,z2,mat,grp) : boxPlan(fx-th/2,a1,fx+th/2,a2,z1,z2,mat,grp);
    };
    const list=(ops||[]).map(o=>Object.assign({},o,{s:o.c-o.w/2+T/2,e:o.c+o.w/2+T/2,zs:FFL+o.sill,zh:FFL+o.sill+o.h})).sort((p,q)=>p.s-q.s);
    let cur=0;
    for(const o of list){
      piece(cur,o.s,BASE,top); piece(o.s,o.e,BASE,Math.min(o.zs,top)); if(o.zh<top) piece(o.s,o.e,o.zh,top); cur=o.e;
      const sub=tagged(g,o.type), zt=Math.min(o.zh,top), f=0.045;
      const frameRect=(s,e,z1,z2,div,tr,glassMat)=>{
        if(z2-z1<0.02) return;
        piece(s,e,z1,z2,glassMat,0.02,sub);
        for(let i=0;i<=div;i++){ const p=s+i*(e-s)/div; piece(Math.max(s,p-f/2),Math.min(e,p+f/2),z1,z2,M.frame,0.06,sub); }
        piece(s,e,z1,Math.min(z2,z1+f),M.frame,0.06,sub);
        if(o.zh<=top) piece(s,e,z2-f,z2,M.frame,0.06,sub);
        for(const t of (tr||[])){ const zz=z1+t; if(zz<z2-0.02) piece(s,e,zz-f/2,zz+f/2,M.frame,0.06,sub); }
      };
      const pivot=(at,ang)=>{ const pv=new THREE.Group(); if(horiz){ pv.position.set(st+at,0,-fx); pv.rotation.y=ang; } else { pv.position.set(fx,0,-(st+at)); pv.rotation.y=Math.PI/2+ang; } sub.add(pv); return pv; };
      if(o.k==='win'){ frameRect(o.s,o.e,o.zs,zt,o.div,o.tr,o.frost?M.frost:M.glass); }
      else if(o.k==='door'||o.k==='gdoor'){
        const leafH=Math.min(2.1,top-FFL)-0.02, w=o.w-0.04; if(leafH<=0.05) continue;
        const pv=pivot(o.s+0.02,o.open*1.15);
        if(o.k==='door'){ const lf=bx(pv,w,leafH,0.045,M.door,w/2,FFL+leafH/2,0);
          bx(pv,0.14,0.02,0.05,M.chrome,w-0.1,FFL+1.0,0.03); bx(pv,0.14,0.02,0.05,M.chrome,w-0.1,FFL+1.0,-0.03); }
        else { bx(pv,w,leafH,0.015,M.glass,w/2,FFL+leafH/2,0);
          for(const [ww,hh,xx,yy] of [[w,0.05,w/2,FFL+0.025],[w,0.05,w/2,FFL+leafH-0.025],[0.05,leafH,0.025,FFL+leafH/2],[0.05,leafH,w-0.025,FFL+leafH/2],[w,0.03,w/2,FFL+1.0]]) bx(pv,ww,hh,0.05,M.frame,xx,yy,0);
          if(o.zh>FFL+2.12) frameRect(o.s,o.e,FFL+2.12,zt,1,[],M.glass); }
      } else if(o.k==='bifold'){
        const leafH=Math.min(2.1,top-FFL)-0.02, lw=(o.w-0.04)/2; if(leafH<=0.05) continue;
        const pv=pivot(o.s+0.02,o.open*0.95);
        bx(pv,lw,leafH,0.03,M.louvre,lw/2,FFL+leafH/2,0);
        const p2=new THREE.Group(); p2.position.set(lw,0,0); p2.rotation.y=-o.open*1.9; pv.add(p2);
        bx(p2,lw,leafH,0.03,M.louvre,lw/2,FFL+leafH/2,0);
      }
    }
    piece(cur,L,BASE,top);
  }
  const cg=tagged(g,'COL');
  for(const [x,y] of [[0,7.8],[15,7.8],[16.1,7.7],[16.1,3.9]]) boxPlan(x-.1,y-.1,x+.1,y+.1,0.05,top,M.wall,cg);
  if(top>=PLATE-0.01){
    const z1=3.45,z2=PLATE;
    [[-.1,5.1,.1,7.8],[0,7.7,1.8,7.9],[12.3,7.7,15,7.9],[14.9,3.9,15.1,7.8],[16.0,3.9,16.2,7.7],[15,7.6,16.2,7.8],[15,3.8,16.2,4.0]].forEach(r=>boxPlan(r[0],r[1],r[2],r[3],z1,z2,M.wall,cg));
  }
  wallGroup=g;
}

/* ================= Pagar ================= */
const railG=tagged(house,'RAIL'); const barMats=[]; const dummy=new THREE.Object3D();
function railing(x1,y1,x2,y2,base){
  const horiz=Math.abs(y2-y1)<1e-6, len=Math.hypot(x2-x1,y2-y1), H=0.9;
  if(horiz) boxPlan(Math.min(x1,x2),y1-.025,Math.max(x1,x2),y1+.025,base+H-.012,base+H,M.rail,railG);
  else boxPlan(x1-.025,Math.min(y1,y2),x1+.025,Math.max(y1,y2),base+H-.012,base+H,M.rail,railG);
  const n=Math.floor(len/0.1);
  for(let i=0;i<=n;i++){ const t=i/n, x=x1+(x2-x1)*t, y=y1+(y2-y1)*t; dummy.position.set(x,base+0.43,-y); dummy.updateMatrix(); barMats.push(dummy.matrix.clone()); }
  for(const p of [0,1]){ const x=x1+(x2-x1)*p, y=y1+(y2-y1)*p; boxPlan(x-.025,y-.025,x+.025,y+.025,base,base+H,M.rail,railG); }
}
railing(0,5.1,0,7.8,.45); railing(0.9,7.8,1.8,7.8,.45);
railing(15,5.2,15,7.8,.45); railing(12.3,7.8,15,7.8,.45); railing(15,3.9,15,4.25,.45);
railing(5.1,8.55,8.4,8.55,.45); railing(5.1,7.8,5.1,8.55,.45); railing(8.4,7.8,8.4,8.55,.45);
const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(0.012,0.85,0.012),M.rail,barMats.length);
barMats.forEach((m,i)=>bars.setMatrixAt(i,m)); bars.castShadow=true; railG.add(bars);

/* ================= Bumbung limas 30° ================= */
const roof=tagged(scene,'ROOF');
const roofMat=new THREE.MeshStandardMaterial({color:0x5f6265,roughness:.8,side:THREE.DoubleSide,
  map:canvasTex(256,(g,S)=>{ const r=rnd(5);
    for(let j=0;j<2;j++) for(let i=-1;i<2;i++){ const x=i*S/2+(j%2?S/4:0), y=j*S/2;
      g.fillStyle=shade('#d9d9d9',1+(r()-.5)*.1); g.fillRect(x,y,S/2,S/2);
      const gr=g.createLinearGradient(0,y,0,y+S/2); gr.addColorStop(0,'rgba(255,255,255,.12)'); gr.addColorStop(1,'rgba(0,0,0,.32)'); g.fillStyle=gr; g.fillRect(x,y,S/2,S/2);
      g.fillStyle='rgba(0,0,0,.45)'; g.fillRect(x,y,2,S/2); } },[1/0.6,1/0.66])});
(function(){
  const e=0.6, x0=-e, x1=16.2+e, yS=-e, yN=7.8+e, half=(yN-yS)/2, rise=half*Math.tan(Math.PI/6), zr=PLATE+rise;
  const V=(x,y,h)=>[x,h,-y];
  const A=V(x0,yS,PLATE), B=V(x1,yS,PLATE), C=V(x1,yN,PLATE), D=V(x0,yN,PLATE), R1=V(x0+half,(yS+yN)/2,zr), R2=V(x1-half,(yS+yN)/2,zr);
  const pos=[], uv=[];
  const face=(pts,mode)=>{ for(const p of pts){ pos.push(...p); uv.push(mode==='x'?p[0]:p[2],(p[1]-PLATE)/Math.sin(Math.PI/6)); } };
  face([A,B,R2,A,R2,R1],'x'); face([C,D,R1,C,R1,R2],'x'); face([D,A,R1],'z'); face([B,C,R2],'z');
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,roofMat); m.castShadow=m.receiveShadow=true; roof.add(m);
  const cap=(p,q)=>{ const a=new THREE.Vector3(...p), b=new THREE.Vector3(...q), len=a.distanceTo(b);
    const c=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,len,10),M.cap); c.position.copy(a).add(b).multiplyScalar(.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); c.castShadow=true; roof.add(c); };
  cap(R1,R2); cap(A,R1); cap(D,R1); cap(B,R2); cap(C,R2);
  const fz=[PLATE-.2,PLATE+.02];
  boxPlan(x0,yS-.02,x1,yS+.02,fz[0],fz[1],M.fascia,roof); boxPlan(x0,yN-.02,x1,yN+.02,fz[0],fz[1],M.fascia,roof);
  boxPlan(x0-.02,yS,x0+.02,yN,fz[0],fz[1],M.fascia,roof); boxPlan(x1-.02,yS,x1+.02,yN,fz[0],fz[1],M.fascia,roof);
  const sof=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,yN-yS),M.soffit); sof.rotation.x=Math.PI/2; sof.position.set((x0+x1)/2,PLATE-.01,-(yS+yN)/2); roof.add(sof);
})();
roof.visible=false;

/* ================= Siling, lampu & kipas (D4001, D9001) ================= */
const ceilG=new THREE.Group(); scene.add(ceilG);
const lightG=new THREE.Group(); scene.add(lightG);
const fans=[];
for(const rm of ROOMS){ if(!rm.c) continue;
  for(const [x1,y1,x2,y2] of rm.r){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,y2-y1),M.ceil); p.rotation.x=Math.PI/2; p.position.set((x1+x2)/2,rm.ch,-(y1+y2)/2);
    p.userData.info=rm.c; ceilG.add(p); pick.push(p);
  }
  const [x1,y1,x2,y2]=rm.full, w=x2-x1, d=y2-y1, area=w*d;
  const nx=area<3?1:(w>3.2?3:2), ny=area<3?1:2;
  for(let i=0;i<nx;i++) for(let j=0;j<ny;j++){
    const lx=x1+w*(i+.5)/nx, ly=y1+d*(j+.5)/ny;
    const dl=item(lightG,lx,ly,rm.ch-0.012,'x+','DL'); cyl(dl,.065,.065,.02,M.lamp,0,0,0,16);
  }
}
for(const [x,y] of [[6.6,2.4],[6.6,3.3]]){ const dl=item(lightG,x,y,CEIL-0.012,'x+','DL'); cyl(dl,.065,.065,.02,M.lamp,0,0,0,16); }
for(const [x,y,ch] of [[3.48,6.27,CEIL],[6.78,5.84,CEIL],[10.33,5.84,CEIL],[13.62,6.45,CEIL],[1.5,1.95,CEIL],[4.5,1.95,CEIL],[8.55,2.8,CEIL],[12.95,1.95,CEIL]]){
  const f=item(lightG,x,y,ch,'x+','FAN');
  cyl(f,.012,.012,.32,M.chrome,0,-.16,0,8); cyl(f,.11,.13,.12,M.cab,0,-.38,0,24);
  const rot=new THREE.Group(); rot.position.y=-.4; f.add(rot);
  for(let k=0;k<3;k++){ const a=k*Math.PI*2/3, b=bx(rot,.62,.012,.13,M.cab,Math.cos(a)*.42,0,-Math.sin(a)*.42); b.rotation.y=a; }
  fans.push(rot);
}
for(const [x1,y1,x2,y2,ch] of [[8.6,7.55,12.1,7.6,CEIL],[12.0,5.3,12.05,7.55,CEIL],[5.3,7.55,8.2,7.6,CEIL],[12.4,.22,14.6,.27,CEIL],[14.72,.9,14.77,3.0,CEIL],[9.4,.17,10.85,.22,CEILW]]){
  const g=tagged(lightG,'LED'); boxPlan(x1,y1,x2,y2,ch-.06,ch-.03,M.led,g,false);
}
for(const [x,y,face] of [[.35,-.08,'y-'],[5.7,-.08,'y-'],[12.4,-.08,'y-'],[15.08,3.15,'x+'],[15.08,.65,'x+'],[16.2,7.7,'x+'],[16.2,3.9,'x+']]){
  const g=item(lightG,x,y,FFL+2.1,face,'WL'); bx(g,.06,.16,.1,M.black,.03,0,0); bx(g,.03,.1,.08,M.lamp,.07,0,0);
}

/* ================= Perabot (M1004) ================= */
const furn=new THREE.Group(); scene.add(furn);
function bed(px,py,w,l,face,throwMat){
  const g=item(furn,px,py,FFL,face,{t:w>1.2?'Katil kelamin':'Katil bujang',ref:'M1004',rows:[['Saiz','≈'+Math.round(w*1000)+' × '+Math.round(l*1000)+' mm (anggaran)'],['Sumber','Susun atur perabot M1004']]});
  bx(g,l,.28,w,M.wood2,0,.14,0); bx(g,l-.04,.2,w-.04,M.linen,0,.38,0);
  bx(g,.08,1.0,w+.06,M.wood2,-l/2+.04,.5,0);
  if(w>1.2){ bx(g,.36,.12,w/2-.12,M.pillow,-l/2+.32,.54,-w/4); bx(g,.36,.12,w/2-.12,M.pillow,-l/2+.32,.54,w/4); }
  else bx(g,.36,.12,w-.2,M.pillow,-l/2+.32,.54,0);
  bx(g,l*.58,.05,w+.03,throwMat||M.throwA,l*.2,.5,0); return g;
}
function nightstand(px,py,face){ const g=item(furn,px,py,FFL,face,'FURN'); bx(g,.42,.5,.42,M.oak,0,.25,0); cyl(g,.08,.1,.28,M.linen,0,.64,0,14); return g; }
function wardrobe(x1,y1,x2,y2){ const g=tagged(furn,{t:'Almari pakaian',ref:'M1004',rows:[['Saiz','≈'+Math.round(Math.max(x2-x1,y2-y1)*1000)+' × '+Math.round(Math.min(x2-x1,y2-y1)*1000)+' × 2200 mm (anggaran)'],['Sumber','Susun atur perabot M1004']]}); boxPlan(x1,y1,x2,y2,FFL,FFL+2.2,M.oak,g); return g; }
function desk(px,py,face,w){ const g=item(furn,px,py,FFL,face,{t:'Meja tulis',ref:'M1004',rows:[['Saiz','≈'+Math.round((w||1)*1000)+' × 500 mm'],['Sumber','Susun atur perabot M1004']]});
  bx(g,.5,.03,w||1,M.oak,0,.74,0); bx(g,.46,.72,.03,M.oak,0,.36,-(w||1)/2+.03); bx(g,.46,.72,.03,M.oak,0,.36,(w||1)/2-.03); return g; }
function chair(parent,px,py,lv,face,mat){ const g=item(parent,px,py,lv,face,'FURN');
  bx(g,.44,.05,.44,mat||M.oak,0,.45,0); bx(g,.05,.45,.42,mat||M.oak,-.2,.7,0);
  for(const [a,b] of [[.18,.18],[.18,-.18],[-.18,.18],[-.18,-.18]]) bx(g,.03,.43,.03,M.wood2,a,.215,b); return g; }
// Bilik 4
bed(1.08,1.4,1.6,2.0,'x+',M.throwA); nightstand(.3,.35,'x+'); nightstand(.3,2.45,'x+');
wardrobe(2.38,.15,2.92,2.9); desk(1.1,3.55,'y-',1.0); chair(furn,1.1,3.0,FFL,'y+');
// Bilik 3
bed(4.05,.6,.9,1.95,'x+',M.throwB); bed(4.05,2.1,.9,1.95,'x+',M.throwA); nightstand(3.3,1.35,'x+');
desk(3.75,3.6,'y-',1.0); chair(furn,3.75,3.05,FFL,'y+'); wardrobe(4.3,3.3,5.05,3.82); wardrobe(5.5,1.2,5.92,2.6);
// Bilik 2
bed(7.75,1.1,.95,1.95,'y+',M.throwB); nightstand(8.5,.3,'y+'); wardrobe(9.3,1.95,9.82,3.6); desk(8.75,3.6,'y-',.9); chair(furn,8.75,3.05,FFL,'y+');
// Bilik 1
bed(13.6,2.85,1.8,2.0,'y-',M.throwA); nightstand(12.5,3.6,'y-'); nightstand(14.7,3.6,'y-');
wardrobe(11.05,.12,12.45,.7); desk(11.4,3.6,'y-',.9); chair(furn,11.4,3.05,FFL,'y+');
// Ruang makan — meja 6 kerusi
(function(){ const g=item(furn,6.75,5.85,FFL,'x+',{t:'Meja makan 6 kerusi',ref:'M1004',rows:[['Saiz','≈1800 × 900 mm'],['Sumber','Susun atur perabot M1004']]});
  bx(g,1.8,.04,.9,M.oak,0,.75,0); for(const [a,b] of [[.82,.38],[.82,-.38],[-.82,.38],[-.82,-.38]]) bx(g,.05,.73,.05,M.wood2,a,.365,b);
  for(const dx of [-.55,0,.55]){ chair(g,dx,-.68,0,'y+',M.fabric2).position.set(dx,0,.68); chair(g,dx,.68,0,'y-',M.fabric2).position.set(dx,0,-.68); }
})();
// Ruang tamu — sofa L, meja kopi, kabinet TV, TV 80"
(function(){ const g=tagged(furn,{t:'Sofa L',ref:'M1004',rows:[['Saiz','≈2700 × 1800 mm (anggaran)'],['Sumber','Susun atur perabot M1004']]});
  boxPlan(8.9,5.4,11.6,6.25,FFL,FFL+.42,M.fabric,g); boxPlan(8.9,5.35,11.6,5.6,FFL,FFL+.82,M.fabric,g);
  boxPlan(10.8,6.25,11.6,7.1,FFL,FFL+.42,M.fabric,g); boxPlan(11.4,6.25,11.65,7.1,FFL,FFL+.62,M.fabric,g); boxPlan(8.85,5.4,9.1,6.25,FFL,FFL+.62,M.fabric,g);
  const t=tagged(furn,'FURN'); boxPlan(9.4,6.45,10.4,6.95,FFL+.36,FFL+.4,M.oak,t); boxPlan(9.45,6.5,10.35,6.9,FFL,FFL+.36,M.wood2,t);
  const tv=tagged(furn,{t:'Kabinet TV & TV 80"',ref:'M1006-1',rows:[['TV','Maksimum 80" pada dinding antara dua tingkap W2'],['Kabinet','≈1550 × 400 mm']]});
  boxPlan(9.3,7.35,10.85,7.74,FFL,FFL+.45,M.wood2,tv); boxPlan(9.17,7.68,10.97,7.72,FFL+.85,FFL+1.85,M.screen,tv);
})();
// Lanai — meja bulat 4 kerusi
(function(){ const g=item(furn,13.85,6.9,.45,'x+',{t:'Set meja lanai',ref:'M1004',rows:[['Susunan','Meja bulat + 4 kerusi'],['Sumber','Susun atur perabot M1004']]});
  cyl(g,.45,.45,.04,M.oak,0,.74,0,28); cyl(g,.05,.05,.72,M.black,0,.36,0,10);
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, c=chair(g,0,0,0,'x+',M.fabric2); c.position.set(Math.cos(a)*.72,0,-Math.sin(a)*.72); c.rotation.y=a+Math.PI; }
})();
// Dapur — kaunter L, kabinet atas, hob, sinki, peti sejuk
(function(){ const g=tagged(furn,'KIT');
  boxPlan(1.95,7.2,5.0,7.75,FFL,FFL+.86,M.cab,g); boxPlan(1.93,7.17,5.02,7.75,FFL+.86,FFL+.9,M.counter,g);
  boxPlan(1.95,6.15,2.55,7.2,FFL,FFL+.86,M.cab,g); boxPlan(1.93,6.12,2.58,7.2,FFL+.86,FFL+.9,M.counter,g);
  boxPlan(4.35,5.35,5.03,6.45,FFL,FFL+.86,M.cab,g); boxPlan(4.32,5.33,5.03,6.47,FFL+.86,FFL+.9,M.counter,g);
  boxPlan(1.95,7.42,5.0,7.75,FFL+1.75,FFL+2.45,M.cab,g); boxPlan(4.35,5.35,5.0,6.45,FFL+1.75,FFL+2.45,M.cab,g);
  boxPlan(2.6,7.3,3.2,7.7,FFL+.9,FFL+.91,M.black,g); boxPlan(2.6,7.35,3.2,7.75,FFL+1.62,FFL+1.75,M.steel,g);
  boxPlan(3.55,7.32,4.15,7.68,FFL+.86,FFL+.905,M.steel,g); cyl(g,.015,.015,.28,M.chrome,3.85,FFL+1.04,-7.7,8);
  const fr=tagged(furn,{t:'Peti sejuk',ref:'M1004',rows:[['Saiz','≈700 × 700 × 1800 mm (anggaran)']]}); boxPlan(4.35,6.5,5.0,7.15,FFL,FFL+1.8,M.steel,fr);
  const wm=tagged(furn,{t:'Mesin basuh',ref:'M1004',rows:[['Lokasi','Yard']]}); boxPlan(1.0,6.2,1.62,6.8,.45,1.3,M.porcelain,wm);
})();

/* ================= Sanitari (D2001–D2008) ================= */
const san=new THREE.Group(); scene.add(san);
function wc(px,py,face,info,close){ const g=item(san,px,py,.45,face,info);
  const ped=cyl(g,.14,.12,.38,M.porcelain,.38,.19,0,24); ped.scale.set(1.35,1,1);
  const bowl=cyl(g,.2,.17,.06,M.porcelain,.4,.41,0,28); bowl.scale.set(1.3,1,1);
  bx(g,.2,close?.42:.3,.4,M.porcelain,.11,close?.62:.55,0); return g; }
function wallBasin(px,py,face,info){ const g=item(san,px,py,.45,face,info);
  bx(g,.3,.13,.35,M.porcelain,.16,.82,0); cyl(g,.012,.012,.12,M.chrome,.06,.94,0,8); cyl(g,.02,.02,.3,M.chrome,.12,.6,0,10); return g; }
function shower(px,py,face,info,bar){ const g=item(san,px,py,.45,face,info);
  bx(g,.05,.16,.1,M.chrome,.03,1.1,0);
  if(bar){ cyl(g,.012,.012,.95,M.chrome,.04,1.5,0,8); } else { bx(g,.15,.02,.02,M.chrome,.08,2.0,0); }
  const hd=cyl(g,.1,.1,.02,M.chrome,bar?.12:.16,bar?1.95:1.98,0,20); if(bar) hd.rotation.z=.4; return g; }
// Bilik air 1
wc(9.66,.075,'y+','WC1',false);
(function(){ const hb=item(san,10.03,.075,.45,'y+','HB'); bx(hb,.04,.1,.06,M.chrome,.02,.55,0); cyl(hb,.015,.015,.15,M.chrome,.04,.48,0,8); })();
(function(){ const g=tagged(san,'B1'); boxPlan(10.2,.075,10.875,.6,FFL+.75,FFL+.85,M.tileCounter,g);
  const b=cyl(g,.2,.15,.13,M.porcelain,10.54,FFL+.915,-.33,28); b.scale.set(1,1,.85); cyl(g,.012,.012,.3,M.chrome,10.54,FFL+1.0,-.13,8); })();
(function(){ const g=item(san,10.54,.076,FFL+1.55,'y+','MR'); const gl=new THREE.Mesh(new THREE.CircleGeometry(.26,40),M.mirrorGlow); gl.rotation.y=Math.PI/2; gl.scale.set(1.75,1,1); gl.position.x=.005; g.add(gl);
  const mi=new THREE.Mesh(new THREE.CircleGeometry(.24,40),M.mirror); mi.rotation.y=Math.PI/2; mi.scale.set(1.8,1,1); mi.position.x=.012; g.add(mi); })();
shower(9.375,1.3,'x+','SHW1',true);
(function(){ const g=tagged(san,'SHW1'); boxPlan(9.43,1.0,9.53,1.6,.45,.456,M.steel,g,false); })();
// Bilik air 2
wc(6.525,.075,'y+','WC2',true); wallBasin(7.125,1.05,'x-','B2'); shower(6.075,1.4,'x+','SHW2',false);
(function(){ const g=tagged(san,'SHW2'); boxPlan(6.3,1.25,6.43,1.38,.45,.456,M.steel,g,false); })();
// Bilik air 3
(function(){ const g=item(san,.075,4.5,.45,'x+','SQ');
  const p=bx(g,.55,.03,.42,M.porcelain,.42,.015,0); const h=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.031,20),M.black); h.scale.set(1.5,1,.9); h.position.set(.45,.016,0); g.add(h);
  bx(g,.15,.3,.4,M.porcelain,.08,1.7,0); cyl(g,.015,.015,1.3,M.porcelain,.1,.95,.12,8); })();
(function(){ const g=tagged(san,'SQ'); boxPlan(.78,3.98,.82,5.02,.45,.47,M.steel,g,false); })();
wallBasin(1.35,3.975,'y+','B2');
(function(){ const g=item(san,.95,3.975,.45,'y+','WTHS'); bx(g,.06,.1,.1,M.chrome,.03,.6,0); cyl(g,.015,.015,.2,M.chrome,.06,.75,.05,8); })();
shower(1.15,5.025,'y-','SHW2',false);
(function(){ const g=tagged(san,'SHW2'); boxPlan(1.15,4.65,1.28,4.78,.45,.456,M.steel,g,false); })();

/* ================= Kompas & label ================= */
(function(){
  const t=canvasTex(256,(g,S)=>{ g.strokeStyle='rgba(30,40,44,.7)'; g.lineWidth=5; g.beginPath(); g.arc(S/2,S/2,S/2-8,0,Math.PI*2); g.stroke();
    g.fillStyle='#b3362d'; g.beginPath(); g.moveTo(S/2,26); g.lineTo(S/2+30,S/2+18); g.lineTo(S/2,S/2); g.lineTo(S/2-30,S/2+18); g.closePath(); g.fill();
    g.fillStyle='rgba(30,40,44,.8)'; g.font='700 52px "Instrument Sans", sans-serif'; g.textAlign='center'; g.fillText('U',S/2,S-34); });
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));
  p.rotation.x=-Math.PI/2; const w=new THREE.Group(); w.add(p); w.rotation.y=Math.PI/2; w.position.set(-3.2,0.06,-3.9); scene.add(w);
})();
const labels=new THREE.Group(); scene.add(labels);
function label(main,sub,x,y,h,s){
  const cv=document.createElement('canvas'); cv.width=560; cv.height=170; const g=cv.getContext('2d');
  g.fillStyle='rgba(255,255,255,.93)'; g.strokeStyle='rgba(27,41,45,.25)'; g.lineWidth=3;
  g.beginPath(); g.moveTo(28,6); g.arcTo(554,6,554,164,22); g.arcTo(554,164,6,164,22); g.arcTo(6,164,6,6,22); g.arcTo(6,6,554,6,22); g.closePath(); g.fill(); g.stroke();
  g.fillStyle='#1b292d'; g.textAlign='center'; g.font='700 54px "Instrument Sans", system-ui, sans-serif'; g.fillText(main,280,78);
  g.fillStyle='#596a6f'; g.font='500 34px "JetBrains Mono", ui-monospace, monospace'; g.fillText(sub,280,128);
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.anisotropy=ANISO;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  const k=s||1; sp.scale.set(2.1*k,0.64*k,1); sp.position.set(x,h,-y); sp.renderOrder=10; labels.add(sp);
}
function buildLabels(){ for(const rm of ROOMS){ const [x1,y1,x2,y2]=rm.full, at=rm.at||[(x1+x2)/2,(y1+y2)/2]; label(rm.n,rm.a+' m²',at[0],at[1],2.6+(rm.lift||0),rm.s); } label('Teres','lepa simen',15.6,1.9,1.4,.75); }
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(buildLabels,buildLabels);

