import { z } from 'zod';
import { bindings } from '../bindings.server';
import {
  ENCRES, P, POLICES, SEPS, taillesDe, totauxCommande, variantesDe,
  type Cfg, type Ligne, type Livraison, type ProduitConfig, type Roue, type Totaux,
} from '../catalogue';

/* Validation et enregistrement des commandes. Le serveur recalcule tous les prix :
   le total envoyé par le navigateur n'est jamais utilisé. */

export const LOGO_URL = /^\/api\/logos\/[a-f0-9-]{36}\.(png|jpg|svg)$/;

const roue = z.object({
  usage: z.enum(['packaging', 'textile']),
  mode: z.enum(['texte', 'logo']),
  texte: z.string().max(40),
  police: z.string().max(20),
  sep: z.string().max(20),
  encre: z.string().max(20),
  logo: z.string().max(120).nullable(),
  logoNom: z.string().max(160),
  ratio: z.number().min(0.1).max(10),
  raster: z.boolean(),
});
const cfgConfig = z.object({
  h: z.string().max(40),
  type: z.literal('config'),
  taille: z.enum(['S', 'M', 'L', 'L30', 'XL50']),
  qty: z.number().int().min(1).max(200),
  actif: z.number().int().min(0).max(5),
  roues: z.array(roue).min(1).max(3),
  sup: roue,
  opt: z.object({
    roueSup: z.boolean(), gravure: z.boolean(), gravureTexte: z.string().max(20),
    express: z.boolean(), coffret: z.boolean(), vecto: z.boolean(),
  }),
});
const cfgSimple = z.object({
  h: z.string().max(40),
  type: z.literal('simple'),
  qty: z.number().int().min(1).max(200),
  sel: z.record(z.string().max(20), z.string().max(40)),
});
export const schemaLigne = z.object({
  cle: z.string().max(60),
  cfg: z.discriminatedUnion('type', [cfgConfig, cfgSimple]),
  qty: z.number().int().min(1).max(200),
});
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const schemaCommande = z.object({
  lignes: z.array(schemaLigne).min(1).max(30),
  promo: z.string().max(30).nullable(),
  bump: z.boolean(),
  livraison: z.enum(['relais', 'domicile', 'express']),
  client: z.object({
    email: z.string().max(160).regex(EMAIL),
    prenom: z.string().trim().min(1).max(80),
    nom: z.string().trim().min(1).max(80),
    adresse: z.string().trim().min(1).max(200),
    cp: z.string().trim().regex(/^\d{4,5}$/),
    ville: z.string().trim().min(1).max(100),
    pays: z.enum(['France', 'Belgique', 'Luxembourg']),
    tel: z.string().trim().min(6).max(30),
  }),
  notes: z.string().max(1000),
});
export type EntreeCommande = z.infer<typeof schemaCommande>;

function verifierRoue(r: Roue, fixe: string | null, n: number) {
  if (fixe && r.usage !== fixe) throw new Error(`Roue ${n} : support non valide.`);
  if (!ENCRES[r.usage].some((e) => e.id === r.encre)) throw new Error(`Roue ${n} : couleur d'encre inconnue.`);
  if (!POLICES.some((p) => p.id === r.police)) throw new Error(`Roue ${n} : police inconnue.`);
  if (!SEPS.some((s) => s.id === r.sep)) throw new Error(`Roue ${n} : séparateur inconnu.`);
  if (r.mode === 'texte' && !r.texte.trim()) throw new Error(`Roue ${n} : le texte est vide.`);
  if (r.mode === 'logo' && !(r.logo && LOGO_URL.test(r.logo))) throw new Error(`Roue ${n} : le fichier du logo manque.`);
}
export function verifierLigne(l: Ligne) {
  const c = l.cfg as Cfg, p = P[c.h];
  if (!p || p.type !== c.type) throw new Error('Un article du panier n\'existe plus. Retirez-le puis réessayez.');
  if (c.type === 'simple' && p.type === 'simple') {
    const opts = p.options || {};
    for (const [k, v] of Object.entries(c.sel)) if (!opts[k]?.some((o) => o.id === v)) throw new Error(`${p.nom} : option non valide.`);
    for (const k of Object.keys(opts)) if (!c.sel[k]) throw new Error(`${p.nom} : option manquante.`);
    return;
  }
  if (c.type !== 'config') return;
  const pc = p as ProduitConfig;
  if (!taillesDe(pc).includes(c.taille)) throw new Error(`${pc.nom} : taille non valide.`);
  if (c.roues.length !== pc.roues.length) throw new Error(`${pc.nom} : nombre de roues non valide.`);
  c.roues.forEach((r, i) => verifierRoue(r, pc.roues[i], i + 1));
  if (pc.roueSup && c.opt.roueSup) verifierRoue(c.sup, null, c.roues.length + 1);
  if (pc.supports && c.opt.gravure && !c.opt.gravureTexte.trim()) throw new Error('Indiquez le texte à graver sur le support.');
}

export interface CommandeRow {
  id: number; ref: string; num: string | null; created_at: string; statut: string; paiement: string;
  stripe_session: string | null; email: string; client: string; livraison: string; articles: string; totaux: string; notes: string | null;
}
export interface CommandePublique {
  ref: string; num: string; date: string; statut: string; paiement: string; livraison: Livraison;
  client: EntreeCommande['client']; lignes: Ligne[]; totaux: Omit<Totaux, 'lignes'>; notes: string;
}
export const versPublique = (r: CommandeRow): CommandePublique => {
  const t = JSON.parse(r.totaux) as Totaux;
  return {
    ref: r.ref, num: r.num || `MR-${1040 + r.id}`, date: r.created_at.replace(' ', 'T') + 'Z', statut: r.statut, paiement: r.paiement,
    livraison: r.livraison as Livraison, client: JSON.parse(r.client), lignes: JSON.parse(r.articles), notes: r.notes || '',
    totaux: { st: t.st, rp: t.rp, port: t.port, total: t.total, promo: t.promo },
  };
};

/* Schéma créé automatiquement au premier accès : aucune migration à lancer à la main.
   Toutes les instructions sont idempotentes (IF NOT EXISTS). */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT NOT NULL UNIQUE, num TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')), statut TEXT NOT NULL DEFAULT 'BAT à envoyer',
    paiement TEXT NOT NULL DEFAULT 'a_regler', stripe_session TEXT, stripe_pi TEXT, email TEXT NOT NULL, client TEXT NOT NULL,
    livraison TEXT NOT NULL, articles TEXT NOT NULL, totaux TEXT NOT NULL, notes TEXT)`,
  'CREATE INDEX IF NOT EXISTS commandes_email ON commandes (email)',
  `CREATE TABLE IF NOT EXISTS devis (
    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')), nom TEXT NOT NULL,
    societe TEXT NOT NULL DEFAULT '', email TEXT NOT NULL, quantite TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS abonnes (email TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
];
let schemaPret: Promise<unknown> | null = null;

export async function db() {
  const { DB } = bindings();
  if (!DB) throw new Error('La base de données n\'est pas encore disponible. Réessayez dans quelques minutes.');
  if (!schemaPret) schemaPret = DB.batch(SCHEMA.map((q) => DB.prepare(q))).catch((e) => { schemaPret = null; throw e; });
  await schemaPret;
  return DB;
}

export async function enregistrerCommande(e: EntreeCommande, origine: string) {
  e.lignes.forEach((l) => verifierLigne(l as Ligne));
  const t = totauxCommande(e.lignes as Ligne[], { promo: e.promo ? e.promo.toUpperCase() : null, bump: e.bump, mode: e.livraison });
  const ref = crypto.randomUUID();
  const D = await db();
  const ligne = await D.prepare(
    'INSERT INTO commandes (ref, email, client, livraison, articles, totaux, notes) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
  ).bind(ref, e.client.email, JSON.stringify(e.client), e.livraison, JSON.stringify(t.lignes), JSON.stringify(t), e.notes.trim()).first<{ id: number }>();
  if (!ligne) throw new Error('La commande n\'a pas pu être enregistrée.');
  const num = `MR-${1040 + ligne.id}`;
  await D.prepare('UPDATE commandes SET num = ? WHERE id = ?').bind(num, ligne.id).run();

  const cle = bindings().STRIPE_SECRET_KEY;
  if (!cle) return { ref, url: null as string | null };
  const resume = t.lignes.map((a) => `${P[a.cfg.h].nom} x${a.qty}`).join(', ').slice(0, 480);
  const b = new URLSearchParams();
  b.set('mode', 'payment');
  b.set('locale', 'fr');
  b.set('customer_email', e.client.email);
  b.set('client_reference_id', num);
  b.set('metadata[ref]', ref);
  b.set('success_url', `${origine}/confirmation/${ref}?session_id={CHECKOUT_SESSION_ID}`);
  b.set('cancel_url', `${origine}/commande?annule=1`);
  b.set('line_items[0][quantity]', '1');
  b.set('line_items[0][price_data][currency]', 'eur');
  b.set('line_items[0][price_data][unit_amount]', String(Math.round(t.total * 100)));
  b.set('line_items[0][price_data][product_data][name]', `Commande ${num}, Mark & Roll`);
  b.set('line_items[0][price_data][product_data][description]', resume || 'Commande');
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: b,
  });
  const s = (await r.json().catch(() => null)) as { id?: string; url?: string } | null;
  if (!r.ok || !s?.id || !s.url) {
    console.error('Stripe', r.status, s);
    return { ref, url: null };
  }
  await D.prepare("UPDATE commandes SET stripe_session = ?, paiement = 'en_attente' WHERE id = ?").bind(s.id, ligne.id).run();
  return { ref, url: s.url };
}

export async function lireCommande(ref: string, session?: string) {
  const D = await db();
  let row = await D.prepare('SELECT * FROM commandes WHERE ref = ?').bind(ref).first<CommandeRow>();
  if (!row) return null;
  const cle = bindings().STRIPE_SECRET_KEY;
  if (row.paiement === 'en_attente' && cle && session && session === row.stripe_session) {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session)}`, { headers: { Authorization: `Bearer ${cle}` } });
    const s = (await r.json().catch(() => null)) as { payment_status?: string } | null;
    if (r.ok && s?.payment_status === 'paid') {
      await D.prepare("UPDATE commandes SET paiement = 'payee' WHERE id = ?").bind(row.id).run();
      row = { ...row, paiement: 'payee' };
    }
  }
  return versPublique(row);
}

export const resumeLigne = (a: Ligne) => `${P[a.cfg.h].nom} x${a.qty} (${variantesDe(a).join(' ; ')})`;
