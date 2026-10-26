import site from '../site.json';

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
