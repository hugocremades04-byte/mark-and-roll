import { createFileRoute } from '@tanstack/react-router'
import { ORIGINE } from '@/lib/seo'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const origin = ORIGINE
        const body = [
          'User-agent: *',
          'Allow: /',
          'Disallow: /atelier',
          'Disallow: /commande',
          'Disallow: /confirmation/',
          'Disallow: /api/',
          'Disallow: /apercu/',
          'Disallow: /bat/',
          'Disallow: /devis/',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
        ].join('\n')
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
