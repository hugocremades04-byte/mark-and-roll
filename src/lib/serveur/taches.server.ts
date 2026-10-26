import site from '../../site.json';
import { bindings } from '../bindings.server';
import { db, type CommandeRow } from './commandes.server';
import { emailBienvenue, emailPhoto } from './emails.server';
import { jeton } from './jeton.server';

/* Tâches quotidiennes (déclencheur Cloudflare, voir wrangler.jsonc > triggers) :
   - séquence de bienvenue de la newsletter (J+2, J+5) ;
   - demande de photo 5 jours après l'expédition.
   Rien ne part tant que la clé Brevo n'est pas réglée. */

export async function tachesQuotidiennes() {
  const b = bindings();
  if (!b.BREVO_API_KEY || !b.EMAIL_EXPEDITEUR) return { envoyes: 0, raison: 'Brevo non configuré' };
  const D = await db();
  const origine = new URL(site.url).origin;
  let envoyes = 0;

  const abonnes = await D.prepare(
    `SELECT email, etape, created_at FROM abonnes WHERE desinscrit = 0 AND (
       (etape = 1 AND created_at <= datetime('now', '-2 days')) OR (etape = 2 AND created_at <= datetime('now', '-5 days'))
     ) LIMIT 100`,
  ).all<{ email: string; etape: number }>();
  for (const a of abonnes.results || []) {
    const etape = (a.etape + 1) as 2 | 3;
    const lien = `${origine}/api/desinscription?e=${encodeURIComponent(a.email)}&t=${await jeton(a.email)}`;
    if (await emailBienvenue(a.email, etape, origine, lien)) envoyes++;
    await D.prepare('UPDATE abonnes SET etape = ? WHERE email = ?').bind(etape, a.email).run();
  }

  const cmds = await D.prepare(
    `SELECT * FROM commandes WHERE statut = 'Expédiée' AND expediee_at <= datetime('now', '-5 days')
       AND (photo_demandee IS NULL OR photo_demandee = 0) LIMIT 50`,
  ).all<CommandeRow>();
  for (const r of cmds.results || []) {
    const c = JSON.parse(r.client) as { email: string; prenom: string; nom: string };
    if (await emailPhoto({ ...c, num: r.num || `MR-${1040 + r.id}` })) envoyes++;
    await D.prepare('UPDATE commandes SET photo_demandee = 1 WHERE id = ?').bind(r.id).run();
  }
  return { envoyes };
}
