import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { suivre } from './stats';
import { P, PROMOS, type Cfg, type Ligne } from './catalogue';

/* État du panier, côté navigateur. Le panier reste dans ce navigateur (confort du visiteur) ;
   la commande, elle, est enregistrée côté serveur. */

type Panneau = null | 'panier' | 'menu' | 'recherche';
interface Boutique {
  panier: Ligne[];
  pret: boolean;
  promo: string | null;
  setPromo: (c: string | null) => void;
  ajouter: (c: Cfg, o?: { edition?: string | null; silencieux?: boolean }) => void;
  ajouterPlusieurs: (l: Cfg[]) => void;
  majQte: (cle: string, q: number) => void;
  retirer: (cle: string) => void;
  vider: () => void;
  panneau: Panneau;
  ouvrir: (p: Panneau) => void;
  fermer: () => void;
  toast: { msg: string; n: number };
  afficher: (msg: string) => void;
  annonce: string;
  annoncer: (msg: string) => void;
}
const Ctx = createContext<Boutique | null>(null);

const CLE_PANIER = 'mr3_panier';
const CLE_PROMO = 'mr3_promo';
const lire = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
};
const ecrire = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* stockage plein ou bloqué : le panier reste en mémoire */
  }
};
let n = 0;
export const uid = (p: string) => `${p}${Date.now().toString(36)}${(++n).toString(36)}`;
const copie = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const [panier, setPanier] = useState<Ligne[]>([]);
  const [promo, setPromoEtat] = useState<string | null>(null);
  const [pret, setPret] = useState(false);
  const [panneau, setPanneau] = useState<Panneau>(null);
  const [toast, setToast] = useState({ msg: '', n: 0 });
  const [annonce, setAnnonce] = useState('');

  useEffect(() => {
    const l = lire<Ligne[]>(CLE_PANIER, []);
    // L'option express n'existe plus : on la retire des paniers enregistrés avant son retrait.
    setPanier(Array.isArray(l) ? l.filter((a) => a && a.cfg && P[a.cfg.h] && a.cfg.type === P[a.cfg.h].type && a.qty > 0).map((a) => (a.cfg.type === 'config' && a.cfg.opt?.express ? { ...a, cfg: { ...a.cfg, opt: { ...a.cfg.opt, express: false } } } : a)) : []);
    const pr = lire<string | null>(CLE_PROMO, null);
    setPromoEtat(pr && PROMOS[pr] ? pr : null);
    setPret(true);
  }, []);
  useEffect(() => {
    if (pret) ecrire(CLE_PANIER, panier);
  }, [panier, pret]);
  useEffect(() => {
    if (pret) ecrire(CLE_PROMO, promo);
  }, [promo, pret]);

  const afficher = useCallback((msg: string) => setToast((t) => ({ msg, n: t.n + 1 })), []);
  const annoncer = useCallback((msg: string) => {
    setAnnonce('');
    setTimeout(() => setAnnonce(msg), 30);
  }, []);

  const ajouter = useCallback<Boutique['ajouter']>((c, o = {}) => {
    const cfg = copie(c);
    if (!o.edition) suivre('panier', cfg.h);
    setPanier((l) => {
      if (o.edition) {
        const i = l.findIndex((a) => a.cle === o.edition);
        const ligne = { cle: o.edition, cfg, qty: c.qty };
        if (i >= 0) return l.map((a, k) => (k === i ? ligne : a));
        return [...l, ligne];
      }
      if (cfg.type === 'simple') {
        const cle = JSON.stringify(cfg.sel);
        const ex = l.find((a) => a.cfg.h === cfg.h && a.cfg.type === 'simple' && JSON.stringify(a.cfg.sel) === cle && !a.promo);
        if (ex) return l.map((a) => (a === ex ? { ...a, qty: Math.min(200, a.qty + c.qty) } : a));
      }
      return [...l, { cle: uid('l'), cfg, qty: c.qty }];
    });
    if (!o.silencieux) {
      annoncer(`${P[c.h].nom} ajouté au panier`);
      setPanneau('panier');
    }
  }, [annoncer]);
  const ajouterPlusieurs = useCallback((cs: Cfg[]) => {
    cs.forEach((c) => suivre('panier', c.h));
    setPanier((l) => [...l, ...cs.map((c) => ({ cle: uid('l'), cfg: copie(c), qty: c.qty }))]);
    annoncer('Sélection ajoutée au panier');
    setPanneau('panier');
  }, [annoncer]);
  const majQte = useCallback((cle: string, q: number) => {
    setPanier((l) => (q < 1 ? l.filter((a) => a.cle !== cle) : l.map((a) => (a.cle === cle ? { ...a, qty: Math.min(200, q) } : a))));
  }, []);
  const retirer = useCallback((cle: string) => {
    setPanier((l) => l.filter((a) => a.cle !== cle));
    afficher('Article retiré du panier');
  }, [afficher]);
  const fermer = useCallback(() => setPanneau(null), []);
  const vider = useCallback(() => {
    setPanier([]);
    setPromoEtat(null);
  }, []);

  const valeur = useMemo<Boutique>(() => ({
    panier, pret, promo, setPromo: setPromoEtat, ajouter, ajouterPlusieurs, majQte, retirer, vider,
    panneau, ouvrir: setPanneau, fermer, toast, afficher, annonce, annoncer,
  }), [panier, pret, promo, ajouter, ajouterPlusieurs, majQte, retirer, vider, panneau, fermer, toast, afficher, annonce, annoncer]);
  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useBoutique() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBoutique hors BoutiqueProvider');
  return v;
}

/* Monte un panneau, puis l'anime ; le démonte après sa transition de fermeture. */
export function usePanneau(ouvert: boolean, duree = 260) {
  const [monte, setMonte] = useState(ouvert);
  const [actif, setActif] = useState(false);
  useEffect(() => {
    if (ouvert) {
      setMonte(true);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setActif(true)));
      return () => cancelAnimationFrame(r);
    }
    setActif(false);
    const t = setTimeout(() => setMonte(false), duree);
    return () => clearTimeout(t);
  }, [ouvert, duree]);
  return { monte, actif };
}

/* Piège le focus dans un panneau ouvert, ferme avec Échap, rend le focus en sortie. */
export function usePiegeFocus(ouvert: boolean, fermer: () => void) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!ouvert) return;
    const avant = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>('[data-focus-initial]') || ref.current?.querySelector<HTMLElement>('button,a,input');
      el?.focus();
    }, 60);
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
      if (e.key !== 'Tab' || !ref.current) return;
      const f = Array.from(ref.current.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', touche);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', touche);
      document.body.style.overflow = '';
      if (avant && avant.isConnected) avant.focus({ preventScroll: true });
    };
  }, [ouvert, fermer]);
  return ref;
}
