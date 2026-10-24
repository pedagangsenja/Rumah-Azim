/* Banglo Azim 3D — landskap: tanah, sempadan lot, jalan, pokok sedia ada, kemudahan tapak (M1001, M1002) */
'use strict';

const land=new THREE.Group(); scene.add(land);
const lotG=new THREE.Group(); scene.add(lotG);
const L3=(x,y,h)=>new THREE.Vector3(x,h||0,-y);

/* ================= Tekstur tanah ================= */
function grassCanvas(base,blades,seed){ return (g,S)=>{ const r=rnd(seed); g.fillStyle=base; g.fillRect(0,0,S,S);
  for(let k=0;k<2600;k++){ const x=r()*S, y=r()*S, l=3+r()*9, a=(r()-.5)*.9; g.strokeStyle=blades[Math.floor(r()*blades.length)]; g.lineWidth=.8+r()*1.2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.sin(a)*l,y-Math.cos(a)*l); g.stroke(); }
  speckle(g,S,r,1500,['rgba(90,70,40,.18)','rgba(255,255,220,.10)'],2); }; }
const grassTex=canvasTex(512,grassCanvas('#6d8c44',['#5d7d38','#7f9c4c','#8fa957','#56722f','#9aae5c','#6a8a3e'],61));
const fieldTex=canvasTex(512,grassCanvas('#869047',['#7a8740','#9aa159','#a8a663','#6f7d3a','#b5ad6a'],67));
const asphaltTex=canvasTex(256,(g,S)=>{ const r=rnd(71); g.fillStyle='#4a4b4c'; g.fillRect(0,0,S,S); speckle(g,S,r,9000,['rgba(255,255,255,.08)','rgba(0,0,0,.18)','rgba(150,140,120,.12)'],1.6); });
const lateriteTex=canvasTex(256,(g,S)=>{ const r=rnd(73); g.fillStyle='#a27450'; g.fillRect(0,0,S,S);
  speckle(g,S,r,7000,['rgba(80,45,25,.18)','rgba(240,210,170,.16)','rgba(120,90,60,.2)'],2.2);
  g.globalAlpha=.25; g.fillStyle='#6f4a30'; g.fillRect(0,S*.28,S,S*.08); g.fillRect(0,S*.64,S,S*.08); g.globalAlpha=1; });
const leafTex=canvasTex(256,(g,S)=>{ const r=rnd(79); g.fillStyle='#2f4a22'; g.fillRect(0,0,S,S);
  for(let k=0;k<1400;k++){ const x=r()*S, y=r()*S, s=3+r()*7; g.fillStyle=['#3c5a2a','#4d6d33','#27401c','#5c7c3a','#355226'][Math.floor(r()*5)];
    g.beginPath(); g.ellipse(x,y,s,s*.5,r()*Math.PI,0,Math.PI*2); g.fill(); } });
const barkTex=canvasTex(128,(g,S)=>{ const r=rnd(83); g.fillStyle='#6b5a48'; g.fillRect(0,0,S,S);
  for(let y=0;y<S;y+=6+r()*5){ g.fillStyle='rgba(40,30,20,.35)'; g.fillRect(0,y,S,1.5+r()); } speckle(g,S,r,800,['rgba(255,255,255,.08)','rgba(0,0,0,.15)'],2); });
const frondTex=canvasTex(256,(g,S)=>{ g.clearRect(0,0,S,S); const r=rnd(89);
  g.strokeStyle='#5b6b2c'; g.lineWidth=5; g.beginPath(); g.moveTo(S/2,S); g.lineTo(S/2,0); g.stroke();
  for(let y=6;y<S;y+=5){ const t=1-y/S, len=S*.48*Math.sin(Math.PI*Math.min(1,t*1.05+.05));
    for(const sgn of [-1,1]){ g.strokeStyle=['#5f8a2e','#6f9a36','#557d29','#7aa33e'][Math.floor(r()*4)]; g.lineWidth=2.4;
      g.beginPath(); g.moveTo(S/2,y); g.quadraticCurveTo(S/2+sgn*len*.5,y-6,S/2+sgn*len,y+10+r()*6); g.stroke(); } } },null);
const tuftTex=canvasTex(128,(g,S)=>{ g.clearRect(0,0,S,S); const r=rnd(97);
  for(let k=0;k<26;k++){ const x=S*(.2+r()*.6), h=S*(.45+r()*.5), a=(r()-.5)*.6; g.strokeStyle=['#5d7d38','#7f9c4c','#8fa957','#6a8a3e'][Math.floor(r()*4)]; g.lineWidth=2+r()*2;
    g.beginPath(); g.moveTo(x,S); g.quadraticCurveTo(x+Math.sin(a)*h*.3,S-h*.5,x+Math.sin(a)*h*.7,S-h); g.stroke(); } },null);
M.grass=std(0xffffff,{map:grassTex,roughness:1,vertexColors:true});
M.asphalt=std(0xffffff,{map:asphaltTex,roughness:.92});
M.laterite=std(0xffffff,{map:lateriteTex,roughness:1});
M.leaf=std(0xffffff,{map:leafTex,roughness:.85});
M.bark=std(0xffffff,{map:barkTex,roughness:.95});
M.frond=std(0xffffff,{map:frondTex,roughness:.8,alphaTest:.5,side:THREE.DoubleSide});
M.tuft=std(0xffffff,{map:tuftTex,roughness:1,alphaTest:.45,side:THREE.DoubleSide});
const depthFor=mat=>new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:mat.map,alphaTest:mat.alphaTest});

/* ================= Tanah luar (padang) dengan tompok warna ================= */
(function(){
  const R=260, geo=new THREE.PlaneGeometry(2*R,2*R,90,90); geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position, col=[], uv=geo.attributes.uv, r=rnd(101);
  const blobs=[...Array(26)].map(()=>[(r()-.5)*160+SUN_T.x,(r()-.5)*160+SUN_T.z,8+r()*22,r()]);
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); let v=0;
    for(const [bx2,bz,br,k] of blobs){ const d=Math.hypot(x-bx2,z-bz)/br; if(d<1) v+=(1-d*d)*(k-.5); }
    const c=new THREE.Color().setRGB(.92+v*.25,.95+v*.12,.86-v*.2); col.push(c.r,c.g,c.b);
    uv.setXY(i,x/3.2,z/3.2); }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(geo,M.grass); m.position.set(SUN_T.x,0,SUN_T.z); m.receiveShadow=true; land.add(m);
})();

/* ================= Lot: rumput, sempadan, batu sempadan ================= */
const LOT_AREA=(function(){ let a=0; for(let i=0;i<LOT.length;i++){ const [x1,y1]=LOT[i], [x2,y2]=LOT[(i+1)%LOT.length]; a+=x1*y2-x2*y1; } return Math.abs(a)/2; })();
INFO.LOT={t:'Sempadan lot',ref:'M1001',rows:[['Luas','≈'+LOT_AREA.toFixed(0)+' m² (dikira daripada ukuran sempadan)'],
  ...LOT_SIDES.map(([s,l,b,n])=>['Sisi '+s.toLowerCase(),l+' · '+b+(n?' · '+n:'')]),
  ['Anjakan rumah','Grid 1 ke sempadan selatan (bendang) 3 000 mm; grid A ke sempadan barat (rumah keluarga) ≈1.52 m (diukur pada skala)']]};
(function(){
  const sh=new THREE.Shape(LOT.map(([x,y])=>new THREE.Vector2(x,y))), geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})); m.position.y=.004; m.userData.info='LOT'; land.add(m); pick.push(m); // kawasan ketik sahaja
  const lineMat=new THREE.MeshBasicMaterial({color:0xd0352a,transparent:true,opacity:.85,depthWrite:false});
  const pegMat=std(0xd8d4cb,{map:concreteTex}), capR=std(0xc0392b,{roughness:.6});
  const g=tagged(lotG,'LOT');
  for(let i=0;i<LOT.length;i++){ const [x1,y1]=LOT[i], [x2,y2]=LOT[(i+1)%LOT.length], len=Math.hypot(x2-x1,y2-y1), n=Math.floor(len/1.2);
    for(let k=0;k<n;k++){ const t0=k/n, t1=(k+.6)/n, a=L3(x1+(x2-x1)*t0,y1+(y2-y1)*t0,.02), b=L3(x1+(x2-x1)*t1,y1+(y2-y1)*t1,.02);
      const d=new THREE.Mesh(new THREE.BoxGeometry(.06,.01,a.distanceTo(b)),lineMat); d.position.copy(a).add(b).multiplyScalar(.5); d.lookAt(b); d.position.y=.02; g.add(d); }
    const p=new THREE.Group(); p.position.copy(L3(x1,y1)); g.add(p);
    bx(p,.15,.3,.15,pegMat,0,.15,0); bx(p,.155,.03,.155,capR,0,.3,0); }
})();

/* ================= Jalan (konteks, lebar anggaran) ================= */
for(const rd of ROADS){
  const [ax,ay]=LOT[rd.side], [bx2,by]=LOT[(rd.side+1)%LOT.length], len=Math.hypot(bx2-ax,by-ay), ux=(bx2-ax)/len, uy=(by-ay)/len;
  let nx=uy, ny=-ux; const cx=LOT.reduce((s,p)=>s+p[0],0)/4, cy=LOT.reduce((s,p)=>s+p[1],0)/4;
  if((ax-cx)*nx+(ay-cy)*ny<0){ nx=-nx; ny=-ny; }
  const s0=-rd.ext[0], s1=len+rd.ext[1], P=(s,o)=>new THREE.Vector2(ax+ux*s+nx*o,ay+uy*s+ny*o);
  const pts=[P(s0,rd.off),P(s1,rd.off),P(s1,rd.off+rd.w),P(s0,rd.off+rd.w)];
  const geo=new THREE.ShapeGeometry(new THREE.Shape(pts)); geo.rotateX(-Math.PI/2);
  const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++){ const x=uv.getX(i), y=uv.getY(i); uv.setXY(i,(x*ux+y*uy)/4,(x*nx+y*ny)/4); }
  const m=new THREE.Mesh(geo,rd.k==='asphalt'?M.asphalt:M.laterite); m.position.y=rd.k==='asphalt'?.03:.018; m.receiveShadow=true;
  m.userData.info={t:rd.n,ref:'M1001',rows:[['Kedudukan',rd.side===1?'Di luar sempadan utara':'Di luar sempadan timur'],['Lebar','≈'+rd.w.toFixed(1)+' m (anggaran, untuk konteks)']]};
  land.add(m); pick.push(m);
}

/* ================= Pokok sedia ada (M1001) ================= */
function blobGeo(r,seed,det){ const geo=new THREE.SphereGeometry(r,det||14,Math.round((det||14)*.75)), p=geo.attributes.position, rr=rnd(seed);
  const off=[...Array(5)].map(()=>[rr()*6,rr()*6,rr()*6]);
  for(let i=0;i<p.count;i++){ const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)), n=v.clone().normalize();
    let k=0; for(const [a,b,c] of off) k+=Math.sin(n.x*3.1+a)*Math.sin(n.y*2.7+b)*Math.sin(n.z*3.3+c);
    v.multiplyScalar(1+.14*k); p.setXYZ(i,v.x,v.y,v.z); }
  const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*2.5,uv.getY(i)*2.5);
  geo.computeVertexNormals(); return geo; }
function broadTree(t,h,seed){
  const g=item(land,t.x,t.y,0,'x+',{t:t.n,ref:'M1001',rows:[['Kanopi dilukis','Ø ≈'+(t.r*2).toFixed(1)+' m'],['Ketinggian','Anggaran, untuk konteks']]});
  const r=rnd(seed), th=h*.42;
  cyl(g,.09*t.r,.15*t.r,th,M.bark,0,th/2,0,10);
  for(let k=0;k<5;k++){ const L=h*(.3+r()*.15), geo=new THREE.CylinderGeometry(.04*t.r,.08*t.r,L,8); geo.translate(0,L/2,0);
    const bg=new THREE.Group(); bg.position.y=th*.92; bg.rotation.y=k/5*Math.PI*2+r(); g.add(bg);
    const m=new THREE.Mesh(geo,M.bark); m.rotation.z=-(.5+r()*.4); m.castShadow=true; bg.add(m); }
  const n=30, cy=h*.68, rr=t.r*.78;
  for(let k=0;k<n;k++){ const u=r()*Math.PI*2, v=Math.acos(2*r()-1), d=Math.cbrt(r())*rr;
    const s=t.r*(.32+r()*.22), m=new THREE.Mesh(blobGeo(s,seed+k),M.leaf);
    m.position.set(Math.cos(u)*Math.sin(v)*d,cy+Math.cos(v)*d*.62,Math.sin(u)*Math.sin(v)*d); m.rotation.set(r()*3,r()*3,r()*3);
    m.castShadow=m.receiveShadow=true; g.add(m); }
  return g;
}
function coconut(t){
  const g=item(land,t.x,t.y,0,'x+',{t:t.n,ref:'M1001',rows:[['Kanopi dilukis','Ø ≈'+(t.r*2).toFixed(1)+' m'],['Ketinggian','Anggaran, untuk konteks']]});
  const H=8.5, curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.35,H*.35,.1),new THREE.Vector3(.9,H*.7,.3),new THREE.Vector3(1.3,H,.4)]);
  const tr=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.17,10,false),M.bark); tr.castShadow=tr.receiveShadow=true; g.add(tr);
  const top=curve.getPoint(1), fg=new THREE.Group(); fg.position.copy(top); g.add(fg);
  const fl=3.6, segs=10, geo=new THREE.PlaneGeometry(1.25,fl,1,segs); geo.translate(0,fl/2,0);
  const p=geo.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i), t2=y/fl; p.setXYZ(i,p.getX(i)*(.35+.65*Math.sin(Math.PI*Math.min(1,t2*1.1))),y,-t2*t2*2.3); }
  geo.computeVertexNormals();
  const r=rnd(7), dm=depthFor(M.frond);
  for(let k=0;k<16;k++){ const f=new THREE.Mesh(geo,M.frond); f.rotation.order='YXZ'; f.rotation.y=k/16*Math.PI*2+r()*.3; f.rotation.x=-(.55+r()*.85);
    f.castShadow=true; f.customDepthMaterial=dm; fg.add(f); }
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const c=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),std(0x6f7a2c,{roughness:.6})); c.position.set(Math.cos(a)*.22,-.25,Math.sin(a)*.22); c.castShadow=true; fg.add(c); }
  return g;
}
for(const t of TREES){ if(t.k==='kelapa') coconut(t); else broadTree(t,t.k==='mangga'?6.2:5.0,t.k==='mangga'?113:127); }

/* ================= Kemudahan tapak (M1002) ================= */
for(const u of UTIL){
  const info={t:u.t,ref:'M1002',rows:u.rows||[['Saiz','Ikut cadangan kontraktor']]};
  const g=item(land,u.x,u.y,0,'x+',info);
  if(u.k==='ist'){ cyl(g,u.d/2,u.d/2,.1,M.cover,0,.05,0,32); for(const dx of [-.3,.3]) cyl(g,.18,.18,.03,M.metal,dx,.115,0,20); }
  else if(u.k==='ic'){ bx(g,.45,.06,.45,M.cover,0,.03,0); bx(g,.3,.01,.3,M.metal,0,.065,0); }
  else if(u.k==='sump'){ bx(g,.6,.08,.6,M.cover,0,.04,0); for(let k=-4;k<=4;k++) bx(g,.03,.012,.5,M.black,k*.055,.085,0); }
  else if(u.k==='tank'){ bx(g,1.5,.25,1.5,M.cover,0,.025,0);
    for(const [a,b] of [[.4,.4],[.4,-.4],[-.4,.4],[-.4,-.4]]) cyl(g,.03,.03,.45,M.stainless,a,.37,b,8);
    cyl(g,u.d/2,u.d/2,u.h-.5,M.stainless,0,.6+(u.h-.5)/2,0,32);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(u.d/2,32,10,0,Math.PI*2,0,Math.PI/2),M.stainless); dome.scale.y=.3; dome.position.y=.6+u.h-.5; dome.castShadow=true; g.add(dome);
    cyl(g,.16,.16,.08,M.stainless,0,.6+u.h-.5+u.d/2*.3,0,16);
    for(const y of [.95,1.45,1.95]) cyl(g,u.d/2+.008,u.d/2+.008,.03,M.metal,0,y,0,32); }
  else if(u.k==='pump'){ boxPlan(-u.w/2,-u.l/2,u.w/2,u.l/2,0,u.h*.6,M.cover,g); boxPlan(-u.w/2-.03,-u.l/2-.03,u.w/2+.03,u.l/2+.03,u.h*.6,u.h*.6+.05,M.metal,g); }
  else if(u.k==='well'){ const ring=new THREE.Mesh(new THREE.CylinderGeometry(u.d/2,u.d/2,.7,28,1,true),M.cover); ring.position.y=.35; ring.material.side=THREE.DoubleSide; ring.castShadow=true; g.add(ring);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(u.d/2,.06,8,28),M.cover); rim.rotation.x=Math.PI/2; rim.position.y=.7; g.add(rim);
    cyl(g,u.d/2-.04,u.d/2-.04,.02,std(0x1e2a2c,{roughness:.1,metalness:.3}),0,.3,0,28); }
}

/* ================= Rumpun rumput & latar pokok jauh (hiasan) ================= */
(function(){
  const inPoly=(x,y,poly)=>{ let ins=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [xi,yi]=poly[i],[xj,yj]=poly[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins; } return ins; };
  const keepOut=(x,y)=>(x>-1.3&&x<17.4&&y>-1.3&&y<9.3)||UTIL.some(u=>Math.hypot(x-u.x,y-u.y)<1.2);
  const geo=new THREE.PlaneGeometry(.5,.35); geo.translate(0,.175,0);
  const g2=geo.clone(); g2.rotateY(Math.PI/2); const merged=new THREE.BufferGeometry();
  const pa=[...geo.attributes.position.array,...g2.attributes.position.array], ua=[...geo.attributes.uv.array,...g2.attributes.uv.array], na=[...geo.attributes.normal.array,...g2.attributes.normal.array];
  merged.setAttribute('position',new THREE.Float32BufferAttribute(pa,3)); merged.setAttribute('uv',new THREE.Float32BufferAttribute(ua,2)); merged.setAttribute('normal',new THREE.Float32BufferAttribute(na,3));
  merged.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);
  const r=rnd(131), mats=[];
  for(let k=0;k<5000&&mats.length<1600;k++){ const x=-30+r()*80, y=-30+r()*62; if(keepOut(x,y)||inPoly(x,y,LOT)) continue;
    if(ROADS.length&&(x>23.5&&x<29)) continue;
    dummy.position.copy(L3(x,y,0)); dummy.rotation.set(0,r()*Math.PI,0); const s=.35+r()*.45; dummy.scale.set(s,s*(.7+r()*.6),s); dummy.updateMatrix(); mats.push(dummy.matrix.clone()); }
  const tufts=new THREE.InstancedMesh(merged,M.tuft,mats.length); mats.forEach((m,i)=>tufts.setMatrixAt(i,m)); tufts.receiveShadow=true; land.add(tufts);
  const far=[], fr=rnd(137);
  for(let k=0;k<150;k++){ const a=fr()*Math.PI*2, d=110+fr()*120, s=3+fr()*4; dummy.position.set(SUN_T.x+Math.cos(a)*d,s*.7,SUN_T.z+Math.sin(a)*d);
    dummy.scale.set(s,s*(1+fr()*.6),s); dummy.rotation.set(0,fr()*6,0); dummy.updateMatrix(); far.push(dummy.matrix.clone()); }
  const fg=new THREE.InstancedMesh(blobGeo(1,151,18),std(0x2c4422,{roughness:1}),far.length); far.forEach((m,i)=>fg.setMatrixAt(i,m)); land.add(fg);
})();
