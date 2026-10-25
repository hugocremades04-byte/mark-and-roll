import { bindings } from '../bindings.server';
import { P, eur, variantesDe, type Ligne, type Totaux } from '../catalogue';

/* Emails via Brevo (API transactionnelle). Tout est facultatif : sans BREVO_API_KEY,
   les fonctions ne font rien et la boutique fonctionne normalement.
   Réglages (Cloudflare > Workers > mark-and-roll > Paramètres > Variables et secrets) :
   - BREVO_API_KEY      (secret)   clé API Brevo
   - EMAIL_EXPEDITEUR   (variable) adresse d'envoi validée dans Brevo, ex. commandes@markandroll.fr
   - EMAIL_ATELIER      (variable) adresse qui reçoit les alertes de commande et de devis
   - BREVO_LISTE_ID     (variable) numéro de la liste Brevo des inscrits à la newsletter */

const API = 'https://api.brevo.com/v3';
const echap = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function config() {
  const b = bindings();
  return { cle: b.BREVO_API_KEY, de: b.EMAIL_EXPEDITEUR, atelier: b.EMAIL_ATELIER, liste: Number(b.BREVO_LISTE_ID || 0) };
}

async function brevo(chemin: string, corps: unknown): Promise<boolean> {
  const { cle } = config();
  if (!cle) return false;
  try {
    const r = await fetch(`${API}${chemin}`, {
      method: 'POST',
      headers: { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corps),
    });
    if (!r.ok && r.status !== 204) console.error('Brevo', chemin, r.status, await r.text().catch(() => ''));
    return r.ok;
  } catch (e) {
    console.error('Brevo', chemin, e);
    return false;
  }
}

/** Gabarit sobre aux couleurs de la marque. */
function gabarit(titre: string, corps: string, bouton?: { lib: string; url: string }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#111317">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px">
<tr><td style="padding:26px 28px 6px"><span style="font-size:22px;font-weight:800;letter-spacing:-0.5px">mark<span style="color:#2B44E0">&amp;</span>roll</span></td></tr>
<tr><td style="padding:8px 28px 4px"><h1 style="font-size:22px;line-height:1.25;margin:0">${titre}</h1></td></tr>
<tr><td style="padding:8px 28px 22px;font-size:15px;line-height:1.55;color:#2C3038">${corps}
${bouton ? `<p style="margin:22px 0 0"><a href="${bouton.url}" style="display:inline-block;background:#2B44E0;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px">${bouton.lib}</a></p>` : ''}
</td></tr></table>
<p style="font-size:12px;color:#5A5F69;margin:14px 0 0">Mark &amp; Roll, rouleaux tampons fabriqués à la commande en France.</p>
</td></tr></table></body></html>`;
}

function tableauLignes(lignes: Ligne[], t: Pick<Totaux, 'st' | 'rp' | 'port' | 'total' | 'promo'>, totalLigne: (a: Ligne) => number) {
  const l = lignes.map((a) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E2E2DD"><strong>${echap(P[a.cfg.h]?.nom ?? a.cfg.h)} × ${a.qty}</strong><br><span style="font-size:13px;color:#5A5F69">${variantesDe(a).map(echap).join('<br>')}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #E2E2DD;white-space:nowrap">${eur(totalLigne(a))}</td></tr>`).join('');
  const ligne = (lib: string, v: string, gras = false) => `<tr><td style="padding:4px 0;${gras ? 'font-weight:700;font-size:16px' : ''}">${lib}</td><td align="right" style="padding:4px 0;${gras ? 'font-weight:700;font-size:16px' : ''}">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0">${l}
${ligne('Sous-total', eur(t.st))}${t.rp ? ligne(`Code ${echap(t.promo || '')}`, `−${eur(t.rp)}`) : ''}${ligne('Livraison', t.port ? eur(t.port) : 'Offerte')}${ligne('Total TTC', eur(t.total), true)}</table>`;
}

export interface InfoCommande {
  num: string; ref: string; origine: string; email: string; prenom: string; nom: string;
  lignes: Ligne[]; totaux: Totaux; totalLigne: (a: Ligne) => number; paiementEnLigne: boolean;
}

/** Accusé de réception au client et alerte à l'atelier. */
export async function emailsNouvelleCommande(c: InfoCommande) {
  const { de, atelier } = config();
  if (!de) return;
  const lien = `${c.origine}/confirmation/${c.ref}`;
  const recap = tableauLignes(c.lignes, c.totaux, c.totalLigne);
  await brevo('/smtp/email', {
    sender: { name: 'Mark & Roll', email: de },
    to: [{ email: c.email, name: `${c.prenom} ${c.nom}` }],
    replyTo: atelier ? { email: atelier } : undefined,
    subject: `Commande ${c.num} reçue`,
    htmlContent: gabarit(`Merci ${echap(c.prenom)}, votre commande est enregistrée.`,
      `<p>Commande <strong>${c.num}</strong>. ${c.paiementEnLigne ? 'Votre paiement est en cours de confirmation.' : 'Vous réglerez après validation du BAT.'}</p>
<p><strong>Et maintenant ?</strong> Nous vous envoyons le bon à tirer (BAT) par email sous 24 h ouvrées. Rien n'est gravé sans votre accord ; dès validation, votre commande part en fabrication et est expédiée sous 3 jours ouvrés.</p>${recap}`,
      { lib: 'Suivre ma commande', url: lien }),
  });
  if (atelier) {
    await brevo('/smtp/email', {
      sender: { name: 'Boutique Mark & Roll', email: de },
      to: [{ email: atelier }],
      replyTo: { email: c.email },
      subject: `Nouvelle commande ${c.num} : ${eur(c.totaux.total)}`,
      htmlContent: gabarit(`Nouvelle commande ${c.num}`, `<p>${echap(c.prenom)} ${echap(c.nom)} (${echap(c.email)}), ${c.paiementEnLigne ? 'paiement en ligne en cours' : 'paiement après BAT'}.</p>${recap}`,
        { lib: 'Ouvrir l\'atelier', url: `${c.origine}/atelier` }),
    });
  }
}

/** Alerte à l'atelier quand Stripe confirme un paiement. */
export async function emailPaiementRecu(num: string, total: number, origine: string) {
  const { de, atelier } = config();
  if (!de || !atelier) return;
  await brevo('/smtp/email', {
    sender: { name: 'Boutique Mark & Roll', email: de },
    to: [{ email: atelier }],
    subject: `Paiement reçu : ${num} (${eur(total)})`,
    htmlContent: gabarit(`Paiement reçu pour ${num}`, `<p>Stripe confirme le paiement de ${eur(total)}. Le BAT peut partir.</p>`, { lib: 'Ouvrir l\'atelier', url: `${origine}/atelier` }),
  });
}

/** Demande de devis : alerte à l'atelier et accusé de réception. */
export async function emailsDevis(d: { nom: string; societe: string; email: string; quantite: string; message: string }) {
  const { de, atelier } = config();
  if (!de) return;
  if (atelier) {
    await brevo('/smtp/email', {
      sender: { name: 'Boutique Mark & Roll', email: de },
      to: [{ email: atelier }],
      replyTo: { email: d.email, name: d.nom },
      subject: `Demande de devis : ${d.societe || d.nom}${d.quantite ? ` (${d.quantite})` : ''}`,
      htmlContent: gabarit('Nouvelle demande de devis', `<p><strong>${echap(d.nom)}</strong>${d.societe ? `, ${echap(d.societe)}` : ''}<br>${echap(d.email)}<br>Quantité : ${echap(d.quantite || 'non précisée')}</p><p>${echap(d.message).replace(/\n/g, '<br>')}</p>`),
    });
  }
  await brevo('/smtp/email', {
    sender: { name: 'Mark & Roll', email: de },
    to: [{ email: d.email, name: d.nom }],
    replyTo: atelier ? { email: atelier } : undefined,
    subject: 'Votre demande de devis Mark & Roll',
    htmlContent: gabarit(`Merci ${echap(d.nom)}, nous avons bien reçu votre demande.`, '<p>Nous revenons vers vous sous 24 h ouvrées avec une proposition chiffrée et un premier BAT si vous nous avez transmis votre logo.</p>'),
  });
}

/** Inscription newsletter : ajout à la liste Brevo et email de bienvenue avec le code. */
export async function inscriptionNewsletter(email: string, code: string) {
  const { de, liste } = config();
  if (liste) await brevo('/contacts', { email, listIds: [liste], updateEnabled: true });
  if (!de) return;
  await brevo('/smtp/email', {
    sender: { name: 'Mark & Roll', email: de },
    to: [{ email }],
    subject: `Votre code de bienvenue : ${code}`,
    htmlContent: gabarit('Bienvenue chez Mark & Roll', `<p>Voici votre code : <strong style="font-size:18px;letter-spacing:1px">${code}</strong>, soit 10 % sur votre première commande. Saisissez-le dans le panier.</p>`),
  });
}

/** Alerte générique à l'atelier (paiement refusé, litige). */
export async function emailAlerteAtelier(sujet: string, texte: string, origine: string) {
  const { de, atelier } = config();
  if (!de || !atelier) return;
  await brevo('/smtp/email', {
    sender: { name: 'Boutique Mark & Roll', email: de },
    to: [{ email: atelier }],
    subject: sujet,
    htmlContent: gabarit(echap(sujet), `<p>${echap(texte)}</p>`, { lib: 'Ouvrir l\'atelier', url: `${origine}/atelier` }),
  });
}
