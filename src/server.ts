import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders } from "./lib/security-headers.server";
import site from "./site.json";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/* Adresse unique : www.marknroll.com et l'ancienne adresse workers.dev renvoient vers marknroll.com.
   Les routes /api/ (webhooks Stripe, logos) et les requêtes autres que GET restent servies telles quelles. */
const CANON = new URL(site.url);
function redirectionCanonique(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const u = new URL(request.url);
  if (u.hostname === CANON.hostname || u.pathname.startsWith("/api/")) return null;
  if (u.hostname === `www.${CANON.hostname}` || u.hostname.endsWith(".workers.dev")) {
    return new Response(null, { status: 301, headers: { Location: `${CANON.origin}${u.pathname}${u.search}` } });
  }
  return null;
}

export default {
  /* Tâches du matin (relances newsletter, demande de photo) : déclencheur « triggers.crons » de wrangler.jsonc. */
  async scheduled(_evt: unknown, _env: unknown, ctx: { waitUntil: (p: Promise<unknown>) => void }) {
    ctx.waitUntil(
      import("./lib/serveur/taches.server")
        .then((m) => m.tachesQuotidiennes())
        .then((r) => console.log("Tâches quotidiennes", JSON.stringify(r)))
        .catch((e) => console.error("Tâches quotidiennes", e)),
    );
  },
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const redirection = redirectionCanonique(request);
    if (redirection) return redirection;
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
