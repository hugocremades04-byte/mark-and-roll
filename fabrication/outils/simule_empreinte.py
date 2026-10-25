"""Simule l'empreinte laissée par une roue (STL) qui roule sur une surface plane.

La roue est lue dans son orientation d'impression (axe Z). On la place axe selon X
comme dans l'assemblage, puis on reporte chaque facette du sommet du relief à sa
position sur le support : X = position axiale, Y = R * angle de roulement.
L'image est vue de dessus (comme quelqu'un qui regarde le carton tamponné).
"""
import sys
import numpy as np
import trimesh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection

stl, diametre, sortie = sys.argv[1], float(sys.argv[2]), sys.argv[3]
R = diametre / 2
m = trimesh.load(stl)
v = m.vertices.copy()
# même rotation que l'assemblage : rotate([0,90,0]) -> (x, y, z) -> (z, y, -x)
v = np.column_stack([v[:, 2], v[:, 1], -v[:, 0]])
rayon = np.hypot(v[:, 1], v[:, 2])
faces = m.faces[(rayon[m.faces] > R - 0.05).all(axis=1)]
phi = np.arctan2(v[:, 1], -v[:, 2])          # angle de roulement
X = v[:, 0]
X = X - (X.min() + X.max()) / 2              # bande centrée
polys = []
for f in faces:
    p = phi[f]
    if p.max() - p.min() > np.pi:            # facette à cheval sur la jointure
        p = np.where(p < 0, p + 2 * np.pi, p)
    Y = R * p
    # vue de dessus : horizontal = Y (sens de roulement), vertical = -X
    polys.append(np.column_stack([Y, -X[f]]))
C = np.pi * diametre
fig, ax = plt.subplots(figsize=(min(18, C / 12), 2.2), dpi=110)
ax.add_collection(PolyCollection(polys, facecolors="black", edgecolors="black", linewidths=0.2))
ax.set_xlim(-C / 2 - 2, C / 2 + 2)
ax.set_ylim(-10, 10)
ax.set_aspect("equal")
ax.set_title(f"Empreinte simulée — roue Ø{diametre:g} mm (1 tour = {C:.0f} mm)", fontsize=9)
ax.axis("off")
fig.savefig(sortie, bbox_inches="tight")
print("facettes de contact :", len(faces), "| largeur imprimée (mm) :", round(np.ptp(X[faces.ravel()]), 2),
      "| rayon max :", round(rayon.max(), 3))
