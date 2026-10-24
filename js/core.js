/* Banglo Azim 3D — renderer, kamera, langit, matahari ikut waktu, bahan, tekstur */
'use strict';

if(!window.THREE || !THREE.OrbitControls){ document.getElementById('err').hidden=false; throw new Error('three.js tidak dimuatkan'); }
const $=id=>document.getElementById(id);

/* ================= Asas ================= */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
const ANISO=Math.min(8,renderer.capabilities.getMaxAnisotropy());

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,0.05,900);
const controls=new THREE.OrbitControls(camera,canvas);
controls.enableDamping=true; controls.dampingFactor=0.08;
controls.minDistance=4; controls.maxDistance=90; controls.maxPolarAngle=1.52;
const CX=8.1, CZ=-3.9;
controls.target.set(CX,1.2,CZ);

/* ================= Langit (shader kecerunan + awan) ================= */
const SKY_U={sunDir:{value:new THREE.Vector3(0,1,0)},zenith:{value:new THREE.Color()},horizon:{value:new THREE.Color()},
  ground:{value:new THREE.Color()},sunCol:{value:new THREE.Color()},sunI:{value:1},cloud:{value:.5}};
const skyMat=new THREE.ShaderMaterial({uniforms:SKY_U,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:`varying vec3 vDir; void main(){ vDir=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`,
  fragmentShader:`uniform vec3 sunDir,zenith,horizon,ground,sunCol; uniform float sunI,cloud; varying vec3 vDir;
    float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float ns(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x),f.y); }
    float fbm(vec2 p){ float v=0., a=.5; for(int k=0;k<5;k++){ v+=a*ns(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
    void main(){
      vec3 d=normalize(vDir); float y=d.y;
      vec3 col= y>0. ? mix(horizon,zenith,pow(y,.55)) : mix(horizon,ground,pow(min(-y*5.,1.),.5));
      float sd=max(dot(d,sunDir),0.);
      if(y>-.02){
        vec2 uv=d.xz/(max(y,0.)+.09);
        float c=smoothstep(.52,.85,fbm(uv*.32+vec2(2.3,7.1)));
        vec3 cc=mix(horizon,vec3(1.),.6)*(.35+.65*sunI)+sunCol*pow(sd,5.)*.4*sunI;
        col=mix(col,cc,c*cloud*smoothstep(-.02,.22,y));
      }
      col+=sunCol*(pow(sd,1400.)*14.*sunI+pow(sd,48.)*.3*sunI+pow(sd,4.)*.08*sunI);
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(500,32,16),skyMat); sky.renderOrder=-1; sky.frustumCulled=false; scene.add(sky);
scene.fog=new THREE.Fog(0xb9d4ea,120,480);

/* Pantulan persekitaran (PMREM daripada langit yang sama) */
const pmrem=new THREE.PMREMGenerator(renderer);
const envScene=new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),skyMat));
let envRT=null, envTimer=0;
function updateEnv(){ const old=envRT; envRT=pmrem.fromScene(envScene,0.02); scene.environment=envRT.texture; if(old) old.dispose(); }
function queueEnv(){ clearTimeout(envTimer); envTimer=setTimeout(updateEnv,140); }

/* ================= Cahaya ================= */
const hemi=new THREE.HemisphereLight(0xdfeaff,0x6b6350,0.35); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1dc,2.4);
const SUN_T=new THREE.Vector3(10.5,0,-1.5); // pusat tapak (pelan x 10.5, y 1.5)
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:170});
sun.shadow.bias=-0.0003; sun.shadow.normalBias=0.03;
sun.target.position.copy(SUN_T); scene.add(sun,sun.target);

/* Kedudukan matahari: Kangar ≈ 6.44° U, 100.19° T, UTC+8. Utara = paksi +x pelan diputar UTARA° ke arah +y; timur ≈ −y (three: z = −y). */
const LAT=6.44*Math.PI/180, LON=100.19, TZ=8;
function sunAt(hour){
  const d=new Date(), N=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);
  const B=2*Math.PI*(N-81)/364, eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
  const solar=hour+(eot+4*(LON-15*TZ))/60;
  const dec=23.44*Math.PI/180*Math.sin(2*Math.PI*(284+N)/365), H=(solar-12)*15*Math.PI/180;
  const alt=Math.asin(Math.sin(LAT)*Math.sin(dec)+Math.cos(LAT)*Math.cos(dec)*Math.cos(H));
  let az=Math.acos(Math.max(-1,Math.min(1,(Math.sin(dec)-Math.sin(alt)*Math.sin(LAT))/(Math.cos(alt)*Math.cos(LAT)))));
  if(H>0) az=2*Math.PI-az;
  const r=az-UTARA*Math.PI/180;
  return {alt, az, dir:new THREE.Vector3(Math.cos(r)*Math.cos(alt),Math.sin(alt),Math.sin(r)*Math.cos(alt))};
}
const smooth=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const PAL={
  day:{z:lin('#3f7fcf'),h:lin('#c3dbef'),g:lin('#7c7a66'),s:lin('#fff4e2'),hs:lin('#e4efff'),hg:lin('#7a705a')},
  gold:{z:lin('#5677ad'),h:lin('#f3be8a'),g:lin('#6a5a4a'),s:lin('#ffb066'),hs:lin('#f0c9a8'),hg:lin('#5a4a3c')},
  night:{z:lin('#081222'),h:lin('#1b2940'),g:lin('#0d1016'),s:lin('#9fb4d8'),hs:lin('#2a3958'),hg:lin('#14161c')}
};
const SUNST={hour:16, alt:0, night:0};
const _c=new THREE.Color();
function mix3(k,day,gold,night){ return _c.copy(PAL.day[k]).lerp(PAL.gold[k],gold).lerp(PAL.night[k],night).clone(); }
function setSunTime(hour){
  SUNST.hour=hour; const s=sunAt(hour), a=s.alt*180/Math.PI; SUNST.alt=a;
  const night=1-smooth(-9,-1,a), gold=(1-smooth(4,24,a))*(1-night); SUNST.night=night;
  SKY_U.zenith.value.copy(mix3('z',1,gold,night)); SKY_U.horizon.value.copy(mix3('h',1,gold,night));
  SKY_U.ground.value.copy(mix3('g',1,gold,night)); SKY_U.sunCol.value.copy(mix3('s',1,gold,night));
  SKY_U.sunI.value=smooth(-3,6,a); SKY_U.sunDir.value.copy(s.dir.y<0?s.dir.clone().setY(Math.max(s.dir.y,-.05)).normalize():s.dir);
  const up=s.dir.clone(); if(up.y<.08){ up.y=.08; up.normalize(); }
  sun.position.copy(SUN_T).addScaledVector(up,90);
  sun.intensity=2.5*smooth(-1,10,a); sun.color.copy(mix3('s',1,gold,0));
  hemi.color.copy(mix3('hs',1,gold,night)); hemi.groundColor.copy(mix3('hg',1,gold,night)); hemi.intensity=.3+.25*night;
  scene.fog.color.copy(SKY_U.horizon.value);
  renderer.toneMappingExposure=1.0+.35*night;
  if(typeof M!=='undefined'){ const k=.6+2.2*night; M.lamp.emissiveIntensity=1.2*k; M.led.emissiveIntensity=1.4*k; M.mirrorGlow.emissiveIntensity=1.0*k; }
  queueEnv();
}

/* ================= Bahan ================= */
const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o));
function rnd(seed){ let s=seed; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }
function shade(hex,f){ const c=new THREE.Color(hex), h={}; c.getHSL(h); c.setHSL(h.h,h.s,Math.max(0,Math.min(1,h.l*f))); return '#'+c.getHexString(); }
function canvasTex(S,draw,rep,linear){ const cv=document.createElement('canvas'); cv.width=cv.height=S; draw(cv.getContext('2d'),S);
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=ANISO; if(!linear) t.encoding=THREE.sRGBEncoding;
  if(rep) t.repeat.set(rep[0],rep[1]); t.userData={url:cv.toDataURL('image/png')}; return t; }
/* Bintik hingar untuk permukaan kasar (lepa, konkrit, tanah) */
function speckle(g,S,r,n,tones,sz){ for(let k=0;k<n;k++){ g.fillStyle=tones[Math.floor(r()*tones.length)]; const s=(sz||1.5)*(.5+r()); g.fillRect(r()*S,r()*S,s,s); } }

const louvreTex=canvasTex(128,(g,S)=>{ g.fillStyle='#f4f4f2'; g.fillRect(0,0,S,S); g.fillStyle='rgba(0,0,0,.28)'; for(let y=0;y<S;y+=10) g.fillRect(8,y,S-16,3); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(0,0,6,S); g.fillRect(S-6,0,6,S); },[1,2]);
const concreteTex=canvasTex(256,(g,S)=>{ const r=rnd(41); g.fillStyle='#bdb9b0'; g.fillRect(0,0,S,S);
  speckle(g,S,r,5000,['rgba(90,85,75,.12)','rgba(255,255,255,.18)','rgba(60,55,50,.08)'],2); });
const sidingTex=canvasTex(128,(g,S)=>{ g.fillStyle='#ecebe6'; g.fillRect(0,0,S,S); for(let y=0;y<S;y+=16){ g.fillStyle='rgba(0,0,0,.16)'; g.fillRect(0,y+13,S,3); g.fillStyle='rgba(255,255,255,.5)'; g.fillRect(0,y,S,2); } });

const M={
  wall:std(0xf2f0eb,{roughness:.92,envMapIntensity:.6}),
  plinth:std(0xa9a69e,{map:concreteTex}), apron:std(0xc8c4ba,{roughness:.95,map:concreteTex}),
  glass:std(0x8fb3bf,{roughness:.04,metalness:.6,transparent:true,opacity:.32,depthWrite:false,envMapIntensity:1.5}),
  frost:std(0xe9eef0,{roughness:.35,metalness:.1,transparent:true,opacity:.93}),
  frame:std(0x2a2d2f,{roughness:.45,metalness:.5}),
  louvre:new THREE.MeshStandardMaterial({map:louvreTex,color:0x2a2d2f,roughness:.5,metalness:.3}),
  rail:std(0x1e2123,{roughness:.55,metalness:.4}),
  door:std(0x8b5a36,{roughness:.55}),
  fascia:std(0xf4f3ef,{roughness:.8}), soffit:std(0xf1efe9,{roughness:.9}), siding:std(0xffffff,{map:sidingTex,roughness:.85}),
  ceil:std(0xf7f6f2,{roughness:.95,envMapIntensity:.6}),
  side:std(0xcfcbc2,{map:concreteTex}),
  porcelain:std(0xfbfbfa,{roughness:.18,envMapIntensity:1.2}), steel:std(0xc9cdd0,{roughness:.3,metalness:.6}), chrome:std(0xe2e6e9,{roughness:.12,metalness:.9}),
  black:std(0x1b1c1e,{roughness:.4}), screen:std(0x0e1013,{roughness:.12,metalness:.3}),
  wood2:std(0x7a5236,{roughness:.6}), oak:std(0xb08458,{roughness:.55}), cab:std(0xe8e4dc,{roughness:.5}), counter:std(0x37393b,{roughness:.25,envMapIntensity:1.2}),
  linen:std(0xf3f1ec), pillow:std(0xffffff), throwA:std(0x5e7a8a), throwB:std(0xa9784f), fabric:std(0x8d938e), fabric2:std(0x5c6a73),
  lamp:new THREE.MeshStandardMaterial({color:0xfff6e0,emissive:0xfff1cc,emissiveIntensity:1.2}),
  led:new THREE.MeshStandardMaterial({color:0xfff3d6,emissive:0xffe9b8,emissiveIntensity:1.4}),
  mirrorGlow:new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff7e6,emissiveIntensity:1.0}),
  mirror:std(0xd3dde1,{roughness:.02,metalness:1}),
  tileCounter:std(0xdcd6c9,{roughness:.3}),
  pvc:std(0x8e9396,{roughness:.5}), cover:std(0x9c988f,{map:concreteTex,roughness:.95}), drain:std(0x4b4a46,{roughness:1}),
  stainless:std(0xd5d9dc,{roughness:.28,metalness:.85}), metal:std(0x9aa1a6,{roughness:.35,metalness:.7})
};

/* ================= Kemasan lantai & dinding (Jadual D1001) ================= */
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
    if(spec.kind==='kitkat'){ // jalur jari mendatar, 2 × 2 kepingan 300 × 300
      const rows=24, rh=S/rows;
      for(let j=0;j<rows;j++){ g.fillStyle=shade(spec.base,1+(r()-.5)*.35); g.fillRect(0,j*rh,S,rh);
        g.fillStyle='rgba(255,230,210,.10)'; g.fillRect(0,j*rh+1,S,rh*.35); g.fillStyle=spec.grout; g.fillRect(0,j*rh+rh-2,S,2); }
      g.fillStyle=spec.grout; g.fillRect(0,0,3,S); g.fillRect(S/2,0,3,S); g.fillRect(0,S/2-1,S,3);
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
      if(spec.band){ g.globalAlpha=.10; g.fillStyle='#b7a27a'; for(let k=0;k<5;k++) g.fillRect(x,y+r()*th,tw,1+r()*2); g.globalAlpha=1; }
      g.fillStyle=spec.grout; g.fillRect(x,y,tw,3); g.fillRect(x,y,3,th);
    }
  });
}
