import { createFileRoute } from '@tanstack/react-router';
import { db } from '@/lib/serveur/commandes.server';

/* Lien personnel envoyé en prospection : marknroll.com/apercu/nom-de-la-marque
   ouvre le configurateur avec le nom déjà tapé, et compte le clic (table apercus). */

const ROBOTS = /bot|crawl|spider|slurp|headless|preview|scanner|safelinks|proofpoint|mimecast|barracuda|facebookexternalhit|whatsapp|telegram/i;

export const Route = createFileRoute('/apercu/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const slug = params.slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
        let nom = slug.replace(/-+/g, ' ').trim().toUpperCase().slice(0, 22);
        let campagne = 'apercu';
        try {
          const D = await db();
          const r = await D.prepare('SELECT nom, campagne FROM apercus WHERE slug = ?').bind(slug).first<{ nom: string; campagne: string }>();
          if (r) {
            nom = r.nom;
            campagne = r.campagne;
            if (!ROBOTS.test(request.headers.get('user-agent') || '')) {
              await D.prepare("UPDATE apercus SET clics = clics + 1, premier_clic = COALESCE(premier_clic, datetime('now')), dernier_clic = datetime('now') WHERE slug = ?").bind(slug).run();
            }
          }
        } catch (e) {
          console.error('Aperçu', e);
        }
        const cible = `/produits/kit-rouleau?texte=${encodeURIComponent(nom)}&utm_source=${encodeURIComponent(campagne)}`;
        return new Response(null, { status: 302, headers: { Location: cible, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
      },
    },
  },
});
