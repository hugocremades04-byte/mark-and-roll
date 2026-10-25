# Rouleau tampon pour marqueur 15 mm — v1

Support clipsé sur un marqueur Molotow ONE4ALL 627HS (ou le 611EM vide rechargeable) + roue gravée avec votre texte ou logo. La pointe du marqueur encre la roue en continu ; on roule sur le carton, le sac ou le tissu.

## Contenu

| Fichier | Rôle |
|---|---|
| `rouleau_tampon.scad` | Modèle paramétrique (texte, logo, diamètre, cotes du marqueur) |
| `stl/support_30mm.stl`, `_60mm`, `_80mm` | Support (manchon + fourche) pour chaque taille de roue |
| `stl/roue_30mm.stl`, `_60mm`, `_80mm` | Roues de démonstration « VOTRE MARQUE » |
| `stl/gabarit_serrage.stl` | Bague de 20 mm pour valider le serrage sur le marqueur (à imprimer en premier) |
| `apercus/` | Rendus et empreintes simulées |
| `outils/build.sh` | Régénère tous les STL en une commande (`TEXTE="MA BOUTIQUE" ./outils/build.sh`) |
| `outils/simule_empreinte.py` | Vérifie l'empreinte d'une roue (sens de lecture, rendu) |

Visserie : 1 vis M3 × 16 + 1 écrou M3.

## Impression

| Pièce | Matière | Réglages | Orientation |
|---|---|---|---|
| Gabarit | PLA ou PETG | 0,2 mm, 3 parois | debout, patte sur le plateau |
| Support | PETG conseillé (PLA possible) | 0,2 mm, **4 parois**, 20–25 % de remplissage, sans supports | debout, patte de serrage sur le plateau, fourche en haut |
| Roue | **TPU 95A** (meilleure prise d'encre et adhérence) ou PLA/PETG pour le carton | 0,16–0,2 mm, 3 parois, 20 %, vitesse lente en TPU | à plat, voile côté plateau, sans supports |

Si les ergots du support s'affaissent à l'impression, activez les supports uniquement sous les ergots.

## Montage et réglage

1. Imprimez le gabarit et glissez-le sur le marqueur. Trop lâche : `jeu_manchon = 0.2`. Trop dur : `jeu_manchon = 0.6`.
2. Placez l'écrou M3 dans son logement hexagonal, la vis de l'autre côté.
3. Avant la première utilisation, pompez le marqueur **sans le support** jusqu'à ce que la pointe soit chargée.
4. Insérez le marqueur par le bas du manchon, pointe vers la fourche.
5. Écartez légèrement les deux bras et clipsez la roue sur les ergots.
6. Faites glisser le manchon jusqu'à ce que la roue enfonce la pointe d'environ 0,5 mm (la roue doit tourner librement en se chargeant), puis serrez la vis.
7. Faites 2–3 tours sur un brouillon pour charger la roue, puis tamponnez.

Entretien : rincez la roue à l'eau tant que la peinture est fraîche, retirez le support et rebouchez le marqueur après usage.

L'empreinte se lit à l'endroit dans un sens de roulement (et à l'envers dans l'autre) : le texte est gravé en miroir sur la roue, c'est normal.

## Personnaliser une roue

1. Installez OpenSCAD (version de développement « nightly » conseillée : rendu en quelques secondes).
2. Ouvrez `rouleau_tampon.scad`, affichez le panneau **Customizer**.
3. Réglez `piece = roue`, `diametre_roue`, puis `texte` (ou `logo_svg` avec le chemin d'un fichier SVG noir et blanc, et `repetitions`).
4. F6 pour le rendu, F7 pour exporter le STL.

La taille du texte est réduite automatiquement s'il ne tient pas sur le tour ; la console affiche la taille utilisée. Repères : roue 30 mm ≈ 10–12 caractères, 60 mm ≈ 2 × 12, 80 mm ≈ 2 × 15.

Paramètres utiles :

- `profondeur_relief` : 1,8 mm pour le carton, 2,2–2,5 mm pour le textile épais.
- `condenser` : 0,8 donne des lettres hautes et serrées ; 1 donne la police normale.
- `separateur` : `etoile`, `point` ou `aucun`.
- `texte_manchon` : votre marque gravée verticalement sur le manchon.

## Cotes à vérifier sur votre marqueur

Le corps du 627HS fait 29 mm (cote fabricant). Le col et la pointe sont modélisés de façon approximative : mesurez au pied à coulisse avant de lancer une série.

- Le coulissement du manchon s'adapte à une pointe (col compris) qui dépasse de 15 à 40 mm du corps ; au-delà, modifiez `distance_pointe`.
- Sur la roue de 30 mm, les bossages des ergots passent environ 10 mm au-dessus du bout de la pointe. Si le support de pointe du marqueur dépasse plus haut, prenez la roue de 60 mm ou augmentez `distance_pointe`.
- Pour un autre marqueur (Posca PC-17K par exemple), adaptez `diametre_marqueur` et `distance_pointe`.

## Production à la commande

Chaque commande = un STL généré en ligne de commande (quelques secondes) :

```
openscad --backend=manifold -D 'piece="roue"' -D diametre_roue=60 -D 'texte="ATELIER LUNA"' -o roue_client.stl rouleau_tampon.scad
```
