#!/usr/bin/env bash
# Génère tous les STL de démonstration à partir de rouleau_tampon.scad
set -euo pipefail
cd "$(dirname "$0")/.."
OPENSCAD=${OPENSCAD:-openscad}
TEXTE=${TEXTE:-VOTRE MARQUE}
mkdir -p stl
for d in 30 60 80; do
  $OPENSCAD --backend=manifold -D "piece=\"roue\""    -D "diametre_roue=$d" -D "texte=\"$TEXTE\"" -o "stl/roue_${d}mm.stl"    rouleau_tampon.scad
  $OPENSCAD --backend=manifold -D "piece=\"support\"" -D "diametre_roue=$d" -o "stl/support_${d}mm.stl" rouleau_tampon.scad
done
$OPENSCAD --backend=manifold -D 'piece="gabarit"' -o stl/gabarit_serrage.stl rouleau_tampon.scad
