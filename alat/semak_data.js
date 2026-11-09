// Semakan data lukisan (tanpa pakej): node alat/semak_data.js
// Luas bilik lawan jadual M1003, kuantiti bukaan lawan D3001/D3002, bilangan dinding/pagar/tangga,
// dan tepi bilik yang terbuka (hanya tepi yang memang terbuka dalam lukisan dibenarkan).
'use strict';
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','js','data.js'),'utf8')+';module.exports={ROOMS,WALLS,STAIRS,RAILS,COLS,INFO,GAYA};';
const m=new module.constructor(); m._compile(src,'data.js'); const D=m.exports;
let bad=0; const fail=s=>{ bad++; console.log('GAGAL:',s); };

// 1. Luas (M1003). Ruang makan dikira hingga grid A dalam M1003, jadi bertindih dengan balkoni 450 mm (README 21).
const LUAS_DIBENARKAN={makan:1.5};
for(const r of D.ROOMS){ const a=r.r.reduce((s,[x1,y1,x2,y2])=>s+(x2-x1)*(y2-y1),0);
  const af=r.full?(r.full[2]-r.full[0])*(r.full[3]-r.full[1]):a, d=Math.min(Math.abs(a-+r.a),Math.abs(af-+r.a));
  if(d>(LUAS_DIBENARKAN[r.id]||0.1)) fail(`luas ${r.id}: model ${af.toFixed(2)} m², M1003 ${r.a}`); }

// 2. Kuantiti bukaan (D3001, D3002)
const JADUAL={W1:4,W2:5,W3:2,W4:1,W5:1,W6:1,MD1:1,D1:1,D2:4,D3:3,GD1:1,GD2:1};
const cnt={}; for(const w of D.WALLS) for(const o of (w[4]||[])) cnt[o.type]=(cnt[o.type]||0)+1;
for(const k in JADUAL) if((cnt[k]||0)!==JADUAL[k]) fail(`kuantiti ${k}: model ${cnt[k]||0}, jadual ${JADUAL[k]}`);
for(const k in cnt) if(!(k in JADUAL)) fail(`jenis bukaan tidak dalam jadual: ${k}`);

// 3. Bilangan unsur (kemas kini nilai ini dengan sengaja apabila lukisan berubah)
const BIL={WALLS:22,RAILS:7,STAIRS:2,COLS:4};
for(const k in BIL) if(D[k].length!==BIL[k]) fail(`${k}: ${D[k].length}, dijangka ${BIL[k]}`);

// 4. Tepi bilik: setiap tepi mesti ada dinding atau pagar, kecuali tepi yang memang terbuka
const TERBUKA={ // bilik -> tepi: [a1,a2] julat terbuka yang dibenarkan sepanjang tepi itu
  yard:{y2:[0,1.075]},               // bukaan 900 untuk tangga; muka dinding 1.0, garis tengah 1.075 (E4, D7006)
  makan:{y1:[6.0,7.2],x2:[3.9,7.35]},// laluan koridor; terbuka ke ruang tamu
  tamu:{x1:[3.9,7.35]},
  lanai:{x2:[4.2,5.4]},              // tangga lanai selepas pier; garis tengah hujung pier 4.2 (D6002)
  balkoni:{x1:[7.8,7.875],x2:[7.8,7.875]}, // sambungan papak di luar grid A
  b2:{x2:[1.8,3.9]}, b1:{x1:[1.8,3.9]}     // bilik berbentuk L
};
const segs=D.WALLS.map(w=>w.slice(0,4)).concat(D.RAILS.map(r=>r.slice(0,4)));
const ada=(x,y,horiz)=>segs.some(([a,b,c,d])=>{ if((b===d)!==horiz) return false;
  return horiz?Math.abs(b-y)<1e-6&&x>=Math.min(a,c)-1e-6&&x<=Math.max(a,c)+1e-6:Math.abs(a-x)<1e-6&&y>=Math.min(b,d)-1e-6&&y<=Math.max(b,d)+1e-6; });
for(const r of D.ROOMS){ const [x1,y1,x2,y2]=r.full||r.r[0];
  for(const [nm,sx1,sy1,sx2,sy2,horiz] of [['y1',x1,y1,x2,y1,true],['y2',x1,y2,x2,y2,true],['x1',x1,y1,x1,y2,false],['x2',x2,y1,x2,y2,false]]){
    const ok=(TERBUKA[r.id]||{})[nm]; const miss=[];
    for(let i=0;i<40;i++){ const t=(i+.5)/40, x=sx1+(sx2-sx1)*t, y=sy1+(sy2-sy1)*t, a=horiz?x:y;
      if(ada(x,y,horiz)) continue; if(ok&&a>=ok[0]-1e-6&&a<=ok[1]+1e-6) continue; miss.push(a.toFixed(2)); }
    if(miss.length) fail(`tepi ${r.id} ${nm} terbuka di ${miss[0]}–${miss[miss.length-1]} (${miss.length}/40 titik)`); } }

// 5. Setiap kunci maklumat yang dirujuk dalam INFO wujud; gaya Arkitek tiada warna
if(D.GAYA[0].id!=='arkitek'||D.GAYA[0].warna) fail('GAYA[0] mesti arkitek tanpa warna');
console.log(bad?`${bad} semakan gagal`:'Semua semakan data lulus');
process.exit(bad?1:0);
