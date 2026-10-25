// Accès serveur aux ressources Cloudflare du Worker (voir wrangler.jsonc).
// `cloudflare:workers` est fourni par le moteur Workers à l'exécution, il n'est pas empaqueté.
import { env } from "cloudflare:workers";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

type AppEnv = {
  /** Base D1 : commandes, devis, inscrits. */
  DB?: D1Database;
  /** Stockage R2 : logos envoyés par les clients. */
  STORAGE?: R2Bucket;
  /** Secrets, réglés dans Cloudflare (Workers > mark-and-roll > Paramètres > Variables et secrets). */
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  ATELIER_CODE?: string;
};

export function bindings(): AppEnv {
  return env as unknown as AppEnv;
}
