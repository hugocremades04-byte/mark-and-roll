import { createFileRoute } from '@tanstack/react-router';
import { db } from '@/lib/serveur/commandes.server';

/* Réception des événements de statistiques (voir src/lib/stats.ts).
   Rien de personnel n'est stocké : un compteur par jour, événement, page ou produit, et source. */

const EVTS = new Set(['visite', 'produit', 'panier', 'commande']);
const ROBOTS = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram/i;
const vide = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

const jourParis = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (ROBOTS.test(request.headers.get('user-agent') || '')) return vide();
        const texte = await request.text();
        if (texte.length > 400) return vide();
        let d: { evt?: unknown; cle?: unknown; valeur?: unknown; source?: unknown };
        try {
          d = JSON.parse(texte);
        } catch {
          return vide();
        }
        const evt = String(d.evt || '');
        if (!EVTS.has(evt)) return vide();
        const cle = String(d.cle || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
        const source = String(d.source || 'direct').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24) || 'direct';
        const valeur = Math.min(10000, Math.max(0, Number(d.valeur) || 0));
        try {
          await (await db()).prepare(
            `INSERT INTO stats (jour, evt, cle, source, n, valeur) VALUES (?, ?, ?, ?, 1, ?)
             ON CONFLICT(jour, evt, cle, source) DO UPDATE SET n = n + 1, valeur = valeur + excluded.valeur`,
          ).bind(jourParis(), evt, cle, source, valeur).run();
        } catch (e) {
          console.error('Stats', e);
        }
        return vide();
      },
    },
  },
});
