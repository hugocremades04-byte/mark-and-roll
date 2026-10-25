import { createFileRoute, Link } from '@tanstack/react-router';
import { Ariane } from '@/components/boutique/Elements';
import site from '@/site.json';

export const Route = createFileRoute('/cgv')({
  head: () => ({ meta: [{ title: 'Conditions générales de vente | Mark & Roll' }, { name: 'description', content: 'Conditions de vente des rouleaux tampons personnalisés Mark & Roll.' }] }),
  component: Cgv,
});

function Cgv() {
  return (
    <div className="wrap">
      <Ariane items={[{ lib: 'Accueil', to: '/' }, { lib: 'Conditions générales de vente' }]} />
      <article className="page-texte">
        <h1>Conditions générales de vente</h1>
        <p className="note">En vigueur au 24 octobre 2026.</p>
        <h2>1. Objet</h2>
        <p>Les présentes conditions encadrent les ventes conclues sur ce site entre Mark &amp; Roll ({site.vendeur.nom}, {site.vendeur.statut}{site.vendeur.siret ? `, SIRET ${site.vendeur.siret}` : ''}) et toute personne qui passe commande. Coordonnées complètes dans les <Link to="/mentions-legales">mentions légales</Link>. Passer commande vaut acceptation de ces conditions.</p>
        <h2>2. Produits personnalisés et bon à tirer</h2>
        <p>Les roues et rouleaux sont gravés à partir du texte, du logo ou du dessin fourni par le client. Avant toute gravure, un bon à tirer (BAT) est envoyé par email sous 24 h ouvrées. Le client peut demander des retouches ; la fabrication démarre uniquement après son accord écrit. Le client garantit détenir les droits sur les éléments qu'il transmet.</p>
        <h2>3. Prix et paiement</h2>
        <p>Les prix sont indiqués en euros toutes taxes comprises{site.vendeur.tva === 'franchise' ? ' (TVA non applicable, article 293 B du CGI)' : ''}, hors frais de livraison précisés avant la validation. Le paiement s'effectue en ligne via notre prestataire sécurisé Stripe (carte bancaire, Apple Pay, Google Pay et autres moyens proposés sur la page de paiement), au moment de la commande ou à réception du lien de paiement joint au BAT.</p>
        <h2>4. Livraison</h2>
        <p>Les produits personnalisés sont expédiés sous 3 jours ouvrés après validation du BAT et paiement (48 h avec l'option express) ; les articles en stock sous 24 h ouvrées. Livraison en France, Belgique et Luxembourg, en point relais ou à domicile. Un numéro de suivi est communiqué à l'expédition.</p>
        <h2>5. Droit de rétractation</h2>
        <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux biens confectionnés selon les spécifications du consommateur ou nettement personnalisés : roues, rouleaux et supports gravés. Pour les articles non personnalisés (encres, marqueurs, accessoires), le client dispose de 14 jours à compter de la réception pour se rétracter, en renvoyant l'article non ouvert ; le remboursement intervient sous 14 jours après réception du retour.</p>
        <h2>6. Garanties</h2>
        <p>Tous les produits bénéficient de la garantie légale de conformité et de la garantie des vices cachés. Une roue présentant un défaut de fabrication ou une gravure non conforme au BAT validé est refaite sans frais.</p>
        <h2>7. Données personnelles</h2>
        <p>Les informations saisies servent uniquement au traitement de la commande, à l'envoi du BAT et à la livraison. Elles ne sont jamais revendues. Le client peut demander l'accès, la rectification ou la suppression de ses données en écrivant à {site.contact}.</p>
        <h2>8. Contact et litiges</h2>
        <p>Pour toute question ou réclamation : {site.contact}. En cas de litige, une solution amiable est recherchée en priorité ; à défaut, le client peut recourir gratuitement à un médiateur de la consommation.</p>
      </article>
    </div>
  );
}
