import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { bindings } from '../bindings.server';
import { db, enregistrerCommande, lireCommande, schemaCommande } from '../serveur/commandes.server';
import { emailsDevis, inscriptionNewsletter } from '../serveur/emails.server';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const configPublique = createServerFn({ method: 'GET' }).handler(async () => ({
  paiementActif: !!bindings().STRIPE_SECRET_KEY,
}));

export const passerCommande = createServerFn({ method: 'POST' })
  .validator(schemaCommande)
  .handler(async ({ data }) => {
    try {
      const origine = new URL(getRequest().url).origin;
      const r = await enregistrerCommande(data, origine);
      return { ok: true as const, ref: r.ref, url: r.url };
    } catch (e) {
      return { ok: false as const, erreur: e instanceof Error ? e.message : 'La commande n\'a pas pu être enregistrée.' };
    }
  });

export const commandePublique = createServerFn({ method: 'GET' })
  .validator(z.object({ ref: z.string().uuid(), session: z.string().max(200).optional() }))
  .handler(async ({ data }) => lireCommande(data.ref, data.session));

export const envoyerDevis = createServerFn({ method: 'POST' })
  .validator(z.object({
    nom: z.string().trim().min(1).max(120),
    societe: z.string().max(160),
    email: z.string().max(160).regex(EMAIL),
    quantite: z.string().max(40),
    message: z.string().max(3000),
  }))
  .handler(async ({ data }) => {
    await (await db()).prepare('INSERT INTO devis (nom, societe, email, quantite, message) VALUES (?, ?, ?, ?, ?)')
      .bind(data.nom, data.societe, data.email, data.quantite, data.message).run();
    await emailsDevis(data);
    return { ok: true };
  });

export const inscrireNews = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().max(160).regex(EMAIL) }))
  .handler(async ({ data }) => {
    await (await db()).prepare('INSERT OR IGNORE INTO abonnes (email) VALUES (?)').bind(data.email.toLowerCase()).run();
    await inscriptionNewsletter(data.email.toLowerCase(), 'BIENVENUE10');
    return { ok: true, code: 'BIENVENUE10' };
  });
