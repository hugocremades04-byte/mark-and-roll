import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Ariane, Img } from '@/components/boutique/Elements';
import { envoyerDevis } from '@/lib/api/boutique.functions';
import site from '@/site.json';

export const Route = createFileRoute('/pros')({
  head: () => ({
    meta: [
      { title: 'Pros et devis | Mark & Roll' },
      { name: 'description', content: 'Rouleaux tampons à votre marque pour e-commerçants, agences, salons et événements. Remise automatique dès 3 kits, devis sous 24 h.' },
    ],
  }),
  component: Pros,
});

function Pros() {
  const [f, setF] = useState({ nom: '', societe: '', email: '', quantite: '10 à 25 kits', message: '' });
  const [err, setErr] = useState<{ champ?: string; msg?: string }>({});
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'ok'>('saisie');
  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.nom.trim()) { setErr({ champ: 'nom', msg: 'Indiquez votre nom.' }); document.getElementById('d-nom')?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr({ champ: 'email', msg: 'Indiquez un email valide, par exemple nom@entreprise.fr.' }); document.getElementById('d-email')?.focus(); return; }
    setErr({});
    setEtat('envoi');
    try {
      await envoyerDevis({ data: { ...f, email: f.email.trim() } });
      setEtat('ok');
    } catch {
      setEtat('saisie');
      setErr({ msg: `Envoi impossible pour le moment. Réessayez, ou écrivez-nous à ${site.contact}.` });
    }
  };
  const maj = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: 'Pros et devis' }]} />
      <section style={{ paddingBlock: '12px 32px' }}>
        <div className="bande-sombre">
          <div>
            <h1 className="titre-sombre">Équipez vos postes d'emballage et vos événements.</h1>
            <p>E-commerçants, agences, salons, mariages, associations : la remise s'applique automatiquement dès 3 kits identiques.</p>
          </div>
          <div className="paliers">
            <div className="palier"><strong>−10 %</strong><span>dès 3 kits</span></div>
            <div className="palier"><strong>−15 %</strong><span>dès 5 kits</span></div>
            <div className="palier"><strong>−20 %</strong><span>dès 10 kits</span></div>
          </div>
        </div>
      </section>
      <section className="pros-photo" aria-label="Un poste d'emballage équipé">
        <Img n="atelier-emballage" alt="Une gérante de boutique marque ses colis kraft avec un rouleau étoiles, entourée de tote bags assortis" w={1600} h={1062} />
      </section>
      <section className="section" aria-labelledby="h-devis">
        <div className="faq-grille">
          <div>
            <h2 id="h-devis">Demander un devis</h2>
            <p className="sous-titre">Au-delà de 25 kits, couleurs d'encre sur mesure, logo multi-roues ou Grand format en série : décrivez votre besoin, nous répondons sous 24 h ouvrées.</p>
          </div>
          {etat === 'ok' ? (
            <div className="encart" role="status"><h3>Demande envoyée</h3><p className="note">Merci {f.nom.split(' ')[0]}. Nous revenons vers vous à {f.email.trim()} sous 24 h ouvrées.</p></div>
          ) : (
            <form className="encart" onSubmit={envoyer} noValidate>
              <div className="champs">
                <div className="champ"><label htmlFor="d-nom">Nom</label><input className="saisie" id="d-nom" autoComplete="name" value={f.nom} onChange={maj('nom')} aria-invalid={err.champ === 'nom' || undefined} required /></div>
                <div className="champ"><label htmlFor="d-societe">Entreprise ou événement</label><input className="saisie" id="d-societe" autoComplete="organization" value={f.societe} onChange={maj('societe')} /></div>
                <div className="champ"><label htmlFor="d-email">Email</label><input className="saisie" id="d-email" type="email" autoComplete="email" spellCheck={false} value={f.email} onChange={maj('email')} aria-invalid={err.champ === 'email' || undefined} required /></div>
                <div className="champ"><label htmlFor="d-qte">Quantité</label>
                  <select className="saisie" id="d-qte" value={f.quantite} onChange={maj('quantite')}><option>10 à 25 kits</option><option>25 à 50 kits</option><option>Plus de 50 kits</option></select></div>
                <div className="champ large"><label htmlFor="d-msg">Votre besoin</label><textarea className="saisie" id="d-msg" value={f.message} maxLength={3000} onChange={maj('message')} placeholder="Supports à marquer, dates, couleurs…" /></div>
              </div>
              <p className="err" aria-live="polite">{err.msg}</p>
              <button className="btn btn-primaire" type="submit" disabled={etat === 'envoi'}>{etat === 'envoi' ? 'Envoi…' : 'Envoyer la demande'}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
