import { createFileRoute } from '@tanstack/react-router';
import { COLLECTIONS, FAQ, ORDRE, P, eur, prixMin } from '@/lib/catalogue';
import { PAGES_SEO } from '@/lib/pages-seo';
import { ORIGINE } from '@/lib/seo';
import site from '@/site.json';

/* /llms.txt : résumé du site pour les assistants IA (ChatGPT, Claude, Perplexity, Gemini),
   au format proposé sur llmstxt.org. Généré depuis le catalogue : toujours à jour. */

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const u = (c: string) => `${ORIGINE}${c}`;
        const produits = ORDRE.filter((h) => P[h].images.length).map((h) => {
          const p = P[h];
          return `- [${p.nom}](${u(`/produits/${h}`)}): ${p.seo?.desc ?? p.court} Dès ${eur(prixMin(h))}.`;
        });
        const txt = [
          '# Mark & Roll',
          '',
          `> Mark & Roll fabrique en France des tampons rouleaux personnalisés (tampons encreurs en rouleau) gravés au logo ou au texte du client. Un passage imprime le motif en continu sur les cartons, colis, sacs kraft, papier de soie, enveloppes et, avec l'encre textile, sur les tote bags et t-shirts. Site : ${ORIGINE}`,
          '',
          '## L\'essentiel',
          `- Personnalisation en ligne avec aperçu immédiat de l'empreinte, puis BAT gratuit par email sous 24 h ouvrées, retouches illimitées. Rien n'est gravé avant l'accord du client.`,
          `- Prix : Kit Rouleau dès ${eur(prixMin('kit-rouleau'))} (support, roue gravée, marqueur rempli), Grand format pour logos détaillés dès ${eur(prixMin('rouleau-large'))}, kit textile dès ${eur(prixMin('kit-textile'))}. TTC, TVA non applicable (art. 293 B du CGI).`,
          '- Tailles : roues S (Ø 30 mm), M (Ø 60 mm), L (Ø 80 mm) avec une bande de 13,5 mm ; Grand format avec une bande de 30 ou 50 mm.',
          '- Livraison : expédition sous 3 jours ouvrés après le BAT (48 h avec l\'option express), en France, Belgique et Luxembourg. Point relais offert dès 59 €.',
          '- Remises : −10 % dès 3 exemplaires, −15 % dès 5, −20 % dès 10. Aucun minimum de commande.',
          '- Paiement sécurisé par Stripe : carte bancaire, Apple Pay, Google Pay et autres moyens selon l\'appareil.',
          `- Contact : ${site.contact}`,
          '',
          '## Produits',
          ...produits,
          '',
          '## Guides et usages',
          ...PAGES_SEO.map((p) => `- [${p.lib}](${u(p.chemin)}): ${p.desc}`),
          '',
          '## Questions fréquentes',
          ...FAQ.map(([q, r]) => `- ${q} ${r}`),
          '',
          '## Pages utiles',
          ...Object.entries(COLLECTIONS).map(([k, c]) => `- [${c.titre}](${u(`/collections/${k}`)}): ${c.desc}`),
          `- [Pros et devis](${u('/pros')}): devis sous 24 h pour les commandes en volume.`,
          `- [Conditions générales de vente](${u('/cgv')})`,
          `- [Mentions légales](${u('/mentions-legales')})`,
          '',
        ].join('\n');
        return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
      },
    },
  },
});
