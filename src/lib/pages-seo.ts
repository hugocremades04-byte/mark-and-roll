import { eur, prixMin } from './catalogue';

/* Pages d'atterrissage SEO : une page par intention d'achat repérée dans les recherches Google.
   Chaque page a son propre contenu (pas de copie d'une page à l'autre), ses questions fréquentes
   et des liens vers les fiches produit. Mots-clés visés indiqués en commentaire. */

const dès = (h: string) => `dès ${eur(prixMin(h))}`;

export interface PageSeo {
  chemin: string;
  /** Libellé court (fil d'Ariane, liens du pied de page). */
  lib: string;
  titre: string;
  desc: string;
  h1: string;
  chapeau: string;
  image: string;
  alt: string;
  produits: string[];
  sections: { h2: string; p: string[] }[];
  faq: [string, string][];
}

export const PAGES_SEO: PageSeo[] = [
  // tampon encreur personnalisé (+ logo, pas cher, livraison rapide, france, prix)
  {
    chemin: '/tampon-encreur-personnalise',
    lib: 'Tampon encreur personnalisé',
    titre: 'Tampon encreur personnalisé à votre logo, fabriqué en France',
    desc: `Tampon encreur personnalisé en rouleau : votre logo ou texte imprimé en continu, encre incluse, BAT gratuit. Fabriqué en France ${dès('kit-rouleau')}, express 48 h.`,
    h1: 'Tampon encreur personnalisé, en rouleau',
    chapeau: `Un tampon encreur classique imprime une fois par coup. Le nôtre roule : votre logo ou votre texte se répète sans s'arrêter, sur toute la longueur du carton. Encre incluse, BAT gratuit, ${dès('kit-rouleau')}.`,
    image: 'heros-action',
    alt: 'Une main roule le tampon sur un colis kraft et imprime une frise d\'étoiles bleues',
    produits: ['kit-rouleau', 'rouleau-large', 'kit-textile'],
    sections: [
      {
        h2: 'Ce qui change par rapport à un tampon encreur classique',
        p: [
          'Pas de coussin encreur à part : le marqueur rempli d\'encre s\'insère dans le support et alimente la roue gravée. Vous roulez, le motif s\'imprime, et vous recommencez sans recharger à chaque colis.',
          'Pas de taille limitée par la plaque : la frise fait la longueur de votre geste. Un passage sur le dessus d\'un carton, un autre sur le côté, et le colis est marqué.',
        ],
      },
      {
        h2: 'Personnalisé en ligne, vérifié avant gravure',
        p: [
          'Tapez votre texte ou envoyez votre logo (SVG, PNG ou JPG) : l\'aperçu de l\'empreinte s\'affiche tout de suite sur la fiche produit. Vous recevez ensuite un BAT gratuit par email sous 24 h ouvrées, avec retouches illimitées. Rien n\'est gravé avant votre accord.',
          'Quatre polices pour le texte, sept couleurs d\'encre pour le carton et le papier, et une encre textile pour le tissu.',
        ],
      },
      {
        h2: 'Prix et délais',
        p: [
          `Kit Rouleau ${dès('kit-rouleau')} (support, roue gravée et marqueur rempli), Grand format pour les logos détaillés ${dès('rouleau-large')}. Remise automatique dès 3 exemplaires.`,
          'Expédition sous 3 jours ouvrés après le BAT, ou 48 h avec l\'option express. Livraison 3,90 € en point relais ou à domicile, offerte dès 45 €, en France, Belgique et Luxembourg.',
        ],
      },
    ],
    faq: [
      ['Combien coûte un tampon encreur personnalisé chez Mark & Roll ?', `Le Kit Rouleau personnalisé démarre à ${eur(prixMin('kit-rouleau'))} avec le marqueur rempli et le BAT gratuit. Le Grand format, pour les logos détaillés, démarre à ${eur(prixMin('rouleau-large'))}.`],
      ['Est-ce que je peux le recevoir rapidement ?', 'Oui. Le BAT arrive sous 24 h ouvrées. Après votre accord, l\'option express fait partir le tampon sous 48 h au lieu de 3 jours ouvrés.'],
      ['Peut-on mettre un logo, pas seulement du texte ?', 'Oui. Envoyez un SVG de préférence, ou un PNG ou JPG haute définition. Le motif s\'imprime d\'une seule couleur ; notre graphiste peut vectoriser votre fichier pour 9 €.'],
      ['Le tampon est-il rechargeable ?', 'Oui. Le marqueur se remplit avec nos flacons d\'encre de 30 ml, et la roue gravée se change sans outil pour passer à un autre motif.'],
    ],
  },
  // tampon logo pour carton, tampon pour colis, tampon personnalisé carton / colis, tampon encreur pour carton
  {
    chemin: '/tampon-carton-colis',
    lib: 'Tampon pour carton et colis',
    titre: 'Tampon pour carton et colis, personnalisé à votre logo',
    desc: 'Marquez vos cartons d\'expédition et vos colis à votre logo en un passage, sans carton imprimé ni minimum de commande. Tampon rouleau personnalisé, BAT gratuit.',
    h1: 'Le tampon pour marquer vos cartons et vos colis',
    chapeau: 'Des cartons standards, et votre logo dessus en deux secondes. Pas de minimum de commande, pas de stock de cartons imprimés : un rouleau gravé à votre marque suffit.',
    image: 'kit-action',
    alt: 'Le Kit Rouleau imprime une frise d\'étoiles bleues en diagonale sur un carton',
    produits: ['kit-rouleau', 'pack-duo', 'pack-boutique'],
    sections: [
      {
        h2: 'Pensé pour les e-commerçants qui expédient',
        p: [
          'Le rouleau reste sur le poste d\'emballage, chargé d\'encre. Au moment de fermer le colis, un passage sur le dessus : votre nom de marque, votre site ou votre @instagram s\'imprime en continu.',
          'Les cartons bruts coûtent moins cher que les cartons imprimés et se commandent en petites quantités. Vous gardez le même rendu de marque sur chaque format de boîte.',
        ],
      },
      {
        h2: 'Quelle taille pour vos cartons ?',
        p: [
          'La roue S (Ø 30 mm) convient à un nom court et aux petits sachets. La M (Ø 60 mm) porte un logo et un slogan, idéale pour les cartons d\'expédition. La L (Ø 80 mm) affiche un nom complet avec l\'adresse du site sur les grands cartons.',
          'Pour un logo détaillé ou un dessin, le Grand format imprime une bande de 30 ou 50 mm de haut.',
        ],
      },
      {
        h2: 'Deux messages sur le même colis',
        p: [
          'Le Pack Duo met deux roues sur un support : votre logo d\'un côté, votre @instagram ou un MERCI de l\'autre. Le Pack Boutique ajoute trois couleurs d\'encre et une recharge.',
        ],
      },
    ],
    faq: [
      ['L\'encre tient-elle sur le carton kraft ?', 'Oui. Les encres acryliques du Kit Rouleau sont faites pour le carton, le kraft, le papier et les enveloppes.'],
      ['Y a-t-il un minimum de commande ?', 'Non. Un seul kit suffit. La remise s\'applique automatiquement dès 3 kits identiques (−10 %), 5 (−15 %) et 10 (−20 %).'],
      ['Combien de colis peut-on marquer avec un marqueur ?', 'Cela dépend de la longueur de vos passages et du support. Le marqueur se recharge avec un flacon de 30 ml quand l\'empreinte pâlit.'],
      ['Le texte s\'imprime-t-il à l\'endroit ?', 'Oui. La roue est gravée en miroir pour que l\'empreinte se lise normalement, comme sur l\'aperçu de la fiche produit.'],
    ],
  },
  // tampon pour sac papier, sachet kraft, sac kraft, papier de soie
  {
    chemin: '/tampon-sac-kraft',
    lib: 'Tampon pour sac kraft',
    titre: 'Tampon pour sac kraft, sachet papier et papier de soie',
    desc: 'Le tampon personnalisé des boutiques, cafés et boulangeries : votre logo sur sacs kraft, sachets papier et papier de soie, en un passage. BAT gratuit, fabriqué en France.',
    h1: 'Votre logo sur vos sacs kraft et vos sachets',
    chapeau: 'Boutique, café, boulangerie, créateur : un passage de rouleau sur le sac et votre nom est dessus. Vous achetez des sacs neutres, vous les marquez au fil de la journée.',
    image: 'usage-cafe',
    alt: 'Sachets de café et gobelets kraft marqués d\'une frise de grains de café bleue',
    produits: ['kit-rouleau', 'rouleau-large', 'pack-boutique'],
    sections: [
      {
        h2: 'Des sacs neutres, une image de marque',
        p: [
          'Les sacs et sachets imprimés à votre logo demandent souvent de grosses quantités. Avec un rouleau gravé, vous marquez exactement le nombre de sacs dont vous avez besoin, quand vous en avez besoin.',
          'La frise continue habille le sac de bord à bord, là où un tampon classique laisse une seule empreinte.',
        ],
      },
      {
        h2: 'Sur le papier de soie aussi',
        p: [
          'Roulé sur le papier de soie qui emballe vos produits, votre nom apparaît au déballage. Sur ce papier fin, un passage léger suffit.',
          'Le rouleau fonctionne aussi sur les étiquettes kraft, les enveloppes, les boîtes à pâtisserie et le bois brut.',
        ],
      },
      {
        h2: 'Logo simple ou dessin détaillé',
        p: [
          `Le Kit Rouleau (${dès('kit-rouleau')}) imprime une bande de 13,5 mm : nom, slogan, logo simple. Le Grand format (${dès('rouleau-large')}) imprime 30 ou 50 mm de haut et garde les détails d\'un logo ou d\'une illustration.`,
        ],
      },
    ],
    faq: [
      ['Est-ce adapté à un café ou une boulangerie ?', 'Oui pour les sacs, sachets et boîtes en papier ou en kraft. L\'encre ne doit pas être appliquée sur une surface en contact direct avec les aliments.'],
      ['Quelle encre pour le papier de soie ?', 'Les encres du Kit Rouleau conviennent au papier de soie. Faites un essai sur une chute pour régler la pression : un passage léger suffit.'],
      ['Mon logo a plusieurs couleurs, est-ce possible ?', 'Le motif s\'imprime d\'une seule couleur à la fois. Un logo multicolore est converti en une couleur ; le BAT vous montre le rendu avant gravure.'],
    ],
  },
  // tampon textile personnalisé, tampon vêtement, tampon pour tote bag, tampon encreur personnalisé pour vêtements
  {
    chemin: '/tampon-tote-bag-vetement',
    lib: 'Tampon pour tote bag et vêtement',
    titre: 'Tampon pour tote bag et vêtement, personnalisé à votre logo',
    desc: 'Tampon textile personnalisé pour tote bags, t-shirts et sacs en coton : encre textile fixée au fer, lavable à 40 °C. Gravé à votre logo, BAT gratuit.',
    h1: 'Le tampon textile pour vos tote bags et vos t-shirts',
    chapeau: `Une roue au relief plus profond et une encre textile qui se fixe au fer : votre logo tient au lavage. Kit textile ${dès('kit-textile')}.`,
    image: 'tote',
    alt: 'Tote bag en coton marqué « ATELIER LUNA » à l\'encre textile, avec le kit',
    produits: ['kit-textile', 'pack-textile', 'pack-complet'],
    sections: [
      {
        h2: 'Comment le marquage tient au lavage',
        p: [
          'Après séchage, repassez 5 minutes sur l\'envers, sans vapeur. Attendez 48 heures, puis lavez à 40 °C maximum, sur l\'envers.',
          'Le coton naturel et les toiles épaisses donnent le rendu le plus net. Pour un tissu foncé, choisissez l\'encre blanche.',
        ],
      },
      {
        h2: 'Pour vos merch, vos événements, votre boutique',
        p: [
          'Tote bags offerts avec une commande, t-shirts d\'équipe, sacs de salon : vous marquez à la demande, sans passer par un atelier de sérigraphie ni commander de série.',
          'Le Pack Textile Starter ajoute 5 tote bags en coton naturel pour vos premiers essais. Le Pack Marque complète réunit un support pour le carton et un pour le textile.',
        ],
      },
    ],
    faq: [
      ['Quelles couleurs d\'encre textile ?', 'Noir, blanc, rouge et bleu marine.'],
      ['Peut-on utiliser le même rouleau pour le carton et le textile ?', 'Le kit textile a une roue au relief plus profond et une encre dédiée. Pour marquer les deux, le Pack Marque complète contient un support pour chaque usage.'],
      ['Sur quels tissus ça marche ?', 'Le coton et les toiles naturelles donnent le meilleur résultat. Faites un essai sur un tissu synthétique avant de marquer une série.'],
    ],
  },
  // tampon mariage personnalisé (+ pas cher, encreur mariage)
  {
    chemin: '/tampon-mariage-personnalise',
    lib: 'Tampon mariage personnalisé',
    titre: 'Tampon mariage personnalisé : prénoms, date, motif',
    desc: 'Tampon de mariage personnalisé à vos prénoms et à votre date : pochettes de dragées, enveloppes, sacs kraft et tote bags des invités, en un passage. BAT gratuit.',
    h1: 'Le tampon de mariage à vos prénoms',
    chapeau: 'Vos prénoms, la date, un cœur entre deux : le rouleau imprime la frise en continu sur les pochettes, les enveloppes et les sacs des invités. Une après-midi de préparation suffit.',
    image: 'usage-mariage',
    alt: 'Pochettes et enveloppes de mariage marquées d\'une frise de cœurs bleus',
    produits: ['kit-rouleau', 'kit-textile', 'rouleau-large'],
    sections: [
      {
        h2: 'Tout ce que vous pouvez marquer',
        p: [
          'Pochettes de dragées, enveloppes de faire-part, sacs kraft de bienvenue, étiquettes de table, papier d\'emballage des cadeaux invités. Avec le kit textile, les tote bags des témoins.',
        ],
      },
      {
        h2: 'Composez votre motif',
        p: [
          'Exemple : « CLARA & HUGO 14.06 » avec le séparateur cœur entre chaque répétition. Choisissez la police Élégante ou Manuscrite et la couleur d\'encre de votre décoration. L\'aperçu de la fiche produit montre la frise telle qu\'elle sera imprimée.',
          'Pour un monogramme ou une illustration, le Grand format imprime un dessin de 26 ou 46 mm de haut.',
        ],
      },
      {
        h2: 'Prévoir les délais',
        p: [
          'BAT sous 24 h ouvrées, puis expédition sous 3 jours ouvrés après votre accord (48 h en express). Commandez au moins deux semaines avant le jour J pour avoir le temps de tout marquer.',
        ],
      },
    ],
    faq: [
      ['Combien coûte un tampon de mariage personnalisé ?', `Le Kit Rouleau personnalisé démarre à ${eur(prixMin('kit-rouleau'))}, marqueur rempli inclus. Le kit textile pour les tote bags démarre à ${eur(prixMin('kit-textile'))}.`],
      ['Peut-on garder le tampon après le mariage ?', 'Oui. Le support se garde, et une nouvelle roue gravée (anniversaire, naissance) s\'achète seule et se change sans outil.'],
      ['Combien de temps avant le mariage faut-il commander ?', 'Comptez environ une semaine entre la commande et la réception, plus le temps de marquer. Deux semaines avant la date est confortable.'],
    ],
  },
  // guide comparatif : comment mettre son logo sur ses colis (questions posées aux IA et à Google)
  {
    chemin: '/guide-logo-colis',
    lib: 'Guide : votre logo sur vos colis',
    titre: 'Mettre son logo sur ses colis : tampon, scotch ou carton imprimé ?',
    desc: 'Carton imprimé, scotch personnalisé, stickers, tampon encreur ou tampon rouleau : les 5 façons de mettre votre logo sur vos colis, avec leurs avantages et leurs limites.',
    h1: 'Mettre son logo sur ses colis : les 5 options',
    chapeau: 'Petite marque, boutique en ligne, créateur : voici comment choisir selon votre volume d\'envois, votre budget et le temps que vous voulez y passer.',
    image: 'atelier-emballage',
    alt: 'Une gérante de boutique marque ses colis avec un rouleau étoiles',
    produits: ['kit-rouleau', 'pack-duo', 'rouleau-large'],
    sections: [
      {
        h2: '1. Le carton imprimé sur mesure',
        p: ['Le rendu le plus abouti, imprimé par un fabricant d\'emballage. En contrepartie : des quantités minimales, un délai de fabrication et un stock à gérer pour chaque format de boîte. Adapté quand le volume d\'envois est élevé et régulier.'],
      },
      {
        h2: '2. Le scotch personnalisé',
        p: ['Votre logo sur le ruban qui ferme le colis. Simple à poser, mais il faut commander un lot de rouleaux et le logo est limité à la largeur du ruban.'],
      },
      {
        h2: '3. Les stickers et étiquettes',
        p: ['Souples et peu chers à l\'unité, ils se posent un par un : comptez le temps de pose sur chaque colis et le réassort quand le stock baisse.'],
      },
      {
        h2: '4. Le tampon encreur classique',
        p: ['Une empreinte par coup de tampon, limitée à la taille de la plaque, avec un coussin encreur à part. Pratique pour une adresse ou une petite mention.'],
      },
      {
        h2: '5. Le tampon rouleau personnalisé',
        p: [
          'Votre logo ou votre texte imprimé en continu, sur toute la longueur du passage. Aucun minimum : un seul rouleau suffit, sur des cartons, sacs et papiers neutres. L\'encre se recharge et la roue se change pour un autre motif.',
          `C\'est ce que fabrique Mark & Roll, en France : Kit Rouleau ${dès('kit-rouleau')}, Grand format pour les logos détaillés ${dès('rouleau-large')}, BAT gratuit avant gravure.`,
        ],
      },
      {
        h2: 'Que choisir ?',
        p: ['Moins de quelques centaines de colis par mois, plusieurs formats de boîtes, un budget serré : le tampon rouleau ou les stickers. Gros volumes réguliers sur un seul format : le carton imprimé. Pour combiner, un passage de rouleau sur un carton neutre fermé par un scotch simple donne déjà un colis reconnaissable.'],
      },
    ],
    faq: [
      ['Quelle est la façon la moins chère de mettre son logo sur ses colis ?', 'Sur de petits volumes, un tampon personnalisé est en général l\'option la plus économique : un achat unique, utilisé sur des cartons neutres, sans minimum de commande.'],
      ['Un tampon fait-il professionnel sur un colis ?', 'Oui si l\'empreinte est nette et régulière. La frise continue d\'un tampon rouleau couvre toute la largeur du carton et donne un rendu proche d\'un ruban imprimé.'],
    ],
  },
];

export const PAGE_SEO = (chemin: string) => PAGES_SEO.find((p) => p.chemin === chemin)!;
