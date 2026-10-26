import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Apercu, ajuste, infoApercu, useMesure } from '@/components/boutique/Apercu';
import { Ariane, CarteProduit, GuideTailles, Img, Paiements, Quantite, VideoBoucle } from '@/components/boutique/Elements';
import { IcoChevron, IcoOk } from '@/components/boutique/Icones';
import { useBoutique } from '@/lib/boutique';
import {
  COLLECTIONS, ENCRES, IMG, LIB_OPT, ORDRE, P, POLICES, SEPS, SURCOUT_TEXTILE, TAILLES,
  altDe, calc, cfgDefaut, encre, estLarge, eur, libTaille, prixMin, prixRoueSeule, prixRoueSup, rouesActives, taillesDe, usageFixe,
  type Cfg, type CfgConfig, type CfgSimple, type ProduitConfig, type ProduitSimple, type Roue,
} from '@/lib/catalogue';
import { absolu, offreLd, seo } from '@/lib/seo';

export const Route = createFileRoute('/produits/$handle')({
  validateSearch: (s: Record<string, unknown>): { ligne?: string } => (typeof s.ligne === 'string' ? { ligne: s.ligne } : {}),
  loader: ({ params }) => {
    if (!P[params.handle]) throw notFound();
    return { h: params.handle };
  },
  head: ({ params }) => {
    const p = P[params.handle];
    if (!p) return {};
    const chemin = `/produits/${params.handle}`;
    const prix = prixMin(params.handle);
    const ld = [
      {
        '@context': 'https://schema.org', '@type': 'Product', name: p.nom, description: p.seo?.desc ?? p.court, sku: params.handle, url: absolu(chemin),
        brand: { '@type': 'Brand', name: 'Mark & Roll' },
        ...(p.images[0] ? { image: absolu(IMG(p.images[0])) } : {}),
        offers: offreLd(params.handle, prix, absolu(chemin)),
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: absolu('/') },
          { '@type': 'ListItem', position: 2, name: COLLECTIONS[p.cats[0]]?.titre ?? 'Boutique', item: absolu(`/collections/${COLLECTIONS[p.cats[0]] ? p.cats[0] : 'boutique'}`) },
          { '@type': 'ListItem', position: 3, name: p.nom, item: absolu(chemin) },
        ],
      },
    ];
    return {
      ...seo({
        titre: `${p.seo?.titre ?? p.nom} | Mark & Roll`,
        description: p.seo?.desc ?? `${p.court} Dès ${eur(prix)}, tampons rouleaux personnalisés Mark & Roll.`,
        chemin,
        image: p.images[0] ? IMG(p.images[0]) : undefined,
      }),
      scripts: [{ type: 'application/ld+json', children: JSON.stringify(ld) }],
    };
  },
  component: PageProduit,
});

function PageProduit() {
  const { h } = Route.useLoaderData();
  return <Fiche key={h} h={h} />;
}

const copie = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
const MAX_LOGO = 4 * 1024 * 1024;

function Fiche({ h }: { h: string }) {
  const p = P[h];
  const b = useBoutique();
  const { ligne } = Route.useSearch();
  const naviguer = useNavigate();
  const mesure = useMesure();
  const [cfg, setCfg] = useState<Cfg>(() => cfgDefaut(h));
  const [edition, setEdition] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [ens, setEns] = useState<Record<string, boolean>>({});
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [barre, setBarre] = useState(false);

  useEffect(() => {
    if (!b.pret || !ligne) return;
    const a = b.panier.find((x) => x.cle === ligne && x.cfg.h === h);
    if (a) {
      setCfg({ ...copie(a.cfg), qty: a.qty });
      setEdition(a.cle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.pret, ligne, h]);

  useEffect(() => {
    const el = btnRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(([e]) => setBarre(!e.isIntersecting && e.boundingClientRect.top < 0));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    document.body.classList.toggle('barre-visible', barre && window.innerWidth <= 900);
    return () => document.body.classList.remove('barre-visible');
  }, [barre]);

  const res = calc(cfg);
  const pc = p.type === 'config' ? p : null;
  const cc = cfg.type === 'config' ? cfg : null;
  const val = pc?.valeur && cc ? pc.valeur(cc.taille) : null;
  const cat = p.cats[0];
  const imgs = p.images.length ? p.images : [null];
  const lies = ORDRE.filter((x) => x !== h && P[x].cats[0] === cat).concat(ORDRE.filter((x) => x !== h && P[x].cats[0] !== cat && P[x].cats.some((k) => p.cats.includes(k)))).slice(0, 4);
  const textile = !!cc && rouesActives(cc).some((r) => r.usage === 'textile');
  const accs = pc ? (pc.gamme === 'large' ? ['encreur-large', textile ? 'encre-textile' : 'encre-tampon'] : ['roue-prete', textile ? 'encre-textile' : 'recharge']) : [];

  const majCfg = (f: (c: CfgConfig) => void) => setCfg((c) => { const x = copie(c) as CfgConfig; f(x); return x; });
  const majRoue = (f: (r: Roue) => void) => majCfg((c) => { f(rouesActives(c)[Math.min(c.actif, rouesActives(c).length - 1)]); });
  const setQty = (n: number) => setCfg((c) => ({ ...c, qty: Math.max(1, Math.min(200, n)) }));

  const selAcc = (x: string) => {
    const d = cfgDefaut(x) as CfgSimple;
    if (cc && d.sel.taille && ((x === 'roue-prete' && !estLarge(cc.taille)) || (x === 'encreur-large' && estLarge(cc.taille)))) d.sel.taille = cc.taille;
    return d;
  };
  const prixAcc = (x: string) => (P[x] as ProduitSimple).prix(selAcc(x).sel);
  const accCoches = accs.filter((x) => ens[x] !== false);
  const totalEns = res.total + accCoches.reduce((s, x) => s + prixAcc(x), 0);

  function valider(): boolean {
    setErreur('');
    if (!cc || !pc) return true;
    const rs = rouesActives(cc);
    for (let k = 0; k < rs.length; k++) {
      const r = rs[k];
      const manque = r.mode === 'texte' ? !r.texte.trim() : !r.logo && !r.plusTard;
      if (manque) {
        majCfg((c) => { c.actif = k; });
        setErreur(r.mode === 'texte' ? `Tapez le texte à graver${rs.length > 1 ? ` sur la roue ${k + 1}` : ''} pour continuer.` : `Choisissez le fichier du logo${rs.length > 1 ? ` de la roue ${k + 1}` : ''}, ou cochez « je l'envoie par email ».`);
        setTimeout(() => document.getElementById(r.mode === 'texte' ? 'perso-texte' : 'perso-plus-tard')?.focus(), 50);
        return false;
      }
      if (r.mode === 'logo' && r.logo && r.logo.startsWith('data:')) {
        setErreur('Envoi du logo en cours, patientez une seconde puis réessayez.');
        return false;
      }
    }
    if (pc.supports && cc.opt.gravure && !cc.opt.gravureTexte.trim()) {
      setErreur('Indiquez le texte à graver, ou décochez l\'option.');
      return false;
    }
    return true;
  }
  function ajouter(e?: FormEvent) {
    e?.preventDefault();
    if (!valider()) return;
    b.ajouter(cfg, { edition });
    if (edition) {
      setEdition(null);
      naviguer({ to: '/produits/$handle', params: { handle: h }, search: {}, replace: true });
    }
  }
  function ajouterSelection() {
    if (!valider()) return;
    b.ajouterPlusieurs([cfg, ...accCoches.map(selAcc)]);
  }

  async function choisirLogo(f: File | undefined) {
    if (!f || !cc) return;
    setErreur('');
    if (f.size > MAX_LOGO) { setErreur('Fichier trop lourd : 4 Mo maximum. Exportez-le en SVG ou réduisez sa taille.'); return; }
    const idx = cc.actif;
    const lecteur = new FileReader();
    const donnees: string = await new Promise((ok, ko) => { lecteur.onload = () => ok(String(lecteur.result)); lecteur.onerror = ko; lecteur.readAsDataURL(f); }).catch(() => '') as string;
    if (!donnees) { setErreur('Ce fichier ne s\'ouvre pas. Essayez un SVG, PNG ou JPG.'); return; }
    const ratio: number = await new Promise((ok) => {
      const im = new Image();
      im.onload = () => ok(im.naturalWidth && im.naturalHeight ? Math.min(8, Math.max(0.5, im.naturalWidth / im.naturalHeight)) : 3);
      im.onerror = () => ok(-1);
      im.src = donnees;
    });
    if (ratio < 0) { setErreur('Ce fichier ne s\'ouvre pas. Essayez un SVG, PNG ou JPG.'); return; }
    const raster = !/svg/i.test(f.type) && !/\.svg$/i.test(f.name);
    majCfg((c) => { const r = rouesActives(c)[idx]; Object.assign(r, { logo: donnees, logoNom: f.name, raster, ratio, plusTard: false }); });
    setEnvoi(true);
    try {
      const rep = await fetch('/api/logos', { method: 'POST', body: f, headers: { 'Content-Type': f.type || 'application/octet-stream' } });
      const j = (await rep.json().catch(() => ({}))) as { url?: string; erreur?: string };
      if (!rep.ok || !j.url) throw new Error(j.erreur || 'Envoi impossible.');
      majCfg((c) => { const r = rouesActives(c)[idx]; if (r && r.logo === donnees) r.logo = j.url!; });
    } catch (e) {
      majCfg((c) => { const r = rouesActives(c)[idx]; if (r && r.logo === donnees) { r.logo = null; r.logoNom = ''; } });
      setErreur(`${e instanceof Error ? e.message : 'Envoi impossible.'} Vérifiez votre connexion puis choisissez le fichier à nouveau.`);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: COLLECTIONS[cat].titre, to: '/collections/$cle', params: { cle: cat } }, { lib: p.nom }]} />
      <div className="fiche">
        <Galerie h={h} imgs={imgs} />
        <div className="achat">
          <div className="achat-tete">
            <div className="sur-titre">
              {pc && <span className="pastille pastille-brand">Personnalisable</span>}
              {val && cc ? <span className="pastille pastille-ok">{eur(val - (pc!.prix[cc.taille] ?? 0))} d'économie</span> : null}
            </div>
            <h1 className="titre-fiche">{p.nom}</h1>
            <div className="achat-prix"><strong>{eur(res.unit)}</strong>{val ? <s className="num">{eur(val)}</s> : null}<span className="note">{pc && (pc.marqueurs || pc.encreur) ? 'TTC, encre incluse' : 'TTC'}</span></div>
            <p className="achat-court">{p.court}</p>
            {p.points && <ul className="points-ok points-fiche">{p.points.map((x) => <li key={x}><IcoOk />{x}</li>)}</ul>}
            <p className="stock"><i aria-hidden="true" />{pc ? 'Fabriqué à la commande, expédié sous 3 jours ouvrés après le BAT' : 'En stock, expédié sous 24 h'}</p>
          </div>

          <form onSubmit={ajouter} noValidate className="form-achat">
            {pc && cc ? (
              <>
                <fieldset className="option etape-bloc">
                  <legend><span className="etape-titre"><span className="etape-n">1</span>{pc.gamme === 'large' ? 'Largeur du rouleau' : 'Taille de la roue'}</span></legend>
                  <div className="choix">
                    {taillesDe(pc).map((t) => (
                      <label key={t}>
                        <input type="radio" name="taille" value={t} checked={cc.taille === t} onChange={() => majCfg((c) => { c.taille = t; })} />
                        <span className="case-v"><strong>{libTaille(t)}</strong><span>{TAILLES[t].usage}</span><span className="case-prix">{eur(pc.prix[t] ?? 0)}</span></span>
                      </label>
                    ))}
                  </div>
                  <details className="guide-mini"><summary>Quelle taille choisir ?<IcoChevron /></summary><GuideTailles seulement={pc.gamme} /></details>
                </fieldset>
                <Perso p={pc} c={cc} mesure={mesure} majCfg={majCfg} majRoue={majRoue} choisirLogo={choisirLogo} envoi={envoi} erreur={!!erreur} effacerErreur={() => setErreur('')} />
                <Ajouts p={pc} c={cc} majCfg={majCfg} />
              </>
            ) : (
              <OptionsSimples p={p as ProduitSimple} c={cfg as CfgSimple} set={(k, v) => setCfg((c) => ({ ...(c as CfgSimple), sel: { ...(c as CfgSimple).sel, [k]: v } }))} />
            )}
            <div className="champ">
              <div className="achat-actions">
                <Quantite valeur={cfg.qty} onChange={setQty} />
                <button ref={btnRef} type="submit" className="btn btn-primaire btn-large">
                  {edition ? 'Mettre à jour' : 'Ajouter au panier'}<span className="prix-btn">· {eur(res.total)}</span>
                </button>
              </div>
              {pc && <p className="remises">{res.remise ? <strong>Remise de {res.remise * 100} % appliquée. </strong> : null}Dès 3 exemplaires −10 %, dès 5 −15 %, dès 10 −20 %.</p>}
              <p className="err" aria-live="polite">{erreur}</p>
            </div>
          </form>

          <div className="garanties"><ul>
            {pc && <li><img src="/img/icones/bat.png" alt="" width={22} height={22} /><span><strong>BAT gratuit sous 24 h</strong>, retouches illimitées avant gravure</span></li>}
            <li><img src="/img/icones/livraison.png" alt="" width={22} height={22} /><span><strong>Livraison offerte dès 45 €</strong>, 3,90 € sinon</span></li>
            <li><img src="/img/icones/securite.png" alt="" width={22} height={22} /><span><strong>Paiement sécurisé</strong>, fabriqué en France</span></li>
          </ul><Paiements /></div>

          <div className="accordeon">
            <details open><summary>Dans la boîte<IcoChevron /></summary><div className="contenu"><ul>{(p.inclut || [p.court]).map((x) => <li key={x}>{x}</li>)}</ul></div></details>
            {pc && (
              <details><summary>Caractéristiques<IcoChevron /></summary><div className="contenu"><div className="table-scroll"><table className="tableau" style={{ minWidth: 0 }}><tbody>
                {pc.gamme === 'large' ? (
                  <>
                    <tr><th scope="row">Rouleau</th><td>TPU 95A gravé en relief de 1,8 mm (2,2 mm en textile)</td></tr>
                    <tr><th scope="row">Manche</th><td>PETG, fourche à axes démontables sans outil</td></tr>
                    <tr><th scope="row">Encreur</th><td>Mousse à cellules ouvertes, rechargeable à l'encre à tampon</td></tr>
                    <tr><th scope="row">Hauteur imprimée</th><td>30 ou 50 mm selon la largeur</td></tr>
                    <tr><th scope="row">Tour de rouleau</th><td>157 ou 201 mm</td></tr>
                  </>
                ) : (
                  <>
                    <tr><th scope="row">Roue</th><td>TPU 95A gravé en relief de 1,8 mm (2,2 mm en textile)</td></tr>
                    <tr><th scope="row">Support</th><td>PETG, serrage par vis M3, pour marqueur Ø29 mm</td></tr>
                    <tr><th scope="row">Marqueur</th><td>Pointe plate 15 mm, rechargeable</td></tr>
                    <tr><th scope="row">Hauteur imprimée</th><td>13,5 mm</td></tr>
                    <tr><th scope="row">Tour de roue</th><td>94, 188 ou 251 mm selon la taille</td></tr>
                  </>
                )}
              </tbody></table></div></div></details>
            )}
            <details><summary>Livraison et retours<IcoChevron /></summary><div className="contenu">
              <p>Point relais ou domicile : 3,90 €, offert dès 45 €. Express 24 h : 14,90 €. Livraison en France, Belgique et Luxembourg.</p>
              <p>Les roues gravées à votre motif ne sont ni reprises ni échangées, sauf défaut de fabrication. Les accessoires non ouverts sont remboursés sous 14 jours.</p>
            </div></details>
            <details><summary>Entretien et recharge<IcoChevron /></summary><div className="contenu">
              <p>{pc?.gamme === 'large'
                ? 'Déposez quelques gouttes d\'encre sur le rouleau encreur et roulez à vide trois tours. Rincez le rouleau gravé à l\'eau tiède tant que l\'encre est fraîche. La mousse se remplace en 10 secondes.'
                : 'Rincez la roue à l\'eau tiède tant que l\'encre est fraîche. Rebouchez le marqueur après usage. Une recharge de 30 ml remplit le marqueur plusieurs fois.'}</p>
            </div></details>
          </div>
        </div>
      </div>

      {pc && (
        <section className="section section-serree" aria-labelledby="h-ens">
          <h2 id="h-ens" className="titre-bloc">Complétez avec les recharges</h2>
          <div className="ensemble">
            <div className="ensemble-items">
              {[h, ...accs].map((x, k) => (
                <div key={x} style={{ display: 'contents' }}>
                  {k > 0 && <span className="ensemble-plus" aria-hidden="true">+</span>}
                  <div className="ensemble-item">
                    <div className="img"><Img n={P[x].images[0]} alt="" /></div>
                    <label>
                      <input type="checkbox" checked={k === 0 || ens[x] !== false} disabled={k === 0} onChange={(e) => setEns((s) => ({ ...s, [x]: e.target.checked }))} />
                      <span>{k === 0 ? 'Ce produit' : P[x].nom}<br /><span className="note num">{k === 0 ? 'personnalisé ci-dessus' : eur(prixAcc(x))}</span></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="ensemble-total">
              <span className="note">Total pour la sélection</span>
              <strong>{eur(Math.round(totalEns * 100) / 100)}</strong>
              <button type="button" className="btn btn-noir" onClick={ajouterSelection}>Ajouter la sélection</button>
            </div>
          </div>
        </section>
      )}

      <section className="section section-serree" aria-labelledby="h-lies">
        <h2 id="h-lies" className="titre-bloc">Vous aimerez aussi</h2>
        <div className="grille">{lies.map((x) => <CarteProduit key={x} h={x} simple />)}</div>
      </section>

      <div className={`barre-achat${barre ? ' visible' : ''}`} aria-hidden={!barre}>
        <div className="infos"><span>{p.nom}</span><strong>{eur(res.total)}</strong></div>
        <button type="button" className="btn btn-primaire" tabIndex={barre ? 0 : -1} onClick={() => ajouter()}>Ajouter au panier</button>
      </div>
    </div>
  );
}

function Galerie({ h, imgs }: { h: string; imgs: (string | null)[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [i, setI] = useState(0);
  const video = P[h].video;
  const n = imgs.length + (video ? 1 : 0);
  const aller = (k: number) => {
    const d = ref.current;
    if (!d) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.scrollTo({ left: k * d.clientWidth, behavior: reduit ? 'auto' : 'smooth' });
  };
  const decal = video ? 1 : 0;
  return (
    <div className="galerie" aria-label="Photos et vidéo du produit">
      <div className="vignettes">
        {video && (
          <button type="button" className="vignette vignette-video" aria-label="Vidéo du produit en action" aria-current={i === 0} onClick={() => aller(0)}>
            <img src={IMG(video.poster)} alt="" width={152} height={152} loading="lazy" />
          </button>
        )}
        {imgs.map((im, k) => (
          <button key={k} type="button" className="vignette" aria-label={`Photo ${k + 1}`} aria-current={k + decal === i} onClick={() => aller(k + decal)}>
            {im && <img src={IMG(im)} alt="" width={152} height={152} loading="lazy" />}
          </button>
        ))}
      </div>
      <div>
        <div className="diapos" ref={ref} tabIndex={0} aria-label="Photos, faire défiler"
          onScroll={(e) => { const d = e.currentTarget; requestAnimationFrame(() => setI(Math.round(d.scrollLeft / Math.max(1, d.clientWidth)))); }}
          onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); aller(Math.max(0, Math.min(n - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))); } }}>
          {video && <div className="diapo diapo-video"><VideoBoucle src={video.src} poster={video.poster} label={`${P[h].nom} en action`} eager /></div>}
          {imgs.map((im, k) => <div key={k} className="diapo"><Img n={im} alt={im ? altDe(h, k) : P[h].nom} eager={k === 0 && !video} w={1100} h={1100} /></div>)}
        </div>
        <div className="points" aria-hidden="true">{Array.from({ length: n }, (_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      </div>
    </div>
  );
}

function OptionsSimples({ p, c, set }: { p: ProduitSimple; c: CfgSimple; set: (k: string, v: string) => void }) {
  return (
    <>
      {Object.entries(p.options || {}).map(([k, opts]) => k === 'couleur' ? (
        <fieldset key={k} className="option">
          <legend>Couleur<span>{opts.find((o) => o.id === c.sel[k])?.nom}</span></legend>
          <div className="nuancier">
            {opts.map((o) => (
              <label key={o.id} title={o.nom}>
                <input type="radio" name={`opt-${k}`} value={o.id} checked={c.sel[k] === o.id} onChange={() => set(k, o.id)} aria-label={o.nom} />
                <span className="nuance" style={{ ['--n' as string]: o.hex }} />
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <fieldset key={k} className="option">
          <legend>{LIB_OPT[k] || k}</legend>
          <div className={`choix${opts.length <= 2 ? ' choix-2' : ''}`}>
            {opts.map((o) => (
              <label key={o.id}>
                <input type="radio" name={`opt-${k}`} value={o.id} checked={c.sel[k] === o.id} onChange={() => set(k, o.id)} />
                <span className="case-v"><strong>{o.nom}</strong></span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}

interface PersoProps {
  p: ProduitConfig;
  c: CfgConfig;
  mesure: ReturnType<typeof useMesure>;
  majCfg: (f: (c: CfgConfig) => void) => void;
  majRoue: (f: (r: Roue) => void) => void;
  choisirLogo: (f: File | undefined) => void;
  erreur: boolean;
  envoi: boolean;
  effacerErreur: () => void;
}
function Perso({ p, c, mesure, majCfg, majRoue, choisirLogo, envoi, erreur, effacerErreur }: PersoProps) {
  const rs = rouesActives(c);
  const i = Math.min(c.actif, rs.length - 1);
  const r = rs[i];
  const fixe = usageFixe(c, i);
  const avecEncre = (p.marqueurs || p.encreur) && i < c.roues.length;
  const fit = ajuste(r, c.taille, mesure);
  const info = infoApercu(r, fit);
  const large = p.gamme === 'large';
  const vide = r.mode === 'texte' && !r.texte.trim();
  return (
    <>
      {rs.length > 1 && (
        <div className="roues-onglets" role="tablist" aria-label={large ? 'Rouleaux à personnaliser' : 'Roues à personnaliser'}>
          {rs.map((x, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} onClick={() => majCfg((y) => { y.actif = k; })}>
              {large ? 'Rouleau' : 'Roue'} {k + 1}{k >= c.roues.length ? ' (option)' : ''}
              <span className="roue-etat" aria-hidden="true">{(x.mode === 'texte' ? x.texte.trim() : x.logo || x.plusTard) ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
      <div className="option etape-bloc">
        <div className="perso-tete">
          <span className="etape-titre"><span className="etape-n">2</span>Votre motif{rs.length > 1 ? `, ${large ? 'rouleau' : 'roue'} ${i + 1}` : ''}</span>
          <div className="onglets" role="tablist" aria-label="Type de motif">
            <button type="button" role="tab" aria-selected={r.mode === 'texte'} onClick={() => majRoue((x) => { x.mode = 'texte'; })}>Texte</button>
            <button type="button" role="tab" aria-selected={r.mode === 'logo'} onClick={() => majRoue((x) => { x.mode = 'logo'; })}>{large ? 'Logo ou dessin' : 'Logo'}</button>
          </div>
        </div>
        <div className="perso">
          {r.mode === 'texte' ? (
            <>
              <div className="champ">
                <label htmlFor="perso-texte">Texte gravé</label>
                <input className="saisie" id="perso-texte" value={r.texte} maxLength={40} autoComplete="off" spellCheck={false} placeholder="Tapez votre marque, ex. ATELIER LUNA"
                  aria-invalid={(vide && erreur) || undefined} onFocus={(e) => e.currentTarget.select()} onChange={(e) => { const v = e.target.value; effacerErreur(); majRoue((x) => { x.texte = v; }); }} />
                <span className="aide num">{r.texte.length}/40 caractères</span>
              </div>
              <div className="champ">
                <span className="lib" id="lib-police">Police</span>
                <div className="polices" role="radiogroup" aria-labelledby="lib-police">
                  {POLICES.map((pol) => (
                    <label key={pol.id}>
                      <input type="radio" name="police" value={pol.id} checked={r.police === pol.id} onChange={() => majRoue((x) => { x.police = pol.id; })} />
                      <span style={{ fontFamily: pol.css }}>{pol.nom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="champ">
              <span className="lib">Fichier {large ? 'du logo ou du dessin' : 'du logo'}</span>
              <label className="depot">
                <input type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg" onChange={(e) => { choisirLogo(e.target.files?.[0]); e.target.value = ''; }} />
                <strong>{envoi ? 'Envoi du fichier…' : r.logo ? r.logoNom : 'Choisir un fichier'}</strong>
                <span>{r.logo ? 'Toucher pour remplacer' : 'SVG, PNG ou JPG, 4 Mo maximum'}</span>
              </label>
              <span className="aide">Imprimé d'une seule couleur. Un motif foncé sur fond clair ou transparent donne le meilleur rendu{large ? ' ; traits d\'au moins 0,6 mm' : ''}.</span>
              {r.logo && r.raster && <span className="aide aide-alerte">Fichier PNG ou JPG : ajoutez la vectorisation dans les options pour un tracé net.</span>}
              {!r.logo && (
                <label className="case-cgv">
                  <input type="checkbox" id="perso-plus-tard" checked={!!r.plusTard} onChange={(e) => { const v = e.target.checked; effacerErreur(); majRoue((x) => { x.plusTard = v; }); }} />
                  <span>Je n'ai pas mon fichier sous la main : je l'envoie en répondant à l'email de confirmation. Le BAT part dès réception.</span>
                </label>
              )}
            </div>
          )}
          <div className="champ">
            <span className="lib">Aperçu de l'empreinte</span>
            <div className="apercu"><Apercu roue={r} taille={c.taille} mesure={mesure} /></div>
            <div className="apercu-pied">
              <span>{info.alerte ? <span className="aide-alerte">{info.texte}</span> : info.texte}</span>
              <span>1 tour = {TAILLES[c.taille].tour} mm</span>
            </div>
          </div>
          <div className="champ">
            <span className="lib" id="lib-sep">Séparateur</span>
            <div className="polices" role="radiogroup" aria-labelledby="lib-sep">
              {SEPS.map((sp) => (
                <label key={sp.id}>
                  <input type="radio" name="sep" value={sp.id} checked={r.sep === sp.id} onChange={() => majRoue((x) => { x.sep = sp.id; })} />
                  <span>{sp.nom}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <fieldset className="option etape-bloc">
        <legend><span className="etape-titre"><span className="etape-n">3</span>Couleur d'encre</span><span>{encre(r.usage, r.encre).nom}{avecEncre ? (p.encreur ? ', flacon inclus' : ', marqueur inclus') : ''}</span></legend>
        {!fixe && (
          <div className="segments" role="radiogroup" aria-label="Support à marquer">
            {(['packaging', 'textile'] as const).map((u) => (
              <label key={u}>
                <input type="radio" name="usage" value={u} checked={r.usage === u} onChange={() => majRoue((x) => { x.usage = u; if (!ENCRES[u].some((en) => en.id === x.encre)) x.encre = 'noir'; })} />
                <span>{u === 'packaging' ? 'Carton et papier' : `Textile${avecEncre ? ` (+${SURCOUT_TEXTILE} €)` : ''}`}</span>
              </label>
            ))}
          </div>
        )}
        <div className="nuancier">
          {ENCRES[r.usage].map((en) => (
            <label key={en.id} title={en.nom}>
              <input type="radio" name="encre" value={en.id} checked={r.encre === en.id} onChange={() => majRoue((x) => { x.encre = en.id; })} aria-label={en.nom} />
              <span className="nuance" style={{ ['--n' as string]: en.hex }} />
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function Ajouts({ p, c, majCfg }: { p: ProduitConfig; c: CfgConfig; majCfg: (f: (c: CfgConfig) => void) => void }) {
  const raster = rouesActives(c).some((r) => r.mode === 'logo' && r.raster);
  const large = p.gamme === 'large';
  const ligne = (k: 'roueSup' | 'gravure' | 'vecto' | 'express' | 'coffret', titre: string, sous: string, prix: ReactNode) => (
    <label className="ajout" key={k}>
      <input type="checkbox" checked={c.opt[k]} onChange={(e) => { const v = e.target.checked; majCfg((x) => { x.opt[k] = v; if (k === 'roueSup' && v) x.actif = rouesActives(x).length - 1; if (k === 'roueSup' && !v) x.actif = Math.min(x.actif, x.roues.length - 1); }); }} />
      <span><strong>{titre}</strong><small>{sous}</small></span>
      <span className="p">{prix}</span>
    </label>
  );
  const autres = c.opt.gravure || c.opt.express || c.opt.coffret;
  return (
    <fieldset className="option etape-bloc">
      <legend><span className="etape-titre"><span className="etape-n">4</span>Options</span><span>facultatif</span></legend>
      <div className="ajouts">
        {p.roueSup && ligne('roueSup', large ? 'Ajouter un 2e rouleau gravé' : 'Ajouter une 2e roue gravée', large ? 'Un second dessin, une saison, une collab' : 'Votre @instagram, un merci, une promo', <>+{eur(prixRoueSup(c.taille))}<s>{eur(prixRoueSeule(c.taille))}</s></>)}
        {raster && ligne('vecto', 'Vectorisation du logo', 'Notre graphiste redessine votre fichier', '+9,00 €')}
        <details className="plus-options" open={autres || undefined}>
          <summary>Gravure du {large ? 'manche' : 'support'}, express, coffret cadeau<IcoChevron /></summary>
          <div className="ajouts">
            {p.supports > 0 && ligne('gravure', `Graver votre marque sur le ${large ? 'manche' : 'support'}`, 'Gravure discrète, 20 caractères', `+${eur(5 * p.supports)}`)}
            {p.supports > 0 && c.opt.gravure && (
              <div className="champ">
                <label htmlFor="opt-gravure">Texte gravé sur le {large ? 'manche' : 'support'}</label>
                <input className="saisie" id="opt-gravure" maxLength={20} value={c.opt.gravureTexte} autoComplete="off" placeholder="Ex. LUNA…"
                  onChange={(e) => { const v = e.target.value; majCfg((x) => { x.opt.gravureTexte = v; }); }} />
              </div>
            )}
            {ligne('express', 'Fabrication express', 'Expédié sous 48 h après le BAT', '+7,00 €')}
            {ligne('coffret', 'Coffret cadeau', 'Boîte et carte manuscrite', '+4,00 €')}
          </div>
        </details>
      </div>
    </fieldset>
  );
}
