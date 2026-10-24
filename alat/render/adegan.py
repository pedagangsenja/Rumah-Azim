# Bina adegan Cycles Banglo Azim daripada banglo.glb dan simpan sebagai banglo.blend
# Koordinat Blender = (x pelan, y pelan, aras). Utara ≈ +x (diputar 8.9° ke arah +y), timur ≈ -y.
import bpy, bmesh, math, random, os, sys
from mathutils import Vector

D = os.path.dirname(os.path.abspath(__file__))
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
GY = os.environ.get('GAYA', '')   # gaya kemasan: kosong = Arkitek; selain itu banglo_<gaya>.glb + gaya_<gaya>.json daripada eksport.js
GJ = __import__('json').load(open(os.path.join(D, 'gaya_' + GY + '.json'))) if GY else {'kunci': [], 'langsir': None}
bpy.ops.import_scene.gltf(filepath=os.path.join(D, 'banglo' + ('_' + GY if GY else '') + '.glb'))
sc = bpy.context.scene

def bsdf(m):
    if not m or not m.use_nodes: return None
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED': return n
    return None
def setp(n, key, val):
    if n and key in n.inputs: n.inputs[key].default_value = val
def base(m):
    return m.name.split('.')[0]
def ancestors(o):
    names = []
    while o:
        names.append(o.name.split('.')[0]); o = o.parent
    return names

# ---------------- Bahan ----------------
TINT = (0.62, 0.74, 0.76, 1)
for m in bpy.data.materials:
    k, n = base(m), bsdf(m)
    if not n: continue
    setp(n, 'Alpha', 1.0)
    if k == 'glass':
        setp(n, 'Base Color', TINT); setp(n, 'Transmission Weight', 1.0); setp(n, 'Roughness', 0.0); setp(n, 'IOR', 1.52); setp(n, 'Metallic', 0.0)
    elif k == 'frost':
        setp(n, 'Base Color', (0.92, 0.94, 0.95, 1)); setp(n, 'Transmission Weight', 1.0); setp(n, 'Roughness', 0.35); setp(n, 'IOR', 1.5); setp(n, 'Metallic', 0.0)
    elif k in ('frame', 'rail', 'louvre'):
        setp(n, 'Metallic', 0.6); setp(n, 'Roughness', 0.38)
    elif k in ('wall', 'wallIn', 'col', 'aksen'):
        setp(n, 'Roughness', 0.78)
    elif k in ('fascia', 'soffit', 'ceil', 'cab', 'kcab', 'kcab2'):
        setp(n, 'Roughness', 0.55 if k in ('cab', 'kcab', 'kcab2') else 0.8)
    elif k.startswith('floor_'):
        r = {'padova': .1, 'castello': .45, 'timber': .32, 'norwich': .4, 'orche': .5, 'trav': .3, 'sx05': .55, 'ls02': .7, 'blitzen': .5, 'ls01': .7, 'oakstrip': .4, 'tv02': .6, 'merbau': .38, 'terra': .75}.get(k[6:], .4)
        setp(n, 'Roughness', r); setp(n, 'Coat Weight', .25 if k[6:] in ('padova', 'timber') else 0)
    elif k == 'tileW':
        setp(n, 'Roughness', 0.22)
    elif k == 'kitkat':
        setp(n, 'Roughness', 0.06); setp(n, 'Coat Weight', .5)
    elif k in ('porcelain',):
        setp(n, 'Roughness', 0.06); setp(n, 'Coat Weight', .4)
    elif k in ('chrome', 'mirror'):
        setp(n, 'Metallic', 1.0); setp(n, 'Roughness', 0.03 if k == 'mirror' else 0.08); setp(n, 'Base Color', (0.9, 0.92, 0.93, 1))
    elif k in ('steel', 'stainless', 'metal'):
        setp(n, 'Metallic', 0.95); setp(n, 'Roughness', 0.22)
    elif k in ('lamp', 'led', 'mirrorGlow'):
        setp(n, 'Emission Color', (1.0, 0.82, 0.6, 1)); setp(n, 'Emission Strength', {'lamp': 25, 'led': 40, 'mirrorGlow': 6}[k])
    elif k == 'screen':
        setp(n, 'Roughness', 0.05); setp(n, 'Coat Weight', .8)
    elif k in ('fabric', 'fabric2', 'linen', 'pillow', 'throwA', 'throwB'):
        setp(n, 'Roughness', 0.92); setp(n, 'Sheen Weight', 0.6)
    elif k in ('wood2', 'oak', 'door'):
        setp(n, 'Roughness', 0.42); setp(n, 'Coat Weight', 0.25)
    elif k == 'counter':
        setp(n, 'Roughness', 0.12); setp(n, 'Coat Weight', 0.4)
    elif k == 'roof':
        setp(n, 'Roughness', 0.68 if GY else 0.5)   # jubin konkrit gaya: kurang kilat supaya warna tidak dibiru langit
        tex = next((x for x in m.node_tree.nodes if x.type == 'TEX_IMAGE'), None)
        if tex:
            bmp = m.node_tree.nodes.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = 0.6; bmp.inputs['Distance'].default_value = 0.03
            m.node_tree.links.new(tex.outputs['Color'], bmp.inputs['Height']); m.node_tree.links.new(bmp.outputs['Normal'], n.inputs['Normal'])
    elif k == 'cap':
        setp(n, 'Roughness', 0.5)
    elif k == 'drain':
        setp(n, 'Roughness', 0.35)

# Warna three.js tanpa tekstur ditulis sebagai sRGB tetapi dibaca linear; tukar supaya ikut warna hex sebenar
def s2l(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
for m in bpy.data.materials:
    k, n = base(m), bsdf(m)
    # bahan yang warnanya ditukar ke linear dalam three.js (pilihan kemasan & gaya) tidak ditukar lagi
    if not n or k in ('wall', 'wallIn', 'col', 'aksen', 'frame', 'louvre', 'door', 'roof', 'cap', 'glass', 'frost') or k in GJ['kunci']: continue
    inp = n.inputs['Base Color']
    if inp.is_linked: continue
    c = inp.default_value; inp.default_value = (s2l(c[0]), s2l(c[1]), s2l(c[2]), 1)

# ---------------- Bevel: bucu lembut ----------------
for o in bpy.data.objects:
    if o.type != 'MESH' or not o.data.materials: continue
    a = ancestors(o); k = base(o.data.materials[0])
    if k in ('glass', 'frost', 'lamp', 'led', 'leaf', 'frond', 'grass', 'asphalt', 'laterite') or 'land' in a and k not in ('cover', 'stainless'): continue
    w = 0.03 if k in ('linen', 'pillow', 'fabric', 'fabric2', 'throwA', 'throwB') else (0.008 if ('furniture' in a or 'sanitary' in a) else 0.004)
    if len(o.data.vertices) > 600: continue
    bv = o.modifiers.new('bevel', 'BEVEL'); bv.width = w; bv.segments = 3 if w > .01 else 2; bv.limit_method = 'ANGLE'
    o.data.shade_smooth() if w > .01 else None

# ---------------- Lampu ----------------
def warm(): return (1.0, 0.8, 0.6)
lights = bpy.data.collections.new('lampu'); sc.collection.children.link(lights)
for o in list(bpy.data.objects):
    nm = o.name.split('.')[0]
    if nm == 'DL' and o.type == 'EMPTY':
        p = o.matrix_world.translation
        L = bpy.data.lights.new('dl', 'SPOT'); L.energy = 45; L.color = warm(); L.spot_size = math.radians(110); L.spot_blend = 0.9; L.shadow_soft_size = 0.04
        lo = bpy.data.objects.new('dl', L); lo.location = (p.x, p.y, p.z - 0.03); lights.objects.link(lo)
    elif nm == 'WL' and o.type == 'EMPTY':
        p = o.matrix_world.translation
        L = bpy.data.lights.new('wl', 'POINT'); L.energy = 18; L.color = warm(); L.shadow_soft_size = 0.05
        lo = bpy.data.objects.new('wl', L); lo.location = (p.x, p.y, p.z); lights.objects.link(lo)

# ---------------- Langsir di pelmet (D4001: ruang tamu, ruang makan, Bilik 1) ----------------
FFL = 0.5; CEIL = FFL + 2.85
cmat = bpy.data.materials.new('langsir'); cmat.use_nodes = True
LC = tuple(s2l(int(GJ['langsir'][i:i + 2], 16) / 255) for i in (1, 3, 5)) + (1,) if GJ['langsir'] else (0.86, 0.83, 0.77, 1)
cb = bsdf(cmat); setp(cb, 'Base Color', LC); setp(cb, 'Roughness', 0.9); setp(cb, 'Sheen Weight', 0.8)
setp(cb, 'Subsurface Weight', 0.0); setp(cb, 'Transmission Weight', 0.25)
def curtain(x1, y1, x2, y2, inward):
    """Dua langsir terbuka di hujung pelmet; inward = arah ke dalam bilik (dx, dy)."""
    L = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / L, (y2 - y1) / L
    for s0, s1 in ((0, 0.42), (L - 0.42, L)):
        bm = bmesh.new(); cols = 24; rows = 2; verts = []
        for j in range(rows):
            z = FFL + 0.02 if j == 0 else CEIL - 0.07
            row = []
            for i in range(cols + 1):
                s = s0 + (s1 - s0) * i / cols; a = 0.035 * math.sin(i * math.pi / 2)
                row.append(bm.verts.new((x1 + ux * s + inward[0] * (0.09 + a), y1 + uy * s + inward[1] * (0.09 + a), z)))
            verts.append(row)
        for i in range(cols): bm.faces.new((verts[0][i], verts[0][i + 1], verts[1][i + 1], verts[1][i]))
        me = bpy.data.meshes.new('langsir'); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new('langsir', me); ob.data.materials.append(cmat); sc.collection.objects.link(ob)
        sol = ob.modifiers.new('tebal', 'SOLIDIFY'); sol.thickness = 0.004
        ob.data.shade_smooth()
curtain(8.5, 7.725, 12.2, 7.725, (0, -1)); curtain(5.2, 7.725, 8.3, 7.725, (0, -1))
curtain(12.3, 0.075, 14.7, 0.075, (0, 1)); curtain(14.925, 0.8, 14.925, 3.1, (-1, 0))

# ---------------- Rumput (rumpun berinstans) ----------------
def clump():
    bm = bmesh.new()
    for b in range(9):
        a = random.random() * 6.283; r = random.random() * 0.03; h = 0.06 + random.random() * 0.08; w = 0.006
        bx, by = r * math.cos(a), r * math.sin(a); lean = random.random() * 0.03; la = random.random() * 6.283
        v1 = bm.verts.new((bx - w * math.sin(a), by + w * math.cos(a), 0)); v2 = bm.verts.new((bx + w * math.sin(a), by - w * math.cos(a), 0))
        v3 = bm.verts.new((bx + lean * math.cos(la), by + lean * math.sin(la), h)); bm.faces.new((v1, v2, v3))
    me = bpy.data.meshes.new('rumpun'); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('rumpun', me); sc.collection.objects.link(ob); return ob
gmat = bpy.data.materials.new('rumput'); gmat.use_nodes = True; gn = gmat.node_tree; gb = bsdf(gmat)
oi = gn.nodes.new('ShaderNodeObjectInfo'); ramp = gn.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.10, 0.20, 0.04, 1); ramp.color_ramp.elements[1].color = (0.30, 0.38, 0.10, 1)
gn.links.new(oi.outputs['Random'], ramp.inputs['Fac']); gn.links.new(ramp.outputs['Color'], gb.inputs['Base Color'])
setp(gb, 'Roughness', 0.6); setp(gb, 'Subsurface Weight', 0.2)
clumps = [clump() for _ in range(4)]
ccol = bpy.data.collections.new('rumpun'); sc.collection.children.link(ccol)
for c in clumps:
    c.data.materials.append(gmat); sc.collection.objects.unlink(c); ccol.objects.link(c); c.location = (0, 0, -50)
ccol.hide_render = False
# kawasan rumput: grid 0.5 m, buang apron, rumah, jalan dan kemudahan
LOT = [(-3, 9.322), (23.94, 9.322), (24.534, -6.757), (-3, -2.678)]
def in_poly(x, y, P):
    ins = False; j = len(P) - 1
    for i in range(len(P)):
        xi, yi = P[i]; xj, yj = P[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: ins = not ins
        j = i
    return ins
UTIL = [(-1.97, -0.95, 1.0), (3.01, -1.95, .4), (-1.57, 2.92, .4), (-2.29, 5.12, .4), (-1.97, 8.64, .5), (-1.86, 10.86, 1.0), (0.14, 11.16, .7), (11.59, 12.95, .9)]
def grassy(x, y):
    if -1.05 < x < 17.25 and -1.05 < y < 9.0: return False
    if x > 24.0 and x < 28.6: return False                      # jalan berturap (≈)
    # jalan dalam di luar sempadan timur
    d = (y - (-2.678 + (x + 3) * (-4.079 / 27.534)))
    if -3.6 < d < -0.3: return False
    for ux, uy, r in UTIL:
        if math.hypot(x - ux, y - uy) < r + .25: return False
    return True
bm = bmesh.new(); step = 0.5
xs = [-14 + i * step for i in range(int(56 / step))]; ys = [-24 + j * step for j in range(int(50 / step))]
for x in xs:
    for y in ys:
        cx, cy = x + step / 2, y + step / 2
        if not grassy(cx, cy): continue
        v = [bm.verts.new((x, y, 0.004)), bm.verts.new((x + step, y, 0.004)), bm.verts.new((x + step, y + step, 0.004)), bm.verts.new((x, y + step, 0.004))]
        bm.faces.new(v)
me = bpy.data.meshes.new('laman'); bm.to_mesh(me); bm.free()
lawn = bpy.data.objects.new('laman', me); sc.collection.objects.link(lawn)
area = sum(p.area for p in lawn.data.polygons)
ps = lawn.modifiers.new('rumput', 'PARTICLE_SYSTEM').particle_system.settings
ps.type = 'HAIR'; ps.use_advanced_hair = True; ps.count = int(area * 70); ps.hair_length = 1.0
ps.render_type = 'COLLECTION'; ps.instance_collection = ccol; ps.use_collection_pick_random = True
ps.particle_size = 1.0; ps.size_random = 0.5; ps.use_rotations = True; ps.rotation_mode = 'NONE'; ps.phase_factor_random = 2.0
ps.use_whole_collection = False
lawn.show_instancer_for_render = False

# ---------------- Daun pokok (instans pada kanopi) ----------------
def leaf_mesh():
    bm = bmesh.new(); pts = [(0, 0), (0.03, 0.02), (0.07, 0.025), (0.11, 0.0), (0.07, -0.025), (0.03, -0.02)]
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]; bm.faces.new(vs)
    me = bpy.data.meshes.new('daun'); bm.to_mesh(me); bm.free(); return me
lmat = bpy.data.materials.new('daun'); lmat.use_nodes = True; ln = lmat.node_tree; lb = bsdf(lmat)
oi2 = ln.nodes.new('ShaderNodeObjectInfo'); r2 = ln.nodes.new('ShaderNodeValToRGB')
r2.color_ramp.elements[0].color = (0.04, 0.12, 0.03, 1); r2.color_ramp.elements[1].color = (0.16, 0.30, 0.06, 1)
ln.links.new(oi2.outputs['Random'], r2.inputs['Fac']); ln.links.new(r2.outputs['Color'], lb.inputs['Base Color'])
setp(lb, 'Roughness', 0.45); setp(lb, 'Transmission Weight', 0.15)
lcol = bpy.data.collections.new('daun'); sc.collection.children.link(lcol)
lf = bpy.data.objects.new('daun', leaf_mesh()); lf.data.materials.append(lmat); lcol.objects.link(lf); lf.location = (0, 0, -60)
for o in list(bpy.data.objects):
    if o.type != 'MESH' or not o.data.materials or base(o.data.materials[0]) != 'leaf': continue
    if 'far_trees' in ancestors(o): continue
    mod = o.modifiers.new('daun', 'PARTICLE_SYSTEM'); s = mod.particle_system.settings
    s.type = 'HAIR'; s.use_advanced_hair = True; s.count = 1400; s.hair_length = 1.0; s.render_type = 'OBJECT'; s.instance_object = lf
    s.particle_size = 1.4; s.size_random = 0.5; s.use_rotations = True; s.rotation_mode = 'NOR'; s.rotation_factor_random = 0.6; s.phase_factor_random = 2.0
    o.show_instancer_for_render = False
for o in bpy.data.objects:
    if o.type == 'MESH' and 'far_trees' in ancestors(o):
        n = bsdf(o.data.materials[0]) if o.data.materials else None
        setp(n, 'Base Color', (0.06, 0.12, 0.05, 1)); setp(n, 'Roughness', 0.9)

# ---------------- Langit & matahari ----------------
world = bpy.data.worlds.new('langit'); sc.world = world; world.use_nodes = True
wn = world.node_tree; bg = wn.nodes['Background']; sky = wn.nodes.new('ShaderNodeTexSky')
for t in ('MULTIPLE_SCATTERING', 'NISHITA'):
    try: sky.sky_type = t; break
    except Exception: pass
sky.sun_disc = False; sky.altitude = 30; sky.air_density = 1.0; sky.aerosol_density = 1.5; sky.ozone_density = 1.0
wn.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.25
sunL = bpy.data.lights.new('matahari', 'SUN'); sunL.angle = math.radians(0.55)
sun = bpy.data.objects.new('matahari', sunL); sc.collection.objects.link(sun)

# ---------------- Kamera ----------------
def cam(name, pos, look, lens=24, pano=False):
    c = bpy.data.cameras.new(name); o = bpy.data.objects.new(name, c); sc.collection.objects.link(o)
    o.location = pos
    if pano:
        c.type = 'PANO'
        try: c.panorama_type = 'EQUIRECTANGULAR'
        except Exception: c.cycles.panorama_type = 'EQUIRECTANGULAR'
        o.rotation_euler = (math.radians(90), 0, math.radians(-90))
    else:
        c.lens = lens; c.sensor_width = 36
        d = Vector(look) - Vector(pos); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        c.shift_y = 0.0
    c.clip_start = 0.05; c.clip_end = 600
    return o
cam('luar_pagi', (24.0, -9.0, 1.7), (10.0, 3.2, 2.0), 26)
cam('luar_jalan', (26.0, 6.2, 1.6), (13.0, 4.6, 2.3), 26)
cam('luar_udara', (31.0, -15.0, 17.0), (8.6, 3.6, 0.8), 40)
cam('luar_senja', (22.5, -7.0, 1.6), (9.5, 3.4, 2.0), 26)
cam('lanai_petang', (19.6, 7.4, 1.55), (13.5, 4.6, 1.8), 22)
cam('dalam_tamu', (11.95, 7.3, 1.5), (5.6, 5.0, 1.15), 16)
cam('dalam_bilik1', (14.7, 0.4, 1.55), (11.6, 3.2, 1.05), 16)
cam('dalam_dapur', (3.7, 4.2, 1.6), (2.7, 7.5, 1.1), 14)
cam('dalam_bilikair1', (10.8, 1.65, 1.7), (9.55, 0.15, 1.05), 14)
cam('p_tamu', (8.4, 5.55, 2.05), None, pano=True)
cam('p_bilik1', (12.75, 1.55, 2.05), None, pano=True)
cam('p_dapur', (3.35, 5.6, 2.1), None, pano=True)
cam('p_lanai', (14.35, 6.0, 2.0), None, pano=True)

# ---------------- Tetapan render ----------------
sc.render.engine = 'CYCLES'
cy = sc.cycles; cy.device = 'CPU'; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.02
cy.use_denoising = True
try: cy.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
cy.max_bounces = 8; cy.diffuse_bounces = 4; cy.glossy_bounces = 4; cy.transmission_bounces = 8; cy.transparent_max_bounces = 16
cy.caustics_reflective = False; cy.caustics_refractive = False; cy.sample_clamp_indirect = 8
try: cy.use_light_tree = True
except Exception: pass
sc.render.use_persistent_data = True
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 88
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'banglo' + ('_' + GY if GY else '') + '.blend'))
print('SIAP', len(bpy.data.objects), 'objek; rumput', ps.count)
