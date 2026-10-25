// Accès serveur aux ressources Cloudflare du Worker (voir wrangler.jsonc).
// `cloudflare:workers` est fourni par le moteur Workers à l'exécution, il n'est pas empaqueté.
import { env } from "cloudflare:workers";
import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

type AppEnv = {
  /** Base D1 : commandes, devis, inscrits. */
  DB?: D1Database;
  /** Stockage KV : logos envoyés par les clients (4 Mo maximum chacun). */
  LOGOS?: KVNamespace;
  /** Secrets, réglés dans Cloudflare (Workers > mark-and-roll > Paramètres > Variables et secrets). */
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  /** « 1 » : Stripe crée et envoie une facture PDF pour chaque paiement. */
  STRIPE_FACTURES?: string;
  STRIPE_PMC?: string;
  ATELIER_CODE?: string;
  /** Emails Brevo (facultatif), voir src/lib/serveur/emails.server.ts. */
  BREVO_API_KEY?: string;
  EMAIL_EXPEDITEUR?: string;
  EMAIL_ATELIER?: string;
  BREVO_LISTE_ID?: string;
};

export function bindings(): AppEnv {
  return env as unknown as AppEnv;
}
