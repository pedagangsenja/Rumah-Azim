# Render satu atau lebih syot daripada banglo.blend
# Guna: python render.py <syot>[,<syot>...] [--uji] [--gaya=<id>] [--spp=<n>]  (gaya: banglo_<id>.blend → out/gaya/<id>/)
import bpy, math, os, sys, datetime, time
from mathutils import Vector

D = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
shots = argv[0].split(',') if argv else []
TEST = '--uji' in argv
SKYROT = float(next((a.split('=')[1] for a in argv if a.startswith('--skyrot=')), '0'))
GY = next((a.split('=')[1] for a in argv if a.startswith('--gaya=')), '')
SPP = int(next((a.split('=')[1] for a in argv if a.startswith('--spp=')), '0'))   # 0 = sampel lalai syot
bpy.ops.wm.open_mainfile(filepath=os.path.join(D, 'banglo' + ('_' + GY if GY else '') + '.blend'))
sc = bpy.context.scene

# Kedudukan matahari: Kangar ≈ 6.44° U, 100.19° T, UTC+8, tarikh 23 Okt 2026 (sama seperti model web)
LAT = math.radians(6.44); LON = 100.19; TZ = 8
UTARA = 8.9   # darjah: utara sebenar dari paksi +x pelan ke arah +y (Google Earth); sama dengan UTARA dalam js/data.js
def sun_at(hour, day=datetime.date(2026, 10, 23)):
    N = (day - datetime.date(day.year, 1, 1)).days + 1
    B = 2 * math.pi * (N - 81) / 364; eot = 9.87 * math.sin(2 * B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)
    solar = hour + (eot + 4 * (LON - 15 * TZ)) / 60
    dec = math.radians(23.44) * math.sin(2 * math.pi * (284 + N) / 365); H = math.radians((solar - 12) * 15)
    alt = math.asin(math.sin(LAT) * math.sin(dec) + math.cos(LAT) * math.cos(dec) * math.cos(H))
    az = math.acos(max(-1, min(1, (math.sin(dec) - math.sin(alt) * math.sin(LAT)) / (math.cos(alt) * math.cos(LAT)))))
    if H > 0: az = 2 * math.pi - az
    return alt, az

SHOTS = {
  # nama: (jam, lebar, tinggi, sampel, dedahan)
  'luar_pagi': (8.0, 1600, 900, 160, 0.0),
  'luar_jalan': (12.75, 1600, 900, 128, -0.3),
  'luar_udara': (11.5, 1600, 900, 128, -0.3),
  'luar_senja': (19.2, 1600, 900, 192, 1.3),
  'lanai_petang': (17.25, 1600, 900, 160, 0.2),
  'dalam_tamu': (16.5, 1600, 900, 128, 0.6),
  'dalam_bilik1': (16.5, 1600, 900, 128, 0.7),
  'dalam_dapur': (12.5, 1600, 900, 128, 0.5),
  'dalam_bilikair1': (12.5, 1600, 900, 128, 0.6),
  'p_tamu': (16.5, 3072, 1536, 128, 0.6),
  'p_bilik1': (16.5, 3072, 1536, 128, 0.7),
  'p_dapur': (12.5, 3072, 1536, 128, 0.5),
  'p_lanai': (17.25, 3072, 1536, 128, 0.3),
}

world = sc.world; sky = next(n for n in world.node_tree.nodes if n.type == 'TEX_SKY')
sun = bpy.data.objects['matahari']
def set_time(hour):
    alt, az = sun_at(hour)
    r = az - math.radians(UTARA)
    d = Vector((math.cos(r) * math.cos(alt), -math.sin(r) * math.cos(alt), math.sin(alt)))   # arah ke matahari (Blender); utara = +x diputar UTARA° ke +y
    sun.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    a = math.degrees(alt)
    sun.data.energy = max(0.0, min(1.0, (a + 1) / 6)) * 4.2
    sun.data.color = (1.0, 0.72 + 0.28 * min(1, max(0, a / 30)), 0.5 + 0.5 * min(1, max(0, a / 35)))
    sky.sun_elevation = max(alt, math.radians(-4)); sky.sun_rotation = (math.atan2(d.x, d.y) + math.radians(SKYROT)) % (2 * math.pi)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25 if a > 2 else 0.6
    return a

OUT = os.path.join(D, 'out', 'gaya', GY) if GY else os.path.join(D, 'out')
os.makedirs(OUT, exist_ok=True)
for name in shots:
    hour, w, h, spp, ev = SHOTS[name]
    a = set_time(hour)
    sc.camera = bpy.data.objects[name]
    sc.render.resolution_x, sc.render.resolution_y = (w // 4, h // 4) if TEST else (w, h)
    sc.render.resolution_percentage = 100
    sc.cycles.samples = 24 if TEST else (SPP or spp)
    sc.view_settings.exposure = ev
    sc.render.filepath = os.path.join(OUT, name + ('_uji' if TEST else '') + '.jpg')
    t = time.time(); bpy.ops.render.render(write_still=True)
    print(f'SYOT {name} matahari {a:.1f}° {time.time() - t:.0f}s -> {sc.render.filepath}', flush=True)
