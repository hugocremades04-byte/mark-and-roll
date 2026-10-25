import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { CarteProduit, CarteRouleau, Img, Preuves, SectionTete, VideoBoucle } from '@/components/boutique/Elements';
import { IcoChevron, IcoFleche } from '@/components/boutique/Icones';
import { ALT, FAQ, IMG, dansCollection } from '@/lib/catalogue';

export const Route = createFileRoute('/')({
  component: Accueil,
});

const PHOTO_ROULEAU: Record<string, string> = { 'kit-rouleau': 'kit-action', 'rouleau-large': 'rouleau-large', 'kit-textile': 'tote' };
const ETAPES = [
  { img: 'etape-composer', titre: 'Composez', texte: 'Votre texte ou votre logo, la police, la couleur. L\'aperçu montre l\'empreinte réelle.' },
  { img: 'etape-bat', titre: 'Validez le BAT', texte: 'Bon à tirer gratuit par email sous 24 h. Rien n\'est gravé sans votre accord.' },
  { img: 'etape-rouler', titre: 'Roulez', texte: 'Expédié sous 3 jours ouvrés, encre incluse. Premier colis marqué le jour même.' },
];
const CHAPITRES = [
  { t: 0, titre: 'Trois pièces, zéro réglage', texte: 'La roue gravée se clipse sur le support, le marqueur l\'encre en continu.' },
  { t: 5, titre: 'Vous roulez, c\'est imprimé', texte: 'Une pression légère : le motif se répète sans raccord sur toute la longueur.' },
  { t: 10, titre: 'Chaque colis porte votre marque', texte: 'Deux secondes par colis, sans étiquette ni imprimante.' },
];
const RECHARGES = ['recharge', 'marqueur', 'encre-tampon', 'roue-prete', 'encre-textile', 'totes'];
const USAGES = [
  { img: 'atelier-emballage', titre: 'E-commerce', texte: 'Cartons, mailers, papier de soie' },
  { img: 'usage-cafe', titre: 'Cafés et épiceries', texte: 'Sachets, gobelets, sacs kraft' },
  { img: 'usage-mariage', titre: 'Événements', texte: 'Pochettes, enveloppes, faire-part' },
  { img: 'tote', titre: 'Textile', texte: 'Tote bags et t-shirts' },
];

export function CtaHeros({ libelle = 'Créer mon rouleau' }: { libelle?: string }) {
  return (
    <Link className="cta-heros" to="/produits/$handle" params={{ handle: 'kit-rouleau' }}>
      {libelle}
      <span className="prix-pastille">dès 39&nbsp;€<IcoFleche epais={2.4} /></span>
    </Link>
  );
}

/* Film 3D en boucle, chapitres synchronisés sur la lecture. */
function Film3D() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [chap, setChap] = useState(0);
  useEffect(() => {
    const v = ref.current?.querySelector('video');
    if (!v) return;
    const maj = () => setChap(CHAPITRES.reduce((k, c, i) => (v.currentTime >= c.t ? i : k), 0));
    v.addEventListener('timeupdate', maj);
    return () => v.removeEventListener('timeupdate', maj);
  }, []);
  const aller = (i: number) => {
    const v = ref.current?.querySelector('video');
    if (v) { v.currentTime = CHAPITRES[i].t + 0.05; setChap(i); }
  };
  return (
    <div className="film3d">
      <div className="film3d-video" ref={ref}>
        <VideoBoucle src="/video/film-3d.mp4" poster="film-3d" label={ALT['film-3d']} />
      </div>
      <ol className="film3d-chap">
        {CHAPITRES.map((c, i) => (
          <li key={c.t}>
            <button type="button" aria-current={chap === i} onClick={() => aller(i)}>
              <span className="film3d-n">{i + 1}</span>
              <span><strong>{c.titre}</strong><span>{c.texte}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Accueil() {
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [flottant, setFlottant] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver(([e]) => setFlottant(!e.isIntersecting && e.boundingClientRect.top < 0));
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <>
      <section className="wrap heros3" aria-labelledby="h-heros">
        <div className="heros3-txt">
          <h1 id="h-heros">Votre logo sur <em>chaque colis</em>.</h1>
          <p className="chapeau">Un rouleau gravé à votre marque : un passage, et votre logo s'imprime en continu sur vos cartons, sachets et tote bags.</p>
          <div className="heros3-cta" ref={ctaRef}>
            <CtaHeros />
            <Link className="lien-fleche" to="/collections/$cle" params={{ cle: 'boutique' }}>Voir tous les produits<IcoFleche /></Link>
          </div>
          <Preuves />
        </div>
        <div className="heros3-video">
          <VideoBoucle src="/video/heros-action.mp4" poster="heros-action" label={ALT['heros-action']} eager />
        </div>
      </section>

      <section className="wrap section" aria-labelledby="h-rouleaux">
        <SectionTete id="h-rouleaux" titre="Choisissez votre rouleau" lien={{ to: '/collections/$cle', params: { cle: 'rouleaux' } }} libLien="Comparer les tailles" />
        <div className="rouleaux-grille">
          {dansCollection('rouleaux').map((h) => <CarteRouleau key={h} h={h} img={PHOTO_ROULEAU[h]} />)}
        </div>
      </section>

      <section className="bande-claire" aria-labelledby="h-etapes">
        <div className="wrap section">
          <div className="section-tete"><div><h2 id="h-etapes">Comment ça marche</h2><p>Trois étapes, un BAT gratuit, votre kit chez vous en moins d'une semaine.</p></div></div>
          <ol className="etapes3">
            {ETAPES.map((e, i) => (
              <li key={e.img}>
                <div className="illu"><Img n={e.img} alt="" w={1200} h={896} /></div>
                <h3><span className="num-rond">{i + 1}</span>{e.titre}</h3>
                <p>{e.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section ancre" id="film" aria-labelledby="h-film">
        <div className="section-tete"><div><h2 id="h-film">Le kit en 3D</h2><p>Trois pièces imprimées en France, une roue gravée à votre marque.</p></div></div>
        <Film3D />
      </section>

      <section className="wrap section-bas" aria-labelledby="h-packs">
        <SectionTete id="h-packs" titre="Les packs, moins cher qu'à l'unité" lien={{ to: '/collections/$cle', params: { cle: 'packs' } }} libLien="Tous les packs" />
        <div className="grille">{dansCollection('packs').map((h) => <CarteProduit key={h} h={h} />)}</div>
      </section>

      <section className="wrap section-bas" aria-labelledby="h-recharges">
        <SectionTete id="h-recharges" titre="Recharges et accessoires" lien={{ to: '/collections/$cle', params: { cle: 'recharges' } }} libLien="Toutes les recharges" />
        <div className="slider">{RECHARGES.map((h) => <CarteProduit key={h} h={h} simple />)}</div>
      </section>

      <section className="wrap section-bas" aria-labelledby="h-usages">
        <SectionTete id="h-usages" titre="Sur tous vos supports" />
        <div className="usages3">
          {USAGES.map((u) => (
            <figure key={u.img} className="usage3">
              <div className="img"><img src={IMG(u.img)} alt={ALT[u.img] || ''} width={800} height={800} loading="lazy" decoding="async" /></div>
              <figcaption><strong>{u.titre}</strong><span>{u.texte}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="wrap section-bas ancre" id="faq" aria-labelledby="h-faq">
        <div className="faq-grille">
          <div>
            <h2 id="h-faq">Questions fréquentes</h2>
            <p className="sous-titre">Une autre question ? contact@markandroll.fr, réponse sous 24 h ouvrées.</p>
          </div>
          <div className="accordeon">
            {FAQ.slice(0, 6).map(([q, r]) => (
              <details key={q}><summary>{q}<IcoChevron /></summary><div className="contenu"><p>{r}</p></div></details>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section-bas" aria-labelledby="h-final">
        <div className="final">
          <div>
            <h2 id="h-final">Votre premier colis signé dans une semaine.</h2>
            <Preuves className="preuves-sombre" />
          </div>
          <CtaHeros />
        </div>
      </section>

      <div className={`cta-flottant${flottant ? ' visible' : ''}`} aria-hidden={!flottant} inert={!flottant}>
        <CtaHeros />
      </div>
    </>
  );
}
