import { Link, createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Ariane, LignesPanier, PanierVide } from '@/components/boutique/Elements';
import { IcoCadenas } from '@/components/boutique/Icones';
import { useBoutique } from '@/lib/boutique';
import { FRANCO, PROMOS, arr, eur, sousTotal } from '@/lib/catalogue';

export const Route = createFileRoute('/panier')({
  head: () => ({ meta: [{ title: 'Panier | Mark & Roll' }, { name: 'robots', content: 'noindex' }] }),
  component: Panier,
});

export function CodePromo({ suffixe = '' }: { suffixe?: string }) {
  const { promo, setPromo, afficher } = useBoutique();
  const [code, setCode] = useState(promo || '');
  const [err, setErr] = useState('');
  const appliquer = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (PROMOS[c]) { setPromo(c); setErr(''); afficher(`Code ${c} appliqué`); return; }
    setErr(c ? `Le code « ${c} » n'existe pas. Vérifiez l'orthographe.` : 'Saisissez un code promo.');
  };
  return (
    <>
      <form className="code-promo" onSubmit={appliquer} noValidate>
        <label className="sr" htmlFor={`code${suffixe}`}>Code promo</label>
        <input className="saisie" id={`code${suffixe}`} name="code" placeholder="Code promo" autoComplete="off" spellCheck={false} value={code}
          onChange={(e) => setCode(e.target.value)} aria-invalid={err ? true : undefined} />
        <button className="btn btn-contour" type="submit">Appliquer</button>
      </form>
      {promo && <p className="note">Code <strong>{promo}</strong> actif. <button type="button" className="lien" onClick={() => { setPromo(null); setCode(''); }}>Retirer</button></p>}
      <p className="err" aria-live="polite">{err}</p>
    </>
  );
}

function Panier() {
  const { panier, promo, pret } = useBoutique();
  const st = sousTotal(panier);
  const rp = promo ? arr(st * PROMOS[promo]) : 0;
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: 'Panier' }]} />
      <h1 className="titre-page">Panier</h1>
      {!pret ? <p className="note">Chargement du panier…</p> : panier.length ? (
        <div className="page-panier">
          <div><LignesPanier /></div>
          <aside className="resume" aria-label="Récapitulatif">
            <h2 className="titre-resume">Récapitulatif</h2>
            <CodePromo />
            <dl className="resume-lignes" style={{ margin: 0 }}>
              <div><dt>Sous-total</dt><dd>{eur(st)}</dd></div>
              {rp ? <div className="remise"><dt>Code {promo}</dt><dd>−{eur(rp)}</dd></div> : null}
              <div><dt>Livraison</dt><dd>{st - rp >= FRANCO ? 'Offerte' : 'Calculée à l\'étape suivante'}</dd></div>
            </dl>
            <div className="resume-total"><span>Total</span><strong>{eur(st - rp)}</strong></div>
            <Link className="btn btn-primaire btn-large" to="/commande">Passer commande</Link>
            <p className="securite"><IcoCadenas />Paiement sécurisé, sans création de compte</p>
          </aside>
        </div>
      ) : <PanierVide />}
    </div>
  );
}
