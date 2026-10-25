import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { STATUTS } from '../catalogue';
import { connecter, deconnecter, estConnecte } from '../serveur/atelier.server';
import { db, versPublique, type CommandeRow } from '../serveur/commandes.server';

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
      await (await db()).prepare('UPDATE commandes SET statut = ? WHERE id = ?').bind(data.statut, data.id).run();
    }
    if (data.paiement) await (await db()).prepare('UPDATE commandes SET paiement = ? WHERE id = ?').bind(data.paiement, data.id).run();
    return { ok: true };
  });
