import { createFileRoute } from '@tanstack/react-router';
import { bindings } from '@/lib/bindings.server';

/* Réception d'un fichier de logo (SVG, PNG ou JPG, 4 Mo maximum), stocké pour l'atelier. */

const MAX = 4 * 1024 * 1024;
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

function typeDe(b: Uint8Array): { ext: 'png' | 'jpg' | 'svg'; mime: string } | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', mime: 'image/png' };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  const debut = new TextDecoder().decode(b.slice(0, 2048)).toLowerCase();
  if (debut.includes('<svg')) return { ext: 'svg', mime: 'image/svg+xml' };
  return null;
}

export const Route = createFileRoute('/api/logos')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { STORAGE } = bindings();
        if (!STORAGE) return json({ erreur: 'Le stockage des fichiers n\'est pas encore disponible.' }, 503);
        const taille = Number(request.headers.get('content-length') || 0);
        if (taille > MAX) return json({ erreur: 'Fichier trop lourd : 4 Mo maximum.' }, 413);
        const buf = new Uint8Array(await request.arrayBuffer());
        if (!buf.length) return json({ erreur: 'Fichier vide.' }, 400);
        if (buf.length > MAX) return json({ erreur: 'Fichier trop lourd : 4 Mo maximum.' }, 413);
        const t = typeDe(buf);
        if (!t) return json({ erreur: 'Format non reconnu. Envoyez un SVG, PNG ou JPG.' }, 415);
        const id = crypto.randomUUID();
        await STORAGE.put(`logos/${id}.${t.ext}`, buf, { httpMetadata: { contentType: t.mime } });
        return json({ url: `/api/logos/${id}.${t.ext}` });
      },
    },
  },
});
