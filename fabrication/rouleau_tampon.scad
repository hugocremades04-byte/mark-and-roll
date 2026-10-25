// =====================================================================
//  ROULEAU TAMPON POUR MARQUEUR 15 mm  —  v1
//  Marqueur visé : Molotow ONE4ALL 627HS (corps Ø29 mm, pointe plate 15 mm)
//  ou le marqueur vide rechargeable Molotow 611EM (même corps).
//
//  Pièces :
//   - support : manchon serré sur le corps du marqueur (vis M3 + écrou)
//               + fourche dont les ergots clipsent la roue (sans outil)
//   - roue    : rouleau gravé en miroir avec votre texte ou logo SVG
//   - gabarit : bague de 20 mm pour tester le serrage avant le support
//
//  Réglage : faites glisser le manchon jusqu'à ce que la roue enfonce
//  la pointe d'environ 0,5 mm, puis serrez la vis M3.
//
//  Logiciel : OpenSCAD (version de développement conseillée, rendu
//  "Manifold" activé = rendu en quelques secondes).
// =====================================================================

/* [Pièce à générer] */
piece = "assemblage"; // [assemblage, support, roue, gabarit]

/* [Roue] */
// Diamètre de la roue (30, 60 ou 80 mm conseillés)
diametre_roue = 60;
// Texte gravé (ignoré si un logo SVG est indiqué)
texte = "VOTRE MARQUE";
police = "Liberation Sans:style=Bold";
// Taille de police maximale en mm (réduite automatiquement si le texte ne tient pas)
taille_texte = 11;
// Compression horizontale des lettres (1 = normale, 0,8 = condensée)
condenser = 0.8;
// Nombre de répétitions sur le tour (0 = automatique)
repetitions = 0;
// Séparateur entre deux répétitions
separateur = "etoile"; // [etoile, point, coeur, aucun]
// Chemin d'un logo SVG (laisser vide pour utiliser le texte)
logo_svg = "";
// Hauteur du logo en mm (≤ hauteur_bande)
hauteur_logo = 11;
// Profondeur du relief en mm (1,8 carton ; 2,2-2,5 textile épais)
profondeur_relief = 1.8;
// Largeur totale de la roue
largeur_roue = 16;
// Hauteur utile du marquage (largeur de pointe 15 mm)
hauteur_bande = 13.5;

/* [Marqueur] */
diametre_marqueur = 29;
// Jeu entre le corps du marqueur et le manchon
jeu_manchon = 0.4;
longueur_manchon = 55;
// Distance haut du manchon -> bout de la pointe au point de contact
distance_pointe = 25;

/* [Axe de la roue] */
diametre_axe = 4;
// Jeu de l'alésage de la roue (TPU : 0,5 ; PLA/PETG : 0,4)
jeu_axe = 0.5;
// Longueur des ergots qui entrent dans la roue (+0,6 de jeu latéral)
longueur_ergot = 3;

/* [Personnalisation du manchon] */
// Texte gravé verticalement sur le manchon (vide = aucun)
texte_manchon = "";
taille_texte_manchon = 6;

/* [Qualité] */
// Largeur des tranches du relief (plus petit = plus fin, plus lent)
pas_tranche = 0.4;
$fn = 96;

// ------------------------------------------------------------------
//  Grandeurs dérivées
// ------------------------------------------------------------------
R   = diametre_roue / 2;              // rayon au sommet du relief
Rc  = R - profondeur_relief;          // rayon du noyau
C   = PI * diametre_roue;             // longueur imprimée par tour
// Mesure du texte (textmetrics sur les versions récentes, estimation sinon)
tm = textmetrics(texte, size = taille_texte, font = police);
largeur_brute = is_undef(tm) ? len(texte) * 0.92 * taille_texte : tm.size[0];
hauteur_brute = is_undef(tm) ? taille_texte * 1.25 : tm.size[1];
largeur_motif = (logo_svg != "") ? hauteur_logo * 3 : largeur_brute * condenser;
reps = repetitions > 0 ? repetitions : max(1, round(C / (largeur_motif + 10)));
segment = C / reps;
// Réduction automatique pour que le texte tienne dans son segment et dans la bande
echelle = min(1, (segment - 10) / largeur_motif, (hauteur_bande - 0.5) / hauteur_brute);

r_in  = (diametre_marqueur + jeu_manchon) / 2;
paroi = 2.5;
r_ext = r_in + paroi;
z_axe = R + distance_pointe;          // hauteur de l'axe au-dessus du manchon
x_joue = largeur_roue / 2 + 0.6;      // face intérieure des ergots
bras_ep = 2.5;                        // épaisseur des bras (souplesse du clip)
bras_l  = 12;                         // largeur des bras
r_bossage = 4.5;
y_vis = r_ext + 3.8;
z_vis = 8;
h_patte = 16;
l_fente = 30;

echo(str("Roue Ø", diametre_roue, " mm : 1 tour = ", round(C), " mm, ",
         reps, " répétition(s) de ", round(segment), " mm"));
if (logo_svg == "")
    echo(str("Taille de police utilisée : ", round(taille_texte * echelle * 10) / 10, " mm",
             echelle < 0.75 ? "  (ATTENTION : texte très réduit, raccourcissez-le ou prenez une roue plus grande)" : ""));

// ------------------------------------------------------------------
//  Motif 2D (en miroir pour que l'empreinte se lise à l'endroit)
// ------------------------------------------------------------------
module etoile(r1 = 3.4, r2 = 1.4) {
    polygon([for (i = [0:9]) let(a = 90 + i * 36, r = (i % 2 == 0) ? r1 : r2) [r * cos(a), r * sin(a)]]);
}

module coeur(r = 1.9) {
    translate([0, -r * 0.35]) union() {
        translate([-r * 0.62, r * 0.55]) circle(r = r * 0.78);
        translate([ r * 0.62, r * 0.55]) circle(r = r * 0.78);
        polygon([[-r * 1.32, r * 0.3], [r * 1.32, r * 0.3], [0, -r * 1.25]]);
    }
}

module element() {
    if (logo_svg != "")
        resize([0, hauteur_logo], auto = true) import(logo_svg, center = true);
    else
        scale([condenser * echelle, echelle])
            text(texte, size = taille_texte, font = police, halign = "center", valign = "center");
}

module motif_lineaire() {
    for (k = [0 : reps - 1]) {
        translate([segment * (k + 0.5), 0]) mirror([1, 0]) element();
        if (separateur == "etoile") translate([segment * k, 0]) etoile();
        if (separateur == "point")  translate([segment * k, 0]) circle(r = 1.6);
        if (separateur == "coeur")  translate([segment * k, 0]) coeur();
    }
}

// Motif recopié de part et d'autre pour gérer la jointure du tour
module motif_enroule() {
    for (k = [-1 : 1]) translate([k * C, 0]) motif_lineaire();
}

// ------------------------------------------------------------------
//  Roue (orientation d'impression : axe vertical, voile en bas)
// ------------------------------------------------------------------
module noyau_roue() {
    ch = 0.6;
    W  = largeur_roue;
    if (diametre_roue <= 40) {
        rotate_extrude()
            polygon([[0, 0], [Rc - ch, 0], [Rc, ch], [Rc, W - ch], [Rc - ch, W], [0, W]]);
    } else {
        jante = 3.5; moyeu = 7; voile = 3;
        rotate_extrude() union() {
            polygon([[Rc - jante, 0], [Rc - ch, 0], [Rc, ch], [Rc, W - ch], [Rc - ch, W], [Rc - jante, W]]);
            square([moyeu, W]);
            square([Rc - jante + 0.01, voile]);
        }
    }
}

// Relief "enroulé" : le motif est découpé en fines tranches,
// chaque tranche est extrudée radialement puis tournée à sa place.
module relief() {
    n = ceil(C / pas_tranche);
    w = C / n;
    wr = w + 0.05;                    // léger recouvrement entre tranches voisines
    b0 = (largeur_roue - hauteur_bande) / 2;
    for (i = [0 : n - 1]) {
        u = i * w + w / 2;
        rotate([0, 0, u / R * 180 / PI])
            translate([Rc - 0.4, 0, 0])
                multmatrix([[0, 0, 1, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1]])
                    linear_extrude(R - Rc + 0.4)
                        intersection() {
                            translate([-wr / 2, b0]) square([wr, hauteur_bande]);
                            translate([-u, largeur_roue / 2]) motif_enroule();
                        }
    }
}

module roue() {
    difference() {
        union() { noyau_roue(); relief(); }
        translate([0, 0, -1]) cylinder(d = diametre_axe + jeu_axe, h = largeur_roue + 2, $fn = 48);
    }
}

// ------------------------------------------------------------------
//  Support (orientation d'impression : manchon vertical, fourche en haut)
// ------------------------------------------------------------------
module bras() {   // côté +x ; l'autre est obtenu par symétrie
    // bras plat (souple en x pour clipser la roue)
    hull() {
        translate([r_in, -bras_l / 2, 0]) cube([bras_ep, bras_l, 0.01]);
        translate([r_in, 0, z_axe]) rotate([0, 90, 0]) cylinder(r = bras_l / 2, h = bras_ep);
    }
    // bossage vers l'intérieur
    translate([x_joue, 0, z_axe]) rotate([0, 90, 0]) cylinder(r = r_bossage, h = r_in - x_joue + 0.5);
    // ergot chanfreiné qui entre dans l'alésage de la roue
    translate([x_joue, 0, z_axe]) rotate([0, -90, 0]) union() {
        cylinder(d = diametre_axe, h = longueur_ergot - 0.8, $fn = 48);
        translate([0, 0, longueur_ergot - 0.8])
            cylinder(d1 = diametre_axe, d2 = diametre_axe - 1.2, h = 0.8, $fn = 48);
    }
}

module texte_grave_manchon() {
    if (texte_manchon != "")
        translate([0, -r_ext + 0.7, -longueur_manchon / 2 - 4])
            multmatrix([[0, -1, 0, 0], [0, 0, -1, 0], [1, 0, 0, 0], [0, 0, 0, 1]])
                linear_extrude(2)
                    text(texte_manchon, size = taille_texte_manchon, font = police,
                         halign = "center", valign = "center");
}

// Manchon + patte de serrage (fente, vis M3, logement d'écrou)
module manchon(h_manchon, avec_bras = true) {
    difference() {
        union() {
            translate([0, 0, -h_manchon]) cylinder(r = r_ext, h = h_manchon);
            translate([-6, r_in + 0.5, -h_manchon]) cube([12, y_vis + 3.8 - r_in - 0.5, h_patte]);
            if (avec_bras) {
                bras();
                mirror([1, 0, 0]) bras();
            }
        }
        translate([0, 0, -h_manchon - 1]) cylinder(r = r_in, h = h_manchon + 2);
        translate([-1, 0, -h_manchon - 1]) cube([2, 40, min(l_fente, h_manchon) + 1]);
        translate([0, y_vis, -h_manchon + z_vis]) rotate([0, 90, 0]) cylinder(d = 3.4, h = 30, center = true, $fn = 32);
        translate([6 - 2.8, y_vis, -h_manchon + z_vis]) rotate([0, 90, 0]) cylinder(d = 6.6, h = 5, $fn = 6);
        if (avec_bras) texte_grave_manchon();
    }
}

module support() { manchon(longueur_manchon, true); }
module gabarit() { translate([0, 0, 20]) manchon(20, false); }

// ------------------------------------------------------------------
//  Marqueur indicatif (cotes de la pointe approximatives)
// ------------------------------------------------------------------
module marqueur_indicatif() {
    z_bout = distance_pointe + 0.5;      // bout de la pointe (enfoncée de 0,5 mm)
    color("white", 0.5) {
        translate([0, 0, z_bout - 28 - 110]) cylinder(d = diametre_marqueur, h = 110);
        translate([0, 0, z_bout - 28]) cylinder(d = 20, h = 18);
        translate([-7.5, -2.5, z_bout - 10]) cube([15, 5, 10]);
    }
}

module assemblage() {
    color("#202020") support();
    color("#3ddc5a") translate([0, 0, z_axe]) rotate([0, 90, 0]) translate([0, 0, -largeur_roue / 2]) roue();
    marqueur_indicatif();
}

// ------------------------------------------------------------------
if (piece == "support")    support();
if (piece == "roue")       roue();
if (piece == "gabarit")    gabarit();
if (piece == "assemblage") assemblage();
