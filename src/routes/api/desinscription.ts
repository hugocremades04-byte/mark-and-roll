import { createFileRoute } from '@tanstack/react-router';
import { db } from '@/lib/serveur/commandes.server';
import { jetonValide } from '@/lib/serveur/jeton.server';

const page = (titre: string, texte: string) => new Response(
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${titre}</title></head>
<body style="margin:0;background:#F4F4F1;font-family:Arial,Helvetica,sans-serif;color:#111317"><div style="max-width:520px;margin:12vh auto;padding:28px;background:#fff;border-radius:14px">
<h1 style="font-size:22px;margin:0 0 10px">${titre}</h1><p style="line-height:1.5">${texte}</p><p><a href="/" style="color:#2B44E0">Retour à la boutique</a></p></div></body></html>`,
  { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
);

export const Route = createFileRoute('/api/desinscription')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const email = (u.searchParams.get('e') || '').toLowerCase().slice(0, 160);
        const t = (u.searchParams.get('t') || '').slice(0, 64);
        if (!email || !(await jetonValide(email, t))) return page('Lien non valide', 'Ce lien de désinscription est incomplet. Écrivez-nous pour être retiré de la liste.');
        await (await db()).prepare('UPDATE abonnes SET desinscrit = 1 WHERE email = ?').bind(email).run();
        return page('Vous êtes désinscrit', "Vous ne recevrez plus nos emails. Si c'est une erreur, réinscrivez-vous depuis le bas de n'importe quelle page du site.");
      },
    },
  },
});
