import site from '../site.json';
import { FAQ, P, port } from './catalogue';

/* Balises de référencement d'une page : title, meta description, adresse canonique et partage.
   L'adresse canonique est toujours celle de site.json (marknroll.com), jamais www ni workers.dev. */

export const ORIGINE = new URL(site.url).origin;
export const absolu = (chemin: string) => new URL(chemin, ORIGINE).toString();

export function seo({ titre, description, chemin, image }: { titre: string; description: string; chemin: string; image?: string }) {
  const url = absolu(chemin);
  return {
    meta: [
      { title: titre },
      { name: 'description', content: description },
      { property: 'og:title', content: titre },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      ...(image ? [{ property: 'og:image', content: absolu(image) }, { name: 'twitter:image', content: absolu(image) }] : []),
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}

/** Données structurées de la marque (page d'accueil). */
export const LD_MARQUE = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mark & Roll',
    url: ORIGINE,
    logo: absolu('/logo.svg'),
    email: site.contact,
    sameAs: ['https://www.instagram.com/mark.androll/'],
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Mark & Roll', url: ORIGINE, inLanguage: 'fr-FR' },
];

/** Offre détaillée pour Google (fiches marchandes) : prix, livraison en France, politique de retour des CGV. */
export function offreLd(h: string, prix: number, url: string) {
  const perso = P[h]?.type === 'config';
  const delai = (min: number, max: number) => ({ '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitCode: 'DAY' });
  return {
    '@type': 'Offer',
    price: prix.toFixed(2),
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@type': 'Organization', name: 'Mark & Roll' },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: port('relais', prix).toFixed(2), currency: 'EUR' },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
      deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: perso ? delai(2, 7) : delai(1, 7), transitTime: delai(2, 4) },
    },
    hasMerchantReturnPolicy: perso
      ? { '@type': 'MerchantReturnPolicy', applicableCountry: 'FR', returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted' }
      : { '@type': 'MerchantReturnPolicy', applicableCountry: 'FR', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail' },
  };
}

/** Questions fréquentes en données structurées (lues par Google et les moteurs IA). */
export const faqLd = (liste: [string, string][] = FAQ) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: liste.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })),
});
