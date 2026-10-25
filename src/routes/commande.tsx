import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Ariane, LignePanier, PanierVide } from '@/components/boutique/Elements';
import { IcoCadenas, IcoCarte } from '@/components/boutique/Icones';
import { configPublique, passerCommande } from '@/lib/api/boutique.functions';
import { useBoutique } from '@/lib/boutique';
import { PRIX_BUMP, PRIX_ROUE_PRETE, eur, ligneBump, port, totauxCommande, type Livraison } from '@/lib/catalogue';
import { CodePromo } from './panier';

export const Route = createFileRoute('/commande')({
  validateSearch: (s: Record<string, unknown>): { annule?: string } => (s.annule ? { annule: '1' } : {}),
  loader: () => configPublique(),
  head: () => ({ meta: [{ title: 'Commande | Mark & Roll' }, { name: 'robots', content: 'noindex' }] }),
  component: Commande,
});

const CHAMPS = [
  { id: 'email', lib: 'votre email' }, { id: 'prenom', lib: 'votre prénom' }, { id: 'nom', lib: 'votre nom' },
  { id: 'adresse', lib: 'votre adresse' }, { id: 'cp', lib: 'votre code postal' }, { id: 'ville', lib: 'votre ville' }, { id: 'tel', lib: 'votre téléphone' },
] as const;
type Client = { email: string; prenom: string; nom: string; adresse: string; cp: string; ville: string; pays: 'France' | 'Belgique' | 'Luxembourg'; tel: string };

function Commande() {
  const { paiementActif } = Route.useLoaderData();
  const { annule } = Route.useSearch();
  const { panier, promo, pret } = useBoutique();
  const naviguer = useNavigate();
  const [client, setClient] = useState<Client>({ email: '', prenom: '', nom: '', adresse: '', cp: '', ville: '', pays: 'France', tel: '' });
  const [mode, setMode] = useState<Livraison>('relais');
  const [bump, setBump] = useState(false);
  const [cgv, setCgv] = useState(false);
  const [notes, setNotes] = useState('');
  const [invalides, setInvalides] = useState<Set<string>>(new Set());
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const form = useRef<HTMLFormElement | null>(null);

  if (!pret) return <div className="wrap section"><p className="note">Chargement du panier…</p></div>;
  if (!panier.length) return <div className="wrap" style={{ paddingBlock: '24px 48px' }}><h1>Commande</h1><PanierVide /></div>;

  const conf = ligneBump(panier);
  const t = totauxCommande(panier, { promo, bump, mode });
  const base = totauxCommande(panier, { promo, bump, mode: 'relais' });
  const net = base.st - base.rp;
  const maj = (k: keyof Client, v: string) => {
    setClient((c) => ({ ...c, [k]: v }));
    if (invalides.has(k)) setInvalides((s) => { const n = new Set(s); n.delete(k); return n; });
  };
  const inv = (k: string) => invalides.has(k) || undefined;

  async function valider(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    const manquants = new Set<string>();
    let msg = '';
    for (const c of CHAMPS) if (!client[c.id].trim()) { manquants.add(c.id); if (!msg) msg = `Indiquez ${c.lib}.`; }
    if (client.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email.trim())) { manquants.add('email'); msg ||= 'L\'email semble incomplet, par exemple nom@boutique.fr.'; }
    if (client.cp.trim() && !/^\d{4,5}$/.test(client.cp.trim())) { manquants.add('cp'); msg ||= 'Le code postal doit compter 4 ou 5 chiffres.'; }
    if (client.tel.trim() && client.tel.trim().length < 6) { manquants.add('tel'); msg ||= 'Le numéro de téléphone semble incomplet.'; }
    setInvalides(manquants);
    if (manquants.size) {
      setErreur(msg);
      const premier = CHAMPS.find((c) => manquants.has(c.id));
      if (premier) form.current?.querySelector<HTMLInputElement>(`#c-${premier.id}`)?.focus();
      return;
    }
    if (!cgv) { setErreur('Cochez l\'acceptation des conditions générales pour valider.'); form.current?.querySelector<HTMLInputElement>('#c-cgv')?.focus(); return; }
    setEnvoi(true);
    try {
      const r = await passerCommande({ data: {
        lignes: panier, promo, bump: !!conf && bump, livraison: mode, notes,
        client: { ...client, email: client.email.trim(), cp: client.cp.trim() },
      } });
      if (!r.ok) { setErreur(r.erreur); setEnvoi(false); return; }
      try { sessionStorage.setItem('mr3_vider', r.ref); } catch { /* navigation privée */ }
      if (r.url) { window.location.href = r.url; return; }
      naviguer({ to: '/confirmation/$ref', params: { ref: r.ref } });
    } catch {
      setErreur('Connexion interrompue. Vérifiez votre réseau puis réessayez : rien n\'a été débité.');
      setEnvoi(false);
    }
  }

  const recap = (suffixe: string) => (
    <>
      <h2 className="titre-resume">Récapitulatif</h2>
      {t.lignes.map((a) => <LignePanier key={a.cle} a={a} compact />)}
      <CodePromo suffixe={suffixe} />
      <dl className="resume-lignes" style={{ margin: 0 }}>
        <div><dt>Sous-total</dt><dd>{eur(t.st)}</dd></div>
        {t.rp ? <div className="remise"><dt>Code {t.promo}</dt><dd>−{eur(t.rp)}</dd></div> : null}
        <div><dt>Livraison</dt><dd>{t.port ? eur(t.port) : 'Offerte'}</dd></div>
      </dl>
      <div className="resume-total"><span>Total TTC</span><strong>{eur(t.total)}</strong></div>
    </>
  );

  const champ = (id: keyof Client, lib: string, props: InputHTMLAttributes<HTMLInputElement> = {}, aide?: string, large?: boolean) => (
    <div className={`champ${large ? ' large' : ''}`}>
      <label htmlFor={`c-${id}`}>{lib}</label>
      <input className="saisie" id={`c-${id}`} name={id} value={client[id]} onChange={(e) => maj(id, e.target.value)} aria-invalid={inv(id)} required {...props} />
      {aide && <span className="aide">{aide}</span>}
    </div>
  );

  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Panier', to: '/panier' }, { lib: 'Commande' }]} />
      <h1 className="titre-page">Commande</h1>
      {annule && <p className="bandeau-info" role="status">Paiement annulé : votre panier est intact, vous pouvez réessayer.</p>}
      <div className="caisse">
        <div className="caisse-gauche">
        <details className="recap-mobile"><summary><span>Afficher le récapitulatif</span><strong className="num">{eur(t.total)}</strong></summary><div className="corps">{recap('-m')}</div></details>
        <form ref={form} onSubmit={valider} noValidate>

          <div className="bloc-form"><h2><span className="etape-num">1</span>Contact</h2>
            {champ('email', 'Email', { type: 'email', autoComplete: 'email', spellCheck: false, placeholder: 'vous@boutique.fr' }, 'Pour le BAT et le suivi de livraison. Pas de compte à créer.')}
          </div>

          <div className="bloc-form"><h2><span className="etape-num">2</span>Livraison</h2>
            <div className="champs">
              {champ('prenom', 'Prénom', { autoComplete: 'given-name' })}
              {champ('nom', 'Nom', { autoComplete: 'family-name' })}
              {champ('adresse', 'Adresse', { autoComplete: 'street-address' }, undefined, true)}
              {champ('cp', 'Code postal', { inputMode: 'numeric', autoComplete: 'postal-code' })}
              {champ('ville', 'Ville', { autoComplete: 'address-level2' })}
              <div className="champ"><label htmlFor="c-pays">Pays</label>
                <select className="saisie" id="c-pays" value={client.pays} autoComplete="country-name" onChange={(e) => maj('pays', e.target.value)}>
                  <option>France</option><option>Belgique</option><option>Luxembourg</option>
                </select></div>
              {champ('tel', 'Téléphone', { type: 'tel', autoComplete: 'tel' }, 'Pour le transporteur uniquement.')}
            </div>
            <div style={{ display: 'grid', gap: 8 }} role="radiogroup" aria-label="Mode de livraison">
              {([['relais', 'Point relais', '2 à 4 jours après expédition, offert dès 59 €'], ['domicile', 'À domicile', '2 à 3 jours après expédition, offert dès 89 €'], ['express', 'Express 24 h', 'Le lendemain de l\'expédition']] as const).map(([m, titre, sous]) => (
                <label className="radio" key={m}>
                  <input type="radio" name="livraison" value={m} checked={mode === m} onChange={() => setMode(m)} />
                  <span><strong>{titre}</strong><small>{sous}</small></span>
                  <span className="p">{port(m, net) ? eur(port(m, net)) : 'Offert'}</span>
                </label>
              ))}
            </div>
          </div>

          {conf && (
            <label className="ajout ajout-offre">
              <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
              <span><strong>Ajouter une roue « MERCI ♥ » prête à rouler</strong><small>Taille {conf.cfg.taille}, se clipse sur votre nouveau support</small></span>
              <span className="p">+{eur(PRIX_BUMP)}<s>{eur(PRIX_ROUE_PRETE[conf.cfg.taille] ?? 12)}</s></span>
            </label>
          )}

          <div className="bloc-form"><h2><span className="etape-num">3</span>Paiement</h2>
            <div className="paiement-info">
              <IcoCarte />
              <p>{paiementActif
                ? 'Vous finalisez le paiement sur la page sécurisée de notre prestataire Stripe : carte bancaire, Apple Pay ou Google Pay.'
                : 'Aucun paiement maintenant. Vous recevez le BAT par email sous 24 h ouvrées avec un lien de paiement sécurisé ; la gravure démarre après votre accord et votre paiement.'}</p>
            </div>
            <div className="champ"><label htmlFor="c-notes">Une précision pour le graphiste ? (facultatif)</label>
              <textarea className="saisie" id="c-notes" name="notes" value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} placeholder="Couleur exacte du logo, sens de lecture…" /></div>
            <label className="case-cgv"><input type="checkbox" id="c-cgv" checked={cgv} onChange={(e) => setCgv(e.target.checked)} />
              <span>J'accepte les <Link to="/cgv" target="_blank">conditions générales de vente</Link> et je valide que ma roue sera gravée après accord du BAT.</span></label>
            <p className="err" aria-live="polite">{erreur}</p>
            <button type="submit" className="btn btn-primaire btn-large" disabled={envoi}>
              {envoi ? 'Validation…' : paiementActif ? 'Payer' : 'Valider ma commande'}<span className="prix-btn">{eur(t.total)}</span>
            </button>
            <p className="securite"><IcoCadenas />{paiementActif ? 'Paiement chiffré, BAT avant toute gravure' : 'Rien n\'est débité aujourd\'hui, BAT avant toute gravure'}</p>
          </div>
        </form>
        </div>
        <aside className="resume" aria-label="Récapitulatif de commande">{recap('')}</aside>
      </div>
    </div>
  );
}
