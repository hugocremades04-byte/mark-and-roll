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
  /** Page par métier : listée à part dans le pied de page. */
  metier?: string;
}

export const PAGES_SEO: PageSeo[] = [
  // tampon encreur personnalisé (+ logo, pas cher, livraison rapide, france, prix)
  {
    chemin: '/tampon-encreur-personnalise',
    lib: 'Tampon encreur personnalisé',
    titre: 'Tampon encreur personnalisé à votre logo, fabriqué en France',
    desc: `Tampon encreur personnalisé en rouleau : votre logo ou texte imprimé en continu, encre incluse, BAT gratuit. Fabriqué en France, ${dès('kit-rouleau')}.`,
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
          'Expédition sous 7 jours ouvrés après le BAT. Livraison 3,90 € en point relais ou à domicile, offerte dès 45 €, en France, Belgique et Luxembourg.',
        ],
      },
    ],
    faq: [
      ['Combien coûte un tampon encreur personnalisé chez Mark & Roll ?', `Le Kit Rouleau personnalisé démarre à ${eur(prixMin('kit-rouleau'))} avec le marqueur rempli et le BAT gratuit. Le Grand format, pour les logos détaillés, démarre à ${eur(prixMin('rouleau-large'))}.`],
      ['Combien de temps pour le recevoir ?', 'Le BAT arrive sous 24 h ouvrées. Après votre accord, le tampon est fabriqué et expédié sous 7 jours ouvrés. Avec la livraison express Chronopost, il arrive le lendemain de l\'expédition.'],
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
          'BAT sous 24 h ouvrées, puis expédition sous 7 jours ouvrés après votre accord. Commandez au moins trois semaines avant le jour J pour avoir le temps de tout marquer.',
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
  // tampon personnalisé café / restaurant / boulangerie / food truck, logo sur gobelet, sac à emporter
  {
    chemin: '/tampon-restaurant-cafe',
    lib: 'Tampon pour café et restaurant',
    titre: 'Tampon personnalisé café, restaurant, boulangerie',
    desc: `Votre logo sur sacs à emporter, boîtes, gobelets kraft et serviettes en papier, en un passage de rouleau. Le tampon personnalisé des cafés, restaurants, boulangeries et food trucks, ${dès('kit-rouleau')}.`,
    h1: 'Le tampon des cafés, restaurants et boulangeries',
    chapeau: "Sacs à emporter, boîtes à pâtisserie, gobelets kraft, serviettes en papier : achetez-les neutres, et votre logo s'imprime dessus au comptoir, au fil du service.",
    image: 'usage-cafe',
    alt: "Sachets de café et gobelets kraft marqués d'une frise de grains de café bleue",
    produits: ['kit-rouleau', 'pack-boutique', 'rouleau-large'],
    sections: [
      {
        h2: 'Vente à emporter : votre nom part avec le client',
        p: [
          "Un sac ou une boîte qui sort de chez vous se promène dans la rue, au bureau, sur les photos des clients. Marqué à votre nom, il fait connaître l'adresse sans coûter plus cher qu'un emballage neutre.",
          'Le rouleau imprime en continu : un passage sur le côté du sac ou sur le couvercle de la boîte suffit, sans viser comme avec un tampon classique.',
        ],
      },
      {
        h2: "Pas de commande minimum chez l'imprimeur",
        p: [
          "Les sacs et gobelets imprimés à votre logo se commandent souvent par milliers, avec un stock à ranger et un délai à chaque réassort. Avec un rouleau, vous gardez vos emballages standards et vous les marquez au fur et à mesure.",
          'Nouvelle carte, saison, événement : une roue gravée seule se clipse sur le même support pour un nouveau motif.',
        ],
      },
      {
        h2: 'Quelle taille pour quel emballage ?',
        p: [
          'Taille S (Ø30 mm) pour les petits sachets et les cartes de fidélité, M (Ø60 mm) pour les sacs à emporter et les boîtes, L (Ø80 mm) pour votre nom complet et votre adresse. Pour un logo détaillé, le Grand format imprime une bande de 30 ou 50 mm de haut.',
          `Le Pack Boutique réunit trois roues et trois couleurs d'encre, par exemple votre logo, votre adresse et un MERCI, ${dès('pack-boutique')}.`,
        ],
      },
    ],
    faq: [
      ['Peut-on tamponner des gobelets et des boîtes en carton ?', "Oui sur le carton mat et le papier kraft. Sur une surface plastifiée ou brillante, l'encre accroche mal : faites un essai sur un exemplaire avant de lancer le service."],
      ["Où tamponner sur un emballage alimentaire ?", "Sur l'extérieur de l'emballage : sac, boîte, gobelet, serviette. L'encre n'est pas prévue pour toucher les aliments."],
      ['Combien coûte un tampon personnalisé pour un café ?', `Le Kit Rouleau démarre à ${eur(prixMin('kit-rouleau'))}, marqueur rempli et BAT gratuit inclus. Le Pack Boutique, avec trois roues et trois couleurs, démarre à ${eur(prixMin('pack-boutique'))}.`],
      ['Peut-on voir le rendu avant de commander ?', "Oui : l'aperçu s'affiche dès que vous tapez votre nom sur la fiche produit, puis vous recevez un BAT gratuit sous 24 h ouvrées. Rien n'est gravé avant votre accord."],
    ],
  },
  // personnaliser colis vinted / etsy / leboncoin, tampon nom de boutique
  {
    chemin: '/tampon-colis-vinted-etsy',
    lib: 'Tampon pour vendeurs Vinted et Etsy',
    titre: 'Personnaliser ses colis Vinted et Etsy avec un tampon',
    desc: 'Vendeur Vinted, Etsy ou Leboncoin : marquez vos colis à votre nom de boutique en un passage, même sur des cartons de récup. Tampon rouleau personnalisé, sans minimum, BAT gratuit.',
    h1: 'Vos colis Vinted et Etsy à votre nom',
    chapeau: "Cartons de récupération, enveloppes kraft, papier de soie : un passage de rouleau et le colis porte votre nom de boutique. L'acheteur se souvient de vous.",
    image: 'carton-empreintes',
    alt: 'Carton kraft marqué de trois empreintes : noire, blanche et MERCI',
    produits: ['kit-rouleau', 'pack-duo', 'roue-gravee'],
    sections: [
      {
        h2: 'Un colis reconnaissable, même dans un carton de récup',
        p: [
          'Beaucoup de vendeurs réutilisent des cartons. Une frise à votre nom sur le dessus transforme un carton récupéré en colis de marque, sans rien racheter.',
          "Le Pack Duo grave deux roues pour un seul support : votre nom de boutique sur l'une, votre @instagram sur l'autre. L'acheteur sait où vous retrouver.",
        ],
      },
      {
        h2: "Un détail que l'acheteur remarque",
        p: [
          "Un emballage marqué à votre nom, un papier de soie tamponné, un MERCI sur le rabat : ce sont de petites attentions que les acheteurs remarquent, photographient et mentionnent dans leurs avis.",
        ],
      },
      {
        h2: 'Petit volume, petit budget',
        p: [
          `Pas de minimum de commande : un seul rouleau suffit, ${dès('kit-rouleau')}, marqueur rempli inclus. Le marqueur se recharge avec un flacon d'encre de 30 ml, et la roue se change pour une nouvelle saison ou une collab.`,
        ],
      },
    ],
    faq: [
      ['Quelle taille choisir pour un nom de boutique ?', 'La taille S convient à un nom court de 10 à 12 caractères. La M et la L laissent la place à un nom plus long ou à un slogan.'],
      ['Ça marche sur une enveloppe ou une pochette ?', "Sur le kraft et le papier, oui. Sur le plastique à bulles ou les pochettes plastifiées, l'encre accroche mal : tamponnez plutôt le papier de soie ou une carte glissée dans le colis."],
      ['Combien de temps pour le recevoir ?', "Le BAT arrive par email sous 24 h ouvrées. La fabrication démarre dès votre accord, et vous recevez un numéro de suivi à l'expédition."],
    ],
  },
  // tampon personnalisé association, événement, festival, salon, marché de créateurs
  {
    chemin: '/tampon-association-evenement',
    lib: 'Tampon pour association et événement',
    titre: 'Tampon personnalisé pour association et événement',
    desc: `Association, festival, salon ou marché de créateurs : votre logo sur sacs, tote bags et programmes, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}, devis pour les quantités.`,
    h1: 'Un tampon à votre logo pour vos événements',
    chapeau: "Kermesse, festival, salon, marché de créateurs, soirée d'asso : marquez sacs, tote bags et programmes à votre logo, au nombre exact de participants.",
    image: 'totes',
    alt: 'Pile de tote bags en coton naturel, prêts à tamponner',
    produits: ['kit-rouleau', 'kit-textile', 'pack-textile'],
    sections: [
      {
        h2: 'Marquer au nombre près, sans stock',
        p: [
          "Les goodies imprimés se commandent par lots et finissent souvent dans un carton au fond d'un local. Avec un rouleau gravé, vous achetez des sacs et des tote bags neutres et vous les marquez la veille, ou sur place, selon le nombre de participants.",
        ],
      },
      {
        h2: "Des tote bags à votre logo avec l'encre textile",
        p: [
          `Le Kit Rouleau textile s'utilise avec une encre pour tissu, lavable à 40 °C après fixation au fer. Le Pack Textile Starter ajoute 5 tote bags en coton naturel de 38 × 42 cm pour vos premiers essais, ${dès('pack-textile')}.`,
        ],
      },
      {
        h2: 'Une animation de stand toute prête',
        p: [
          'Sur un stand, le rouleau attire du monde : chacun marque son sac ou son tote bag au logo de l\'événement. Une animation simple, sans machine ni électricité.',
        ],
      },
      {
        h2: "Le même rouleau d'une édition à l'autre",
        p: [
          'Le support et la roue se gardent. Pour une nouvelle édition, une roue gravée seule se clipse sur le support avec le nouveau visuel ou la nouvelle date.',
          'Plusieurs rouleaux ou une grosse quantité : remise automatique dès 3 kits, et devis sous 24 h sur la page Pros et devis.',
        ],
      },
    ],
    faq: [
      ['Peut-on tamponner des tote bags en coton ?', "Oui, avec le Kit Rouleau textile et son encre pour tissu. Tamponnez le coton à plat et tendu, puis fixez au fer : l'empreinte tient au lavage à 40 °C."],
      ['Faites-vous des devis pour les associations ?', 'Oui. La page Pros et devis permet de demander un devis pour plusieurs rouleaux ou une quantité importante, avec une réponse sous 24 h.'],
      ["Peut-on ajouter la date de l'événement ?", "Oui, en texte ou intégrée à votre logo. Pour l'édition suivante, il suffit de commander une nouvelle roue gravée."],
    ],
  },
  // packaging pas cher petite marque, idées packaging personnalisé, emballage colis petite entreprise
  {
    chemin: '/guide-packaging-petite-marque',
    lib: 'Guide : packaging pas cher pour petite marque',
    titre: 'Packaging pas cher pour petite marque : 7 idées',
    desc: "Un packaging à votre image sans gros budget ni minimum de commande : 7 idées concrètes pour petite marque, créateur ou boutique en ligne, du carton neutre au papier de soie tamponné.",
    h1: 'Packaging pas cher pour petite marque : 7 idées',
    chapeau: "Une belle ouverture de colis ne demande pas des milliers de boîtes imprimées. Voici sept idées qui tiennent dans un petit budget et suivent le rythme de vos commandes.",
    image: 'pack-boutique',
    alt: "Pack Boutique : support avec sa roue, deux roues gravées, deux marqueurs de couleur et un flacon d'encre",
    produits: ['kit-rouleau', 'pack-boutique', 'pack-duo'],
    sections: [
      { h2: '1. Partir de cartons et sachets neutres', p: ["Les emballages standards coûtent moins cher, se trouvent partout et ne demandent aucun stock dédié. La personnalisation vient ensuite, au moment d'emballer."] },
      { h2: '2. Tamponner votre logo', p: [`Un tampon rouleau imprime votre nom en continu sur le carton, le kraft et le papier de soie. Un achat unique, ${dès('kit-rouleau')}, et aucun minimum.`] },
      { h2: '3. Marquer le papier de soie', p: ["Un papier de soie neutre, tamponné d'une frise à votre logo sur un bord, donne l'effet d'un papier imprimé sans en commander des rames."] },
      { h2: '4. Écrire un mot à la main', p: ['Quelques mots avec le prénom du client restent l\'attention la plus remarquée. Une carte simple, tamponnée à votre logo, suffit.'] },
      { h2: '5. Choisir une couleur signature', p: ["Une même couleur répétée partout (encre, ficelle, sticker de fermeture) rend un colis reconnaissable. Le Pack Boutique contient trois marqueurs de couleurs différentes pour tester."] },
      { h2: '6. Mettre votre @instagram sur le colis', p: ['Le client qui photographie son colis doit pouvoir vous mentionner. Une deuxième roue gravée à votre @instagram, comme dans le Pack Duo, s\'en charge.'] },
      { h2: '7. Fermer simplement', p: ['Un scotch kraft ou une ficelle naturelle ferment le colis proprement, pour quelques centimes. Gardez le logo pour le carton lui-même.'] },
      { h2: 'Quand passer au carton imprimé ?', p: ['Pour quelques dizaines de colis par mois, un tampon, du papier de soie neutre et des cartes suffisent à créer une identité. Le carton imprimé sur mesure devient intéressant quand les volumes sont élevés et réguliers, sur un seul format de boîte.'] },
    ],
    faq: [
      ['Quel est le packaging le moins cher pour une petite marque ?', "Des emballages neutres achetés en petite quantité, personnalisés avec un tampon : vous payez le marquage une seule fois, quel que soit le nombre de colis."],
      ['Comment rendre un colis plus pro sans gros budget ?', 'Un logo net et répété, une couleur signature et un mot au client. Le reste (carton, scotch, papier de soie) peut rester standard.'],
    ],
  },
  // papier de soie personnalisé logo, petite quantité, sans minimum
  {
    chemin: '/guide-papier-de-soie-personnalise',
    lib: 'Guide : papier de soie personnalisé',
    titre: 'Papier de soie personnalisé logo, sans minimum',
    desc: "Papier de soie imprimé ou tamponné à votre logo : quantités minimales, délais et l'alternative sans minimum avec un tampon rouleau. Guide pour boutiques et créateurs.",
    h1: 'Papier de soie personnalisé : imprimé ou tamponné ?',
    chapeau: "Le papier de soie à votre logo fait beaucoup pour l'ouverture d'un colis. Deux façons de l'obtenir : le faire imprimer, ou le tamponner vous-même au rouleau.",
    image: 'grand-format',
    alt: 'Le rouleau Grand format imprime une frise de citrons sur du papier kraft',
    produits: ['kit-rouleau', 'rouleau-large', 'pack-duo'],
    sections: [
      {
        h2: 'Le papier de soie imprimé',
        p: ["Imprimé par un fabricant, il couvre toute la feuille d'un motif régulier. En contrepartie, il se commande en général par milliers de feuilles, avec un délai de production et un motif figé pour tout le lot."],
      },
      {
        h2: 'Le papier de soie tamponné',
        p: [
          "Vous achetez un papier de soie neutre, à la couleur de votre choix, et vous passez le rouleau sur un bord ou en diagonale juste avant d'emballer. Le motif se répète sur toute la longueur du passage, comme un papier imprimé.",
          'Aucune quantité minimale : vous marquez dix feuilles ou deux cents, selon les commandes de la semaine.',
        ],
      },
      {
        h2: 'Bien tamponner un papier fin',
        p: ["Posez la feuille sur une surface plane et dure, roulez d'un geste régulier sans appuyer fort, et laissez sécher quelques instants avant de plier. Sur un papier très fin, un passage léger évite que l'encre ne traverse."],
      },
      {
        h2: 'Quel rouleau choisir ?',
        p: [`Pour un nom ou un logo simple, le Kit Rouleau ${dès('kit-rouleau')}. Pour un logo détaillé ou un motif décoratif plus haut, le Grand format ${dès('rouleau-large')} imprime une bande de 30 ou 50 mm.`],
      },
    ],
    faq: [
      ['Peut-on tamponner du papier de soie ?', 'Oui. Roulez légèrement sur une surface dure et laissez sécher avant de plier : le motif reste net.'],
      ["Quelle couleur d'encre sur du papier de soie ?", "Les encres foncées (noir, bleu, vert) ressortent le mieux sur le blanc et le kraft. L'encre blanche s'utilise sur un papier de soie de couleur foncée, et l'or sur le noir."],
    ],
  },
  // packaging bijoux personnalisé, pochette bijoux logo, emballage bijoux créatrice
  {
    chemin: '/packaging-bijoux-personnalise',
    metier: 'Bijoux',
    lib: 'Packaging bijoux personnalisé',
    titre: 'Packaging bijoux personnalisé à votre logo, sans minimum',
    desc: `Créatrice de bijoux : votre nom sur vos pochettes kraft, boîtes, cartes et papier de soie, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}, BAT gratuit, fabriqué en France.`,
    h1: 'Le packaging de vos bijoux, à votre nom',
    chapeau: "Pochettes kraft, petites boîtes, cartes de présentation, papier de soie : un passage de rouleau et chaque commande porte le nom de votre atelier, même en petite série.",
    image: 'pack-duo',
    alt: 'Kit avec une deuxième roue MERCI',
    produits: ['kit-rouleau', 'pack-duo', 'roue-prete'],
    sections: [
      {
        h2: 'Petits formats, petite roue',
        p: [
          "Les emballages de bijoux sont petits : la taille S (Ø30 mm) imprime un nom court de 10 à 12 caractères, juste à la bonne échelle pour une pochette, une carte ou le couvercle d'une boîte. La M laisse la place à un nom plus long ou à un slogan.",
          'La frise se répète sur toute la longueur du passage : un geste sur le bord du papier de soie, et la pièce est emballée à votre nom.',
        ],
      },
      {
        h2: 'Une deuxième roue pour le message',
        p: [
          "Le Pack Duo grave deux roues pour un seul support : le nom de votre atelier sur l'une, votre @instagram ou un MERCI sur l'autre. La cliente sait où vous retrouver quand elle photographie son colis.",
          'Pour un mot déjà prêt, les roues MERCI et FAIT MAIN se clipsent sur le même support.',
        ],
      },
      {
        h2: 'Vos couleurs, pas celles d\'un imprimeur',
        p: [
          "Noir, blanc, or, bleu, vert, rouge ou orange : l'encre se choisit à la commande et se recharge avec un flacon de 30 ml. L'or ressort bien sur le kraft et le papier noir.",
        ],
      },
    ],
    faq: [
      ['Quelle taille de tampon pour des pochettes à bijoux ?', 'La taille S (Ø30 mm) pour un nom court sur de petites pochettes et des cartes. La M (Ø60 mm) si votre nom est plus long ou si vous marquez aussi vos cartons d\'envoi.'],
      ['Peut-on tamponner une pochette en velours ou en coton ?', "Le coton oui, avec le Kit Rouleau textile et son encre pour tissu. Le velours, à poils, donne une empreinte irrégulière : réservez le tampon au papier et au carton."],
      ['Le rendu est-il assez fin pour un logo de bijouterie ?', "Un logo simple ou un nom en police Élégante passe très bien. Pour un logo détaillé, le Grand format grave un motif de 26 ou 46 mm de haut. Vous validez le BAT avant toute gravure."],
    ],
  },
  // emballage bougie personnalisé, packaging bougie artisanale, boîte bougie logo
  {
    chemin: '/emballage-bougie-personnalise',
    metier: 'Bougies',
    lib: 'Emballage bougie personnalisé',
    titre: 'Emballage bougie personnalisé : boîtes et papier à votre logo',
    desc: `Bougies artisanales : votre logo sur les boîtes, le papier kraft, le papier de soie et les cartons d'envoi, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}, sans minimum.`,
    h1: 'Vos bougies emballées à votre nom',
    chapeau: "Boîtes en carton, papier kraft, papier de soie, cartons d'expédition : achetez-les neutres et marquez-les à votre logo au moment d'emballer, au rythme de vos coulées.",
    image: 'empreinte-large',
    alt: "Frise d'abeilles et de fleurs imprimée au rouleau Grand format sur un carton",
    produits: ['kit-rouleau', 'rouleau-large', 'pack-boutique'],
    sections: [
      {
        h2: 'Sur le carton et le papier, pas sur le verre',
        p: [
          "Le rouleau imprime sur les matières qui boivent l'encre : boîte en carton, papier kraft, papier de soie, carte. Sur le verre du contenant ou sur la cire, l'encre n'accroche pas : gardez une étiquette pour le pot, et le tampon pour tout ce qui l'entoure.",
        ],
      },
      {
        h2: 'Une collection, une roue',
        p: [
          "Collection d'hiver, parfum en édition limitée, collab : une roue gravée seule se clipse sur votre support pour un nouveau motif, sans racheter de boîtes imprimées.",
          `Le Pack Boutique réunit trois roues et trois couleurs d'encre, par exemple votre logo, le nom de la collection et un MERCI, ${dès('pack-boutique')}.`,
        ],
      },
      {
        h2: 'Un motif décoratif en Grand format',
        p: [
          `Pour habiller tout le papier d'une frise (abeilles, fleurs, flammes, votre illustration), le Grand format imprime une bande de 30 ou 50 mm de haut, ${dès('rouleau-large')}.`,
        ],
      },
    ],
    faq: [
      ['Peut-on tamponner directement sur un pot de bougie ?', "Non : sur le verre, la céramique émaillée ou la cire, l'encre n'accroche pas. Le tampon sert pour les boîtes, le papier, les cartes et les cartons d'envoi."],
      ['Quelle couleur pour une boîte kraft ?', "Le noir et le bleu ressortent le plus. L'or donne un effet plus précieux, le blanc s'utilise sur une boîte noire ou foncée."],
      ['Y a-t-il un minimum de commande ?', 'Non. Un seul kit suffit, et la remise s\'applique automatiquement dès 3 kits.'],
    ],
  },
  // emballage savon personnalisé, packaging savon artisanal, bande papier savon logo
  {
    chemin: '/emballage-savon-personnalise',
    metier: 'Savons et cosmétiques',
    lib: 'Emballage savon personnalisé',
    titre: 'Emballage savon personnalisé : bande papier et kraft à votre logo',
    desc: `Savonnerie artisanale : votre logo sur la bande de papier, le kraft, les boîtes et les cartons d'envoi, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}, BAT gratuit.`,
    h1: 'Vos savons emballés à votre nom',
    chapeau: "Bande de papier autour du savon, papier kraft, boîte, sachet : un passage de rouleau et l'emballage porte votre nom. Sans commande minimale chez un imprimeur.",
    image: 'rouleau-large',
    alt: 'Rouleau Grand format qui imprime une frise de branches de citronnier sur du papier kraft',
    produits: ['kit-rouleau', 'rouleau-large', 'pack-boutique'],
    sections: [
      {
        h2: 'La bande de papier, marquée en un geste',
        p: [
          "Une bande de papier kraft ou recyclé autour du savon, et un passage de rouleau sur toute sa longueur : votre nom se répète tout autour. Vous préparez vos bandes à l'avance, ou au moment d'emballer.",
          "On tamponne l'emballage, jamais le savon : l'encre n'est pas prévue pour toucher la peau ni pour le savon lui-même.",
        ],
      },
      {
        h2: 'Un même support, plusieurs gammes',
        p: [
          'Une roue par gamme (visage, corps, cheveux) ou par parfum : elles se clipsent sans outil sur le même support. Trois couleurs d\'encre dans le Pack Boutique pour distinguer vos gammes au premier coup d\'œil.',
        ],
      },
      {
        h2: 'Quelle taille ?',
        p: [
          "Taille S (Ø30 mm) pour une bande étroite ou une étiquette, M (Ø60 mm) pour le nom et un slogan, L (Ø80 mm) pour votre nom complet et votre site. Pour une frise décorative sur tout le papier, le Grand format.",
        ],
      },
    ],
    faq: [
      ['Peut-on tamponner directement sur un savon ?', "Non. Le tampon sert pour l'emballage : papier, carton, boîte, sachet. L'encre n'est pas prévue pour le contact avec la peau."],
      ['Ça tient sur du papier recyclé ?', "Oui, le papier recyclé et le kraft absorbent bien l'encre. Laissez sécher quelques instants avant de plier la bande."],
      ['Combien coûte un tampon pour savonnerie ?', `Le Kit Rouleau démarre à ${eur(prixMin('kit-rouleau'))}, marqueur rempli et BAT gratuit inclus. Le Pack Boutique, avec trois roues et trois couleurs, démarre à ${eur(prixMin('pack-boutique'))}.`],
    ],
  },
  // emballage céramique colis, expédier céramique, tampon fragile fait main
  {
    chemin: '/emballage-ceramique-colis',
    metier: 'Céramique',
    lib: 'Emballage céramique à votre nom',
    titre: 'Emballer et expédier vos céramiques avec votre logo',
    desc: `Céramiste : votre nom, FAIT MAIN et FRAGILE sur vos cartons, votre papier kraft et votre papier de soie, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}, sans minimum.`,
    h1: 'Vos céramiques expédiées à votre nom',
    chapeau: "Des pièces uniques méritent un colis qui le dit. Votre nom sur le carton, FRAGILE sur le dessus, FAIT MAIN sur le papier de soie : trois passages de rouleau, et c'est emballé.",
    image: 'roue-prete',
    alt: 'Trois roues prêtes à rouler gravées MERCI, FAIT MAIN et FRAGILE',
    produits: ['kit-rouleau', 'pack-duo', 'roue-prete'],
    sections: [
      {
        h2: 'Le carton de récup devient un colis d\'atelier',
        p: [
          "Les céramistes réutilisent souvent cartons et papier froissé pour caler les pièces. Une frise à votre nom sur le dessus du carton suffit à transformer un emballage de récupération en colis reconnaissable.",
        ],
      },
      {
        h2: 'FRAGILE et FAIT MAIN, déjà gravés',
        p: [
          "Les roues prêtes FRAGILE et FAIT MAIN se clipsent sur le même support que votre roue personnalisée. Un passage FRAGILE sur deux faces du carton, et le transporteur ne peut pas le rater.",
          "Le Pack Duo grave deux roues pour un seul support, par exemple le nom de l'atelier et votre @instagram.",
        ],
      },
      {
        h2: 'Sur le papier, pas sur l\'émail',
        p: [
          "L'encre accroche sur le carton, le kraft et le papier de soie. Sur une pièce émaillée ou cuite, elle ne tient pas : pour signer vos pièces, gardez votre tampon à argile. Le rouleau, lui, s'occupe de tout l'emballage.",
        ],
      },
    ],
    faq: [
      ['Peut-on utiliser le rouleau sur l\'argile crue ?', "Ce n'est pas son usage : la roue est gravée pour l'encre, sur papier et carton. Pour marquer l'argile, un tampon à céramique reste l'outil adapté."],
      ['Quelle taille pour marquer un carton d\'envoi ?', 'La M (Ø60 mm) pour votre nom et un slogan, la L (Ø80 mm) pour votre nom complet et votre site. Sur un grand carton, la frise continue couvre toute la largeur en un passage.'],
      ['Peut-on voir le rendu avant de commander ?', "Oui : l'aperçu s'affiche dès que vous tapez votre nom sur la fiche produit, puis vous recevez un BAT gratuit sous 24 h ouvrées."],
    ],
  },
  // sachet café personnalisé, emballage thé logo, sachet kraft torréfacteur, épicerie fine
  {
    chemin: '/sachet-cafe-the-personnalise',
    metier: 'Café, thé et épicerie fine',
    lib: 'Sachet café et thé personnalisé',
    titre: 'Sachet café et thé personnalisé à votre logo, sans minimum',
    desc: `Torréfacteur, maison de thé, biscuiterie, chocolatier : votre logo sur sachets kraft, boîtes et cartons d'envoi, en un passage de rouleau. Tampon personnalisé ${dès('kit-rouleau')}.`,
    h1: 'Vos sachets de café et de thé, à votre nom',
    chapeau: "Sachets kraft neutres, boîtes, étiquettes, cartons d'expédition : marquez-les à votre logo au fil des torréfactions, sans commander des milliers de sachets imprimés.",
    image: 'usage-cafe',
    alt: "Sachets de café et gobelets kraft marqués d'une frise de grains de café bleue",
    produits: ['kit-rouleau', 'rouleau-large', 'pack-boutique'],
    sections: [
      {
        h2: 'Des sachets neutres, une marque reconnaissable',
        p: [
          "Les sachets imprimés à votre logo se commandent par milliers, pour un seul format et un seul design. Avec un rouleau, vous gardez des sachets kraft standards et vous les marquez par lots, au rythme de vos ventes.",
          "Un passage sur la face du sachet, un autre sur le carton d'envoi : vos clients reconnaissent votre maison dès la boîte aux lettres.",
        ],
      },
      {
        h2: 'Une roue par origine ou par gamme',
        p: [
          "Éthiopie, Brésil, décaféiné, thé vert, édition de Noël : une roue gravée seule se clipse sur votre support pour chaque nouveauté. Le Pack Boutique réunit trois roues et trois couleurs d'encre pour démarrer.",
        ],
      },
      {
        h2: 'Sur le kraft mat, pas sur le plastique',
        p: [
          "L'encre accroche sur le kraft mat, le papier et le carton. Sur un sachet plastifié brillant ou une fenêtre transparente, elle accroche mal : faites un essai sur un sachet avant de marquer tout un lot.",
          "On tamponne l'extérieur de l'emballage : l'encre n'est pas prévue pour toucher les aliments.",
        ],
      },
    ],
    faq: [
      ['Peut-on tamponner un sachet de café à valve ?', "Oui sur la face en kraft mat, en évitant la valve. Sur un sachet doublé de plastique brillant, l'encre accroche mal : faites un essai d'abord."],
      ['Quelle taille pour un sachet de 250 g ?', 'La M (Ø60 mm) imprime votre nom et un slogan sur la largeur d\'un sachet. La S convient aux petits sachets d\'échantillon.'],
      ['Combien coûte un tampon pour sachets ?', `Le Kit Rouleau démarre à ${eur(prixMin('kit-rouleau'))}, marqueur rempli et BAT gratuit inclus. Remise automatique dès 3 kits.`],
    ],
  },
];

export const PAGE_SEO = (chemin: string) => PAGES_SEO.find((p) => p.chemin === chemin)!;
