import { Link, createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { Ariane, CarteProduit, CarteRouleau, GuideTailles, Preuves } from '@/components/boutique/Elements';
import { ALIAS_COLLECTIONS, COLLECTIONS, P, RAYONS, dansCollection } from '@/lib/catalogue';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/collections/$cle')({
  loader: ({ params }) => {
    const alias = ALIAS_COLLECTIONS[params.cle];
    if (alias) throw redirect({ to: '/collections/$cle', params: { cle: alias }, statusCode: 301 });
    if (!COLLECTIONS[params.cle]) throw notFound();
    return { cle: params.cle };
  },
  head: ({ params }) => {
    const C = COLLECTIONS[params.cle];
    return C ? seo({ titre: `${C.seo.titre} | Mark & Roll`, description: C.seo.desc, chemin: `/collections/${params.cle}` }) : {};
  },
  component: Collection,
});

const PHOTO_ROULEAU: Record<string, string> = { 'kit-rouleau': 'kit-action', 'rouleau-large': 'rouleau-large', 'kit-textile': 'tote' };

function Rouleaux() {
  return (
    <div className="rouleaux-grille">
      {dansCollection('rouleaux').map((h) => <CarteRouleau key={h} h={h} img={PHOTO_ROULEAU[h]} />)}
    </div>
  );
}

function Grille({ hs }: { hs: string[] }) {
  return <div className="grille">{hs.map((h) => <CarteProduit key={h} h={h} />)}</div>;
}

function Recharges() {
  const hs = dansCollection('recharges');
  return (
    <>
      {RAYONS.map((r) => {
        const l = hs.filter((h) => P[h].rayon === r.id);
        return l.length ? (
          <section key={r.id} className="rayon" aria-labelledby={`r-${r.id}`}>
            <h2 id={`r-${r.id}`} className="rayon-titre">{r.titre}<span>{l.length}</span></h2>
            <Grille hs={l} />
          </section>
        ) : null;
      })}
    </>
  );
}

function Collection() {
  const { cle } = Route.useLoaderData();
  const C = COLLECTIONS[cle];
  const n = dansCollection(cle).length;
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: C.titre }]} />
      <div className="collection-tete">
        <h1>{C.h1}</h1>
        <p>{C.desc}</p>
      </div>
      <nav className="filtres barre-filtres" aria-label="Rayons">
        {Object.entries(COLLECTIONS).map(([k, x]) => (
          <Link key={k} className="filtre" to="/collections/$cle" params={{ cle: k }} aria-current={k === cle ? 'page' : undefined}>
            {x.court}<span className="filtre-n">{dansCollection(k).length}</span>
          </Link>
        ))}
      </nav>
      <p className="sr" aria-live="polite">{n} produits</p>

      {cle === 'rouleaux' && (
        <>
          <Rouleaux />
          <Preuves className="preuves-centre" />
          <section className="section ancre" id="guide-tailles" aria-labelledby="h-guide">
            <div className="section-tete"><div><h2 id="h-guide">Quelle taille choisir ?</h2><p>Plus la roue est grande, plus le motif est long avant de se répéter. Plus la bande est large, plus le logo peut être haut et détaillé.</p></div></div>
            <GuideTailles />
          </section>
        </>
      )}
      {cle === 'packs' && <Grille hs={dansCollection('packs')} />}
      {cle === 'recharges' && <Recharges />}
      {cle === 'boutique' && (
        <>
          <section className="rayon" aria-labelledby="b-rouleaux">
            <div className="rayon-tete"><h2 id="b-rouleaux" className="rayon-titre">Rouleaux personnalisés</h2><Link className="lien-fleche" to="/collections/$cle" params={{ cle: 'rouleaux' }}>Comparer</Link></div>
            <Rouleaux />
          </section>
          <section className="rayon" aria-labelledby="b-packs">
            <div className="rayon-tete"><h2 id="b-packs" className="rayon-titre">Packs</h2></div>
            <Grille hs={dansCollection('packs')} />
          </section>
          <Recharges />
        </>
      )}
    </div>
  );
}
