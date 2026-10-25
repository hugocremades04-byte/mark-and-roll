import { createFileRoute } from '@tanstack/react-router';
import { bindings } from '@/lib/bindings.server';

const ID = /^[a-f0-9-]{36}\.(png|jpg|svg)$/;

export const Route = createFileRoute('/api/logos/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { LOGOS } = bindings();
        if (!LOGOS || !ID.test(params.id)) return new Response('Introuvable', { status: 404 });
        const o = await LOGOS.getWithMetadata<{ contentType?: string }>(`logos/${params.id}`, 'arrayBuffer');
        if (!o.value) return new Response('Introuvable', { status: 404 });
        return new Response(o.value, {
          headers: {
            'Content-Type': o.metadata?.contentType || 'application/octet-stream',
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
