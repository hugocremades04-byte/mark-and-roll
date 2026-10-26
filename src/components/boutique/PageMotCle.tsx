import { Link } from '@tanstack/react-router';
import { Ariane, CarteProduit, Img, Preuves } from '@/components/boutique/Elements';
import { IcoChevron, IcoFleche } from '@/components/boutique/Icones';
import { PAGES_SEO, PAGE_SEO } from '@/lib/pages-seo';
import { absolu, faqLd, seo } from '@/lib/seo';

/** Balises de la page : title, description, canonique, FAQ et fil d'Ariane en données structurées. */
export function headPageMotCle(chemin: string) {
  const x = PAGE_SEO(chemin);
  const ariane = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: absolu('/') },
      { '@type': 'ListItem', position: 2, name: x.lib, item: absolu(chemin) },
    ],
  };
  return {
    ...seo({ titre: `${x.titre} | Mark & Roll`, description: x.desc, chemin, image: `/img/${x.image}.webp` }),
    scripts: [{ type: 'application/ld+json', children: JSON.stringify([faqLd(x.faq), ariane]) }],
  };
}

export function PageMotCle({ chemin }: { chemin: string }) {
  const x = PAGE_SEO(chemin);
  const autres = PAGES_SEO.filter((p) => p.chemin !== chemin);
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: x.lib }]} />
      <section className="ms-tete" aria-labelledby="h-ms">
        <div>
          <h1 id="h-ms">{x.h1}</h1>
          <p className="chapeau">{x.chapeau}</p>
          <div className="ms-cta">
            <Link className="btn btn-primaire" to="/produits/$handle" params={{ handle: x.produits[0] }}>Créer mon tampon</Link>
            <Link className="lien-fleche" to="/collections/$cle" params={{ cle: 'rouleaux' }}>Comparer les tailles<IcoFleche /></Link>
          </div>
          <Preuves />
        </div>
        <div className="ms-visuel"><Img n={x.image} alt={x.alt} w={1200} h={1200} eager /></div>
      </section>

      <section className="section-serree" aria-label="Produits">
        <div className="grille ms-grille">{x.produits.map((h) => <CarteProduit key={h} h={h} />)}</div>
      </section>

      <article className="page-texte ms-texte">
        {x.sections.map((s) => (
          <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.p.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}
          </section>
        ))}
      </article>

      <section className="section-bas ms-faq" aria-labelledby="h-ms-faq">
        <div className="faq-grille">
          <div><h2 id="h-ms-faq">Questions fréquentes</h2></div>
          <div className="accordeon">
            {x.faq.map(([q, r]) => (
              <details key={q}><summary>{q}<IcoChevron /></summary><div className="contenu"><p>{r}</p></div></details>
            ))}
          </div>
        </div>
      </section>

      <nav className="ms-liens section-bas" aria-label="À lire aussi">
        <h2>À lire aussi</h2>
        <ul>{autres.map((p) => <li key={p.chemin}><a href={p.chemin}>{p.lib}</a></li>)}</ul>
      </nav>
    </div>
  );
}
