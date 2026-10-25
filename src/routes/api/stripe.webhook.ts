import { createFileRoute } from '@tanstack/react-router';
import { bindings } from '@/lib/bindings.server';
import { db } from '@/lib/serveur/commandes.server';
import { emailAlerteAtelier, emailPaiementRecu } from '@/lib/serveur/emails.server';

/* Webhook Stripe : marque la commande payée même si le client ferme la page avant le retour.
   Adresse à déclarer dans Stripe : https://<votre-domaine>/api/stripe/webhook
   Événements : checkout.session.completed, checkout.session.async_payment_succeeded,
   checkout.session.async_payment_failed, checkout.session.expired, charge.refunded, charge.dispute.created. */

const TOLERANCE_S = 300;
const texte = (msg: string, status: number) => new Response(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });

async function signatureValide(corps: string, entete: string, secret: string): Promise<boolean> {
  const parts = entete.split(',').map((x) => x.trim().split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > TOLERANCE_S) return false;
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(`${t}.${corps}`)));
  const attendu = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
  // Comparaison à temps constant
  return sigs.some((s) => {
    if (s.length !== attendu.length) return false;
    let d = 0;
    for (let i = 0; i < s.length; i++) d |= s.charCodeAt(i) ^ attendu.charCodeAt(i);
    return d === 0;
  });
}

interface Session { id: string; payment_status?: string; payment_intent?: string | null; metadata?: { ref?: string } }
interface Charge { payment_intent?: string | null; refunded?: boolean; amount?: number; reason?: string }

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = bindings().STRIPE_WEBHOOK_SECRET;
        if (!secret) return texte('Webhook non configuré.', 503);
        const corps = await request.text();
        const ok = await signatureValide(corps, request.headers.get('stripe-signature') || '', secret);
        if (!ok) return texte('Signature invalide.', 400);
        const evt = JSON.parse(corps) as { type: string; data: { object: Session & Charge } };
        const D = await db();
        if (evt.type === 'checkout.session.completed' || evt.type === 'checkout.session.async_payment_succeeded') {
          const s = evt.data.object;
          if (s.payment_status === 'paid') {
            const avant = await D.prepare('SELECT num, paiement, totaux FROM commandes WHERE stripe_session = ? OR ref = ?').bind(s.id, s.metadata?.ref ?? '').first<{ num: string; paiement: string; totaux: string }>();
            await D.prepare("UPDATE commandes SET paiement = 'payee', stripe_pi = ? WHERE stripe_session = ? OR ref = ?").bind(s.payment_intent ?? null, s.id, s.metadata?.ref ?? '').run();
            if (avant && avant.paiement !== 'payee') {
              await emailPaiementRecu(avant.num, (JSON.parse(avant.totaux) as { total: number }).total, new URL(request.url).origin);
            }
          }
        } else if (evt.type === 'checkout.session.async_payment_failed' || evt.type === 'checkout.session.expired') {
          // Paiement refusé ou session abandonnée : la commande repasse « à régler »
          const s = evt.data.object;
          const row = await D.prepare("SELECT num FROM commandes WHERE (stripe_session = ? OR ref = ?) AND paiement = 'en_attente'").bind(s.id, s.metadata?.ref ?? '').first<{ num: string }>();
          if (row) {
            await D.prepare("UPDATE commandes SET paiement = 'a_regler' WHERE stripe_session = ? OR ref = ?").bind(s.id, s.metadata?.ref ?? '').run();
            if (evt.type === 'checkout.session.async_payment_failed') await emailAlerteAtelier(`Paiement refusé : ${row.num}`, 'Le paiement différé a échoué. Relancez le client avec un nouveau lien de paiement.', new URL(request.url).origin);
          }
        } else if (evt.type === 'charge.dispute.created') {
          const c = evt.data.object;
          await emailAlerteAtelier('Litige ouvert sur un paiement', `Un client conteste un paiement${c.amount ? ` de ${(c.amount / 100).toFixed(2).replace('.', ',')} €` : ''}${c.reason ? ` (motif : ${c.reason})` : ''}. Répondez dans le tableau de bord Stripe avant la date limite.`, new URL(request.url).origin);
        } else if (evt.type === 'charge.refunded') {
          // Remboursement total : la commande passe en « remboursée » (session retrouvée par le paiement)
          const c = evt.data.object;
          if (c.refunded && c.payment_intent) {
            await D.prepare("UPDATE commandes SET paiement = 'remboursee' WHERE stripe_pi = ?").bind(c.payment_intent).run();
          }
        }
        return texte('ok', 200);
      },
    },
  },
});
