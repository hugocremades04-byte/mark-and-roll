import { createFileRoute } from '@tanstack/react-router';
import { COLLECTIONS, ORDRE } from '@/lib/catalogue';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().split('T')[0];
        const chemins = ['/', '/pros', '/cgv', '/mentions-legales', ...Object.keys(COLLECTIONS).map((c) => `/collections/${c}`), ...ORDRE.map((h) => `/produits/${h}`)];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...chemins.map((c) => `  <url><loc>${origin}${c}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${c === '/' ? '1.0' : c.startsWith('/produits') ? '0.8' : '0.6'}</priority></url>`),
          '</urlset>',
        ].join('\n');
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
      },
    },
  },
});
