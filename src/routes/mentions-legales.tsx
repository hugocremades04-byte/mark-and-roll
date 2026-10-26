import { createFileRoute } from '@tanstack/react-router';
import { Ariane } from '@/components/boutique/Elements';
import site from '../site.json';
import { seo } from '@/lib/seo';

/* Mentions légales (LCEN, art. 6-III). Les informations du vendeur se règlent dans src/site.json. */

export const Route = createFileRoute('/mentions-legales')({
  head: () => seo({ titre: 'Mentions légales | Mark & Roll', description: 'Éditeur, hébergeur et contact du site Mark & Roll, tampons rouleaux personnalisés à votre logo.', chemin: '/mentions-legales' }),
  component: MentionsLegales,
});

function MentionsLegales() {
  const v = site.vendeur;
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: 'Mentions légales' }]} />
      <article className="page-texte">
        <h1>Mentions légales</h1>
        <h2>Éditeur du site et vendeur</h2>
        <p>
          Mark &amp; Roll est le nom commercial de {v.nom}, {v.statut}.<br />
          {v.siret && <>SIRET : {v.siret}<br /></>}
          {v.adresse && <>Adresse : {v.adresse}<br /></>}
          {v.telephone && <>Téléphone : {v.telephone}<br /></>}
          Email : <a href={`mailto:${site.contact}`}>{site.contact}</a><br />
          {v.tva === 'franchise' && <>TVA non applicable, article 293 B du CGI.<br /></>}
          Directeur de la publication : {v.nom}.
        </p>
        <h2>Hébergement</h2>
        <p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis. www.cloudflare.com</p>
        <h2>Paiement</h2>
        <p>Les paiements en ligne sont traités par Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Irlande. Mark &amp; Roll n'a jamais accès à vos données bancaires.</p>
        <h2>Données personnelles</h2>
        <p>Les informations saisies lors d'une commande, d'une demande de devis ou d'une inscription à la newsletter servent uniquement à traiter la demande, envoyer le BAT et livrer. Elles ne sont jamais revendues. Vous pouvez demander l'accès, la rectification ou la suppression de vos données à {site.contact}. Le site ne dépose aucun cookie publicitaire ; la mesure d'audience est anonyme et sans cookie.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, visuels et le logo Mark &amp; Roll sont protégés. Les logos et dessins transmis par les clients restent leur propriété et servent uniquement à leur commande.</p>
      </article>
    </div>
  );
}
