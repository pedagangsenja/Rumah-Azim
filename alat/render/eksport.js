// Eksport adegan three.js Banglo Azim ke GLB untuk Blender (nama bahan & nod dikekalkan)
const { chromium } = require('playwright');
const fs = require('fs');
const SP = __dirname; // GLB ditulis di sini
const CDN = process.env.THREE_PKG || (__dirname + '/three'); // isi pakej npm three@0.128.0
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.route('**/*', r => {
    const u = r.request().url();
    let m = u.match(/r128\/three\.min\.js$/); if (m) return r.fulfill({ path: CDN + '/build/three.min.js', contentType: 'text/javascript' });
    m = u.match(/three@0\.128\.0\/(.+)$/); if (m) return r.fulfill({ path: CDN + '/' + m[1], contentType: 'text/javascript' });
    if (u.startsWith('file://')) return r.continue(); return r.abort();
  });
  await p.goto('file://' + require('path').resolve(__dirname, '../../index.html')); await p.waitForTimeout(2500);
  await p.addScriptTag({ path: CDN + '/examples/js/exporters/GLTFExporter.js' });
  const b64 = await p.evaluate(() => new Promise((res, rej) => {
    S.cut = false; buildWalls(PLATE); S.roof = true; S.label = false; sync();
    for (const k in M) M[k].name = k;
    roofMat.name = 'roof'; capMat.name = 'cap'; stepMat.name = 'step';
    for (const rm of ROOMS) for (const o of rm.meshes) o.top.name = 'floor_' + rm.f;
    // nama nod daripada kunci maklumat (DL, FAN, WL, LED, AC, ...) dan nama bilik
    const named = new Set();
    scene.traverse(o => { const v = o.userData && o.userData.info; if (typeof v === 'string' && !o.name) o.name = v;
      if (o.userData && o.userData.room) o.name = 'room_' + o.userData.room.id; });
    scene.traverse(o => { if (o.isMesh && o.userData.info === 'GABLE') o.material.name = 'siding';
      if (o.isMesh && o.userData.info === 'LOT') o.visible = false; });
    // InstancedMesh -> jejaring biasa (rumpun rumput tidak dieksport; dibina semula di Blender)
    const inst = []; scene.traverse(o => { if (o.isInstancedMesh) inst.push(o); });
    for (const im of inst) {
      if (im.material === M.tuft) { im.visible = false; continue; }
      const g = new THREE.Group(); g.name = im.material === M.rail ? 'rail_bars' : 'far_trees';
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < im.count; i++) { const me = new THREE.Mesh(im.geometry, im.material); im.getMatrixAt(i, m4); me.applyMatrix4(m4); g.add(me); }
      im.parent.add(g); im.parent.remove(im);
    }
    house.name = 'house'; roof.name = 'roof'; site.name = 'site'; ceilG.name = 'ceilings'; lightG.name = 'lights';
    furn.name = 'furniture'; san.name = 'sanitary'; land.name = 'land';
    new THREE.GLTFExporter().parse([house, roof, site, ceilG, lightG, furn, san, land], buf => {
      const u8 = new Uint8Array(buf); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
      res(btoa(s));
    }, { binary: true, onlyVisible: true, maxTextureSize: 1024 });
  }));
  const out = SP + '/banglo.glb'; fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('GLB', (fs.statSync(out).size / 1e6).toFixed(1), 'MB');
  await b.close();
})();
