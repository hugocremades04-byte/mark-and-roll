/* Catalogue, prix et fiches de fabrication.
   Module pur, partagé par le navigateur (affichage) et le serveur (calcul qui fait foi). */

export type Usage = 'packaging' | 'textile';
export type Taille = 'S' | 'M' | 'L' | 'L30' | 'XL50';
export type Mode = 'texte' | 'logo';
export type Livraison = 'relais' | 'domicile' | 'express';

export interface Roue {
  usage: Usage;
  mode: Mode;
  texte: string;
  police: string;
  sep: string;
  encre: string;
  logo: string | null;
  logoNom: string;
  ratio: number;
  raster: boolean;
}
export interface OptionsKit {
  roueSup: boolean;
  gravure: boolean;
  gravureTexte: string;
  express: boolean;
  coffret: boolean;
  vecto: boolean;
}
export interface CfgConfig {
  h: string;
  type: 'config';
  taille: Taille;
  qty: number;
  actif: number;
  roues: Roue[];
  sup: Roue;
  opt: OptionsKit;
}
export interface CfgSimple {
  h: string;
  type: 'simple';
  qty: number;
  sel: Record<string, string>;
}
export type Cfg = CfgConfig | CfgSimple;
export interface Ligne {
  cle: string;
  cfg: Cfg;
  qty: number;
  promo?: number;
}

export interface InfoTaille {
  nom: string;
  d: number;
  tour: number;
  bande: number;
  motif: number;
  car: string;
  usage: string;
}
export const TAILLES: Record<Taille, InfoTaille> = {
  S: { nom: 'S', d: 30, tour: 94, bande: 13.5, motif: 11, car: '10 à 12 caractères', usage: 'Logo court, sachets, cartes' },
  M: { nom: 'M', d: 60, tour: 188, bande: 13.5, motif: 11, car: '2 × 12 caractères', usage: 'Logo et slogan, cartons' },
  L: { nom: 'L', d: 80, tour: 251, bande: 13.5, motif: 11, car: '2 × 16 caractères', usage: 'Nom complet et site, grands cartons' },
  L30: { nom: 'Large', d: 50, tour: 157, bande: 30, motif: 26, car: 'Logo ou dessin de 26 mm de haut', usage: 'Logo détaillé, tampon de marque' },
  XL50: { nom: 'XL', d: 64, tour: 201, bande: 50, motif: 46, car: 'Dessin de 46 mm de haut', usage: 'Illustration, motif continu' },
};
export const TAILLES_STD: Taille[] = ['S', 'M', 'L'];
export const TAILLES_LARGE: Taille[] = ['L30', 'XL50'];
export const estLarge = (t: Taille) => t === 'L30' || t === 'XL50';
export const libTaille = (t: Taille) => (estLarge(t) ? `${TAILLES[t].nom}, bande ${TAILLES[t].bande} mm` : `${t}, Ø${TAILLES[t].d} mm`);

const KIT: Record<string, number> = { S: 39, M: 49, L: 59 };
const KIT_TEXTILE: Record<string, number> = { S: 45, M: 55, L: 65 };
export const PRIX_ROUE = 19;
export const SURCOUT_TEXTILE = 6;
export const PRIX_MARQUEUR = { packaging: 9.9, textile: 12.9 };
export const prixRoueSeule = (t: Taille) => (t === 'XL50' ? 32 : t === 'L30' ? 25 : PRIX_ROUE);
export const prixRoueSup = (t: Taille) => (t === 'XL50' ? 24 : t === 'L30' ? 19 : 14);
export const PRIX_BUMP = 9;
export const PRIX_ROUE_PRETE: Record<string, number> = { S: 12, M: 14, L: 16 };

export interface Encre { id: string; nom: string; hex: string }
const encres = (l: [string, string, string][]): Encre[] => l.map(([id, nom, hex]) => ({ id, nom, hex }));
export const ENCRES: Record<Usage, Encre[]> = {
  packaging: encres([['noir', 'Noir', '#1B1A20'], ['blanc', 'Blanc', '#F7F7F4'], ['orange', 'Orange', '#EA580C'], ['rouge', 'Rouge', '#D3263B'], ['bleu', 'Bleu', '#1E5BBF'], ['vert', 'Vert', '#1E8449'], ['or', 'Or', '#C29A2E']]),
  textile: encres([['noir', 'Noir', '#1B1A20'], ['blanc', 'Blanc', '#F7F7F4'], ['rouge', 'Rouge', '#C42637'], ['marine', 'Bleu marine', '#1E2A55']]),
};
export interface Police { id: string; nom: string; css: string; scad: string; cond: number }
export const POLICES: Police[] = [
  { id: 'anton', nom: 'Condensée', css: "'Anton', Impact, sans-serif", scad: 'Anton', cond: 1 },
  { id: 'archivo', nom: 'Grasse', css: "'Archivo Black', 'Arial Black', sans-serif", scad: 'Archivo Black', cond: 0.85 },
  { id: 'serif', nom: 'Élégante', css: "'DM Serif Display', Georgia, serif", scad: 'DM Serif Display', cond: 0.95 },
  { id: 'brush', nom: 'Manuscrite', css: "'Caveat Brush', 'Comic Sans MS', cursive", scad: 'Caveat Brush', cond: 1 },
];
export const SEPS = [
  { id: 'etoile', nom: 'Étoile' },
  { id: 'point', nom: 'Point' },
  { id: 'coeur', nom: 'Cœur' },
  { id: 'aucun', nom: 'Aucun' },
];
export const DESIGNS = [
  { id: 'merci', nom: 'MERCI ♥' },
  { id: 'faitmain', nom: 'FAIT MAIN ★' },
  { id: 'fragile', nom: 'FRAGILE' },
  { id: 'commande', nom: 'Merci pour votre commande' },
];

interface Base {
  nom: string;
  court: string;
  images: string[];
  /** Vidéo du produit en action, en tête de galerie. */
  video?: { src: string; poster: string };
  cats: string[];
  badge?: string;
  inclut?: string[];
  /** Rayon dans les recharges : encres, roues, accessoires. */
  rayon?: 'encres' | 'roues' | 'accessoires';
  /** Trois points forts affichés sur la fiche et les grandes cartes. */
  points?: string[];
}
export interface ProduitConfig extends Base {
  type: 'config';
  gamme: 'std' | 'large';
  roues: (Usage | null)[];
  supports: number;
  marqueurs: boolean;
  encreur: boolean;
  roueSup: boolean;
  prix: Partial<Record<Taille, number>>;
  valeur?: (t: Taille) => number;
}
export interface Opt { id: string; nom: string; hex?: string }
export interface ProduitSimple extends Base {
  type: 'simple';
  options?: Record<string, Opt[]>;
  prix: (sel: Record<string, string>) => number;
}
export type Produit = ProduitConfig | ProduitSimple;

export const P: Record<string, Produit> = {
  'kit-rouleau': {
    type: 'config', gamme: 'std', nom: 'Kit Rouleau personnalisé', court: 'Support, roue gravée à votre marque et marqueur rempli.',
    roues: [null], supports: 1, marqueurs: true, encreur: false, roueSup: true, prix: { S: 39, M: 49, L: 59 },
    images: ['kit-packshot', 'kit-action', 'hero', 'kit-contenu', 'roue-detail', 'carton-empreintes', 'roues-tailles'], cats: ['rouleaux', 'packaging'], badge: 'Le plus vendu',
    points: ['Texte ou logo simple sur 13,5 mm de haut', 'Marqueur rempli inclus, prêt à rouler', 'Roues interchangeables sans outil'],
    video: { src: '/video/heros-action.mp4', poster: 'heros-action' },
    inclut: ['1 support réglable en PETG', '1 roue gravée à votre texte ou logo', '1 marqueur 15 mm rempli de la couleur choisie', '1 vis M3 pour le serrage'],
  },
  'rouleau-large': {
    type: 'config', gamme: 'large', nom: 'Rouleau Grand format', court: 'Bande de 30 ou 50 mm pour les logos détaillés et les dessins, encreur rechargeable intégré.',
    roues: [null], supports: 1, marqueurs: false, encreur: true, roueSup: true, prix: { L30: 65, XL50: 79 },
    images: ['rouleau-large', 'large-3d', 'empreinte-large', 'large-rouleau-3d', 'large-eclate'], cats: ['rouleaux', 'grand-format', 'packaging'], badge: 'Nouveau',
    points: ['Logo détaillé ou dessin sur 30 ou 50 mm', 'Rouleau encreur et flacon d\'encre inclus', 'Rouleau gravé changeable en 10 secondes'],
    video: { src: '/video/grand-format.mp4', poster: 'grand-format' },
    inclut: ['1 manche en PETG avec fourche', '1 rouleau gravé à votre logo ou dessin', '1 rouleau encreur en mousse, rechargeable', '1 flacon d\'encre 30 ml de la couleur choisie'],
  },
  'kit-textile': {
    type: 'config', gamme: 'std', nom: 'Kit Rouleau textile', court: 'Roue à relief profond et marqueur à encre textile, fixée au fer.',
    roues: ['textile'], supports: 1, marqueurs: true, encreur: false, roueSup: true, prix: { S: 45, M: 55, L: 65 },
    images: ['tote', 'kit-packshot', 'roue-detail', 'kit-contenu'], cats: ['rouleaux', 'textile'],
    points: ['Relief profond pour le coton et la toile', 'Encre textile incluse, fixée au fer', 'Lavable à 40 °C'],
    inclut: ['1 support réglable en PETG', '1 roue textile à relief profond', '1 marqueur à encre textile', 'Notice de fixation au fer'],
  },
  'pack-duo': {
    type: 'config', gamme: 'std', nom: 'Pack Duo', court: 'Deux roues sur un support : votre logo et votre @instagram.',
    roues: [null, null], supports: 1, marqueurs: true, encreur: false, roueSup: false, prix: { S: 59, M: 69, L: 79 },
    valeur: (t) => KIT[t] + PRIX_ROUE + PRIX_MARQUEUR.packaging,
    images: ['pack-duo', 'kit-contenu', 'carton-empreintes'], cats: ['packs', 'packaging'], badge: 'Populaire',
    inclut: ['1 support réglable', '2 roues gravées', '2 marqueurs 15 mm'],
  },
  'pack-boutique': {
    type: 'config', gamme: 'std', nom: 'Pack Boutique', court: 'Trois roues, trois couleurs d\'encre et une recharge.',
    roues: [null, null, null], supports: 1, marqueurs: true, encreur: false, roueSup: false, prix: { S: 89, M: 99, L: 109 },
    valeur: (t) => KIT[t] + 2 * PRIX_ROUE + 2 * PRIX_MARQUEUR.packaging + 9.9,
    images: ['pack-boutique', 'carton-empreintes', 'marqueurs'], cats: ['packs', 'packaging'],
    inclut: ['1 support réglable', '3 roues gravées', '3 marqueurs de couleurs différentes', '1 recharge d\'encre 30 ml'],
  },
  'pack-textile': {
    type: 'config', gamme: 'std', nom: 'Pack Textile Starter', court: 'Le kit textile avec 5 tote bags en coton pour vos premiers essais.',
    roues: ['textile'], supports: 1, marqueurs: true, encreur: false, roueSup: false, prix: { S: 65, M: 75, L: 85 },
    valeur: (t) => KIT_TEXTILE[t] + 14.9 + 12.9,
    images: ['pack-textile', 'tote', 'kit-packshot'], cats: ['packs', 'textile'],
    inclut: ['Kit Rouleau textile complet', '5 tote bags en coton naturel 38 × 42 cm', '1 encre textile 30 ml'],
  },
  'pack-complet': {
    type: 'config', gamme: 'std', nom: 'Pack Marque complète', court: 'Un support pour les cartons, un pour le textile.',
    roues: ['packaging', 'textile'], supports: 2, marqueurs: true, encreur: false, roueSup: false, prix: { S: 75, M: 92, L: 109 },
    valeur: (t) => KIT[t] + KIT_TEXTILE[t],
    images: ['pack-complet', 'carton-empreintes', 'tote'], cats: ['packs', 'packaging', 'textile'],
    inclut: ['2 supports réglables', '1 roue packaging et 1 roue textile', '1 marqueur acrylique et 1 marqueur textile'],
  },
  'roue-gravee': {
    type: 'config', gamme: 'std', nom: 'Roue gravée seule', court: 'Un nouveau motif pour votre support : saison, collab, promo.',
    roues: [null], supports: 0, marqueurs: false, encreur: false, roueSup: false, prix: { S: 19, M: 19, L: 19 },
    images: ['roue-detail', 'roues-tailles'], cats: ['recharges'], rayon: 'roues',
    inclut: ['1 roue gravée à votre motif', 'Se clipse sans outil sur un support de même taille'],
  },
  'roue-large': {
    type: 'config', gamme: 'large', nom: 'Rouleau gravé Grand format seul', court: 'Un nouveau logo ou dessin pour votre manche Grand format.',
    roues: [null], supports: 0, marqueurs: false, encreur: false, roueSup: false, prix: { L30: 25, XL50: 32 },
    images: ['large-rouleau-3d', 'empreinte-large', 'rouleau-large'], cats: ['recharges', 'grand-format'], rayon: 'roues',
    inclut: ['1 rouleau gravé à votre motif', 'Se monte sans outil sur un manche Grand format de même largeur'],
  },
  'roue-prete': {
    type: 'simple', nom: 'Roue prête à rouler', court: 'Motifs classiques déjà gravés, expédiés sous 24 h.',
    images: ['roue-prete', 'carton-empreintes'], cats: ['recharges', 'packaging'], rayon: 'roues',
    options: { motif: DESIGNS, taille: TAILLES_STD.map((t) => ({ id: t, nom: `${t} (Ø${TAILLES[t].d} mm)` })) },
    prix: (v) => PRIX_ROUE_PRETE[v.taille || 'S'] ?? 12,
  },
  'marqueur': {
    type: 'simple', nom: 'Marqueur acrylique 15 mm', court: 'Rempli, prêt à l\'emploi, pour tous nos supports.',
    images: ['marqueurs'], cats: ['recharges', 'packaging'], rayon: 'encres', options: { couleur: ENCRES.packaging }, prix: () => 9.9,
  },
  'recharge': {
    type: 'simple', nom: 'Recharge encre acrylique 30 ml', court: 'Pour remplir votre marqueur plusieurs fois.',
    images: ['flacon', 'marqueurs'], cats: ['recharges', 'packaging'], rayon: 'encres', options: { couleur: ENCRES.packaging }, prix: () => 9.9,
  },
  'encre-tampon': {
    type: 'simple', nom: 'Encre pour encreur Grand format 30 ml', court: 'Encre à tampon pour carton et papier, à verser sur le rouleau encreur.',
    images: ['encre-tampon', 'empreinte-large'], cats: ['recharges', 'grand-format', 'packaging'], rayon: 'encres', options: { couleur: ENCRES.packaging }, prix: () => 8.9,
  },
  'encreur-large': {
    type: 'simple', nom: 'Rouleau encreur de rechange', court: 'Mousse à cellules ouvertes pour manche Grand format.',
    images: ['encreur-large', 'large-eclate'], cats: ['recharges', 'grand-format'], rayon: 'roues',
    options: { taille: [{ id: 'L30', nom: 'Large, 30 mm' }, { id: 'XL50', nom: 'XL, 50 mm' }] },
    prix: (v) => (v.taille === 'XL50' ? 9.9 : 7.9),
  },
  'marqueur-textile': {
    type: 'simple', nom: 'Marqueur textile 15 mm', court: 'Encre textile souple, à fixer au fer.',
    images: ['marqueur-textile', 'tote'], cats: ['recharges', 'textile'], rayon: 'encres', options: { couleur: ENCRES.textile }, prix: () => 12.9,
  },
  'encre-textile': {
    type: 'simple', nom: 'Encre textile 30 ml', court: 'Pour marqueur textile et encreur Grand format. Lavable à 40 °C après fixation au fer.',
    images: ['encre-textile', 'tote'], cats: ['recharges', 'textile'], rayon: 'encres', options: { couleur: ENCRES.textile }, prix: () => 12.9,
  },
  'marqueur-vide': {
    type: 'simple', nom: 'Marqueur vide rechargeable', court: 'Pointe 15 mm, à remplir avec l\'encre de votre choix.',
    images: ['marqueur-vide', 'marqueurs'], cats: ['recharges'], rayon: 'encres', prix: () => 6.9,
  },
  'totes': {
    type: 'simple', nom: 'Tote bags coton, lot de 5', court: 'Coton naturel épais, 38 × 42 cm, prêts à tamponner.',
    images: ['totes', 'tote'], cats: ['recharges', 'textile'], rayon: 'accessoires', prix: () => 14.9,
  },
  'carte-cadeau': {
    type: 'simple', nom: 'Carte cadeau', court: 'La personne crée son rouleau quand elle le souhaite.',
    images: [], cats: ['recharges'], rayon: 'accessoires', options: { montant: [30, 50, 80].map((m) => ({ id: String(m), nom: `${m} €` })) },
    prix: (v) => Number(v.montant || 30),
  },
};

export const LIB_OPT: Record<string, string> = { motif: 'Motif', taille: 'Taille', couleur: 'Couleur', montant: 'Montant' };

export const COLLECTIONS: Record<string, { titre: string; court: string; desc: string }> = {
  boutique: { titre: 'Toute la boutique', court: 'Tout', desc: 'Rouleaux personnalisés, packs et recharges. Tout est fabriqué à la commande en France.' },
  rouleaux: { titre: 'Rouleaux personnalisés', court: 'Rouleaux', desc: 'Choisissez votre rouleau, ajoutez votre texte ou votre logo, validez le BAT gratuit. Encre incluse.' },
  packs: { titre: 'Packs', court: 'Packs', desc: 'Plusieurs roues ou plusieurs supports, moins cher qu\'à l\'unité. Le BAT reste gratuit pour chaque roue.' },
  recharges: { titre: 'Recharges et accessoires', court: 'Recharges', desc: 'Encres, marqueurs, roues de rechange et accessoires pour votre rouleau.' },
};
/** Anciennes adresses de catégories, redirigées vers les nouvelles. */
export const ALIAS_COLLECTIONS: Record<string, string> = {
  kits: 'rouleaux', 'grand-format': 'rouleaux', textile: 'rouleaux', packaging: 'boutique', accessoires: 'recharges',
};
export const RAYONS: { id: 'encres' | 'roues' | 'accessoires'; titre: string }[] = [
  { id: 'encres', titre: 'Encres et marqueurs' },
  { id: 'roues', titre: 'Roues et rouleaux de rechange' },
  { id: 'accessoires', titre: 'Accessoires' },
];

export const ORDRE = [
  'kit-rouleau', 'rouleau-large', 'kit-textile',
  'pack-duo', 'pack-boutique', 'pack-textile', 'pack-complet',
  'marqueur', 'recharge', 'encre-tampon', 'marqueur-textile', 'encre-textile', 'marqueur-vide',
  'roue-gravee', 'roue-prete', 'roue-large', 'encreur-large',
  'totes', 'carte-cadeau',
];
export const dansCollection = (cle: string) => ORDRE.filter((h) => cle === 'boutique' || P[h].cats[0] === cle);

export const IMG = (n: string) => `/img/${n}.webp`;
export const ALT: Record<string, string> = {
  'kit-packshot': 'Kit Rouleau : support noir, roue orange gravée et marqueur blanc',
  hero: 'Le rouleau imprime « ATELIER LUNA » en continu sur un carton kraft',
  'kit-contenu': 'Contenu du kit vu de dessus : support, roues, marqueur et vis',
  'roue-detail': 'Gros plan sur une roue orange gravée en relief',
  'carton-empreintes': 'Carton kraft marqué de trois empreintes : noire, blanche et MERCI',
  'roues-tailles': 'Roues S, M et L côte à côte',
  tote: 'Tote bag en coton marqué « ATELIER LUNA » à l\'encre textile, avec le kit',
  'pack-duo': 'Kit avec une deuxième roue MERCI',
  marqueurs: 'Six marqueurs 15 mm de couleurs différentes',
  flacon: 'Flacon d\'encre 30 ml',
  'rouleau-large': 'Rouleau Grand format qui imprime une frise de branches de citronnier sur du papier kraft',
  'empreinte-large': 'Frise d\'abeilles et de fleurs imprimée au rouleau Grand format sur un carton',
  'heros-action': 'Une main roule le tampon sur un colis kraft et imprime une frise d\'étoiles bleues',
  'kit-action': 'Le Kit Rouleau imprime une frise d\'étoiles bleues en diagonale sur un carton',
  'grand-format': 'Le rouleau Grand format imprime une frise de citrons sur du papier kraft',
  'usage-cafe': 'Sachets de café et gobelets kraft marqués d\'une frise de grains de café bleue',
  'usage-mariage': 'Pochettes et enveloppes de mariage marquées d\'une frise de cœurs bleus',
  'atelier-emballage': 'Une gérante de boutique marque ses colis avec un rouleau étoiles',
  'large-3d': 'Le manche Grand format avec son rouleau gravé de citrons et son rouleau encreur en mousse',
  'large-rouleau-3d': 'Rouleau gravé Grand format en TPU orange, relief de citrons encré en bleu',
  'large-eclate': 'Vue éclatée du manche Grand format : rouleau encreur en mousse, rouleau gravé, vis et molettes',
  'pack-boutique': 'Pack Boutique : support avec sa roue, deux roues gravées, deux marqueurs de couleur et un flacon d\'encre',
  'pack-textile': 'Pack Textile Starter : kit textile, tote bags en coton pliés et flacon d\'encre textile',
  'pack-complet': 'Pack Marque complète : deux supports, un pour le carton et un pour le textile, posés sur un tote bag',
  'roue-prete': 'Trois roues prêtes à rouler gravées MERCI, FAIT MAIN et FRAGILE',
  'encre-tampon': 'Trois flacons d\'encre à tampon à embout verseur, noir, orange et bleu',
  'encre-textile': 'Quatre flacons d\'encre textile : noir, blanc, rouge et bleu marine',
  'marqueur-textile': 'Quatre marqueurs textile 15 mm posés sur une toile de coton',
  'marqueur-vide': 'Deux marqueurs 15 mm vides, à remplir avec l\'encre de votre choix',
  totes: 'Pile de tote bags en coton naturel, prêts à tamponner',
  'encreur-large': 'Deux rouleaux encreurs en mousse, 30 et 50 mm, sur leur noyau',
  'film-3d': 'Animation 3D du Kit Rouleau : assemblage, impression et résultat',
};
export const altDe = (h: string, i: number) => ALT[P[h].images[i]] || P[h].nom;

const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const eur = (n: number) => fmt.format(n);
const fmtUn = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export const un = (n: number) => fmtUn.format(n);
export const arr = (n: number) => Math.round(n * 100) / 100;

export const taillesDe = (p: ProduitConfig): Taille[] => (p.gamme === 'large' ? TAILLES_LARGE : TAILLES_STD);
export const police = (id: string) => POLICES.find((p) => p.id === id) || POLICES[0];
export const encre = (u: Usage, id: string) => (ENCRES[u] || ENCRES.packaging).find((e) => e.id === id) || ENCRES.packaging[0];

export function prixMin(h: string): number {
  const p = P[h];
  if (p.type === 'config') return Math.min(...taillesDe(p).map((t) => p.prix[t] ?? Infinity));
  if (!p.options) return p.prix({});
  const cles = Object.keys(p.options);
  const base = Object.fromEntries(cles.map((k) => [k, p.options![k][0].id]));
  return Math.min(...p.options[cles[0]].map((o) => p.prix({ ...base, [cles[0]]: o.id })));
}
export const aPartirDe = (h: string) => {
  const p = P[h];
  return p.type === 'config' || (p.type === 'simple' && !!p.options && Object.values(p.options).some((o) => o.length > 1));
};

const TEXTES = ['VOTRE MARQUE', '@VOTRECOMPTE', 'MERCI'];
export function roueDefaut(usage: Usage, mode: Mode, texte: string): Roue {
  return { usage, mode, texte, police: 'anton', sep: 'etoile', encre: 'noir', logo: null, logoNom: '', ratio: 3, raster: false };
}
export function cfgDefaut(h: string): Cfg {
  const p = P[h];
  if (p.type === 'simple') {
    const sel: Record<string, string> = {};
    Object.entries(p.options || {}).forEach(([k, v]) => { sel[k] = v[0].id; });
    return { h, type: 'simple', qty: 1, sel };
  }
  const large = p.gamme === 'large';
  const roues = p.roues.map((u, i) => {
    const r = roueDefaut(u || 'packaging', large ? 'logo' : 'texte', TEXTES[i] || 'VOTRE MARQUE');
    if (i === 1) r.encre = 'orange';
    if (i === 2) r.encre = 'rouge';
    if (!ENCRES[r.usage].some((e) => e.id === r.encre)) r.encre = 'noir';
    return r;
  });
  return {
    h, type: 'config', taille: large ? 'L30' : 'M', qty: 1, actif: 0, roues,
    sup: roueDefaut(roues[0].usage, 'texte', 'MERCI'),
    opt: { roueSup: false, gravure: false, gravureTexte: '', express: false, coffret: false, vecto: false },
  };
}
export const rouesActives = (c: CfgConfig): Roue[] => {
  const p = P[c.h] as ProduitConfig;
  return c.roues.concat(c.opt.roueSup && p.roueSup ? [c.sup] : []);
};
export const usageFixe = (c: CfgConfig, i: number): Usage | null => (i < c.roues.length ? (P[c.h] as ProduitConfig).roues[i] : null);

export interface Calc { unit: number; total: number; lignes: [string, number][]; remise: number; brut: number }
export function calc(c: Cfg): Calc {
  const p = P[c.h];
  if (c.type === 'simple' || p.type === 'simple') {
    const u = (p as ProduitSimple).prix((c as CfgSimple).sel || {});
    return { unit: u, total: arr(u * c.qty), lignes: [[p.nom, u]], remise: 0, brut: u * c.qty };
  }
  const lignes: [string, number][] = [];
  let u = p.prix[c.taille] ?? 0;
  lignes.push([`${p.nom}, ${libTaille(c.taille)}`, u]);
  c.roues.forEach((r, i) => {
    if (p.roues[i] == null && (p.marqueurs || p.encreur) && r.usage === 'textile') {
      u += SURCOUT_TEXTILE;
      lignes.push([`Roue ${i + 1} version textile`, SURCOUT_TEXTILE]);
    }
  });
  if (p.roueSup && c.opt.roueSup) { u += prixRoueSup(c.taille); lignes.push(['2e roue gravée', prixRoueSup(c.taille)]); }
  if (p.supports && c.opt.gravure) { u += 5 * p.supports; lignes.push(['Gravure du support', 5 * p.supports]); }
  const nr = rouesActives(c).filter((r) => r.mode === 'logo' && r.raster).length;
  if (c.opt.vecto && nr) { u += 9 * nr; lignes.push(['Vectorisation du logo', 9 * nr]); }
  if (c.opt.express) { u += 7; lignes.push(['Fabrication express 48 h', 7]); }
  if (c.opt.coffret) { u += 4; lignes.push(['Coffret cadeau', 4]); }
  u = arr(u);
  const remise = c.qty >= 10 ? 0.2 : c.qty >= 5 ? 0.15 : c.qty >= 3 ? 0.1 : 0;
  const brut = u * c.qty;
  return { unit: u, lignes, remise, brut, total: arr(brut * (1 - remise)) };
}
export const totalLigne = (a: Ligne) => (a.promo ? arr(a.promo * a.qty) : calc({ ...a.cfg, qty: a.qty } as Cfg).total);
export const sousTotal = (l: Ligne[]) => arr(l.reduce((s, a) => s + totalLigne(a), 0));
export const PROMOS: Record<string, number> = { BIENVENUE10: 0.1 };
export const port = (mode: Livraison, st: number) => (mode === 'domicile' ? (st >= 89 ? 0 : 5.9) : mode === 'express' ? 9.9 : st >= 59 ? 0 : 3.9);
export const FRANCO = 59;

/* Ligne de kit standard qui permet de proposer la roue MERCI à prix réduit. */
export const ligneBump = (l: Ligne[]) => l.find((a) => a.cfg.type === 'config' && !estLarge(a.cfg.taille) && P[a.cfg.h].type === 'config' && (P[a.cfg.h] as ProduitConfig).supports > 0) as (Ligne & { cfg: CfgConfig }) | undefined;

export interface Totaux { lignes: Ligne[]; st: number; rp: number; port: number; total: number; promo: string | null }
export function totauxCommande(panier: Ligne[], o: { promo: string | null; bump: boolean; mode: Livraison }): Totaux {
  const conf = ligneBump(panier);
  const lignes = panier.slice();
  if (o.bump && conf) {
    lignes.push({ cle: 'bump', cfg: { h: 'roue-prete', type: 'simple', qty: 1, sel: { motif: 'merci', taille: conf.cfg.taille } }, qty: 1, promo: PRIX_BUMP });
  }
  const st = sousTotal(lignes);
  const promo = o.promo && PROMOS[o.promo] ? o.promo : null;
  const rp = promo ? arr(st * PROMOS[promo]) : 0;
  const pt = port(o.mode, st - rp);
  return { lignes, st, rp, port: pt, total: arr(st - rp + pt), promo };
}

export function variantesDe(a: Ligne): string[] {
  const c = a.cfg, p = P[c.h], out: string[] = [];
  if (c.type === 'simple' || p.type === 'simple') {
    const ps = p as ProduitSimple;
    Object.entries((c as CfgSimple).sel || {}).forEach(([k, v]) => {
      const o = ps.options?.[k]?.find((x) => x.id === v);
      out.push(`${LIB_OPT[k] || k} : ${o ? o.nom : v}`);
    });
    return out;
  }
  out.push(`Taille : ${libTaille(c.taille)}`);
  rouesActives(c).forEach((r, k) => out.push(`${p.gamme === 'large' ? 'Rouleau' : 'Roue'} ${k + 1} : ${r.mode === 'logo' ? `logo ${r.logoNom || ''}`.trim() : `« ${r.texte} », ${police(r.police).nom.toLowerCase()}`}, encre ${encre(r.usage, r.encre).nom.toLowerCase()}${r.usage === 'textile' ? ', textile' : ''}`));
  if (c.opt.gravure) out.push(`Gravure ${p.gamme === 'large' ? 'manche' : 'support'} : « ${c.opt.gravureTexte} »`);
  if (c.opt.express) out.push('Express 48 h');
  if (c.opt.coffret) out.push('Coffret cadeau');
  if (c.opt.vecto) out.push('Vectorisation du logo');
  return out;
}

/* Fiches de fabrication : une commande OpenSCAD par pièce à imprimer. */
const sh = (s: string) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "'\\''");
const fichier = (logo: string | null) => (logo ? logo.split('/').pop()!.replace(/\.(png|jpg)$/, '.svg') : 'logo.svg');
export interface Fab { titre: string; infos: string[]; cmd: string | null; logo?: string | null }
export function fabrication(num: string, a: Ligne, idx: number): Fab[] {
  const c = a.cfg, p = P[c.h];
  if (c.type === 'simple' || p.type === 'simple') return [{ titre: `${p.nom} × ${a.qty}`, infos: variantesDe(a).concat(['Article en stock, à préparer']), cmd: null }];
  const T = TAILLES[c.taille], large = p.gamme === 'large', out: Fab[] = [];
  rouesActives(c).forEach((r, k) => {
    const pol = police(r.police), f = `${num}_a${idx + 1}_${large ? 'rouleau' : 'roue'}${k + 1}`;
    const motif = r.mode === 'logo' ? `-D 'logo_svg="${fichier(r.logo)}"'${large ? ` -D ratio_logo=${Math.round(r.ratio * 100) / 100}` : ''}` : `-D 'texte="${sh(r.texte)}"' -D 'police="${pol.scad}"' -D condenser=${pol.cond}`;
    const relief = r.usage === 'textile' ? 2.2 : 1.8;
    out.push({
      titre: `${large ? 'Rouleau' : 'Roue'} ${k + 1} × ${a.qty}`,
      infos: [r.mode === 'logo' ? `Logo ${r.logoNom || 'client'}${r.raster ? ', à vectoriser' : ''}` : `Texte « ${r.texte} », police ${pol.scad}`, `Encre ${encre(r.usage, r.encre).nom.toLowerCase()}, TPU 95A, relief ${String(relief).replace('.', ',')} mm`],
      cmd: large
        ? `openscad --backend=manifold -D 'piece="rouleau"' -D largeur_bande=${T.bande} -D diametre_rouleau=${T.d} ${motif} -D 'separateur="${r.sep}"' -D profondeur_relief=${relief} -o ${f}.stl rouleau_large.scad`
        : `openscad --backend=manifold -D 'piece="roue"' -D diametre_roue=${T.d} ${motif} -D 'separateur="${r.sep}"' -D profondeur_relief=${relief} -o ${f}.stl rouleau_tampon.scad`,
      logo: r.mode === 'logo' ? r.logo : null,
    });
  });
  if (p.supports) {
    out.push({
      titre: `${large ? 'Manche' : 'Support'} × ${p.supports * a.qty}`,
      infos: [`PETG noir, ${libTaille(c.taille)}`, c.opt.gravure ? `Gravure « ${c.opt.gravureTexte} »` : 'Sans gravure'].concat(large ? [`Rouleau encreur mousse ${T.bande} mm, encre ${encre(c.roues[0].usage, c.roues[0].encre).nom.toLowerCase()} 30 ml`] : []),
      cmd: large
        ? `openscad --backend=manifold -D 'piece="manche"' -D largeur_bande=${T.bande} -D diametre_rouleau=${T.d}${c.opt.gravure ? ` -D 'texte_manche="${sh(c.opt.gravureTexte)}"'` : ''} -o ${num}_a${idx + 1}_manche.stl rouleau_large.scad`
        : `openscad --backend=manifold -D 'piece="support"' -D diametre_roue=${T.d}${c.opt.gravure ? ` -D 'texte_manchon="${sh(c.opt.gravureTexte)}"'` : ''} -o ${num}_a${idx + 1}_support.stl rouleau_tampon.scad`,
    });
  }
  return out;
}

export const STATUTS = ['BAT à envoyer', 'BAT validé', 'En fabrication', 'Expédiée', 'Annulée'];
export const FAQ: [string, string][] = [
  ['Le texte s\'imprime-t-il à l\'endroit ?', 'Oui. La roue est gravée en miroir pour que l\'empreinte se lise normalement. L\'aperçu de la fiche produit montre le résultat imprimé.'],
  ['Kit Rouleau ou Grand format ?', 'Le Kit Rouleau imprime une bande de 13,5 mm avec un marqueur : idéal pour un nom, un slogan ou un logo simple. Le Grand format imprime une bande de 30 ou 50 mm grâce à son rouleau encreur : il garde les détails d\'un logo complexe ou d\'un dessin.'],
  ['Sur quelles surfaces ça marche ?', 'Carton, kraft, papier, enveloppes, papier de soie, affiches et bois brut. Pour le tissu, prenez la version textile : relief plus profond et encre textile.'],
  ['L\'encre textile tient-elle au lavage ?', 'Après séchage, repassez 5 minutes sur l\'envers, sans vapeur. Attendez 48 heures, puis lavez à 40 °C maximum, sur l\'envers.'],
  ['Quel fichier envoyer pour mon logo ou mon dessin ?', 'Un SVG de préférence. Un PNG ou JPG haute définition fonctionne aussi. Le motif s\'imprime d\'une seule couleur ; notre graphiste peut le vectoriser pour 9 €.'],
  ['Comment recharger ?', 'Le marqueur se remplit avec nos flacons de 30 ml. Sur le Grand format, quelques gouttes d\'encre sur le rouleau encreur suffisent ; la mousse se change en 10 secondes.'],
  ['Quels délais de livraison ?', 'BAT sous 24 h ouvrées, puis expédition sous 3 jours ouvrés après votre accord (48 h avec l\'option express). Point relais offert dès 59 €.'],
];
