/* Statistiques de la boutique, sans cookie et sans donnée personnelle : on compte des événements
   agrégés par jour (visite, fiche produit vue, ajout au panier, page commande) et la source de la visite.
   La source est fixée au chargement de la page par SCRIPT_SOURCE (avant que le routeur ne réécrive l'URL). */

/** Script en ligne du <head> : lit utm_source ou le site d'origine, une fois par session d'onglet. */
export const SCRIPT_SOURCE = `(function(){try{var s=sessionStorage;if(s.getItem('mr_src'))return;var q=new URLSearchParams(location.search),u=(q.get('utm_source')||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24),r='',src='direct';try{r=document.referrer?new URL(document.referrer).hostname:''}catch(e){}if(u)src=u;else if(r&&r!==location.hostname&&r.indexOf('marknroll')<0&&r.indexOf('workers.dev')<0){var m=[[/instagram/,'instagram'],[/tiktok/,'tiktok'],[/youtu/,'youtube'],[/facebook|fb\\.com/,'facebook'],[/google\\./,'google'],[/bing\\./,'bing'],[/duckduckgo/,'duckduckgo'],[/chatgpt|openai/,'chatgpt'],[/perplexity/,'perplexity'],[/etsy/,'etsy'],[/pinterest/,'pinterest'],[/linkedin|lnkd/,'linkedin'],[/^t\\.co$|twitter|x\\.com/,'x']];src='autre';for(var i=0;i<m.length;i++)if(m[i][0].test(r)){src=m[i][1];break}}s.setItem('mr_src',src);s.setItem('mr_entree',location.pathname);if(src!=='direct'){try{localStorage.setItem('mr_canal',JSON.stringify({s:src,t:Date.now()}))}catch(e){}}}catch(e){}})();`;

const lire = (k: string, local = false) => {
  try {
    return (local ? localStorage : sessionStorage).getItem(k);
  } catch {
    return null;
  }
};

/** Source de la visite en cours (instagram, tiktok, google, dm, direct…). */
export const source = () => lire('mr_src') || 'direct';

/** Source à retenir pour une commande : la visite en cours, sinon le dernier canal connu sur 30 jours. */
export function sourceCommande(): string {
  const s = source();
  if (s !== 'direct') return s;
  try {
    const c = JSON.parse(lire('mr_canal', true) || 'null') as { s: string; t: number } | null;
    if (c && Date.now() - c.t < 30 * 864e5) return c.s;
  } catch {
    /* rien */
  }
  return 'direct';
}

/** Tes propres visites (appareils connectés à l'atelier) ne sont pas comptées. */
const moi = () => lire('mr_moi', true) === '1';

export function suivre(evt: 'visite' | 'produit' | 'panier' | 'commande', cle = '', valeur = 0) {
  if (typeof window === 'undefined' || moi()) return;
  try {
    const corps = JSON.stringify({ evt, cle, valeur, source: source() });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/stats', new Blob([corps], { type: 'application/json' }));
    else void fetch('/api/stats', { method: 'POST', body: corps, keepalive: true, headers: { 'Content-Type': 'application/json' } });
  } catch {
    /* la mesure ne doit jamais gêner la navigation */
  }
}

const rubrique = (p: string) =>
  p === '/' ? 'accueil' : p.startsWith('/produits/') ? 'produit' : p.startsWith('/collections/') ? 'collection'
    : p.startsWith('/tampon-') || p.startsWith('/guide-') ? 'guide' : p.split('/')[1] || 'autre';

/** Une visite par session d'onglet, avec la rubrique de la page d'entrée. */
export function visite() {
  if (typeof window === 'undefined' || location.pathname.startsWith('/atelier')) return;
  try {
    if (sessionStorage.getItem('mr_vu')) return;
    sessionStorage.setItem('mr_vu', '1');
  } catch {
    return;
  }
  suivre('visite', rubrique(lire('mr_entree') || location.pathname));
}

/** Appelé à la connexion à l'atelier : cet appareil n'est plus compté dans les statistiques. */
export function exclureCetAppareil() {
  try {
    localStorage.setItem('mr_moi', '1');
  } catch {
    /* rien */
  }
}
