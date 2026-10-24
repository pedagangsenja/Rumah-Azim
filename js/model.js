/* Banglo Azim 3D — binaan model 3D */
'use strict';

for(const k in FIN) FIN[k].tex=makeTex(FIN[k]);
/* Jubin dinding bilik air: Travertine disusun lurus (mendatar), Kit Kat Deep Brown (D1001) */
const WFIN={
  trav:{tex:makeTex({base:'#e9dcbf',grout:'#b8a985',speck:true,band:true,seed:31}), pw:1.2, ph:.6},
  kit:{tex:makeTex({kind:'kitkat',base:'#5a2a1c',grout:'#3a1a10',seed:37}), pw:.6, ph:.6}
};
M.tileW=new THREE.MeshStandardMaterial({map:WFIN.trav.tex,roughness:.35,side:THREE.DoubleSide});
M.kitkat=new THREE.MeshStandardMaterial({map:WFIN.kit.tex,roughness:.15,envMapIntensity:1.3,side:THREE.DoubleSide});

/* ================= Pembantu geometri ================= */
const pick=[];
const house=new THREE.Group(); scene.add(house);
function boxPlan(x1,y1,x2,y2,z1,z2,mat,g,shadow=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2-x1),z2-z1,Math.abs(y2-y1)),mat);
  m.position.set((x1+x2)/2,(z1+z2)/2,-(y1+y2)/2); m.castShadow=m.receiveShadow=shadow; g.add(m); return m;
}
function bx(g,w,h,d,mat,x,y,z){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; g.add(m); return m; }
function cyl(g,rt,rb,h,mat,x,y,z,seg=20){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; g.add(m); return m; }
const FACE={'x+':0,'x-':Math.PI,'y+':Math.PI/2,'y-':-Math.PI/2};
function item(parent,px,py,lv,face,info){ const g=new THREE.Group(); g.position.set(px,lv,-py); g.rotation.y=FACE[face||'x+']; g.userData.info=info; parent.add(g); pick.push(g); return g; }
function tagged(parent,info){ const g=new THREE.Group(); g.userData.info=info; parent.add(g); pick.push(g); return g; }
/* Segi empat bebas: titik [x,aras,y pelan] + uv, dua muka */
function quad(g,pts,uvs,mat,shadow=true){
  const geo=new THREE.BufferGeometry(), pos=[], uv=[];
  for(const i of [0,1,2,0,2,3]){ const p=pts[i]; pos.push(p[0],p[1],-p[2]); uv.push(...uvs[i]); }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat); m.castShadow=shadow; m.receiveShadow=true; g.add(m); return m;
}
/* Garis dalam bilik? (untuk menentukan sisi luar dinding) */
function inRoom(x,y){ for(const rm of ROOMS) for(const [x1,y1,x2,y2] of rm.r) if(x>x1&&x<x2&&y>y1&&y<y2) return rm; return null; }
/* Sisi dinding: 'e' = luar (tiada bilik, atau yard / lanai / balkoni), 'i' = dalam */
const LUARAN=new Set(['yard','lanai','balkoni']);
function sisiDinding(x,y){ const rm=inRoom(x,y); return !rm||LUARAN.has(rm.id)?'e':'i'; }
/* Bahan setiap muka kotak dinding (urutan BoxGeometry: +x, −x, +y, −y, +z, −z; +z three = sisi −y pelan) */
function bahanDinding(horiz,neg,pos){ const m=c=>c==='e'?M.wall:c==='a'?M.aksen:M.wallIn, end=neg==='e'||pos==='e'?M.wall:M.wallIn;
  return horiz?[end,end,end,end,m(neg),m(pos)]:[m(pos),m(neg),end,end,end,end]; }

/* ================= Apron, plinth & longkang (M1002) ================= */
const site=new THREE.Group(); scene.add(site);
/* Longkang U 300 mm di bawah titisan cucur atap: garis tengah (anggaran ≈0.95 m dari grid) */
/* Apron 600 mm + longkang 300 mm dari muka dinding (M1006-4, M1006-5); papak balkoni mengunjur di atas apron (D6004) */
const DRAIN=[[-.825,-.825],[15.825,-.825],[15.825,3.15],[16.95,3.15],[16.95,8.625],[-.825,8.625]];
(function(){
  const APRON=[[-.675,-.675],[15.675,-.675],[15.675,3.3],[16.8,3.3],[16.8,8.475],[-.675,8.475]];
  const geo=new THREE.ShapeGeometry(new THREE.Shape(APRON.map(([x,y])=>new THREE.Vector2(x,y)))); geo.rotateX(-Math.PI/2);
  const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)/2.5,uv.getY(i)/2.5);
  const ap=new THREE.Mesh(geo,M.apron); ap.position.y=.05; ap.receiveShadow=true; ap.userData.info='APRON'; site.add(ap); pick.push(ap);
  const dg=tagged(site,'DRAIN');
  for(let i=0;i<DRAIN.length;i++){
    const [ax,ay]=DRAIN[i], [bx2,by]=DRAIN[(i+1)%DRAIN.length], horiz=Math.abs(by-ay)<1e-6;
    const lo=horiz?Math.min(ax,bx2)-.15:Math.min(ay,by)-.15, hi=horiz?Math.max(ax,bx2)+.15:Math.max(ay,by)+.15, c=horiz?ay:ax;
    const covered=!horiz&&ax>16.5;
    const strip=(o1,o2,z1,z2,mat)=>horiz?boxPlan(lo,c+o1,hi,c+o2,z1,z2,mat,dg):boxPlan(c+o1,lo,c+o2,hi,z1,z2,mat,dg);
    strip(-.15,-.1,0,.07,M.cover); strip(.1,.15,0,.07,M.cover); strip(-.1,.1,0,.015,M.drain);
    if(covered) for(let s=lo+.02;s<hi-.3;s+=.6) boxPlan(c-.14,s,c+.14,s+.58,.07,.12,M.cover,dg);
  }
})();
[[0.9,0,13.5,7.8],[0,0,0.9,6.6],[13.5,0,15,4.25],[13.5,5.3,15,7.8]].forEach(r=>boxPlan(r[0],r[1],r[2],r[3],0.05,0.44,M.plinth,house)); // plinth; ruang dibiarkan untuk anak tangga
boxPlan(5.1,7.8,8.4,8.1,0.29,0.44,M.plinth,house); // papak balkoni tergantung 150 mm di luar grid A (D6004)
boxPlan(15,3.9,16.2,7.8,.05,.06,M.apron,house); // lantai teres, lepa simen

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

/* ================= Anak tangga (D7006, D7007): jejak 300, naik 100, stepnose bucu bulat ================= */
const steps=tagged(house,'STEPS');
const stepMat=new THREE.MeshStandardMaterial({map:texFor('orche',.6,.3),roughness:.8});
function stairAt(x,y){
  for(const s of STAIRS){ if(x<s.x1||x>s.x2||y<s.y1||y>s.y2) continue;
    let a=s.dir==='x+'?x-s.x1:y-s.y1; for(let i=0;i<s.d.length;i++){ if(a<=s.d[i]) return s.h[i]; a-=s.d[i]; } return s.h[s.h.length-1]; }
  return null;
}
for(const s of STAIRS){ let a=0;
  s.d.forEach((d,i)=>{ const h=s.h[i];
    const r=s.dir==='x+'?[s.x1+a,s.y1,s.x1+a+d,s.y2]:[s.x1,s.y1+a,s.x2,s.y1+a+d];
    boxPlan(r[0],r[1],r[2],r[3],.05,h-.012,M.apron,steps); boxPlan(r[0],r[1],r[2],r[3],h-.012,h,stepMat,steps);
    const n=s.dir==='x+'?[r[2]-.03,r[1],r[2]+.008,r[3]]:[r[0],r[3]-.03,r[2],r[3]+.008];
    boxPlan(n[0],n[1],n[2],n[3],h-.02,h+.004,M.black,steps,false); // stepnose
    a+=d; });
}

/* ================= Dinding & bukaan ================= */
const WTOP=PLATE+.12; // dinding naik sedikit ke dalam ruang bumbung supaya tiada celah di bawah sofit
let wallGroup=null;
function buildWalls(top){
  if(wallGroup){ house.remove(wallGroup); const i=pick.indexOf(wallGroup); if(i>=0) pick.splice(i,1);
    wallGroup.traverse(o=>{ if(o.geometry) o.geometry.dispose(); const j=pick.indexOf(o); if(j>=0) pick.splice(j,1); }); }
  const full=top>=PLATE-0.01; if(full) top=WTOP;
  const g=tagged(house,'WALL');
  for(const [x1,y1,x2,y2,ops] of WALLS){
    const horiz=Math.abs(y2-y1)<1e-6, a0=horiz?Math.min(x1,x2):Math.min(y1,y2);
    const len=Math.abs(horiz?x2-x1:y2-y1), fx=horiz?y1:x1, L=len+T, st=a0-T/2;
    const box=(a1,a2,z1,z2,mat,th,grp,c)=>horiz? boxPlan(a1,c-th/2,a2,c+th/2,z1,z2,mat,grp) : boxPlan(c-th/2,a1,c+th/2,a2,z1,z2,mat,grp);
    const sisi=(a,sg)=>{ const k=horiz?sisiDinding(a,fx+sg*.3):sisiDinding(fx+sg*.3,a);
      return k==='i'&&AKSEN.some(w=>w.h===horiz&&Math.abs(w.f-fx)<1e-6&&w.sg===sg&&a>w.a1&&a<w.a2)?'a':k; };
    const piece=(s,e,z1,z2,mat=null,th=T,grp=g,off=0)=>{
      if(e-s<0.004||z2-z1<0.004) return;
      const a1=st+s, a2=st+e, c=fx+off;
      if(mat) return box(a1,a2,z1,z2,mat,th,grp,c);
      // dinding biasa: dipecah di tempat sisi luar/dalam bertukar supaya warna dinding luar & dalam boleh berbeza
      let p0=a1, k0=sisi(a1+.025,-1)+sisi(a1+.025,1);
      for(let a=a1+.05;a<a2;a+=.05){ const k=sisi(Math.min(a+.025,a2-.001),-1)+sisi(Math.min(a+.025,a2-.001),1);
        if(k!==k0){ box(p0,a,z1,z2,bahanDinding(horiz,k0[0],k0[1]),th,grp,c); p0=a; k0=k; } }
      return box(p0,a2,z1,z2,bahanDinding(horiz,k0[0],k0[1]),th,grp,c);
    };
    const list=(ops||[]).map(o=>Object.assign({},o,{s:o.c-o.w/2+T/2,e:o.c+o.w/2+T/2,zs:FFL+o.sill,zh:FFL+o.sill+o.h})).sort((p,q)=>p.s-q.s);
    let cur=0;
    for(const o of list){
      piece(cur,o.s,BASE,top); piece(o.s,o.e,BASE,Math.min(o.zs,top)); if(o.zh<top) piece(o.s,o.e,o.zh,top); cur=o.e;
      const sub=tagged(g,o.type), zt=Math.min(o.zh,top), f=0.045;
      const frameRect=(s,e,z1,z2,div,tr,glassMat)=>{
        if(z2-z1<0.02) return;
        piece(s,e,z1,z2,glassMat,0.012,sub);
        for(let i=0;i<=div;i++){ const p=s+i*(e-s)/div; piece(Math.max(s,p-f/2),Math.min(e,p+f/2),z1,z2,M.frame,0.07,sub); }
        piece(s,e,z1,Math.min(z2,z1+f),M.frame,0.07,sub);
        if(o.zh<=top) piece(s,e,z2-f,z2,M.frame,0.07,sub);
        for(const t of (tr||[])){ const zz=z1+t; if(zz<z2-0.02) piece(s,e,zz-f/2,zz+f/2,M.frame,0.07,sub); }
      };
      const pivot=(at,ang)=>{ const pv=new THREE.Group(); if(horiz){ pv.position.set(st+at,0,-fx); pv.rotation.y=ang; } else { pv.position.set(fx,0,-(st+at)); pv.rotation.y=Math.PI/2+ang; } sub.add(pv); return pv; };
      /* Ambang luar untuk tingkap pada dinding luar (aluminium/konkrit, D3002) */
      if(o.k==='win'&&o.sill>0&&o.zs<top){
        const mid=a0+o.c, p1=horiz?[mid,fx-.3]:[fx-.3,mid], p2=horiz?[mid,fx+.3]:[fx+.3,mid];
        const out=!inRoom(...p1)?-1:(!inRoom(...p2)?1:0);
        if(out){ const sl=tagged(sub,'SILL'); piece(o.s-.03,o.e+.03,o.zs-.035,o.zs,M.frame,.1,sl,out*(T/2+.035)); }
      }
      if(o.k==='win'){ frameRect(o.s,o.e,o.zs,zt,o.div,o.tr,o.frost?M.frost:M.glass); }
      else if(o.k==='door'||o.k==='gdoor'){
        const leafH=Math.min(2.1,top-FFL)-0.02, w=o.w-0.04; if(leafH<=0.05) continue;
        piece(o.s,o.s+.04,FFL,FFL+Math.min(o.h,top-FFL),M.frame,.16,sub); piece(o.e-.04,o.e,FFL,FFL+Math.min(o.h,top-FFL),M.frame,.16,sub);
        const pv=pivot(o.s+0.02,o.open*1.15);
        if(o.k==='door'){ bx(pv,w,leafH,0.045,M.door,w/2,FFL+leafH/2,0);
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
  for(const [x,y] of COLS) boxPlan(x-.1,y-.1,x+.1,y+.1,0.05,top,M.col,cg);
  if(full){
    const z1=3.45;
    [[-.1,5.1,.1,7.8],[0,7.7,1.8,7.9],[12.3,7.7,15,7.9],[14.9,3.9,15.1,7.8],[16.0,3.9,16.2,7.7],[15,7.6,16.2,7.8],[15,3.8,16.2,4.0]].forEach(r=>boxPlan(r[0],r[1],r[2],r[3],z1,WTOP,M.col,cg));
    boxPlan(5.1,7.725,8.4,7.875,CEIL,WTOP,M.col,cg); // rasuk grid A di atas ceruk balkoni (keratan 2-1)
  }
  wallGroup=g;
}

/* ================= Jubin dinding bilik air (D1001–D1004) ================= */
const tileG=new THREE.Group(); house.add(tileG);
(function(){
  const holesOn=(horiz,f,lo,hi)=>{ const out=[];
    for(const [x1,y1,x2,y2,ops] of WALLS){ const h2=Math.abs(y2-y1)<1e-6; if(h2!==horiz) continue;
      if(Math.abs((horiz?y1:x1)-f)>1e-6) continue; const a0=horiz?Math.min(x1,x2):Math.min(y1,y2);
      for(const o of (ops||[])){ const s=a0+o.c-o.w/2, e=a0+o.c+o.w/2; if(e>lo&&s<hi) out.push([s,e,FFL+o.sill,FFL+o.sill+o.h]); } }
    return out.sort((p,q)=>p[0]-q[0]); };
  for(const id in WTILE){
    const rm=ROOMS.find(r=>r.id===id), [x1,y1,x2,y2]=rm.r[0], cfg=WTILE[id], z0=rm.lv, zc=rm.ch;
    const sides={y1:[true,y1,x1,x2,1],y2:[true,y2,x1,x2,-1],x1:[false,x1,y1,y2,1],x2:[false,x2,y1,y2,-1]};
    for(const k in sides){
      const [horiz,f,lo0,hi0,inward]=sides[k], lo=lo0+T/2, hi=hi0-T/2, face=f+inward*(T/2+.004);
      const kit=(cfg.kit||[]).includes(k), kz=z0+(cfg.kz||0);
      const g=tagged(tileG,kit?'KITKAT':'TILEW');
      const panel=(a,b,za,zb)=>{
        if(b-a<.005||zb-za<.005) return;
        const bands=kit&&za<kz&&zb>kz?[[za,kz],[kz,zb]]:[[za,zb]];
        for(const [p,q] of bands){ const isKit=kit&&p>=kz-1e-6, W=isKit?WFIN.kit:WFIN.trav;
          const P=(s,z)=>horiz?[s,z,face]:[face,z,s];
          quad(g,[P(a,p),P(b,p),P(b,q),P(a,q)],[[a/W.pw,(p-z0)/W.ph],[b/W.pw,(p-z0)/W.ph],[b/W.pw,(q-z0)/W.ph],[a/W.pw,(q-z0)/W.ph]],isKit?M.kitkat:M.tileW,false); }
      };
      let cur=lo;
      for(const [s,e,zs,zh] of holesOn(horiz,f,lo,hi)){ const S=Math.max(s,lo), E=Math.min(e,hi);
        panel(cur,S,z0,zc); panel(S,E,z0,Math.min(zs,zc)); if(zh<zc) panel(S,E,zh,zc); cur=E; }
      panel(cur,hi,z0,zc);
    }
  }
})();

/* ================= Pagar (D6001–D6004) ================= */
const railG=tagged(house,'RAIL'); const barMats=[]; const dummy=new THREE.Object3D();
function railing(x1,y1,x2,y2,base){
  const horiz=Math.abs(y2-y1)<1e-6, len=Math.hypot(x2-x1,y2-y1), H=0.9;
  if(horiz) boxPlan(Math.min(x1,x2),y1-.025,Math.max(x1,x2),y1+.025,base+H-.012,base+H,M.rail,railG);
  else boxPlan(x1-.025,Math.min(y1,y2),x1+.025,Math.max(y1,y2),base+H-.012,base+H,M.rail,railG);
  if(horiz) boxPlan(Math.min(x1,x2),y1-.02,Math.max(x1,x2),y1+.02,base+.05,base+.062,M.rail,railG);
  else boxPlan(x1-.02,Math.min(y1,y2),x1+.02,Math.max(y1,y2),base+.05,base+.062,M.rail,railG);
  const n=Math.floor(len/0.1);
  for(let i=0;i<=n;i++){ const t=i/n, x=x1+(x2-x1)*t, y=y1+(y2-y1)*t; dummy.position.set(x,base+0.475,-y); dummy.updateMatrix(); barMats.push(dummy.matrix.clone()); }
  const posts=Math.max(1,Math.round(len/0.9));
  for(let p=0;p<=posts;p++){ const x=x1+(x2-x1)*p/posts, y=y1+(y2-y1)*p/posts;
    boxPlan(x-.025,y-.025,x+.025,y+.025,base,base+H,M.rail,railG); boxPlan(x-.05,y-.05,x+.05,y+.05,base,base+.006,M.rail,railG,false); }
}
RAILS.forEach(r=>railing(...r));
const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(0.01,0.84,0.04),M.rail,barMats.length);
barMats.forEach((m,i)=>bars.setMatrixAt(i,m)); bars.castShadow=true; railG.add(bars);

/* Papak kanopi balkoni (keratan 2-1) */
boxPlan(KANOPI[0],KANOPI[1],KANOPI[2],KANOPI[3],FFL+2.4,FFL+2.5,M.col,tagged(house,'KANOPI'));

/* ================= Bumbung (M1004): limas + gable atas lanai & teres, cerun 30° ================= */
const roof=tagged(scene,'ROOF');
function roofCanvas(bump){ return (g,S)=>{ const r=rnd(5), tw=S/2, ch=S/2;
  for(let j=0;j<2;j++) for(let i=-1;i<3;i++){ const x=i*tw+(j%2?tw/2:0), y=j*ch, tone=1+(r()-.5)*.12;
    for(let px=0;px<tw;px++){ const v=.5+.5*Math.cos(px/tw*Math.PI*4);
      if(bump){ const l=Math.round(70+150*v); g.fillStyle=`rgb(${l},${l},${l})`; }
      else g.fillStyle=shade('#d4d4d2',tone*(.84+.24*v));
      g.fillRect(x+px,y,1,ch); }
    const gr=g.createLinearGradient(0,y,0,y+ch); gr.addColorStop(0,bump?'rgba(0,0,0,.35)':'rgba(0,0,0,.22)'); gr.addColorStop(.25,'rgba(0,0,0,0)'); gr.addColorStop(.92,'rgba(255,255,255,.06)'); gr.addColorStop(1,bump?'rgba(255,255,255,.4)':'rgba(255,255,255,.12)');
    g.fillStyle=gr; g.fillRect(x,y,tw,ch);
    g.fillStyle=bump?'rgba(0,0,0,.9)':'rgba(0,0,0,.5)'; g.fillRect(x,y,tw,3); g.fillRect(x,y,1.5,ch); } }; }
const roofMat=new THREE.MeshStandardMaterial({color:0x5f6265,roughness:.72,map:canvasTex(256,roofCanvas(false)),bumpMap:canvasTex(256,roofCanvas(true),null,true),bumpScale:.05});
const capMat=std(0x5f6265,{roughness:.7});
const ROOFT=Math.tan(RF.pitch), ROOFHE=RF.ridge-(RF.y1-RF.y0)/2*ROOFT;
const ROOFP=(function(){
  const {x0,x1,y0,y1,gx,gy}=RF, half=(y1-y0)/2, ry=(y0+y1)/2, xr0=x0+half, xr1=x1-half, gy0=2*gy-y1, jx=gy+(xr1-ry);
  return {gy0,jx,xr0,xr1,ry,planes:[
    {d:[0,-1],e0:-y0,poly:[[x0,y0],[x1,y0],[xr1,ry],[xr0,ry]]},
    {d:[-1,0],e0:-x0,poly:[[x0,y0],[xr0,ry],[x0,y1]]},
    {d:[0,1],e0:y1,poly:[[x0,y1],[xr0,ry],[xr1,ry],[jx,gy],[gx,gy],[gx,y1]]},
    {d:[1,0],e0:x1,poly:[[x1,y0],[x1,gy0],[jx,gy],[xr1,ry]]},
    {d:[0,-1],e0:-gy0,poly:[[x1,gy0],[gx,gy0],[gx,gy],[jx,gy]]}]};
})();
const planeH=(P,x,y)=>ROOFHE+(P.e0-(x*P.d[0]+y*P.d[1]))*ROOFT;
function roofTop(x,y){ let best=null; for(const P of ROOFP.planes){ const c=P.poly.map(p=>new THREE.Vector2(p[0],p[1]));
    if(THREE.ShapeUtils.isClockWise(c)) c.reverse();
    let inside=false; for(let i=0,j=c.length-1;i<c.length;j=i++){ if(((c[i].y>y)!==(c[j].y>y))&&(x<(c[j].x-c[i].x)*(y-c[i].y)/(c[j].y-c[i].y)+c[i].x)) inside=!inside; }
    if(inside){ const h=planeH(P,x,y); best=best===null?h:Math.max(best,h); } }
  return best; }
(function(){
  const dep=RF.depth, slope=1/Math.cos(RF.pitch);
  const surf=(P,off,mat,up)=>{
    const c=P.poly.map(p=>new THREE.Vector2(p[0],p[1])), tris=THREE.ShapeUtils.triangulateShape(c,[]);
    const pos=[], uv=[], tx=-P.d[1], ty=P.d[0];
    for(const t of tris){ const idx=up?t:[t[0],t[2],t[1]];
      for(const i of idx){ const [x,y]=P.poly[i], h=planeH(P,x,y)-off; pos.push(x,h,-y); uv.push((x*tx+y*ty)/.6,(P.e0-(x*P.d[0]+y*P.d[1]))*slope/.68); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.computeVertexNormals();
    if(geo.attributes.normal.getY(0)*(up?1:-1)<0){ const a=geo.attributes.position.array; for(let i=0;i<a.length;i+=9) for(let k=0;k<3;k++){ const t=a[i+3+k]; a[i+3+k]=a[i+6+k]; a[i+6+k]=t; }
      const u=geo.attributes.uv.array; for(let i=0;i<u.length;i+=6) for(let k=0;k<2;k++){ const t=u[i+2+k]; u[i+2+k]=u[i+4+k]; u[i+4+k]=t; } geo.computeVertexNormals(); }
    const m=new THREE.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; roof.add(m); return m;
  };
  for(const P of ROOFP.planes){
    surf(P,0,roofMat,true); surf(P,dep,M.soffit,false);
    /* fascia pada cucur & papan verge pada hujung gable */
    const n=P.poly.length;
    for(let i=0;i<n;i++){ const a=P.poly[i], b=P.poly[(i+1)%n];
      const eave=Math.abs(a[0]*P.d[0]+a[1]*P.d[1]-P.e0)<1e-6&&Math.abs(b[0]*P.d[0]+b[1]*P.d[1]-P.e0)<1e-6;
      const verge=Math.abs(a[0]-RF.gx)<1e-6&&Math.abs(b[0]-RF.gx)<1e-6;
      if(!eave&&!verge) continue;
      const ha=planeH(P,...a), hb=planeH(P,...b);
      quad(roof,[[a[0],ha-dep,a[1]],[b[0],hb-dep,b[1]],[b[0],hb-.02,b[1]],[a[0],ha-.02,a[1]]],[[0,0],[1,0],[1,1],[0,1]],M.fascia);
      if(verge){ const L=Math.hypot(b[1]-a[1],hb-ha), vb=new THREE.Mesh(new THREE.BoxGeometry(.09,.08,L),capMat);
        vb.position.set(a[0]-.02,(ha+hb)/2+.02,-(a[1]+b[1])/2); vb.rotation.x=Math.atan2(hb-ha,b[1]-a[1]); vb.castShadow=true; roof.add(vb); }
    }
  }
  /* bubung, rabung & lurah */
  const {gy0,jx,xr0,xr1,ry}=ROOFP, {x0,x1,y0,y1,gx,gy}=RF, gh=planeH(ROOFP.planes[4],gx,gy);
  const L3=(x,y,h)=>new THREE.Vector3(x,h,-y);
  const cap=(a,b,r=.1)=>{ const len=a.distanceTo(b), c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),capMat); c.position.copy(a).add(b).multiplyScalar(.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); c.castShadow=true; roof.add(c); };
  const R0=L3(xr0,ry,RF.ridge), R1=L3(xr1,ry,RF.ridge), J=L3(jx,gy,gh);
  cap(R0,R1); cap(L3(x0,y0,ROOFHE),R0); cap(L3(x0,y1,ROOFHE),R0); cap(L3(x1,y0,ROOFHE),R1); cap(R1,J); cap(J,L3(gx,gy,gh));
  const v=new THREE.Mesh(new THREE.BoxGeometry(.3,.012,L3(x1,gy0,ROOFHE).distanceTo(J)),M.metal), va=L3(x1,gy0,ROOFHE);
  v.position.copy(va).add(J).multiplyScalar(.5); v.lookAt(J); v.position.y+=.015; roof.add(v);
  /* Dinding gable teres (E1): papan mendatar + bolong udara */
  const gxw=RF.gableX, uG=planeH(ROOFP.planes[4],gxw,3.9)-dep, uA=planeH(ROOFP.planes[2],gxw,7.8)-dep, ua=gh-dep;
  const sh=new THREE.Shape([new THREE.Vector2(3.9,PLATE),new THREE.Vector2(7.8,PLATE),new THREE.Vector2(7.8,uA),new THREE.Vector2(gy,ua),new THREE.Vector2(3.9,uG)]);
  const geo=new THREE.ShapeGeometry(sh); const uv=geo.attributes.uv, p=geo.attributes.position;
  for(let i=0;i<p.count;i++){ uv.setXY(i,p.getX(i)/1.2,p.getY(i)/.6); }
  const gm=new THREE.Mesh(geo,M.siding);
  gm.rotation.y=Math.PI/2; gm.position.set(gxw,0,0); gm.castShadow=gm.receiveShadow=true; gm.userData.info='GABLE'; roof.add(gm); pick.push(gm);
  const vent=new THREE.Mesh(new THREE.BoxGeometry(.04,.42,.3),M.louvre); vent.position.set(gxw,ua-.75,-gy); roof.add(vent);
})();

/* ================= Siling, lampu & kipas (D4001, D9001) ================= */
const ceilG=new THREE.Group(); scene.add(ceilG);
const lightG=new THREE.Group(); scene.add(lightG);
const fans=[];
for(const rm of ROOMS){ if(!rm.c) continue;
  for(const [x1,y1,x2,y2] of rm.r){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,y2-y1),M.ceil); p.rotation.x=Math.PI/2; p.position.set((x1+x2)/2,rm.ch,-(y1+y2)/2);
    p.userData.info=rm.c; ceilG.add(p); pick.push(p);
  }
}
for(const [x1,y1,x2,y2] of SOFIT){
  const p=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1,y2-y1),M.ceil); p.rotation.x=Math.PI/2; p.position.set((x1+x2)/2,CEIL,-(y1+y2)/2);
  p.userData.info='SOFFIT'; ceilG.add(p); pick.push(p);
}
for(const [x,y] of DLS){ const rm=inRoom(x,y), h=rm&&rm.ch?rm.ch:(rm&&rm.id==='balkoni'?FFL+2.4:CEIL);
  const dl=item(lightG,x,y,h-0.012,'x+','DL'); cyl(dl,.065,.065,.02,M.lamp,0,0,0,16); }
for(const [x,y,ch] of [[3.48,6.27,CEIL],[6.78,5.84,CEIL],[10.33,5.84,CEIL],[13.62,6.45,CEIL],[1.5,1.95,CEIL],[4.5,1.95,CEIL],[8.55,2.8,CEIL],[12.95,1.95,CEIL]]){
  const f=item(lightG,x,y,ch,'x+','FAN');
  cyl(f,.012,.012,.32,M.chrome,0,-.16,0,8); cyl(f,.11,.13,.12,M.cab,0,-.38,0,24);
  const rot=new THREE.Group(); rot.position.y=-.4; f.add(rot);
  for(let k=0;k<3;k++){ const a=k*Math.PI*2/3, b=bx(rot,.62,.012,.13,M.cab,Math.cos(a)*.42,0,-Math.sin(a)*.42); b.rotation.y=a; }
  fans.push(rot);
}
for(const [x1,y1,x2,y2,ch] of PELMET){
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
wardrobe(2.38,.15,2.92,2.9); desk(.33,3.25,'x+',1.1); chair(furn,.85,3.25,FFL,'x-');
// Bilik 3
bed(4.05,.6,.9,1.95,'x+',M.throwB); bed(4.05,2.1,.9,1.95,'x+',M.throwA); nightstand(3.3,1.35,'x+');
desk(3.75,3.6,'y-',1.0); chair(furn,3.75,3.05,FFL,'y+'); wardrobe(4.3,3.3,5.05,3.82); wardrobe(5.5,1.2,5.92,2.6);
// Bilik 2
bed(7.75,1.1,.95,1.95,'y+',M.throwB); nightstand(8.5,.3,'y+'); wardrobe(9.3,1.95,9.82,3.6); desk(8.75,3.6,'y-',.9); chair(furn,8.75,3.05,FFL,'y+');
// Bilik 1
bed(13.6,2.85,1.8,2.0,'y-',M.throwA); nightstand(12.5,3.6,'y-'); nightstand(14.7,3.6,'y-');
wardrobe(11.05,.12,12.45,.7); desk(11.4,3.6,'y-',.9); chair(furn,11.4,3.05,FFL,'y+');
(function(){ const g=tagged(furn,{t:'Kabinet rendah',ref:'M1004',rows:[['Saiz','≈2350 × 470 × 450 mm (anggaran)'],['Nota','Di hadapan tingkap W1 yang berambang 300 mm']]}); boxPlan(12.38,.13,14.73,.6,FFL,FFL+.45,M.wood2,g); })();
// Ruang makan — meja 6 kerusi
(function(){ const g=item(furn,6.75,5.85,FFL,'x+',{t:'Meja makan 6 kerusi',ref:'M1004',rows:[['Saiz','≈1800 × 900 mm'],['Sumber','Susun atur perabot M1004']]});
  bx(g,1.8,.04,.9,M.oak,0,.75,0); for(const [a,b] of [[.82,.38],[.82,-.38],[-.82,.38],[-.82,-.38]]) bx(g,.05,.73,.05,M.wood2,a,.365,b);
  for(const dx of [-.55,0,.55]){ chair(g,dx,-.68,0,'y+',M.fabric2).position.set(dx,0,.68); chair(g,dx,.68,0,'y-',M.fabric2).position.set(dx,0,-.68); }
})();
// Ruang tamu — sofa L, meja kopi, kabinet TV, TV 80"
(function(){ const g=tagged(furn,{t:'Sofa L',ref:'M1004',rows:[['Saiz','≈2700 × 1800 mm (anggaran)'],['Sumber','Susun atur perabot M1004']]});
  boxPlan(8.9,5.4,11.6,6.25,FFL,FFL+.42,M.fabric,g); boxPlan(8.9,5.35,11.6,5.6,FFL,FFL+.82,M.fabric,g);
  boxPlan(10.8,6.25,11.6,7.1,FFL,FFL+.42,M.fabric,g); boxPlan(11.4,6.25,11.65,7.1,FFL,FFL+.62,M.fabric,g); boxPlan(8.85,5.4,9.1,6.25,FFL,FFL+.62,M.fabric,g);
  const tv=tagged(furn,{t:'Kabinet TV & TV 80"',ref:'M1006-1',rows:[['TV','Maksimum 80" pada dinding antara dua tingkap W2'],['Kabinet','≈1550 × 400 mm']]});
  boxPlan(9.3,7.35,10.85,7.74,FFL,FFL+.45,M.wood2,tv); boxPlan(9.17,7.68,10.97,7.72,FFL+.85,FFL+1.85,M.screen,tv);
})();
// Lanai — meja bulat 4 kerusi
(function(){ const g=item(furn,13.85,6.9,.45,'x+',{t:'Set meja lanai',ref:'M1004',rows:[['Susunan','Meja bulat + 4 kerusi'],['Sumber','Susun atur perabot M1004']]});
  cyl(g,.45,.45,.04,M.oak,0,.74,0,28); cyl(g,.05,.05,.72,M.black,0,.36,0,10);
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4, c=chair(g,0,0,0,'x+',M.fabric2); c.position.set(Math.cos(a)*.72,0,-Math.sin(a)*.72); c.rotation.y=a+Math.PI; }
})();
// Dapur (M1004, M1006-4) — kaunter L di dinding W5 & dinding yard, hob & sinki di bawah W5, peti sejuk dua pintu di sebelah GD2
(function(){ const g=tagged(furn,'KIT');
  boxPlan(1.95,7.1,4.47,7.725,FFL,FFL+.86,M.kcab,g); boxPlan(1.93,7.07,4.49,7.725,FFL+.86,FFL+.9,M.counter,g);
  boxPlan(1.95,6.15,2.55,7.1,FFL,FFL+.86,M.kcab,g); boxPlan(1.93,6.12,2.58,7.1,FFL+.86,FFL+.9,M.counter,g);
  boxPlan(1.95,7.4,4.47,7.725,FFL+1.75,FFL+2.45,M.kcab2,g);
  boxPlan(2.6,7.3,3.2,7.7,FFL+.9,FFL+.91,M.black,g); boxPlan(2.6,7.35,3.2,7.75,FFL+1.62,FFL+1.75,M.steel,g);
  boxPlan(3.7,7.32,4.3,7.68,FFL+.86,FFL+.905,M.steel,g); cyl(g,.015,.015,.28,M.chrome,4.0,FFL+1.04,-7.62,8);
  const fr=tagged(furn,{t:'Peti sejuk dua pintu',ref:'M1004 · M1006-4',rows:[['Saiz','≈900 × 700 × 1800 mm (anggaran)'],['Lokasi','Di sebelah pintu GD2']]}); boxPlan(4.33,5.07,5.02,6.0,FFL,FFL+1.8,M.steel,fr); boxPlan(4.32,5.53,4.33,5.54,FFL+.2,FFL+1.7,M.black,fr,false);
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


/* ================= Penghawa dingin (D9001) ================= */
(function(){
  for(const [x1,y1,x2,y2] of AC.inside){ const g=tagged(furn,'AC'); boxPlan(x1,y1,x2,y2,FFL+2.25,FFL+2.55,M.cab,g);
    const along=x2-x1<y2-y1; along?boxPlan(x1-.002,y1+.04,x2+.002,y2-.04,FFL+2.28,FFL+2.3,M.black,g,false):boxPlan(x1+.04,y1-.002,x2-.04,y2+.002,FFL+2.28,FFL+2.3,M.black,g,false); }
  for(const [x1,y1,x2,y2] of AC.outside){ const g=tagged(furn,'AC'); boxPlan(x1,y1,x2,y2,.05,.6,M.cab,g);
    const wide=x2-x1>y2-y1, fan=new THREE.Mesh(new THREE.CircleGeometry(.17,24),M.black);
    if(wide){ fan.position.set((x1+x2)/2+.12,.33,-(y1-.002)); } else { fan.position.set(x1-.002,.33,-((y1+y2)/2+.12)); fan.rotation.y=-Math.PI/2; }
    g.add(fan); }
})();

/* ================= Paip udara VP & papan agihan DB ================= */
for(const v of VPIPE){
  const top=(roofTop(v.x,v.y)||PLATE)+.9, g=item(house,v.x,v.y,0,'x+','VP');
  cyl(g,.055,.055,top,M.pvc,0,top/2,0,14); cyl(g,.085,.085,.12,M.pvc,0,top+.08,0,14); cyl(g,.03,.06,.06,M.pvc,0,top+.17,0,14);
  for(const z of [1.2,2.4,3.4]) cyl(g,.07,.07,.03,M.metal,0,z,0,12);
}
(function(){ const g=item(house,14.1,3.9+T/2+.05,FFL+1.4,'y+','DB'); bx(g,.1,.5,.38,M.cab,0,.25,0); bx(g,.012,.46,.34,M.metal,.055,.25,0); })();

/* ================= Kompas & label ================= */
(function(){
  const t=canvasTex(256,(g,S)=>{ g.strokeStyle='rgba(30,40,44,.7)'; g.lineWidth=5; g.beginPath(); g.arc(S/2,S/2,S/2-8,0,Math.PI*2); g.stroke();
    g.fillStyle='#b3362d'; g.beginPath(); g.moveTo(S/2,84); g.lineTo(S/2+30,S/2+60); g.lineTo(S/2,S/2+40); g.lineTo(S/2-30,S/2+60); g.closePath(); g.fill();
    g.fillStyle='rgba(30,40,44,.8)'; g.font='700 52px "Instrument Sans", sans-serif'; g.textAlign='center'; g.fillText('U',S/2,74); }); // 'U' di hujung anak panah
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));
  p.rotation.x=-Math.PI/2; const w=new THREE.Group(); w.add(p); w.rotation.y=(UTARA-90)*Math.PI/180; w.position.set(19.3,0.03,3.6); scene.add(w); // anak panah ke utara sebenar
})();
const labels=new THREE.Group(); scene.add(labels);
function label(main,sub,x,y,h,s){
  const cv=document.createElement('canvas'); cv.width=560; cv.height=170; const g=cv.getContext('2d');
  g.fillStyle='rgba(255,255,255,.93)'; g.strokeStyle='rgba(27,41,45,.25)'; g.lineWidth=3;
  g.beginPath(); g.moveTo(28,6); g.arcTo(554,6,554,164,22); g.arcTo(554,164,6,164,22); g.arcTo(6,164,6,6,22); g.arcTo(6,6,554,6,22); g.closePath(); g.fill(); g.stroke();
  g.fillStyle='#1b292d'; g.textAlign='center'; g.font='700 54px "Instrument Sans", system-ui, sans-serif'; g.fillText(main,280,78);
  g.fillStyle='#596a6f'; g.font='500 34px "JetBrains Mono", ui-monospace, monospace'; g.fillText(sub,280,128);
  const t=new THREE.CanvasTexture(cv); t.encoding=THREE.sRGBEncoding; t.anisotropy=ANISO;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,fog:false}));
  const k=s||1; sp.scale.set(2.1*k,0.64*k,1); sp.position.set(x,h,-y); sp.renderOrder=10; labels.add(sp);
}
function buildLabels(){ for(const rm of ROOMS){ const [x1,y1,x2,y2]=rm.full, at=rm.at||[(x1+x2)/2,(y1+y2)/2]; label(rm.n,rm.a+' m²',at[0],at[1],2.6+(rm.lift||0),rm.s); } label('Teres','lepa simen',15.6,4.7,1.5,.75); }
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(buildLabels,buildLabels);
