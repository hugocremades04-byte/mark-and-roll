import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { inscrireNews } from '@/lib/api/boutique.functions';
import { useBoutique, usePanneau, usePiegeFocus } from '@/lib/boutique';
import { FRANCO, IMG, ORDRE, P, cfgDefaut, estLarge, eur, prixMin, rouesActives, sousTotal, type CfgSimple, type Ligne } from '@/lib/catalogue';
import { LignesPanier, Paiements, PanierVide } from './Elements';
import { IcoCamion, IcoCroix, IcoDroite, IcoLoupe, IcoMenu, IcoOk, IcoPanier } from './Icones';
import site from '@/site.json';
import { PAGES_SEO } from '@/lib/pages-seo';

const NAV: { lib: string; cle: string; desc: string }[] = [
  { lib: 'Rouleaux', cle: 'rouleaux', desc: 'Kit Rouleau, Grand format, textile' },
  { lib: 'Packs', cle: 'packs', desc: 'Plusieurs roues, moins cher' },
  { lib: 'Recharges', cle: 'recharges', desc: 'Encres, marqueurs, roues' },
];

export const Logo = ({ blanc }: { blanc?: boolean }) => (
  <img className="logo-img" src={blanc ? '/logo-blanc.svg' : '/logo.svg'} alt="" width={132} height={31} />
);

export function Bandeau() {
  return (
    <div className="bandeau">
      <div className="wrap">
        <span><IcoOk epais={2} />Lancement : −15&nbsp;% sur votre premier kit avec le code PREMIERS15</span>
        <span><IcoCamion epais={2} />Livraison offerte dès 45&nbsp;€</span>
        <span><IcoOk epais={2} />BAT gratuit avant chaque gravure</span>
      </div>
    </div>
  );
}

export function Entete() {
  const { panier, ouvrir, panneau } = useBoutique();
  const chemin = useRouterState({ select: (s) => s.location.pathname });
  const n = panier.reduce((s, a) => s + a.qty, 0);
  const actif = (cle: string) => chemin === `/collections/${cle}` || (chemin.startsWith('/produits/') && P[chemin.split('/')[2]]?.cats[0] === cle);
  return (
    <header className="entete">
      <div className="wrap entete-in">
        <button type="button" className="icone-btn burger" aria-label="Ouvrir le menu" aria-controls="menu" aria-expanded={panneau === 'menu'} onClick={() => ouvrir('menu')}><IcoMenu /></button>
        <Link className="logo" to="/" aria-label="Mark and Roll, accueil" translate="no"><Logo /></Link>
        <nav className="nav" aria-label="Catégories">
          {NAV.map((x) => (
            <Link key={x.cle} to="/collections/$cle" params={{ cle: x.cle }} className={actif(x.cle) ? 'actif' : undefined}>{x.lib}</Link>
          ))}
          <Link to="/pros" className={chemin === '/pros' ? 'actif' : undefined}>Pros</Link>
        </nav>
        <div className="entete-actions">
          <Link className="btn btn-primaire btn-entete" to="/produits/$handle" params={{ handle: 'kit-rouleau' }}>Créer mon rouleau</Link>
          <button type="button" className="icone-btn" aria-label="Rechercher un produit" onClick={() => ouvrir('recherche')}><IcoLoupe /></button>
          <button type="button" className="icone-btn" aria-label={`Panier, ${n} article${n > 1 ? 's' : ''}`} onClick={() => ouvrir('panier')}>
            <IcoPanier />
            <span className="compteur" data-vide={n ? '0' : '1'} aria-hidden="true">{n}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function Pied() {
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState<{ err?: string; code?: string; envoi?: boolean }>({});
  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEtat({ err: 'Indiquez un email valide pour recevoir le code.' }); return; }
    setEtat({ envoi: true });
    try {
      const r = await inscrireNews({ data: { email: email.trim() } });
      setEtat({ code: r.code });
      setEmail('');
    } catch {
      setEtat({ err: 'Inscription impossible pour le moment. Réessayez dans un instant.' });
    }
  };
  return (
    <footer className="pied">
      <div className="wrap pied-haut">
        <div>
          <Logo blanc />
          <h2 style={{ marginTop: 22 }}>−10&nbsp;% sur votre première commande</h2>
          <p>Recevez le code, puis nos nouvelles roues et les idées de packaging de nos clients. Un email par mois.</p>
          {etat.code ? (
            <p className="news-ok" role="status">Votre code : <strong>{etat.code}</strong>. Saisissez-le dans le panier.</p>
          ) : (
            <form className="news" onSubmit={envoyer} noValidate>
              <label className="sr" htmlFor="news-email">Votre email</label>
              <input className="saisie" id="news-email" name="email" type="email" autoComplete="email" spellCheck={false} placeholder="vous@boutique.fr"
                value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={etat.err ? true : undefined} />
              <button className="btn" type="submit" disabled={etat.envoi}>{etat.envoi ? 'Envoi…' : 'Recevoir le code'}</button>
            </form>
          )}
          <p className="err" aria-live="polite" style={{ marginTop: 8 }}>{etat.err}</p>
        </div>
        <div><h3>Boutique</h3><ul>
          <li><Link to="/produits/$handle" params={{ handle: 'kit-rouleau' }}>Kit Rouleau personnalisé</Link></li>
          <li><Link to="/produits/$handle" params={{ handle: 'rouleau-large' }}>Rouleau Grand format</Link></li>
          <li><Link to="/produits/$handle" params={{ handle: 'kit-textile' }}>Kit Rouleau textile</Link></li>
          <li><Link to="/collections/$cle" params={{ cle: 'packs' }}>Packs</Link></li>
          <li><Link to="/collections/$cle" params={{ cle: 'recharges' }}>Recharges et accessoires</Link></li>
          <li><Link to="/produits/$handle" params={{ handle: 'carte-cadeau' }}>Carte cadeau</Link></li>
        </ul></div>
        <div><h3>Par usage</h3><ul>
          {PAGES_SEO.filter((x) => !x.chemin.startsWith('/guide-') && !x.metier).map((x) => <li key={x.chemin}><a href={x.chemin}>{x.lib}</a></li>)}
        </ul>
        <h3 className="pied-sous">Par métier</h3><ul>
          {PAGES_SEO.filter((x) => x.metier).map((x) => <li key={x.chemin}><a href={x.chemin}>{x.metier}</a></li>)}
        </ul></div>
        <div><h3>Aide</h3><ul>
          <li><Link to="/" hash="faq">Questions fréquentes</Link></li>
          <li><Link to="/collections/$cle" params={{ cle: 'rouleaux' }} hash="guide-tailles">Guide des tailles</Link></li>
          {PAGES_SEO.filter((x) => x.chemin.startsWith('/guide-')).map((x) => <li key={x.chemin}><a href={x.chemin}>{x.lib.replace('Guide : ', '')}</a></li>)}
          <li><Link to="/pros">Pros et devis</Link></li>
          <li><Link to="/cgv">Conditions générales de vente</Link></li>
          <li><Link to="/mentions-legales">Mentions légales</Link></li>
          <li><Link to="/atelier">Espace atelier</Link></li>
        </ul></div>
        <div><h3>Nous écrire</h3><ul>
          <li><a href={`mailto:${site.contact}`}>{site.contact}</a></li>
          <li>Du lundi au vendredi, 9 h à 18 h</li>
          <li>Réponse sous 24 h ouvrées</li>
        </ul></div>
      </div>
      <div className="wrap pied-bas">
        <span>© 2026 Mark &amp; Roll. Prix TTC.</span>
        <Paiements sombre />
      </div>
    </footer>
  );
}

function suggestions(panier: Ligne[]) {
  const hs = new Set(panier.map((a) => a.cfg.h));
  const confs = panier.map((a) => a.cfg).filter((c) => c.type === 'config');
  const textile = confs.some((c) => c.type === 'config' && rouesActives(c).some((r) => r.usage === 'textile'));
  const std = confs.some((c) => c.type === 'config' && !estLarge(c.taille));
  const large = confs.some((c) => c.type === 'config' && estLarge(c.taille));
  return [
    std && !hs.has('roue-prete') && 'roue-prete',
    large && !hs.has('encreur-large') && 'encreur-large',
    large && !textile && !hs.has('encre-tampon') && 'encre-tampon',
    textile && !hs.has('encre-textile') && 'encre-textile',
    textile && !hs.has('totes') && 'totes',
    std && !hs.has('recharge') && 'recharge',
    !hs.has('marqueur') && 'marqueur',
  ].filter((x): x is string => !!x).slice(0, 2);
}

function Panneau({ id, cote, ouvert, label, children }: { id: string; cote: 'gauche' | 'droite'; ouvert: boolean; label: string; children: ReactNode }) {
  const { fermer } = useBoutique();
  const { monte, actif } = usePanneau(ouvert);
  const ref = usePiegeFocus(ouvert, fermer);
  if (!monte) return null;
  return (
    <aside ref={ref as RefObject<HTMLElement>} id={id} className={`tiroir tiroir-${cote}${actif ? ' ouvert' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
      {children}
    </aside>
  );
}

export function Panneaux() {
  const b = useBoutique();
  const { panneau, fermer, panier, ajouter } = b;
  const voile = usePanneau(panneau !== null, 220);
  const rech = usePanneau(panneau === 'recherche', 230);
  const refRech = usePiegeFocus(panneau === 'recherche', fermer);
  const [q, setQ] = useState('');
  const st = sousTotal(panier);
  const reste = Math.max(0, FRANCO - st);
  const sug = suggestions(panier);
  const resultats = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ORDRE.filter((h) => !s || `${P[h].nom} ${P[h].court} ${P[h].cats.join(' ')}`.toLowerCase().includes(s)).slice(0, 8);
  }, [q]);
  const chemin = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => { fermer(); }, [chemin, fermer]);

  const ajouterSug = (h: string) => {
    const c = cfgDefaut(h) as CfgSimple;
    const conf = panier.find((a) => a.cfg.type === 'config');
    if (conf && conf.cfg.type === 'config' && c.sel.taille) {
      const t = conf.cfg.taille;
      if ((h === 'roue-prete' && !estLarge(t)) || (h === 'encreur-large' && estLarge(t))) c.sel.taille = t;
    }
    ajouter(c, { silencieux: true });
    b.annoncer(`${P[h].nom} ajouté`);
  };

  return (
    <>
      {voile.monte && <div className={`voile${voile.actif ? ' ouvert' : ''}`} onClick={fermer} />}

      <Panneau id="menu" cote="gauche" ouvert={panneau === 'menu'} label="Menu">
        <div className="tiroir-tete"><span className="logo" translate="no"><Logo /></span>
          <button type="button" className="icone-btn" onClick={fermer} aria-label="Fermer le menu"><IcoCroix /></button></div>
        <div className="tiroir-corps">
          <Link className="btn btn-primaire btn-large" to="/produits/$handle" params={{ handle: 'kit-rouleau' }} onClick={fermer}>Créer mon rouleau</Link>
          <ul className="menu-liste">
            {NAV.map((x) => (
              <li key={x.cle}><Link to="/collections/$cle" params={{ cle: x.cle }} onClick={fermer}><span>{x.lib}<small>{x.desc}</small></span><IcoDroite className="ico" /></Link></li>
            ))}
            <li><Link to="/collections/$cle" params={{ cle: 'boutique' }} onClick={fermer}><span>Toute la boutique<small>{ORDRE.length} produits</small></span><IcoDroite className="ico" /></Link></li>
            <li><Link to="/pros" onClick={fermer}><span>Pros et devis<small>Dès 10 kits, prix dégressifs</small></span><IcoDroite className="ico" /></Link></li>
            <li><Link to="/" hash="faq" onClick={fermer}><span>Aide<small>Questions fréquentes</small></span><IcoDroite className="ico" /></Link></li>
          </ul>
        </div>
      </Panneau>

      <Panneau id="mini-panier" cote="droite" ouvert={panneau === 'panier'} label="Votre panier">
        <div className="tiroir-tete"><h2>Votre panier</h2>
          <button type="button" className="icone-btn" onClick={fermer} aria-label="Fermer le panier" data-focus-initial><IcoCroix /></button></div>
        <div className="tiroir-corps">
          {!panier.length ? <PanierVide onLien={fermer} /> : (
            <>
              <div className={`franco${reste ? '' : ' ok'}`}>
                <span>{reste ? `Plus que ${eur(reste)} pour la livraison offerte` : 'Livraison offerte en point relais'}</span>
                <div className="jauge"><span style={{ width: `${Math.min(100, (st / FRANCO) * 100)}%` }} /></div>
              </div>
              <LignesPanier />
              {sug.length > 0 && (
                <div className="upsell"><h3>Pour compléter</h3>
                  {sug.map((h) => (
                    <div className="upsell-item" key={h}>
                      <img src={IMG(P[h].images[0])} alt="" width={112} height={112} loading="lazy" />
                      <div><strong>{P[h].nom}</strong><span>{eur(prixMin(h))}</span></div>
                      <button type="button" className="btn btn-contour" onClick={() => ajouterSug(h)}>Ajouter</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {panier.length > 0 && (
          <div className="tiroir-pied">
            <div className="total-ligne"><span>Sous-total</span><strong>{eur(st)}</strong></div>
            <p className="note">Livraison et codes promo à l'étape suivante.</p>
            <Link className="btn btn-primaire btn-large" to="/commande" onClick={fermer}>Commander</Link>
            <Link className="btn btn-contour" to="/panier" onClick={fermer}>Voir le panier</Link>
          </div>
        )}
      </Panneau>

      {rech.monte && (
        <div ref={refRech as RefObject<HTMLDivElement>} className={`recherche${rech.actif ? ' ouvert' : ''}`} role="dialog" aria-modal="true" aria-label="Recherche">
          <div className="wrap">
            <div className="recherche-ligne"><IcoLoupe className="ico" />
              <label className="sr" htmlFor="recherche-champ">Rechercher</label>
              <input id="recherche-champ" type="search" autoComplete="off" placeholder="Kit, grand format, encre textile…" value={q} onChange={(e) => setQ(e.target.value)} data-focus-initial />
              <button type="button" className="icone-btn" onClick={fermer} aria-label="Fermer la recherche"><IcoCroix /></button></div>
            <div className="recherche-res" aria-live="polite">
              {resultats.length ? resultats.map((h) => (
                <Link key={h} className="res" to="/produits/$handle" params={{ handle: h }} onClick={fermer}>
                  {P[h].images[0] ? <img src={IMG(P[h].images[0])} alt="" width={112} height={112} loading="lazy" /> : <span />}
                  <span><strong style={{ color: 'var(--ink)' }}>{P[h].nom}</strong><br />{P[h].court}</span>
                  <strong className="num">{eur(prixMin(h))}</strong>
                </Link>
              )) : <p className="note" style={{ padding: '14px 0' }}>Aucun produit pour « {q} ». Essayez « kit », « grand format » ou « encre ».</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Toast() {
  const { toast } = useBoutique();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast.n) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, [toast.n]);
  return (
    <div className={`toast${visible ? ' visible' : ''}`} role="status" aria-live="polite">
      <IcoOk /><span>{toast.msg}</span>
    </div>
  );
}

export const Atouts = () => (
  <div className="atouts atouts2">
    <div className="atout"><img src="/img/icones/bat.png" alt="" width={40} height={40} /><div><strong>BAT gratuit</strong><span>Rien n'est gravé sans votre accord</span></div></div>
    <div className="atout"><img src="/img/icones/encre.png" alt="" width={40} height={40} /><div><strong>Encre incluse</strong><span>Prêt à rouler dès réception</span></div></div>
    <div className="atout"><img src="/img/icones/interchangeable.png" alt="" width={40} height={40} /><div><strong>Roues interchangeables</strong><span>Se clipsent sans outil</span></div></div>
    <div className="atout"><img src="/img/icones/livraison.png" alt="" width={40} height={40} /><div><strong>Livraison offerte</strong><span>Dès 45 €, en point relais ou à domicile</span></div></div>
  </div>
);
