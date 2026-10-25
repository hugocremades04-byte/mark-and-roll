/** En-têtes de sécurité ajoutés à chaque réponse du Worker (server.ts).
    Une réponse qui fixe déjà sa propre politique (les logos clients, servis en bac à sable) la garde. */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  if (!headers.has('Content-Security-Policy')) {
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https:; media-src 'self' blob: https:; " +
        "connect-src 'self' https: https://cloudflareinsights.com; " +
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
  }
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
