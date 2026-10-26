import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Apercu, useMesure } from '@/components/boutique/Apercu';
import { IcoOk } from '@/components/boutique/Icones';
import { batPublic, repondreBat } from '@/lib/api/bat.functions';
import { P, libTaille, rouesActives } from '@/lib/catalogue';
import site from '@/site.json';

export const Route = createFileRoute('/bat/$ref')({
  loader: async ({ params }) => {
    if (!/^[0-9a-f-]{36}$/.test(params.ref)) throw notFound();
    const b = await batPublic({ data: { ref: params.ref } });
    if (!b) throw notFound();
    return b;
  },
  head: () => ({ meta: [{ title: 'Votre BAT | Mark & Roll' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Bat,
});

function Bat() {
  const b = Route.useLoaderData();
  const router = useRouter();
  const mesure = useMesure();
  const [modif, setModif] = useState(false);
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const repondu = b.bat.reponse;
  const verrouille = !['BAT à envoyer', 'BAT envoyé', 'BAT validé'].includes(b.statut);

  const envoyer = async (action: 'valide' | 'modif') => {
    setErreur('');
    if (action === 'modif' && !texte.trim()) { setErreur('Dites-nous ce qu\'il faut changer.'); return; }
    setEnvoi(true);
    try {
      await repondreBat({ data: { ref: b.ref, action, commentaire: action === 'modif' ? texte : undefined } });
      setModif(false);
      await router.invalidate();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Envoi impossible, réessayez.');
    } finally {
      setEnvoi(false);
    }
  };

  const configs = b.lignes.filter((a) => a.cfg.type === 'config');
  return (
    <div className="wrap bat">
      <h1>Votre BAT, commande {b.num}</h1>
      <p className="chapeau">Bonjour {b.prenom}, voici le rendu de votre gravure. Rien n'est fabriqué sans votre accord.</p>
      {b.bat.note && <div className="encart"><h2 className="titre-resume">Le mot de l'atelier</h2><p>{b.bat.note}</p></div>}

      {configs.map((a, i) => {
        if (a.cfg.type !== 'config') return null;
        const cfg = a.cfg;
        return (
          <div className="encart" key={i}>
            <h2 className="titre-resume">{P[cfg.h]?.nom ?? cfg.h}{a.qty > 1 ? ` x${a.qty}` : ''}</h2>
            {rouesActives(cfg).map((r, j) => (
              <div className="bat-roue" key={j}>
                <p className="note">Rouleau {j + 1} : {r.mode === 'logo' ? 'logo' : `« ${r.texte} »`}, {libTaille(cfg.taille)}</p>
                <div className="apercu"><Apercu roue={r} taille={cfg.taille} mesure={mesure} /></div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="encart">
        {repondu === 'validé' ? (
          <div className="bat-ok"><span className="ok-rond"><IcoOk /></span><div><strong>BAT validé, merci !</strong><p className="note">Votre tampon part en fabrication. Vous recevrez le numéro de suivi à l'expédition.</p></div></div>
        ) : repondu === 'modification' ? (
          <div><strong>Modification reçue.</strong><p className="note">Nous vous renvoyons un BAT corrigé très vite. Votre demande : « {b.bat.commentaire} »</p></div>
        ) : verrouille ? (
          <p className="note">Cette commande est déjà en fabrication. Pour toute question : <a href={`mailto:${site.contact}`}>{site.contact}</a></p>
        ) : (
          <>
            <h2 className="titre-resume">Tout est bon ?</h2>
            <p className="note">Vérifiez l'orthographe, la police et la couleur. Le rendu final est fidèle à cet aperçu, avec le grain du carton en plus.</p>
            {!modif ? (
              <div className="bat-actions">
                <button type="button" className="btn btn-primaire" disabled={envoi} onClick={() => envoyer('valide')}>Je valide mon BAT</button>
                <button type="button" className="btn btn-contour" disabled={envoi} onClick={() => setModif(true)}>Demander une modification</button>
              </div>
            ) : (
              <div className="pile">
                <label className="champ"><span className="lib">Qu'est-ce qu'on change ?</span>
                  <textarea className="saisie" rows={4} maxLength={1000} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Ex. agrandir le logo, passer le texte en majuscules…" /></label>
                <div className="bat-actions">
                  <button type="button" className="btn btn-primaire" disabled={envoi} onClick={() => envoyer('modif')}>Envoyer ma demande</button>
                  <button type="button" className="btn btn-contour" disabled={envoi} onClick={() => setModif(false)}>Annuler</button>
                </div>
              </div>
            )}
          </>
        )}
        {erreur && <p className="err" role="alert">{erreur}</p>}
      </div>
      <p className="note">Une question ? Répondez simplement à notre email ou écrivez à <a href={`mailto:${site.contact}`}>{site.contact}</a>. <Link to="/">Retour à la boutique</Link></p>
    </div>
  );
}
