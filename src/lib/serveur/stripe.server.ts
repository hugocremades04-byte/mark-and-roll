import { bindings } from '../bindings.server';
import type { D1Database } from '@cloudflare/workers-types';
import { P, variantesDe, type Ligne, type Livraison, type Totaux } from '../catalogue';

/* Appels à l'API Stripe (REST, sans SDK : le Worker reste léger).
   Clé recommandée : une clé restreinte (rk_...) avec seulement « Checkout Sessions : écriture »,
   rangée dans le secret STRIPE_SECRET_KEY de Cloudflare. Jamais dans le code. */

export const STRIPE_VERSION = '2026-09-30.endive';
/** Étiquette du parcours de paiement, visible dans le tableau de bord Stripe. */
const INTEGRATION_ID = 'mark-and-roll-checkout-qmpvrnci';

export async function stripe<T>(chemin: string, init: { method?: 'GET' | 'POST'; corps?: URLSearchParams } = {}): Promise<{ ok: boolean; status: number; data: T | null }> {
  const cle = bindings().STRIPE_SECRET_KEY;
  if (!cle) return { ok: false, status: 0, data: null };
  const r = await fetch(`https://api.stripe.com/v1${chemin}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${cle}`,
      'Stripe-Version': STRIPE_VERSION,
      ...(init.corps ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: init.corps,
  });
  const data = (await r.json().catch(() => null)) as T | null;
  if (!r.ok) console.error('Stripe', chemin, r.status, (data as { error?: { message?: string } } | null)?.error?.message);
  return { ok: r.ok, status: r.status, data };
}

const LIB_LIVRAISON: Record<Livraison, string> = { relais: 'Point relais', domicile: 'Livraison à domicile', express: 'Livraison express' };

export interface EntreeSession {
  num: string; ref: string; origine: string; email: string; livraison: Livraison;
  totaux: Totaux; totalLigne: (a: Ligne) => number;
}

/** Crée la session Stripe Checkout : un article par ligne du panier, la livraison en option d'expédition.
   Le montant total facturé par Stripe est exactement celui calculé par le serveur. */
export async function creerSessionCheckout(e: EntreeSession) {
  const t = e.totaux;
  const taux = t.st > 0 ? t.rp / t.st : 0;
  const nets = t.lignes.map((a) => Math.round(e.totalLigne(a) * (1 - taux) * 100));
  const cible = Math.round((t.st - t.rp) * 100);
  if (nets.length) nets[nets.length - 1] += cible - nets.reduce((s, n) => s + n, 0);

  const b = new URLSearchParams();
  b.set('mode', 'payment');
  b.set('locale', 'fr');
  b.set('customer_email', e.email);
  b.set('client_reference_id', e.num);
  b.set('metadata[ref]', e.ref);
  b.set('metadata[num]', e.num);
  b.set('payment_intent_data[description]', `Commande ${e.num}`);
  b.set('payment_intent_data[metadata][ref]', e.ref);
  b.set('payment_intent_data[metadata][num]', e.num);
  b.set('success_url', `${e.origine}/confirmation/${e.ref}?session_id={CHECKOUT_SESSION_ID}`);
  b.set('cancel_url', `${e.origine}/commande?annule=1`);
  b.set('integration_identifier', INTEGRATION_ID);
  b.set('submit_type', 'pay');
  b.set('custom_text[submit][message]', 'Rien n\'est gravé avant votre accord : vous recevez le BAT par email sous 24 h ouvrées.');
  // Pas de payment_method_types : Stripe propose les moyens de paiement activés dans le tableau de bord
  // (carte, Apple Pay, Google Pay, etc.).
  t.lignes.forEach((a, i) => {
    const p = P[a.cfg.h];
    const k = `line_items[${i}]`;
    b.set(`${k}[quantity]`, '1');
    b.set(`${k}[price_data][currency]`, 'eur');
    b.set(`${k}[price_data][unit_amount]`, String(Math.max(0, nets[i])));
    b.set(`${k}[price_data][product_data][name]`, `${p?.nom ?? a.cfg.h}${a.qty > 1 ? ` × ${a.qty}` : ''}`);
    const d = variantesDe(a).join(' ; ').slice(0, 480);
    if (d) b.set(`${k}[price_data][product_data][description]`, d);
  });
  b.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  b.set('shipping_options[0][shipping_rate_data][display_name]', t.port ? LIB_LIVRAISON[e.livraison] : `${LIB_LIVRAISON[e.livraison]}, offerte`);
  b.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(Math.round(t.port * 100)));
  b.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
  // Facture PDF automatique envoyée par Stripe (option payante côté Stripe) : variable STRIPE_FACTURES = 1.
  if (bindings().STRIPE_FACTURES === '1') {
    b.set('invoice_creation[enabled]', 'true');
    b.set('invoice_creation[invoice_data][description]', `Commande ${e.num}`);
    b.set('invoice_creation[invoice_data][metadata][ref]', e.ref);
  }
  return stripe<{ id: string; url: string }>('/checkout/sessions', { method: 'POST', corps: b });
}

export const EVENEMENTS_WEBHOOK = [
  'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
  'checkout.session.expired', 'charge.refunded', 'charge.dispute.created',
];

/** Mode de la clé (test ou live) : un webhook est déclaré pour chacun. */
const modeCle = () => (/_live_/.test(bindings().STRIPE_SECRET_KEY || '') ? 'live' : 'test');

/** Déclare automatiquement l'adresse du webhook chez Stripe, une seule fois par mode et par adresse.
   Aucun secret à recopier : le webhook vérifie chaque événement en le relisant chez Stripe. */
export async function assurerWebhook(D: D1Database, origine: string) {
  if (!bindings().STRIPE_SECRET_KEY) return;
  const url = `${origine}/api/stripe/webhook`;
  const cle = `stripe_webhook_${modeCle()}`;
  try {
    const deja = await D.prepare('SELECT valeur FROM reglages WHERE cle = ?').bind(cle).first<{ valeur: string }>();
    if (deja?.valeur === url) return;
    const liste = await stripe<{ data: { id: string; url: string; status: string }[] }>('/webhook_endpoints?limit=100');
    if (!liste.ok) return;
    if (!liste.data?.data.some((w) => w.url === url && w.status === 'enabled')) {
      const b = new URLSearchParams();
      b.set('url', url);
      b.set('description', 'Boutique Mark & Roll');
      b.set('api_version', STRIPE_VERSION);
      EVENEMENTS_WEBHOOK.forEach((e, i) => b.set(`enabled_events[${i}]`, e));
      const r = await stripe<{ id: string }>('/webhook_endpoints', { method: 'POST', corps: b });
      if (!r.ok) return;
    }
    await D.prepare("INSERT INTO reglages (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur, updated_at = datetime('now')").bind(cle, url).run();
  } catch (e) {
    console.error('Webhook Stripe', e);
  }
}
