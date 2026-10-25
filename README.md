# Mark & Roll

Boutique de rouleaux tampons personnalisés. Site React (TanStack Start) publié comme Worker Cloudflare, avec une base D1 pour les commandes et un stockage R2 pour les logos clients.

## Mise en ligne sur Cloudflare (une seule fois)

1. **Compte** : créer un compte gratuit sur dash.cloudflare.com.
2. **Importer le dépôt** : Workers et Pages > Créer > Importer un dépôt > connecter GitHub > choisir `mark-and-roll`.
   - Commande de build : `npm run build`
   - Commande de déploiement : `npx wrangler deploy` (valeur par défaut)
   - Dossier racine : laisser vide
3. **Premier déploiement** : Cloudflare crée tout seul la base `mark-and-roll` et le compartiment `mark-and-roll-logos`. Les tables se créent au premier accès au site.
   - Si le journal de build signale une erreur sur D1 ou R2 : Stockage et bases de données > D1 > Créer `mark-and-roll`, puis R2 > Créer un compartiment `mark-and-roll-logos`, et relancer le déploiement.
4. **Secrets** : Workers > mark-and-roll > Paramètres > Variables et secrets > Ajouter, type « Secret » :
   - `ATELIER_CODE` : le mot de passe de l'espace atelier (`/atelier`), long et unique.
   - `STRIPE_SECRET_KEY` : clé secrète Stripe (`sk_live_...`, ou `sk_test_...` pour tester).
   - `STRIPE_WEBHOOK_SECRET` : voir l'étape 6.
5. **Nom de domaine** : ajouter le domaine dans Cloudflare (Ajouter un domaine, puis changer les serveurs DNS chez le registraire), puis Workers > mark-and-roll > Paramètres > Domaines et routes > Ajouter > Domaine personnalisé. Mettre ensuite l'adresse dans `src/site.json` (champ `url`).
6. **Webhook Stripe** : Stripe > Développeurs > Webhooks > Ajouter une destination.
   - URL : `https://<votre-domaine>/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`
   - Copier le « secret de signature » (`whsec_...`) dans le secret `STRIPE_WEBHOOK_SECRET`.

Chaque modification poussée sur GitHub republie le site automatiquement.

## Paiement

- Sans `STRIPE_SECRET_KEY`, la commande est enregistrée et le client paie après validation du BAT.
- Avec la clé, le client paie sur Stripe Checkout (carte, Apple Pay, Google Pay). La commande passe en « payée » au retour sur le site et par le webhook, même si le client ferme la page.
- Un remboursement total dans Stripe passe la commande en « remboursée ».

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
