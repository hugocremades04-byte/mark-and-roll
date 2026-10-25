"""Garde le corps principal de chaque STL (supprime les éclats d'épaisseur nulle) et vérifie l'étanchéité."""
import sys, trimesh
for f in sys.argv[1:]:
    m = trimesh.load(f)
    corps = m.split(only_watertight=False)
    if len(corps) > 1:
        m = max(corps, key=lambda b: abs(b.volume))
        m.export(f)
    print(f, 'étanche' if m.is_watertight else 'A VÉRIFIER', '%.1f cm3' % (m.volume / 1000))
