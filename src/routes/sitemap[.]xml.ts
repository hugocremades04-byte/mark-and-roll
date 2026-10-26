import { createFileRoute } from '@tanstack/react-router';
import { COLLECTIONS, ORDRE } from '@/lib/catalogue';
import { ORIGINE } from '@/lib/seo';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const origin = ORIGINE;
        // Date du dernier déploiement (Google ignore une date qui change tous les jours sans raison).
        const today = __DATE_BUILD__;
        const chemins = ['/', '/pros', '/cgv', '/mentions-legales', ...Object.keys(COLLECTIONS).map((c) => `/collections/${c}`), ...ORDRE.map((h) => `/produits/${h}`)];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...chemins.map((c) => `  <url><loc>${origin}${c}</loc><lastmod>${today}</lastmod><priority>${c === '/' ? '1.0' : c.startsWith('/produits') ? '0.8' : '0.6'}</priority></url>`),
          '</urlset>',
        ].join('\n');
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
      },
    },
  },
});
