# Mark & Roll

Boutique de rouleaux tampons personnalisés. Site React (TanStack Start) publié comme Worker Cloudflare, avec une base D1 pour les commandes et un espace KV pour les logos clients. Tout tient dans l'offre gratuite de Cloudflare.

## Mise en ligne sur Cloudflare (une seule fois)

1. **Compte** : créer un compte gratuit sur dash.cloudflare.com.
2. **Importer le dépôt** : Workers et Pages > Créer > Importer un dépôt > connecter GitHub > choisir `mark-and-roll`.
   - Commande de build : laisser vide (Wrangler construit le site lui-même, voir `wrangler.jsonc`)
   - Commande de déploiement : `npx wrangler deploy` (valeur par défaut)
   - Dossier racine : laisser vide
3. **Premier déploiement** : Cloudflare crée tout seul la base `mark-and-roll` (D1) et l'espace des logos (KV). Les tables se créent au premier accès au site.
4. **Secrets** : Workers > mark-and-roll > Paramètres > Variables et secrets > Ajouter, type « Secret » :
   - `ATELIER_CODE` : le mot de passe de l'espace atelier (`/atelier`), long et unique.
   - `STRIPE_SECRET_KEY` : clé secrète Stripe (`sk_live_...`, ou `sk_test_...` pour tester).
   - `STRIPE_WEBHOOK_SECRET` : voir l'étape 6.
5. **Nom de domaine** : ajouter le domaine dans Cloudflare (Ajouter un domaine, puis changer les serveurs DNS chez le registraire), puis Workers > mark-and-roll > Paramètres > Domaines et routes > Ajouter > Domaine personnalisé. Mettre ensuite l'adresse dans `src/site.json` (champ `url`).
6. **Webhook Stripe** : Stripe > Développeurs > Webhooks > Ajouter une destination.
   - URL : `https://<votre-domaine>/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created`
   - Copier le « secret de signature » (`whsec_...`) dans le secret `STRIPE_WEBHOOK_SECRET`.
7. **Emails (Brevo, facultatif)** : secret `BREVO_API_KEY`, variables `EMAIL_EXPEDITEUR` (adresse validée dans Brevo), `EMAIL_ATELIER` (reçoit les alertes) et `BREVO_LISTE_ID` (liste newsletter).

Chaque modification poussée sur GitHub republie le site automatiquement.

## Paiement (Stripe)

- **Clé** : créer une clé restreinte (Développeurs > Clés API > Créer une clé restreinte) avec seulement « Checkout Sessions : écriture », puis la ranger dans le secret `STRIPE_SECRET_KEY`. Une clé restreinte limite les dégâts en cas de fuite ; ne jamais mettre de clé dans le code.
- **Tester d'abord** : utiliser une sandbox Stripe et ses clés de test, carte `4242 4242 4242 4242`.
- **Sans clé**, la commande est enregistrée et le client paie après validation du BAT.
- **Avec la clé**, le client paie sur Stripe Checkout. Les moyens de paiement (carte, Apple Pay, Google Pay, etc.) se règlent dans le tableau de bord Stripe, sans toucher au code. Chaque article apparaît sur le reçu, la livraison en ligne séparée, le total est recalculé par le serveur.
- **Statuts** : la commande passe « payée » au retour et par le webhook, repasse « à régler » si le paiement échoue ou expire, « remboursée » après un remboursement total. Un litige envoie une alerte email.
- **Factures** : variable `STRIPE_FACTURES` = `1` pour que Stripe génère et envoie une facture PDF à chaque paiement (option facturée par Stripe).
- **TVA (Stripe Tax)** : non activée. Les prix sont TTC. À activer seulement après avoir enregistré l'immatriculation TVA dans Stripe (Tax > Lieux) ; sinon Stripe ne collecte rien. En franchise de TVA (micro-entreprise), ne pas l'activer.

## Travailler en local

```bash
npm install
cp .dev.vars.example .dev.vars   # secrets de test, jamais publiés
npm run dev                      # build puis wrangler dev sur http://localhost:8787
npm run typecheck
```

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Produits, prix, options, FAQ | `src/lib/catalogue.ts` |
| Accueil | `src/routes/index.tsx` |
| Fiche produit et configurateur | `src/routes/produits.$handle.tsx` |
| Pages rayons | `src/routes/collections.$cle.tsx` |
| En-tête, menu, pied de page | `src/components/boutique/Cadre.tsx` |
| Styles | `src/site.css` |
| Titre, description, image de partage, adresse du site | `src/site.json` |
| Conditions générales de vente | `src/routes/cgv.tsx` |
| Modèles 3D à imprimer et notices | `fabrication/` |

Les prix sont toujours recalculés côté serveur : le total envoyé par le navigateur n'est jamais utilisé.
