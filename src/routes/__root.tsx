import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeadContent, Link, Outlet, Scripts, createRootRouteWithContext, useRouter } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';

import siteCss from '../site.css?url';
import site from '../site.json';
import { BoutiqueProvider, useBoutique } from '@/lib/boutique';
import { Bandeau, Entete, Panneaux, Pied, Toast } from '@/components/boutique/Cadre';


/* Métadonnées du site : à compléter dans src/site.json (l'adresse définitive sert aux images de partage). */
type Site = { url: string; titre: string; description: string; image: string; analytics?: string };
const SITE = site as Site;
const absolu = (chemin: string) => (SITE.url ? new URL(chemin, SITE.url).toString() : chemin);

function buildHead() {
  const title = SITE.titre;
  const description = SITE.description;
  const ogImage = absolu(SITE.image);
  return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#F4F4F1' },
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:site_name', content: 'Mark & Roll' },
      { name: 'twitter:card', content: ogImage ? 'summary_large_image' : 'summary' },
      ...(ogImage ? [{ property: 'og:image', content: ogImage }, { name: 'twitter:image', content: ogImage }] : []),
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Anton&family=Archivo+Black&family=DM+Serif+Display&family=Caveat+Brush&display=swap' },
      { rel: 'preload', href: '/fonts/cabinet-grotesk-800.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' as const },
      { rel: 'stylesheet', href: siteCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  };
}

function Introuvable() {
  return (
    <div className="wrap confirmation" style={{ textAlign: 'left' }}>
      <h1>Page introuvable</h1>
      <p style={{ color: 'var(--ink-2)' }}>Le lien est peut-être ancien, ou le produit a changé de nom.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-primaire" to="/collections/$cle" params={{ cle: 'boutique' }}>Voir la boutique</Link>
        <Link className="btn btn-contour" to="/">Accueil</Link>
      </div>
    </div>
  );
}

function Erreur({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="wrap confirmation">
      <h1>Cette page n'a pas pu s'afficher</h1>
      <p style={{ color: 'var(--ink-2)' }}>Un incident de notre côté. Réessayez, votre panier est conservé.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primaire" onClick={() => { router.invalidate(); reset(); }}>Réessayer</button>
        <a className="btn btn-contour" href="/">Accueil</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: Introuvable,
  errorComponent: Erreur,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        {SITE.analytics && (
          // Mesure d'audience Cloudflare : sans cookie, ne suit pas les visiteurs individuellement.
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: SITE.analytics })} />
        )}
      </body>
    </html>
  );
}

function Annonce() {
  const { annonce } = useBoutique();
  return <p className="sr" aria-live="polite">{annonce}</p>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();


  return (
    <QueryClientProvider client={queryClient}>
      <BoutiqueProvider>
        <a className="saut" href="#contenu">Aller au contenu</a>
        <Bandeau />
        <Entete />
        <Annonce />
        <main id="contenu" tabIndex={-1}>
          <Outlet />
        </main>
        <Pied />
        <Panneaux />
        <Toast />
      </BoutiqueProvider>
    </QueryClientProvider>
  );
}
