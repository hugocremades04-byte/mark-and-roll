import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import site from '../../site.json';
import { db, versPublique, type CommandeRow } from '../serveur/commandes.server';
import { emailAlerteAtelier } from '../serveur/emails.server';

/* Page BAT publique : le client voit l'aperçu de sa gravure et valide en un clic.
   L'adresse contient la référence secrète de la commande (UUID), comme la page de confirmation. */

export const batPublic = createServerFn({ method: 'GET' })
  .validator(z.object({ ref: z.string().uuid() }))
  .handler(async ({ data }) => {
    const r = await (await db()).prepare('SELECT * FROM commandes WHERE ref = ?').bind(data.ref).first<CommandeRow>();
    if (!r || !r.bat_envoye_at) return null;
    const c = versPublique(r);
    return { ref: c.ref, num: c.num, prenom: c.client.prenom, statut: c.statut, lignes: c.lignes, bat: c.bat };
  });

export const repondreBat = createServerFn({ method: 'POST' })
  .validator(z.object({ ref: z.string().uuid(), action: z.enum(['valide', 'modif']), commentaire: z.string().max(1000).optional() }))
  .handler(async ({ data }) => {
    const D = await db();
    const r = await D.prepare('SELECT id, num, statut, bat_envoye_at FROM commandes WHERE ref = ?').bind(data.ref)
      .first<{ id: number; num: string; statut: string; bat_envoye_at: string | null }>();
    if (!r || !r.bat_envoye_at) throw new Error('BAT introuvable.');
    if (!['BAT à envoyer', 'BAT envoyé', 'BAT validé'].includes(r.statut)) throw new Error('Cette commande est déjà en fabrication : écrivez-nous pour toute modification.');
    const origine = new URL(site.url).origin;
    if (data.action === 'valide') {
      await D.prepare("UPDATE commandes SET statut = 'BAT validé', bat_reponse = 'validé', bat_commentaire = NULL WHERE id = ?").bind(r.id).run();
      await emailAlerteAtelier(`BAT validé : ${r.num}`, 'Le client a validé son BAT. La commande peut partir en fabrication.', origine);
    } else {
      const txt = (data.commentaire || '').trim();
      if (!txt) throw new Error('Dites-nous ce qu\'il faut changer.');
      await D.prepare("UPDATE commandes SET statut = 'BAT à envoyer', bat_reponse = 'modification', bat_commentaire = ? WHERE id = ?").bind(txt, r.id).run();
      await emailAlerteAtelier(`Modification demandée : ${r.num}`, `Le client demande : « ${txt} »`, origine);
    }
    return { ok: true };
  });
