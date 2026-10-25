import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server';
import { bindings } from '../bindings.server';

/* Accès à l'espace atelier : un code secret, vérifié par son empreinte SHA-256.
   Le code lui-même n'est jamais écrit dans le code source. Un code de remplacement
   peut être défini dans les paramètres du site (ATELIER_CODE). */

const EMPREINTE = '19d711b293aaa75ff567ef612247860429000e50410740a53a4629b81f52ed36';
const COOKIE = 'mr_atelier';

async function sha256(t: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
}
async function codeValide(code: string | undefined | null) {
  if (!code || code.length > 200) return false;
  const secours = bindings().ATELIER_CODE;
  if (secours && secours.length >= 12 && code === secours) return true;
  return (await sha256(code)) === EMPREINTE;
}
export async function estConnecte() {
  return codeValide(getCookie(COOKIE));
}
export async function connecter(code: string) {
  const ok = await codeValide(code.trim());
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return false;
  }
  setCookie(COOKIE, code.trim(), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return true;
}
export function deconnecter() {
  deleteCookie(COOKIE, { path: '/' });
}
