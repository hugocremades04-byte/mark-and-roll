#!/usr/bin/env bash
# Génère les STL du rouleau Grand format (Large 30 mm et XL 50 mm) + deux rouleaux d'exemple
set -euo pipefail
cd "$(dirname "$0")/.."
OPENSCAD=${OPENSCAD:-openscad}
mkdir -p stl_large
for f in "30 50" "50 64"; do
  set -- $f
  for p in manche noyau_encreur; do
    $OPENSCAD --backend=manifold -D "piece=\"$p\"" -D largeur_bande=$1 -D diametre_rouleau=$2 -o "stl_large/${p}_$1mm.stl" rouleau_large.scad
  done
done
$OPENSCAD --backend=manifold -D 'piece="molette"' -o stl_large/molette_x2.stl rouleau_large.scad
$OPENSCAD --backend=manifold -D 'piece="rouleau"' -D largeur_bande=30 -D diametre_rouleau=50 -D 'texte="ATELIER LUNA"' -o stl_large/rouleau_30mm_texte.stl rouleau_large.scad
$OPENSCAD --backend=manifold -D 'piece="rouleau"' -D largeur_bande=50 -D diametre_rouleau=64 -D 'logo_svg="exemples/citron.svg"' -D ratio_logo=1.5 -D 'separateur="point"' -o stl_large/rouleau_50mm_dessin.stl rouleau_large.scad
# Nettoyage : retire les éclats d'épaisseur nulle que l'union peut laisser
python3 outils/nettoie_stl.py stl_large/*.stl
