import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { IcoOk } from '@/components/boutique/Icones';
import { commandePublique } from '@/lib/api/boutique.functions';
import { useBoutique } from '@/lib/boutique';
import { P, eur, totalLigne } from '@/lib/catalogue';
import site from '@/site.json';

export const Route = createFileRoute('/confirmation/$ref')({
  validateSearch: (s: Record<string, unknown>): { session_id?: string } => (typeof s.session_id === 'string' ? { session_id: s.session_id } : {}),
  loaderDeps: ({ search }) => ({ session: search.session_id }),
  loader: async ({ params, deps }) => {
    if (!/^[0-9a-f-]{36}$/.test(params.ref)) throw notFound();
    const c = await commandePublique({ data: { ref: params.ref, session: deps.session } });
    if (!c) throw notFound();
    return c;
  },
  head: () => ({ meta: [{ title: 'Commande confirmée | Mark & Roll' }, { name: 'robots', content: 'noindex' }] }),
  component: Confirmation,
});

const LIV: Record<string, string> = { relais: 'en point relais', domicile: 'à domicile', express: 'express' };

function Confirmation() {
  const c = Route.useLoaderData();
  const { vider, pret } = useBoutique();
  useEffect(() => {
    if (!pret) return;
    try {
      if (sessionStorage.getItem('mr3_vider') === c.ref) {
        sessionStorage.removeItem('mr3_vider');
        vider();
      }
    } catch { /* navigation privée */ }
  }, [pret, c.ref, vider]);

  const payee = c.paiement === 'payee';
  const logoAttendu = c.lignes.some((a) => a.cfg.type === 'config' && [...a.cfg.roues, a.cfg.sup].some((r) => r.mode === 'logo' && !r.logo && r.plusTard));
  return (
    <div className="wrap confirmation">
      <div className="ok-rond"><IcoOk /></div>
      <h1>Merci {c.client.prenom}, votre commande est enregistrée.</h1>
      <p style={{ color: 'var(--ink-2)' }}>Commande <strong className="num">{c.num}</strong>. Nous vous écrivons à {c.client.email} avec le BAT sous 24 h ouvrées. Gardez cette page : son adresse permet de suivre votre commande.</p>
      {logoAttendu && (
        <div className="encart encart-alerte">
          <h2 className="titre-resume">Il nous manque votre logo</h2>
          <p>Envoyez-le en répondant à l'email de confirmation, ou ici : le BAT part dès réception. SVG de préférence, sinon PNG ou JPG en bonne définition.</p>
          <a className="btn btn-primaire" href={`mailto:${site.contact}?subject=${encodeURIComponent(`Logo pour la commande ${c.num}`)}`}>Envoyer mon logo</a>
        </div>
      )}
      <div className="encart">
        <h2 className="titre-resume">Et maintenant ?</h2>
        <ol className="chrono">
          <li className="fait"><span className="etape-num">1</span><div><strong>Commande reçue</strong><p className="note">Vos réglages et fichiers sont transmis à l'atelier.</p></div></li>
          <li className={payee ? 'fait' : ''}><span className="etape-num">2</span><div><strong>{payee ? 'Paiement reçu' : c.paiement === 'en_attente' ? 'Paiement en cours de confirmation' : 'BAT et lien de paiement par email'}</strong><p className="note">{payee ? 'Merci, votre règlement est confirmé.' : 'Vous validez le BAT ou demandez une retouche, puis vous réglez en ligne.'}</p></div></li>
          <li className={c.statut === 'En fabrication' || c.statut === 'Expédiée' ? 'fait' : ''}><span className="etape-num">3</span><div><strong>Fabrication et expédition</strong><p className="note">Sous 7 jours ouvrés après votre accord, avec un numéro de suivi.</p></div></li>
        </ol>
        <p className="note">Statut actuel : <strong>{c.statut}</strong></p>
      </div>
      <div className="encart">
        <h2 className="titre-resume">Récapitulatif</h2>
        {c.lignes.map((a) => <div key={a.cle} className="total-ligne"><span>{P[a.cfg.h]?.nom ?? a.cfg.h} × {a.qty}</span><span className="num">{eur(totalLigne(a))}</span></div>)}
        {c.totaux.rp ? <div className="total-ligne"><span>Code {c.totaux.promo}</span><span className="num">−{eur(c.totaux.rp)}</span></div> : null}
        <div className="total-ligne"><span>Livraison {LIV[c.livraison] ?? ''}</span><span className="num">{c.totaux.port ? eur(c.totaux.port) : 'Offerte'}</span></div>
        <div className="resume-total"><span>{payee ? 'Total payé' : 'Total à régler'}</span><strong>{eur(c.totaux.total)}</strong></div>
        <p className="note">Livraison à {c.client.prenom} {c.client.nom}, {c.client.adresse}, {c.client.cp} {c.client.ville}.</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-primaire" to="/">Continuer mes achats</Link>
        <a className="btn btn-contour" href={`mailto:${site.contact}?subject=${encodeURIComponent(`Commande ${c.num}`)}`}>Nous écrire</a>
      </div>
    </div>
  );
}
