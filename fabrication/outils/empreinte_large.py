"""Empreinte d'un rouleau Grand format (STL en orientation d'impression, axe Z) déroulée à plat.
usage : python empreinte_large.py rouleau.stl diametre sortie.png [tours] [couleur]
L'image montre l'empreinte vue de dessus, telle qu'on la lit sur le carton."""
import sys, numpy as np, trimesh
from PIL import Image, ImageDraw, ImageFilter
stl, D, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
tours = float(sys.argv[4]) if len(sys.argv) > 4 else 1.6
coul = sys.argv[5] if len(sys.argv) > 5 else '#2B44E0'
R = D / 2; C = np.pi * D; px = 12
m = trimesh.load(stl); v = m.vertices
r = np.hypot(v[:, 0], v[:, 1])
faces = m.faces[(r[m.faces] > R - 0.05).all(axis=1)]
faces = faces[trimesh.triangles.area(v[faces]) > 2e-3]   # ignore les facettes d'aire nulle laissées par l'union
phi = np.arctan2(v[:, 1], v[:, 0])
z = v[:, 2]; z0, z1 = z.min(), z.max()
Wpx = int(C * tours * px); Hpx = int((z1 - z0) * px) + 20
masque = Image.new('L', (Wpx, Hpx), 0); d = ImageDraw.Draw(masque)
for f in faces:
    p = phi[f].copy()
    if p.max() - p.min() > np.pi: p[p < 0] += 2 * np.pi
    if p.max() - p.min() > 0.2: continue      # facette dégénérée (épaisseur nulle) laissée par l'union
    # le rouleau avance : la surface en contact défile en sens inverse de la rotation -> lecture à l'endroit
    q = -p
    if q.min() < 0: q = q + 2 * np.pi          # même décalage pour toute la facette (pas de coupure à la jointure)
    u = q * R
    for k in range(-1, int(tours) + 2):
        xs = (u + k * C) * px; ys = (z1 - z[f]) * px + 10
        if xs.max() < 0 or xs.min() > Wpx: continue
        d.polygon(list(zip(xs, ys)), fill=255)
rng = np.random.default_rng(3)
a = np.asarray(masque.filter(ImageFilter.GaussianBlur(0.6))).astype(float)
grain = rng.normal(0, 1, a.shape); grain = np.asarray(Image.fromarray(((grain - grain.min()) / np.ptp(grain) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
a = np.clip(a * (0.72 + 0.4 * grain), 0, 255)
c = [int(coul[i:i + 2], 16) for i in (1, 3, 5)]
img = np.zeros(a.shape + (4,), np.uint8); img[..., 0], img[..., 1], img[..., 2] = c; img[..., 3] = a.astype(np.uint8)
Image.fromarray(img, 'RGBA').save(out); print(out, img.shape)
