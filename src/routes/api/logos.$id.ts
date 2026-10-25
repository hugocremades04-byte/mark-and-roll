import { createFileRoute } from '@tanstack/react-router';
import { bindings } from '@/lib/bindings.server';

const ID = /^[a-f0-9-]{36}\.(png|jpg|svg)$/;

export const Route = createFileRoute('/api/logos/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { STORAGE } = bindings();
        if (!STORAGE || !ID.test(params.id)) return new Response('Introuvable', { status: 404 });
        const o = await STORAGE.get(`logos/${params.id}`);
        if (!o) return new Response('Introuvable', { status: 404 });
        return new Response(o.body as unknown as ReadableStream, {
          headers: {
            'Content-Type': o.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
            // Un SVG ouvert directement ne peut exécuter aucun script.
            'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
            'X-Content-Type-Options': 'nosniff',
          },
        });
      },
    },
  },
});
