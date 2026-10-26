import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { STATUTS } from '../catalogue';
import { connecter, deconnecter, estConnecte } from '../serveur/atelier.server';
import { db, versPublique, type CommandeRow } from '../serveur/commandes.server';
import { emailBat } from '../serveur/emails.server';
import site from '../../site.json';

export interface DevisRow { id: number; created_at: string; nom: string; societe: string; email: string; quantite: string; message: string }

export const etatAtelier = createServerFn({ method: 'GET' }).handler(async () => {
  if (!(await estConnecte())) return { connecte: false as const };
  const D = await db();
  const [c, d, a] = await Promise.all([
    D.prepare('SELECT * FROM commandes ORDER BY id DESC LIMIT 300').all<CommandeRow>(),
    D.prepare('SELECT * FROM devis ORDER BY id DESC LIMIT 200').all<DevisRow>(),
    D.prepare('SELECT email, created_at FROM abonnes ORDER BY created_at DESC LIMIT 1000').all<{ email: string; created_at: string }>(),
  ]);
  return {
    connecte: true as const,
    commandes: (c.results || []).map((r) => ({ id: r.id, ...versPublique(r) })),
    devis: d.results || [],
    abonnes: a.results || [],
  };
});

export const connexionAtelier = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().max(200) }))
  .handler(async ({ data }) => ({ ok: await connecter(data.code) }));

export const deconnexionAtelier = createServerFn({ method: 'POST' }).handler(async () => {
  deconnecter();
  return { ok: true };
});

export const majCommande = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.number().int().positive(),
    statut: z.string().optional(),
    paiement: z.enum(['a_regler', 'en_attente', 'payee', 'remboursee']).optional(),
  }))
  .handler(async ({ data }) => {
    if (!(await estConnecte())) throw new Error('Session atelier expirée.');
    if (data.statut) {
      if (!STATUTS.includes(data.statut)) throw new Error('Statut inconnu.');
      await (await db()).prepare("UPDATE commandes SET statut = ?, expediee_at = CASE WHEN ? = 'Expédiée' THEN COALESCE(expediee_at, datetime('now')) ELSE expediee_at END WHERE id = ?").bind(data.statut, data.statut, data.id).run();
    }
    if (data.paiement) await (await db()).prepare('UPDATE commandes SET paiement = ? WHERE id = ?').bind(data.paiement, data.id).run();
    return { ok: true };
  });

/** Statistiques de la période : compteurs agrégés (table stats) et commandes (source, paiement, total). */
export const statsAtelier = createServerFn({ method: 'GET' })
  .validator(z.object({ jours: z.number().int().min(1).max(366) }))
  .handler(async ({ data }) => {
    if (!(await estConnecte())) throw new Error('Session atelier expirée.');
    const D = await db();
    const jour = (d: Date) => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    const depuis = jour(new Date(Date.now() - (data.jours - 1) * 864e5));
    const [ev, cmd] = await Promise.all([
      D.prepare('SELECT jour, evt, cle, source, SUM(n) AS n FROM stats WHERE jour >= ? GROUP BY jour, evt, cle, source').bind(depuis)
        .all<{ jour: string; evt: string; cle: string; source: string; n: number }>(),
      D.prepare("SELECT created_at, paiement, totaux, source FROM commandes WHERE created_at >= ? AND statut != 'Annulée'").bind(`${depuis} 00:00:00`)
        .all<{ created_at: string; paiement: string; totaux: string; source: string | null }>(),
    ]);
    return {
      depuis,
      evenements: ev.results || [],
      commandes: (cmd.results || []).map((r) => {
        const t = JSON.parse(r.totaux) as { total: number; promo: string | null };
        return { jour: jour(new Date(r.created_at.replace(' ', 'T') + 'Z')), payee: r.paiement === 'payee', total: t.total, promo: t.promo, source: r.source || 'direct' };
      }),
    };
  });

/** Envoie le BAT au client : lien vers sa page de validation (et email si Brevo est branché). */
export const envoyerBat = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number().int().positive(), note: z.string().max(600).optional() }))
  .handler(async ({ data }) => {
    if (!(await estConnecte())) throw new Error('Session atelier expirée.');
    const D = await db();
    const r = await D.prepare('SELECT * FROM commandes WHERE id = ?').bind(data.id).first<CommandeRow>();
    if (!r) throw new Error('Commande introuvable.');
    const note = (data.note || '').trim() || null;
    await D.prepare("UPDATE commandes SET bat_envoye_at = datetime('now'), bat_note = ?, bat_reponse = NULL, bat_commentaire = NULL, statut = 'BAT envoyé' WHERE id = ?")
      .bind(note, r.id).run();
    const c = versPublique(r);
    const url = `${new URL(site.url).origin}/bat/${r.ref}`;
    const email = await emailBat({ email: c.client.email, prenom: c.client.prenom, nom: c.client.nom, num: c.num }, url, note);
    return { url, email };
  });
