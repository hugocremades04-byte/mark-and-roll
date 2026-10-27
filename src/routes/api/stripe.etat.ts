import { createFileRoute } from '@tanstack/react-router';
import { etatStripe } from '@/lib/serveur/stripe.server';
import { bindings } from '@/lib/bindings.server';
import { cfgDefaut, totalLigne, totauxCommande, type Ligne } from '@/lib/catalogue';
import { emailBat, emailBienvenue, emailPhoto, emailRelancePaiement, emailsNouvelleCommande, inscriptionNewsletter } from '@/lib/serveur/emails.server';
import site from '@/site.json';

/* Diagnostic privé de la connexion Stripe : type de clé et réponses de Stripe, jamais la clé.
   Accessible uniquement avec le jeton dont l'empreinte SHA-256 figure ci-dessous. */

const EMPREINTE = '9f4fbce10edace02641f2a03e4df9cec2fb2806a124dd86be3980b3d1149a325';

async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
}

export const Route = createFileRoute('/api/stripe/etat')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const t = new URL(request.url).searchParams.get('t') || '';
        if (t.length > 100 || (await sha256(t)) !== EMPREINTE) return new Response('Introuvable', { status: 404 });
        if (new URL(request.url).searchParams.get('test') === 'emails') return Response.json(await testEmails(), { headers: { 'Cache-Control': 'no-store' } });
        return Response.json(await etatStripe(), { headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});

/** Envoie un exemplaire de chaque email client à l'adresse de l'atelier, avec une commande fictive. */
async function testEmails() {
  const a = bindings().EMAIL_ATELIER;
  if (!a) return { ok: false, raison: 'EMAIL_ATELIER manquant' };
  const origine = new URL(site.url).origin;
  const cfg = cfgDefaut('kit-rouleau');
  if (cfg.type === 'config') cfg.roues[0].texte = 'ATELIER LUNA';
  const lignes: Ligne[] = [{ cle: 'test', cfg, qty: 1 }];
  const c = { num: 'MR-TEST', ref: '00000000-0000-0000-0000-000000000000', origine, email: a, prenom: 'Hugo', nom: 'Test', lignes, totaux: totauxCommande(lignes, { promo: null, bump: false, mode: 'relais' }), totalLigne };
  const r: Record<string, boolean | string> = {};
  await emailsNouvelleCommande({ ...c, paiementEnLigne: true }); r.confirmation = 'envoyé (client + alerte atelier)';
  await emailRelancePaiement(c, `${origine}/panier`); r.relance_paiement = 'envoyé';
  r.bat = await emailBat({ email: a, prenom: 'Hugo', nom: 'Test', num: 'MR-TEST' }, `${origine}/bat/00000000-0000-0000-0000-000000000000`, "J'ai centré votre logo et agrandi le texte.");
  await inscriptionNewsletter(a, 'BIENVENUE10'); r.bienvenue_1 = 'envoyé';
  r.bienvenue_2 = await emailBienvenue(a, 2, origine, `${origine}/api/desinscription?e=test&t=test`);
  r.bienvenue_3 = await emailBienvenue(a, 3, origine, `${origine}/api/desinscription?e=test&t=test`);
  r.photo = await emailPhoto({ email: a, prenom: 'Hugo', nom: 'Test', num: 'MR-TEST' });
  return { ok: true, destinataire: a.replace(/^(.{3}).*@/, '$1…@'), r };
}
