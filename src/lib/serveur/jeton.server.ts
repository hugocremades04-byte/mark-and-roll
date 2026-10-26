import { bindings } from '../bindings.server';

/** Jeton signé (HMAC-SHA256) pour les liens de désinscription : personne ne peut désinscrire une autre adresse. */
async function cle() {
  const b = bindings();
  const secret = b.ATELIER_CODE || b.STRIPE_SECRET_KEY || b.BREVO_API_KEY || 'mark-and-roll';
  return crypto.subtle.importKey('raw', new TextEncoder().encode(`desinscription:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
export async function jeton(email: string) {
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await cle(), new TextEncoder().encode(email.toLowerCase())));
  return Array.from(sig.slice(0, 16), (x) => x.toString(16).padStart(2, '0')).join('');
}
export async function jetonValide(email: string, t: string) {
  const attendu = await jeton(email);
  if (t.length !== attendu.length) return false;
  let d = 0;
  for (let i = 0; i < t.length; i++) d |= t.charCodeAt(i) ^ attendu.charCodeAt(i);
  return d === 0;
}
