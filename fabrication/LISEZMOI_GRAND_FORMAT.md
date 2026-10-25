# Rouleau tampon Grand format (bande de 30 ou 50 mm)

Pour les logos détaillés, les dessins et les motifs continus. Le rouleau gravé tourne contre un rouleau encreur en mousse : la mousse dépose l'encre sur le relief, le relief l'imprime sur le carton ou le tissu. Pas de marqueur, donc aucune limite à 15 mm de large.

| Format | Bande imprimée | Ø rouleau | 1 tour imprime | Motif conseillé |
|---|---|---|---|---|
| Large | 30 mm | 50 mm | 157 mm | logo ou dessin de 26 mm de haut |
| XL | 50 mm | 64 mm | 201 mm | dessin de 46 mm de haut |

## Contenu du dossier

- `rouleau_large.scad` : le modèle paramétrique complet (manche, rouleau gravé, noyau encreur, molette)
- `stl_large/` : les pièces prêtes à trancher, plus deux rouleaux d'exemple (texte 30 mm, dessin de citrons 50 mm)
- `outils/` : génération en lot, nettoyage des STL, aperçu de l'empreinte pour le BAT
- `apercus/` : empreintes simulées des deux rouleaux d'exemple
- `rendus/` : vues 3D (outil complet, rouleau gravé, vue éclatée)

## Pièces à imprimer

| Fichier | Matière | Réglages conseillés |
|---|---|---|
| `manche_30mm.stl` ou `manche_50mm.stl` | PETG | poignée posée sur le plateau, couches 0,2 mm, 4 périmètres, remplissage gyroïde 25 %, **sans support** (évasement à 45°) |
| `rouleau_*.stl` (un par client) | TPU 95A | axe vertical, voile en bas, couches 0,2 mm, 3 périmètres, remplissage 20 %, 20 à 25 mm/s |
| `noyau_encreur_30mm.stl` ou `_50mm.stl` | PETG | debout, 3 périmètres |
| `molette_x2.stl` | PETG | à plat, en imprimer 2, insérer un écrou M5 dans chaque empreinte hexagonale |

Volumes indicatifs : manche 109 cm³ (Large) / 134 cm³ (XL), rouleau gravé 28 à 62 cm³.

## Quincaillerie par kit

- 2 vis M5 : **M5 x 60** (Large) ou **M5 x 80** (XL)
- 2 écrous M5 (dans les molettes)
- 1 manchon de mousse Ø25 mm, alésage 12 mm, recoupé à la largeur de bande + 2 mm (32 ou 52 mm)
- 1 flacon d'encre 30 ml : encre à tampon à base d'eau pour carton et papier, encre textile à tampon pour le tissu (fixation au fer)

## Montage (2 minutes, sans outil)

1. Enfiler le manchon de mousse sur le noyau encreur.
2. Glisser le rouleau gravé entre les deux bras, passer une vis M5 depuis l'extérieur d'un bras, à travers le rouleau puis l'autre bras, serrer une molette à la main. Le rouleau doit tourner librement.
3. Placer le noyau encreur dans la lumière oblongue, passer la seconde vis, faire glisser l'axe jusqu'à ce que la mousse écrase le relief d'environ 1,5 mm, serrer la molette.
4. Déposer 10 à 15 gouttes d'encre sur la mousse, rouler à vide trois tours sur une chute de carton.

Pour changer de rouleau : dévisser la molette du bas, sortir la vis, remplacer le rouleau. Pour renforcer l'encrage quand la mousse s'use, rapprocher l'axe encreur dans la lumière.

## Générer un rouleau client

```bash
# Texte
openscad --backend=manifold -D 'piece="rouleau"' -D largeur_bande=30 -D diametre_rouleau=50 \
  -D 'texte="ATELIER LUNA"' -D 'separateur="etoile"' -o client_rouleau.stl rouleau_large.scad
# Logo ou dessin (SVG noir sur fond transparent, rapport largeur/hauteur fourni par la boutique)
openscad --backend=manifold -D 'piece="rouleau"' -D largeur_bande=50 -D diametre_rouleau=64 \
  -D 'logo_svg="logo_client.svg"' -D ratio_logo=1.5 -D 'separateur="point"' -o client_rouleau.stl rouleau_large.scad
python3 outils/nettoie_stl.py client_rouleau.stl
python3 outils/empreinte_large.py client_rouleau.stl 64 bat_client.png   # aperçu de l'empreinte pour le BAT
```

L'espace atelier de la boutique affiche ces commandes toutes prêtes pour chaque commande (ainsi que le lien du fichier logo envoyé par le client). Le motif est gravé en miroir : l'empreinte se lit à l'endroit, vérifiée par `empreinte_large.py`.

Polices : installez Anton, Archivo Black, DM Serif Display et Caveat Brush (Google Fonts) sur le poste de fabrication, ce sont les 4 polices proposées sur la boutique.

Paramètres utiles : `profondeur_relief` (1,8 carton, 2,2 textile), `repetitions` (0 = automatique), `hauteur_logo` (0 = bande moins 4 mm), `compression_mousse`, `texte_manche` (gravure sur le bras, option à 5 €), `diametre_mousse` et `alesage_mousse` si vous changez de fournisseur de manchons.

## Règles pour les fichiers clients

- Une seule couleur, traits d'au moins 0,6 mm, espaces d'au moins 0,8 mm à l'échelle finale.
- SVG de préférence ; un PNG doit être vectorisé (option à 9 € sur la boutique).
- Les aplats très grands (plus de 15 x 15 mm) encrent moins régulièrement : préférer des contours épais ou une trame.

## Entretien

Rincer le rouleau gravé à l'eau tiède tant que l'encre est fraîche. Ranger l'outil rouleau en l'air ou dans sa boîte pour que la mousse ne sèche pas contre le relief. Le manchon de mousse se remplace en 10 secondes (vendu comme « Rouleau encreur de rechange » sur la boutique).
