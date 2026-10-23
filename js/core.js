/* Banglo Azim 3D — renderer, kamera, cahaya, bahan, tekstur */
'use strict';

if(!window.THREE || !THREE.OrbitControls){ document.getElementById('err').hidden=false; throw new Error('three.js tidak dimuatkan'); }
const $=id=>document.getElementById(id);

/* ================= Asas ================= */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
const ANISO=renderer.capabilities.getMaxAnisotropy();

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,0.05,400);
const controls=new THREE.OrbitControls(camera,canvas);
controls.enableDamping=true; controls.dampingFactor=0.08;
controls.minDistance=5; controls.maxDistance=70; controls.maxPolarAngle=1.5;
const CX=8.1, CZ=-3.9;
controls.target.set(CX,1.2,CZ);

scene.add(new THREE.HemisphereLight(0xf2f6ff,0x7a705c,0.6));
scene.add(new THREE.AmbientLight(0xffffff,0.18));
const sun=new THREE.DirectionalLight(0xfff1dc,1.1);
sun.position.set(CX+11,24,CZ+15); sun.target.position.set(CX,0,CZ);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:70});
sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.02;
scene.add(sun,sun.target);

/* ================= Bahan ================= */
const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o));
function rnd(seed){ let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
function shade(hex,f){ const c=new THREE.Color(hex), h={}; c.getHSL(h); c.setHSL(h.h,h.s,Math.max(0,Math.min(1,h.l*f))); return '#'+c.getHexString(); }
function canvasTex(S,draw,rep){ const cv=document.createElement('canvas'); cv.width=cv.height=S; draw(cv.getContext('2d'),S);
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=ANISO; t.encoding=THREE.sRGBEncoding;
  if(rep) t.repeat.set(rep[0],rep[1]); t.userData={url:cv.toDataURL('image/png')}; return t; }

const louvreTex=canvasTex(128,(g,S)=>{ g.fillStyle='#f4f4f2'; g.fillRect(0,0,S,S); g.fillStyle='rgba(0,0,0,.28)'; for(let y=0;y<S;y+=10) g.fillRect(8,y,S-16,3); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(0,0,6,S); g.fillRect(S-6,0,6,S); },[1,2]);
const M={
  wall:std(0xf2f0eb,{roughness:.92}),
  plinth:std(0xb3b0a8), apron:std(0xc8c4ba,{roughness:.95}),
  glass:std(0x9ec4d0,{roughness:.05,metalness:.15,transparent:true,opacity:.3,depthWrite:false}),
  frost:std(0xe9eef0,{roughness:.4,transparent:true,opacity:.75}),
  frame:std(0x2a2d2f,{roughness:.5,metalness:.4}),
  louvre:new THREE.MeshStandardMaterial({map:louvreTex,color:0x2a2d2f,roughness:.5,metalness:.3}),
  rail:std(0x1e2123,{roughness:.55,metalness:.35}),
  door:std(0x8b5a36,{roughness:.6}),
  fascia:std(0xf4f3ef), cap:std(0x121314,{roughness:.8}),
  soffit:std(0xf1efe9), ceil:std(0xf7f6f2,{roughness:.95}),
  ground:std(0x9aad85,{roughness:1}), side:std(0xcfcbc2),
  porcelain:std(0xfbfbfa,{roughness:.25}), steel:std(0xc9cdd0,{roughness:.35,metalness:.3}), chrome:std(0xe2e6e9,{roughness:.2,metalness:.35}),
  black:std(0x1b1c1e,{roughness:.4}), screen:std(0x0e1013,{roughness:.2,metalness:.2}),
  wood2:std(0x7a5236,{roughness:.7}), oak:std(0xb08458,{roughness:.65}), cab:std(0xe8e4dc,{roughness:.6}), counter:std(0x37393b,{roughness:.35}),
  linen:std(0xf3f1ec), pillow:std(0xffffff), throwA:std(0x5e7a8a), throwB:std(0xa9784f), fabric:std(0x8d938e), fabric2:std(0x5c6a73),
  lamp:new THREE.MeshStandardMaterial({color:0xfff6e0,emissive:0xfff1cc,emissiveIntensity:1.2}),
  led:new THREE.MeshStandardMaterial({color:0xfff3d6,emissive:0xffe9b8,emissiveIntensity:1.4}),
  mirrorGlow:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff7e6,emissiveIntensity:1.0}),
  mirror:std(0xd3dde1,{roughness:.08,metalness:.2}),
  tileCounter:std(0xdcd6c9,{roughness:.4})
};

/* ================= Kemasan lantai (Jadual D1001) ================= */
function makeTex(spec){
  return canvasTex(512,(g,S)=>{
    const r=rnd(spec.seed||7);
    if(spec.kind==='timber'){
      const cols=8, cw=S/cols, tones=['#8c5231','#a5673e','#975b35','#b2774a','#9e6039'];
      for(let i=0;i<cols;i++){ let y=-r()*S*.6;
        while(y<S){ const len=S*(.35+r()*.45);
          g.fillStyle=tones[Math.floor(r()*tones.length)]; g.fillRect(i*cw,y,cw,len);
          g.globalAlpha=.18; g.strokeStyle='#4a2a16';
          for(let k=0;k<5;k++){ g.beginPath(); const x=i*cw+4+r()*(cw-8); g.moveTo(x,y); g.bezierCurveTo(x+6,y+len*.3,x-6,y+len*.6,x+3,y+len); g.stroke(); }
          g.globalAlpha=1; g.fillStyle='#3e2414'; g.fillRect(i*cw,y,cw,2); y+=len; }
        g.fillStyle='rgba(40,20,10,.55)'; g.fillRect(i*cw,0,1.5,S); }
      return;
    }
    const tw=S/2, th=S/2;
    for(let j=0;j<2;j++) for(let i=-1;i<2;i++){
      const off=spec.stagger&&j%2?tw/2:0, x=i*tw+off, y=j*th;
      g.fillStyle=shade(spec.base,1+(r()-.5)*(spec.wood?.12:.05)); g.fillRect(x,y,tw,th);
      if(spec.wood){ g.globalAlpha=.22; g.strokeStyle=shade(spec.base,.7);
        for(let k=0;k<9;k++){ g.beginPath(); const yy=y+4+r()*(th-8); g.moveTo(x,yy); g.bezierCurveTo(x+tw*.3,yy+5*(r()-.5)*2,x+tw*.6,yy-6*(r()-.5)*2,x+tw,yy); g.stroke(); }
        g.globalAlpha=1; }
      if(spec.vein){ g.globalAlpha=.12; g.strokeStyle='#9a9a94'; g.lineWidth=1.2;
        for(let k=0;k<3;k++){ g.beginPath(); let px=x+r()*tw, py=y; g.moveTo(px,py); for(let s=0;s<6;s++){ px+=(r()-.4)*tw*.25; py+=th/6; g.lineTo(px,py);} g.stroke(); }
        g.globalAlpha=1; g.lineWidth=1; }
      if(spec.speck){ for(let k=0;k<160;k++){ g.fillStyle=`rgba(120,100,70,${.05+r()*.08})`; g.fillRect(x+r()*tw,y+r()*th,1.5,1.5);} }
      g.fillStyle=spec.grout; g.fillRect(x,y,tw,3); g.fillRect(x,y,3,th);
    }
  });
}
