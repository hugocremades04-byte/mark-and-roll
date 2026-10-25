// =====================================================================
//  ROULEAU TAMPON GRAND FORMAT (bande de 30 ou 50 mm), v1
//  Pour les logos détaillés, les dessins et les motifs continus.
//
//  Principe : un rouleau gravé en TPU tourne contre un rouleau encreur en
//  mousse (manchon du commerce). La mousse dépose l'encre sur le relief,
//  le relief l'imprime sur le carton ou le tissu.
//
//  Pièces imprimées :
//   - manche        : poignée + fourche d'une seule pièce (PETG), imprimée
//                     poignée en bas, sans support
//   - rouleau       : rouleau gravé en miroir (TPU 95A)
//   - noyau_encreur : noyau qui porte le manchon de mousse (PETG)
//   - molette       : écrou moleté qui serre un axe à la main (PETG), x2
//
//  Quincaillerie : 2 vis M5 (longueur affichée dans la console), 2 écrous M5,
//  1 manchon de mousse Ø25 mm (alésage 12 mm) recoupé à la largeur de bande + 2 mm.
//
//  Montage : vis M5 depuis l'extérieur d'un bras, à travers le rouleau gravé,
//  puis le second bras, molette serrée à la main. Même chose pour le noyau
//  encreur dans la lumière oblongue : on règle la pression de la mousse en
//  faisant glisser l'axe avant de serrer. Changement de rouleau sans outil.
//
//  Logiciel : OpenSCAD (version de développement, rendu « Manifold »).
// =====================================================================

/* [Pièce à générer] */
piece = "assemblage"; // [assemblage, manche, rouleau, noyau_encreur, molette]
// (pièces m_* : composants placés en position d'usage, pour les rendus)

/* [Format] */
// Hauteur imprimée : 30 (Large) ou 50 (XL)
largeur_bande = 30; // [30, 50]
// Diamètre du rouleau gravé au sommet du relief : 50 (Large) ou 64 (XL)
diametre_rouleau = 50;

/* [Motif] */
// Texte gravé (ignoré si un logo SVG est indiqué)
texte = "VOTRE MARQUE";
police = "Liberation Sans:style=Bold";
// Taille de police maximale en mm (0 = automatique selon la bande)
taille_texte = 0;
// Compression horizontale des lettres
condenser = 0.85;
// Nombre de répétitions sur le tour (0 = automatique)
repetitions = 0;
separateur = "etoile"; // [etoile, point, coeur, aucun]
// Chemin d'un logo ou dessin SVG (vide = texte)
logo_svg = "";
// Hauteur du logo en mm (0 = bande moins 4 mm)
hauteur_logo = 0;
// Rapport largeur / hauteur du logo (donné par la boutique, 3 par défaut)
ratio_logo = 3;
// Profondeur du relief (1,8 carton ; 2,2 textile)
profondeur_relief = 1.8;

/* [Encreur] */
diametre_mousse = 25;
alesage_mousse = 12;
// Écrasement de la mousse contre le relief (réglable au montage de 0 à 3 mm)
compression_mousse = 1.5;

/* [Personnalisation du manche] */
texte_manche = "";
taille_texte_manche = 7;

/* [Mécanique] */
diametre_vis = 5;
jeu_vis = 0.4;
// Jeu latéral entre le rouleau et chaque bras
jeu_lateral = 0.6;
epaisseur_bras = 5;
longueur_poignee = 95;

/* [Qualité] */
pas_tranche = 0.4;
$fn = 96;

// ------------------------------------------------------------------
//  Grandeurs dérivées
// ------------------------------------------------------------------
W   = largeur_bande;
R   = diametre_rouleau / 2;
Rc  = R - profondeur_relief;
C   = PI * diametre_rouleau;
Wr  = W + 4;                           // largeur du rouleau (épaulements de 2 mm)
Wi  = Wr + 2 * jeu_lateral;            // écart intérieur entre les bras
xb  = Wi / 2;                          // face intérieure d'un bras
Xe  = xb + epaisseur_bras;             // face extérieure
Rf  = diametre_mousse / 2;
d_enc = R + Rf - compression_mousse;   // entraxe rouleau / encreur
theta = 28;                            // encreur incliné vers l'arrière
ye  = -d_enc * sin(theta);
ze  =  d_enc * cos(theta);
course = 3;                            // longueur de réglage de la lumière
z_pont = ze + Rf + 3;                  // dessous du pont
h_pont = 7;
r_poignee = 15;
vis_long = 2 * Xe + 10;
dv = diametre_vis + jeu_vis;

h_auto = W * 0.78;
taille = taille_texte > 0 ? taille_texte : h_auto;
h_logo = hauteur_logo > 0 ? hauteur_logo : W - 4;
tm = textmetrics(texte, size = taille, font = police);
largeur_brute = is_undef(tm) ? len(texte) * 0.92 * taille : tm.size[0];
hauteur_brute = is_undef(tm) ? taille * 1.25 : tm.size[1];
largeur_motif = (logo_svg != "") ? h_logo * ratio_logo : largeur_brute * condenser;
reps = repetitions > 0 ? repetitions : max(1, round(C / (largeur_motif + 10)));
segment = C / reps;
echelle = min(1, (segment - 10) / largeur_motif, (W - 1) / hauteur_brute);
k_sep = W / 13.5 * 0.6;

echo(str("Rouleau ", W, " mm, Ø", diametre_rouleau, " : 1 tour = ", round(C), " mm, ",
         reps, " répétition(s) de ", round(segment), " mm"));
echo(str("Vis M5 conseillées : 2 x M5 x ", ceil(vis_long / 5) * 5, " mm"));
echo(str("Manchon de mousse : Ø", diametre_mousse, " x ", W + 2, " mm, alésage ", alesage_mousse, " mm"));

// ------------------------------------------------------------------
//  Motif 2D (miroir pour que l'empreinte se lise à l'endroit)
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
        resize([0, h_logo], auto = true) import(logo_svg, center = true);
    else
        scale([condenser * echelle, echelle])
            text(texte, size = taille, font = police, halign = "center", valign = "center");
}
module motif_lineaire() {
    for (k = [0 : reps - 1]) {
        translate([segment * (k + 0.5), 0]) mirror([1, 0]) element();
        if (separateur == "etoile") translate([segment * k, 0]) scale(k_sep) etoile();
        if (separateur == "point")  translate([segment * k, 0]) circle(r = 1.6 * k_sep);
        if (separateur == "coeur")  translate([segment * k, 0]) scale(k_sep) coeur();
    }
}
module motif_enroule() { for (k = [-1 : 1]) translate([k * C, 0]) motif_lineaire(); }

// ------------------------------------------------------------------
//  Rouleau gravé (impression : axe vertical, voile en bas)
// ------------------------------------------------------------------
module noyau_rouleau() {
    ch = 0.6; jante = 3.5; moyeu = 6.5; voile = 3;
    rotate_extrude() union() {
        polygon([[Rc - jante, 0], [Rc - ch, 0], [Rc, ch], [Rc, Wr - ch], [Rc - ch, Wr], [Rc - jante, Wr]]);
        square([moyeu, Wr]);
        square([Rc - jante + 0.01, voile]);
    }
    // nervures entre moyeu et jante
    for (a = [0 : 60 : 359]) rotate(a) translate([moyeu - 0.5, -1.2, 0]) cube([Rc - jante - moyeu + 1, 2.4, Wr * 0.55]);
}
module relief() {
    n = ceil(C / pas_tranche);
    w = C / n;
    wr = w + 0.05;
    b0 = (Wr - W) / 2;
    for (i = [0 : n - 1]) {
        u = i * w + w / 2;
        rotate([0, 0, u / R * 180 / PI])
            translate([Rc - 0.4, 0, 0])
                multmatrix([[0, 0, 1, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1]])
                    linear_extrude(R - Rc + 0.4)
                        intersection() {
                            translate([-wr / 2, b0]) square([wr, W]);
                            translate([-u, Wr / 2]) motif_enroule();
                        }
    }
}
module rouleau() {
    difference() {
        union() { noyau_rouleau(); relief(); }
        translate([0, 0, -1]) cylinder(d = dv + 0.2, h = Wr + 2, $fn = 48);
    }
}

// ------------------------------------------------------------------
//  Noyau encreur (impression debout)
// ------------------------------------------------------------------
module noyau_encreur() {
    difference() {
        union() {
            cylinder(d = alesage_mousse + 0.4, h = Wr);
            cylinder(d = alesage_mousse + 4, h = 1);
            translate([0, 0, Wr - 1]) cylinder(d = alesage_mousse + 4, h = 1);
        }
        translate([0, 0, -1]) cylinder(d = dv + 0.2, h = Wr + 2, $fn = 48);
    }
}

// ------------------------------------------------------------------
//  Molette (écrou moleté M5)
// ------------------------------------------------------------------
module molette() {
    difference() {
        union() {
            cylinder(d = 20, h = 8, $fn = 20);
            for (a = [0 : 30 : 359]) rotate(a) translate([10, 0, 0]) cylinder(d = 3, h = 8, $fn = 16);
        }
        translate([0, 0, -1]) cylinder(d = dv, h = 10, $fn = 40);
        translate([0, 0, 8 - 4.2]) cylinder(d = 8.1 / cos(30), h = 5, $fn = 6);
    }
}

// ------------------------------------------------------------------
//  Manche (repère d'usage : rouleau en bas, axe du rouleau sur X)
// ------------------------------------------------------------------
module profil_bras() {   // dans le plan YZ
    hull() {
        circle(r = 7.5);
        translate([ye, ze]) circle(r = 7.5);
        translate([ye - 9, z_pont]) square([abs(ye) + 18, 0.01]);
    }
}
module lumiere_encreur() {   // oblong le long de l'entraxe
    hull() for (s = [-course / 2, course / 2])
        translate([ye * (1 + s / d_enc), ze * (1 + s / d_enc)]) circle(d = dv);
}
module bras(cote) {
    difference() {
        translate([cote > 0 ? xb : -Xe, 0, 0]) rotate([90, 0, 90]) linear_extrude(epaisseur_bras) profil_bras();
        translate([-50, 0, 0]) rotate([0, 90, 0]) cylinder(d = dv, h = 100, $fn = 40);
        translate([-50, 0, 0]) rotate([90, 0, 90]) linear_extrude(100) lumiere_encreur();
    }
}
y_c = ye / 2;
module pont() {
    translate([-Xe, ye - 9, z_pont]) cube([2 * Xe, abs(ye) + 18, h_pont]);
}
h_evase = max(10, Xe - r_poignee, (abs(ye) + 18) / 2 - r_poignee);
module evasement() {
    hull() {
        translate([-Xe, ye - 9, z_pont + h_pont - 0.01]) cube([2 * Xe, abs(ye) + 18, 0.01]);
        translate([0, y_c, z_pont + h_pont + h_evase]) cylinder(r = r_poignee, h = 0.01);
    }
}
module poignee() {
    z0 = z_pont + h_pont + h_evase;
    L = longueur_poignee;
    // bout plat (r - 5) pour poser la poignée sur le plateau à l'impression
    translate([0, y_c, z0]) rotate_extrude() hull() {
        square([r_poignee, 1]);
        translate([0, L * 0.35]) square([r_poignee - 1.2, 1]);
        translate([0, L * 0.7]) square([r_poignee + 1.5, 1]);
        translate([0, L - 6]) square([r_poignee, 0.01]);
        translate([0, L - 0.01]) square([r_poignee - 5, 0.01]);
    }
}
module texte_grave_manche() {
    if (texte_manche != "")
        translate([Xe - 0.6, ye / 2, ze / 2 + 4]) rotate([90, 0, 90]) linear_extrude(1)
            text(texte_manche, size = taille_texte_manche, font = police, halign = "center", valign = "center");
}
module manche_usage() {
    difference() {
        union() { bras(1); bras(-1); pont(); evasement(); poignee(); }
        texte_grave_manche();
    }
}
// Orientation d'impression : poignée posée sur le plateau
module manche() {
    z_haut = z_pont + h_pont + h_evase + longueur_poignee;
    translate([0, 0, z_haut]) rotate([180, 0, 0]) manche_usage();
}

// ------------------------------------------------------------------
module assemblage() {
    color("#1f1f1f") manche_usage();
    color("#ff6a1a") translate([-Wr / 2, 0, 0]) rotate([0, 90, 0]) rouleau();
    color("#555") translate([-Wr / 2, ye, ze]) rotate([0, 90, 0]) noyau_encreur();
    color("#d9d6cf", 0.9) translate([-(W + 2) / 2, ye, ze]) rotate([0, 90, 0])
        difference() { cylinder(d = diametre_mousse, h = W + 2); translate([0, 0, -1]) cylinder(d = alesage_mousse, h = W + 4); }
    color("#2a2a2a") for (p = [[0, 0], [ye, ze]]) translate([Xe, p[0], p[1]]) rotate([0, 90, 0]) molette();
}

if (piece == "manche")        manche();
if (piece == "rouleau")       rouleau();
if (piece == "noyau_encreur") noyau_encreur();
if (piece == "molette")       molette();
if (piece == "assemblage")    assemblage();
if (piece == "m_manche")      manche_usage();
if (piece == "m_rouleau")     translate([-Wr / 2, 0, 0]) rotate([0, 90, 0]) rouleau();
if (piece == "m_noyau")       translate([-Wr / 2, ye, ze]) rotate([0, 90, 0]) noyau_encreur();
if (piece == "m_mousse")      translate([-(W + 2) / 2, ye, ze]) rotate([0, 90, 0])
                                  difference() { cylinder(d = diametre_mousse, h = W + 2); translate([0, 0, -1]) cylinder(d = alesage_mousse, h = W + 4); }
if (piece == "m_molettes")    for (p = [[0, 0], [ye, ze]]) translate([Xe, p[0], p[1]]) rotate([0, 90, 0]) molette();
if (piece == "m_vis")         for (p = [[0, 0], [ye, ze]]) translate([-Xe - 3.5, p[0], p[1]]) rotate([0, 90, 0]) union() { cylinder(d = 8.5, h = 3.5, $fn = 6); cylinder(d = 5, h = vis_long - 4); }
