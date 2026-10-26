import { createFileRoute } from '@tanstack/react-router';
import { IMG, ORDRE, P, prixMin } from '@/lib/catalogue';
import { absolu } from '@/lib/seo';

/* Flux produits pour Google Merchant Center (annonces gratuites Google Shopping).
   Adresse à donner dans Merchant Center : https://marknroll.com/flux-google.xml */

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const Route = createFileRoute('/flux-google.xml')({
  server: {
    handlers: {
      GET: async () => {
        const items = ORDRE.filter((h) => P[h].images.length).map((h) => {
          const p = P[h];
          const titre = p.seo ? `${p.seo.titre}` : `${p.nom} pour tampon rouleau Mark & Roll`;
          return [
            '<item>',
            `<g:id>${h}</g:id>`,
            `<g:title>${x(titre.slice(0, 150))}</g:title>`,
            `<g:description>${x(p.seo?.desc ?? p.court)}</g:description>`,
            `<g:link>${absolu(`/produits/${h}`)}</g:link>`,
            `<g:image_link>${absolu(IMG(p.images[0]))}</g:image_link>`,
            ...p.images.slice(1, 6).map((i) => `<g:additional_image_link>${absolu(IMG(i))}</g:additional_image_link>`),
            `<g:price>${prixMin(h).toFixed(2)} EUR</g:price>`,
            '<g:availability>in_stock</g:availability>',
            '<g:condition>new</g:condition>',
            '<g:brand>Mark &amp; Roll</g:brand>',
            '<g:identifier_exists>no</g:identifier_exists>',
            '</item>',
          ].join('');
        });
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Mark &amp; Roll</title><link>${absolu('/')}</link><description>Tampons rouleaux personnalisés</description>\n${items.join('\n')}\n</channel></rss>`;
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
      },
    },
  },
});
