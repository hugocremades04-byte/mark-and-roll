import { createFileRoute } from '@tanstack/react-router';
import { etatStripe } from '@/lib/serveur/stripe.server';

/* Diagnostic privé de la connexion Stripe : type de clé et réponses de Stripe, jamais la clé.
   Accessible uniquement avec le jeton dont l'empreinte SHA-256 figure ci-dessous. */

const EMPREINTE = '9f4fbce10edace02641f2a03e4df9cec2fb2806a124dd86be3980b3d1149a325';

async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
}

export const Route = createFileRoute('/api/stripe/etat')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const t = new URL(request.url).searchParams.get('t') || '';
        if (t.length > 100 || (await sha256(t)) !== EMPREINTE) return new Response('Introuvable', { status: 404 });
        return Response.json(await etatStripe(), { headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});
