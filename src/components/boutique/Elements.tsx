import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useBoutique } from '@/lib/boutique';
import { IMG, P, TAILLES, aPartirDe, altDe, cfgDefaut, estLarge, eur, prixMin, totalLigne, variantesDe, type CfgSimple, type Ligne, type ProduitConfig, type Taille } from '@/lib/catalogue';
import { IcoFleche, IcoMoins, IcoOk, IcoPlus, IcoSac } from './Icones';

export function Img({ n, alt, w = 800, h = 800, eager, className }: { n: string | undefined | null; alt: string; w?: number; h?: number; eager?: boolean; className?: string }) {
  if (!n) {
    return (
      <div className="carte-cadeau-visuel">
        Carte cadeau<img src="/logo-blanc.svg" alt="" width={120} height={28} />
      </div>
    );
  }
  return <img src={IMG(n)} alt={alt} width={w} height={h} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" className={className} />;
}

export function SectionTete({ titre, id, lien, libLien }: { titre: string; id: string; lien?: { to: string; params?: Record<string, string> }; libLien?: string }) {
  return (
    <div className="section-tete">
      <h2 id={id}>{titre}</h2>
      {lien && (
        <Link className="lien-fleche" to={lien.to as "/"} params={lien.params as never}>
          {libLien}<IcoFleche />
        </Link>
      )}
    </div>
  );
}

export function CarteProduit({ h, simple }: { h: string; simple?: boolean }) {
  const { ajouter } = useBoutique();
  const p = P[h];
  const val = p.type === 'config' && p.valeur ? p.valeur(p.gamme === 'large' ? 'L30' : 'S') : null;
  const min = prixMin(h);
  const eco = val ? Math.round(((val - min) / val) * 100) : 0;
  const img2 = p.images[1];
  const opts = p.type === 'simple' ? p.options : undefined;
  const couleurs = opts && Object.keys(opts).length === 1 && opts.couleur ? opts.couleur : null;
  const [couleur, setCouleur] = useState(couleurs ? couleurs[0].id : '');
  const rapide = p.type === 'simple' && (!opts || !!couleurs);
  const nomCouleur = couleurs?.find((o) => o.id === couleur)?.nom;
  return (
    <article className="carte">
      <Link className="carte-image" to="/produits/$handle" params={{ handle: h }} tabIndex={-1} aria-hidden="true">
        <Img n={p.images[0]} alt={altDe(h, 0)} />
        {img2 && !simple && <Img n={img2} alt="" className="alt" />}
        {eco > 0 ? <span className="badge badge-promo">−{eco}&nbsp;%</span> : p.badge ? <span className="badge">{p.badge}</span> : null}
      </Link>
      <div className="carte-corps">
        <h3><Link to="/produits/$handle" params={{ handle: h }}>{p.nom}</Link></h3>
        <p className="carte-desc">{p.court}</p>
        <p className="prix">
          {aPartirDe(h) && !couleurs && <small>Dès</small>}
          <span>{eur(min)}</span>
          {val ? <s>{eur(val)}</s> : null}
        </p>
        {couleurs && (
          <div className="carte-nuances" role="radiogroup" aria-label={`Couleur, ${p.nom}`}>
            {couleurs.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={couleur === o.id} aria-label={o.nom} title={o.nom}
                style={{ ['--n' as string]: o.hex }} onClick={() => setCouleur(o.id)} />
            ))}
          </div>
        )}
      </div>
      {rapide ? (
        <button type="button" className="btn btn-contour" onClick={() => ajouter({ ...(cfgDefaut(h) as CfgSimple), sel: couleurs ? { couleur } : {} })}
          aria-label={`Ajouter ${p.nom}${nomCouleur ? `, ${nomCouleur.toLowerCase()}` : ''} au panier`}>
          <IcoPlus />Ajouter
        </button>
      ) : (
        <Link className={`btn carte-cta ${p.type === 'config' ? 'btn-noir' : 'btn-contour'}`} to="/produits/$handle" params={{ handle: h }}>
          {p.type === 'config' ? 'Personnaliser' : 'Choisir'}
        </Link>
      )}
    </article>
  );
}

/** Grande carte des trois rouleaux : photo en situation, points forts, prix et CTA. */
export function CarteRouleau({ h, img }: { h: string; img?: string }) {
  const p = P[h] as ProduitConfig;
  return (
    <article className="rouleau-carte">
      <Link className="rouleau-img" to="/produits/$handle" params={{ handle: h }} tabIndex={-1} aria-hidden="true">
        <Img n={img || p.images[0]} alt="" w={1100} h={1100} />
        {p.badge && <span className="badge">{p.badge}</span>}
      </Link>
      <div className="rouleau-corps">
        <h3><Link to="/produits/$handle" params={{ handle: h }}>{p.nom}</Link></h3>
        <ul className="points-ok">{(p.points || []).map((x) => <li key={x}><IcoOk />{x}</li>)}</ul>
        <div className="rouleau-pied">
          <p className="prix prix-grand"><small>Dès</small><span>{eur(prixMin(h))}</span></p>
          <Link className="btn btn-primaire" to="/produits/$handle" params={{ handle: h }}>Personnaliser<IcoFleche /></Link>
        </div>
      </div>
    </article>
  );
}

const LIGNES_TAILLES: [Taille, string][] = [['S', 'kit-rouleau'], ['M', 'kit-rouleau'], ['L', 'kit-rouleau'], ['L30', 'rouleau-large'], ['XL50', 'rouleau-large']];
/** Tableau comparatif des tailles de roue et de rouleau. */
export function GuideTailles({ seulement }: { seulement?: 'std' | 'large' }) {
  const lignes = LIGNES_TAILLES.filter(([t]) => !seulement || (seulement === 'large') === estLarge(t));
  return (
    <div className="table-scroll">
      <table className="tableau">
        <thead><tr><th scope="col">Taille</th><th scope="col">Hauteur imprimée</th><th scope="col">1 tour imprime</th><th scope="col">Idéal pour</th>{!seulement && <th scope="col">Prix</th>}</tr></thead>
        <tbody>
          {lignes.map(([t, h]) => (
            <tr key={t}>
              <th scope="row">{estLarge(t) ? `Grand format ${TAILLES[t].nom}` : `Roue ${t}`}</th>
              <td>{String(TAILLES[t].bande).replace('.', ',')}&nbsp;mm</td>
              <td>{TAILLES[t].tour}&nbsp;mm</td>
              <td>{TAILLES[t].usage}</td>
              {!seulement && <td>{eur((P[h] as ProduitConfig).prix[t] ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Trois engagements en ligne, sous un CTA. */
export const Preuves = ({ className }: { className?: string }) => (
  <ul className={`preuves${className ? ` ${className}` : ''}`}>
    <li><IcoOk />BAT gratuit sous 24&nbsp;h</li>
    <li><IcoOk />Expédié en 3 jours ouvrés</li>
    <li><IcoOk />Livraison offerte dès 59&nbsp;€</li>
  </ul>
);

export function Quantite({ valeur, onChange, petit, libelle = 'Quantité' }: { valeur: number; onChange: (n: number) => void; petit?: boolean; libelle?: string }) {
  const borne = (n: number) => Math.max(1, Math.min(200, Number.isFinite(n) ? n : 1));
  return (
    <div className={`qte${petit ? ' qte-petit' : ''}`}>
      <button type="button" onClick={() => onChange(valeur - 1)} aria-label="Diminuer la quantité"><IcoMoins /></button>
      <input type="number" inputMode="numeric" min={1} max={200} value={valeur} aria-label={libelle}
        onChange={(e) => onChange(borne(parseInt(e.target.value, 10)))} />
      <button type="button" onClick={() => onChange(valeur + 1)} aria-label="Augmenter la quantité"><IcoPlus /></button>
    </div>
  );
}

export function LignesPanier({ editable = true }: { editable?: boolean }) {
  const { panier, majQte, retirer, fermer } = useBoutique();
  return (
    <>
      {panier.map((a) => <LignePanier key={a.cle} a={a} editable={editable} onQte={(q) => majQte(a.cle, q)} onRetirer={() => retirer(a.cle)} onLien={fermer} />)}
    </>
  );
}

export function LignePanier({ a, editable, onQte, onRetirer, onLien, compact }: { a: Ligne; editable?: boolean; onQte?: (q: number) => void; onRetirer?: () => void; onLien?: () => void; compact?: boolean }) {
  const p = P[a.cfg.h];
  const v = variantesDe(a);
  return (
    <div className={`ligne-panier${compact ? ' ligne-compacte' : ''}`}>
      <Link className="img" to="/produits/$handle" params={{ handle: a.cfg.h }} tabIndex={-1} aria-hidden="true" onClick={onLien}>
        <Img n={p.images[0]} alt="" w={160} h={160} />
      </Link>
      <div style={{ minWidth: 0 }}>
        <h3>
          <Link to="/produits/$handle" params={{ handle: a.cfg.h }} style={{ textDecoration: 'none' }} onClick={onLien}>{p.nom}{compact ? ` × ${a.qty}` : ''}</Link>
          <span className="num">{eur(totalLigne(a))}</span>
        </h3>
        <ul className="variantes">{(compact ? v.slice(0, 3) : v).map((x, i) => <li key={i}>{x}</li>)}</ul>
        {a.promo ? <span className="pastille pastille-ok" style={{ marginTop: 6 }}>Offre commande</span> : null}
        {editable && onQte && onRetirer && (
          <div className="ligne-actions">
            <Quantite petit valeur={a.qty} onChange={onQte} />
            <span style={{ display: 'flex', gap: 14 }}>
              {p.type === 'config' && (
                <Link className="lien" to="/produits/$handle" params={{ handle: a.cfg.h }} search={{ ligne: a.cle }} onClick={onLien}>Modifier</Link>
              )}
              <button type="button" className="lien" onClick={onRetirer}>Retirer</button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PanierVide({ onLien }: { onLien?: () => void }) {
  return (
    <div className="vide">
      <IcoSac />
      <p><strong>Votre panier est vide.</strong></p>
      <Link className="btn btn-primaire" to="/produits/$handle" params={{ handle: 'kit-rouleau' }} onClick={onLien}>Créer mon rouleau</Link>
    </div>
  );
}

export function Ariane({ items }: { items: { lib: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <ol className="ariane" aria-label="Fil d'Ariane">
      {items.map((x, i) => (
        <li key={i} aria-current={i === items.length - 1 ? 'page' : undefined}>
          {x.to ? <Link to={x.to as "/"} params={x.params as never}>{x.lib}</Link> : x.lib}
        </li>
      ))}
    </ol>
  );
}

export const Paiements = ({ sombre }: { sombre?: boolean }) => (
  <span className="paiements" aria-label="Moyens de paiement acceptés">
    {['CB', 'VISA', 'Mastercard', 'Apple Pay', 'Google Pay'].map((m) => <span key={m} className="paiement" data-sombre={sombre ? '1' : undefined}>{m}</span>)}
  </span>
);

/* Vidéo en boucle, muette : démarre après hydratation, reste sur l'affiche si l'utilisateur réduit les animations. */
export function VideoBoucle({ src, poster, label, className, eager }: { src: string; poster: string; label: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return; }
    const lancer = () => { v.play().catch(() => { /* lecture automatique refusée : l'affiche reste visible */ }); };
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) lancer(); else v.pause(); }, { threshold: 0.15 });
      o.observe(v);
      return () => o.disconnect();
    }
    lancer();
  }, []);
  return (
    <video ref={ref} className={className} src={src} poster={IMG(poster)} muted loop playsInline preload={eager ? 'auto' : 'metadata'} aria-label={label} />
  );
}
