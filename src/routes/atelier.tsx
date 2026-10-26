import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Ariane } from '@/components/boutique/Elements';
import { connexionAtelier, deconnexionAtelier, etatAtelier, majCommande } from '@/lib/api/atelier.functions';
import { useBoutique } from '@/lib/boutique';
import { P, STATUTS, eur, fabrication } from '@/lib/catalogue';
import { Statistiques } from '@/components/boutique/Statistiques';
import { exclureCetAppareil } from '@/lib/stats';
import { useEffect } from 'react';

export const Route = createFileRoute('/atelier')({
  loader: () => etatAtelier(),
  head: () => ({ meta: [{ title: 'Espace atelier | Mark & Roll' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Atelier,
});

const PAIEMENTS: Record<string, string> = { a_regler: 'À régler', en_attente: 'Paiement en cours', payee: 'Payée', remboursee: 'Remboursée' };
const dateFr = (iso: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(iso));

async function copier(texte: string, afficher: (m: string) => void, ok: string) {
  try {
    await navigator.clipboard.writeText(texte);
    afficher(ok);
  } catch {
    afficher('Copie bloquée par le navigateur : sélectionnez le texte à la main');
  }
}

function Connexion() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    const r = await connexionAtelier({ data: { code } }).catch(() => ({ ok: false }));
    setEnvoi(false);
    if (!r.ok) { setErr('Code incorrect.'); return; }
    router.invalidate();
  };
  return (
    <form className="encart connexion" onSubmit={envoyer} noValidate>
      <h1 className="titre-resume">Espace atelier</h1>
      <p className="note">Réservé à l'équipe : commandes, fiches de fabrication, devis et inscrits.</p>
      <div className="champ"><label htmlFor="code-atelier">Code d'accès</label>
        <input className="saisie" id="code-atelier" type="password" autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={err ? true : undefined} /></div>
      <p className="err" aria-live="polite">{err}</p>
      <button className="btn btn-primaire" type="submit" disabled={envoi || !code}>{envoi ? 'Vérification…' : 'Entrer'}</button>
    </form>
  );
}

function Atelier() {
  const etat = Route.useLoaderData();
  const router = useRouter();
  const { afficher } = useBoutique();
  const [onglet, setOnglet] = useState<'commandes' | 'stats' | 'devis' | 'inscrits'>('commandes');
  useEffect(() => { if (etat.connecte) exclureCetAppareil(); }, [etat.connecte]);
  if (!etat.connecte) return <div className="wrap"><Connexion /></div>;
  const { commandes, devis, abonnes } = etat;

  const maj = async (id: number, champ: { statut?: string; paiement?: 'a_regler' | 'en_attente' | 'payee' | 'remboursee' }) => {
    try {
      await majCommande({ data: { id, ...champ } });
      afficher(champ.statut ? `Statut : ${champ.statut}` : `Paiement : ${PAIEMENTS[champ.paiement!]}`);
      router.invalidate();
    } catch {
      afficher('Mise à jour impossible, reconnectez-vous');
    }
  };
  const csv = () => {
    const l = [['numero', 'date', 'client', 'email', 'telephone', 'adresse', 'livraison', 'articles', 'total', 'code', 'paiement', 'statut'].join(';')];
    commandes.forEach((c) => l.push([
      c.num, c.date.slice(0, 10), `${c.client.prenom} ${c.client.nom}`, c.client.email, c.client.tel,
      `${c.client.adresse} ${c.client.cp} ${c.client.ville} ${c.client.pays}`, c.livraison,
      c.lignes.map((a) => `${P[a.cfg.h]?.nom ?? a.cfg.h} x${a.qty}`).join(' + '), String(c.totaux.total).replace('.', ','), c.totaux.promo ?? '', PAIEMENTS[c.paiement] ?? c.paiement, c.statut,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')));
    copier(l.join('\n'), afficher, 'CSV copié, collez-le dans un tableur');
  };

  return (
    <div className="wrap atelier">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: 'Espace atelier' }]} />
      <div className="section-tete" style={{ marginTop: 8 }}>
        <div><h1>Espace atelier</h1><p>Chaque roue a sa commande de fabrication prête à lancer avec les générateurs OpenSCAD.</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-contour" onClick={csv} disabled={!commandes.length}>Copier en CSV</button>
          <button type="button" className="btn btn-contour" onClick={async () => { await deconnexionAtelier(); router.invalidate(); }}>Se déconnecter</button>
        </div>
      </div>
      <div className="onglets onglets-atelier" role="tablist" aria-label="Rubriques">
        <button type="button" role="tab" aria-selected={onglet === 'commandes'} onClick={() => setOnglet('commandes')}>Commandes ({commandes.length})</button>
        <button type="button" role="tab" aria-selected={onglet === 'stats'} onClick={() => setOnglet('stats')}>Statistiques</button>
        <button type="button" role="tab" aria-selected={onglet === 'devis'} onClick={() => setOnglet('devis')}>Devis ({devis.length})</button>
        <button type="button" role="tab" aria-selected={onglet === 'inscrits'} onClick={() => setOnglet('inscrits')}>Inscrits ({abonnes.length})</button>
      </div>

      {onglet === 'commandes' && (
        <div className="pile">
          {!commandes.length && <p className="note">Aucune commande pour l'instant. Elles apparaîtront ici dès la première validation.</p>}
          {commandes.map((c, k) => (
            <article className="cmd" key={c.ref}>
              <div className="cmd-tete">
                <div>
                  <h2 className="titre-resume">{c.num} <span className={`pastille ${c.paiement === 'payee' ? 'pastille-ok' : 'pastille-brand'}`}>{PAIEMENTS[c.paiement] ?? c.paiement}</span></h2>
                  <p className="note">{dateFr(c.date)}, {c.client.prenom} {c.client.nom}, {eur(c.totaux.total)}{c.totaux.promo ? `, code ${c.totaux.promo}` : ''}</p>
                </div>
                <div className="cmd-reglages">
                  <label className="champ"><span className="lib">Statut</span>
                    <select className="saisie" value={c.statut} onChange={(e) => maj(c.id, { statut: e.target.value })}>{STATUTS.map((s) => <option key={s}>{s}</option>)}</select></label>
                  <label className="champ"><span className="lib">Paiement</span>
                    <select className="saisie" value={c.paiement} onChange={(e) => maj(c.id, { paiement: e.target.value as 'payee' })}>{Object.entries(PAIEMENTS).map(([v, lib]) => <option key={v} value={v}>{lib}</option>)}</select></label>
                </div>
              </div>
              <p className="note">{c.client.email}, {c.client.tel}, {c.client.adresse}, {c.client.cp} {c.client.ville}, {c.client.pays}. Livraison {c.livraison}.{c.notes ? ` Note : « ${c.notes} »` : ''}</p>
              <details open={k === 0}><summary>Fiche de fabrication</summary>
                <div className="pile" style={{ marginTop: 12 }}>
                  {c.lignes.map((a, i) => fabrication(c.num, a, i).map((f, j) => (
                    <div className="fab" key={`${i}-${j}`}>
                      <strong>{f.titre}</strong>
                      <ul>{f.infos.map((x) => <li key={x}>{x}</li>)}</ul>
                      {f.logo && <a className="lien" href={f.logo} target="_blank" rel="noreferrer" download>Télécharger le fichier du client</a>}
                      {f.cmd && <div className="code"><code>{f.cmd}</code><button type="button" className="btn btn-contour" onClick={() => copier(f.cmd!, afficher, 'Commande copiée')}>Copier</button></div>}
                    </div>
                  )))}
                </div>
              </details>
            </article>
          ))}
        </div>
      )}

      {onglet === 'stats' && <Statistiques />}
      {onglet === 'devis' && (
        <div className="pile">
          {!devis.length && <p className="note">Aucune demande de devis pour l'instant.</p>}
          {devis.map((d) => (
            <article className="cmd" key={d.id}>
              <div className="cmd-tete"><h2 className="titre-resume">{d.nom}{d.societe ? `, ${d.societe}` : ''}</h2><span className="pastille">{d.quantite}</span></div>
              <p className="note">{dateFr(d.created_at.replace(' ', 'T') + 'Z')}, <a href={`mailto:${d.email}`}>{d.email}</a></p>
              {d.message && <p>{d.message}</p>}
            </article>
          ))}
        </div>
      )}

      {onglet === 'inscrits' && (
        <div className="pile">
          <div><button type="button" className="btn btn-contour" disabled={!abonnes.length} onClick={() => copier(abonnes.map((a) => a.email).join('\n'), afficher, 'Emails copiés')}>Copier les emails</button></div>
          {!abonnes.length ? <p className="note">Aucun inscrit pour l'instant.</p> : (
            <div className="table-scroll"><table className="tableau"><thead><tr><th scope="col">Email</th><th scope="col">Inscrit le</th></tr></thead>
              <tbody>{abonnes.map((a) => <tr key={a.email}><td>{a.email}</td><td>{dateFr(a.created_at.replace(' ', 'T') + 'Z')}</td></tr>)}</tbody></table></div>
          )}
        </div>
      )}
    </div>
  );
}
