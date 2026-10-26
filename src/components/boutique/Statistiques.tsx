import { useEffect, useState } from 'react';
import { statsAtelier } from '@/lib/api/atelier.functions';
import { P, eur } from '@/lib/catalogue';

/* Tableau de bord de l'atelier : visites, sources, ajouts au panier, commandes, chiffre d'affaires.
   Données comptées par le site lui-même (src/lib/stats.ts), sans cookie. */

type Donnees = Awaited<ReturnType<typeof statsAtelier>>;
const PERIODES: [number, string][] = [[1, "Aujourd'hui"], [7, '7 jours'], [30, '30 jours'], [90, '90 jours']];
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10} %` : '–');

export function Statistiques() {
  const [jours, setJours] = useState(7);
  const [d, setD] = useState<Donnees | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    setErr('');
    statsAtelier({ data: { jours } }).then(setD).catch(() => setErr('Statistiques indisponibles, reconnectez-vous.'));
  }, [jours]);

  const somme = (evt: string, f: (e: Donnees['evenements'][number]) => boolean = () => true) =>
    (d?.evenements || []).filter((e) => e.evt === evt && f(e)).reduce((s, e) => s + Number(e.n), 0);
  const cmds = d?.commandes || [];
  const payees = cmds.filter((c) => c.payee);
  const ca = payees.reduce((s, c) => s + c.total, 0);
  const visites = somme('visite');

  const sources = [...new Set([...(d?.evenements || []).map((e) => e.source), ...cmds.map((c) => c.source)])].map((s) => {
    const p = payees.filter((c) => c.source === s);
    return { s, v: somme('visite', (e) => e.source === s), a: somme('panier', (e) => e.source === s), c: p.length, ca: p.reduce((x, c) => x + c.total, 0) };
  }).sort((x, y) => y.v - x.v || y.ca - x.ca);

  const produits = [...new Set((d?.evenements || []).filter((e) => e.evt === 'produit' || e.evt === 'panier').map((e) => e.cle))].map((h) => ({
    h, vues: somme('produit', (e) => e.cle === h), ajouts: somme('panier', (e) => e.cle === h),
  })).sort((x, y) => y.vues - x.vues);

  const codes = [...new Set(payees.map((c) => c.promo).filter(Boolean))].map((k) => {
    const l = payees.filter((c) => c.promo === k);
    return { k: k as string, n: l.length, ca: l.reduce((x, c) => x + c.total, 0) };
  }).sort((x, y) => y.n - x.n);

  const parJour = [...new Set([...(d?.evenements || []).map((e) => e.jour), ...cmds.map((c) => c.jour)])].sort().reverse().map((j) => {
    const p = payees.filter((c) => c.jour === j);
    return { j, v: somme('visite', (e) => e.jour === j), a: somme('panier', (e) => e.jour === j), c: p.length, ca: p.reduce((x, c) => x + c.total, 0) };
  });

  const entonnoir: [string, number][] = [
    ['Visiteurs', visites], ['Fiches produit vues', somme('produit')], ['Ajouts au panier', somme('panier')],
    ['Page commande ouverte', somme('commande')], ['Commandes validées', cmds.length], ['Commandes payées', payees.length],
  ];

  return (
    <div className="pile stats">
      <div className="onglets" role="tablist" aria-label="Période">
        {PERIODES.map(([n, lib]) => <button key={n} type="button" role="tab" aria-selected={jours === n} onClick={() => setJours(n)}>{lib}</button>)}
      </div>
      {err && <p className="err">{err}</p>}
      {!d && !err && <p className="note">Chargement…</p>}
      {d && (
        <>
          <div className="stats-tuiles">
            <div className="tuile"><span>Visiteurs</span><strong>{visites}</strong></div>
            <div className="tuile"><span>Commandes payées</span><strong>{payees.length}</strong></div>
            <div className="tuile"><span>Chiffre d'affaires</span><strong>{eur(ca)}</strong></div>
            <div className="tuile"><span>Panier moyen</span><strong>{payees.length ? eur(ca / payees.length) : '–'}</strong></div>
            <div className="tuile"><span>Conversion</span><strong>{pct(payees.length, visites)}</strong></div>
            <div className="tuile"><span>Ajouts au panier</span><strong>{somme('panier')}</strong></div>
          </div>

          <h2 className="titre-resume">Parcours</h2>
          <table className="stats-table">
            <thead><tr><th>Étape</th><th className="num">Nombre</th><th className="num">Part des visiteurs</th></tr></thead>
            <tbody>{entonnoir.map(([l, n]) => <tr key={l}><td>{l}</td><td className="num">{n}</td><td className="num">{pct(n, visites)}</td></tr>)}</tbody>
          </table>

          <h2 className="titre-resume">Sources</h2>
          <table className="stats-table">
            <thead><tr><th>Source</th><th className="num">Visiteurs</th><th className="num">Ajouts</th><th className="num">Payées</th><th className="num">CA</th><th className="num">Conversion</th></tr></thead>
            <tbody>{sources.length ? sources.map((x) => <tr key={x.s}><td>{x.s}</td><td className="num">{x.v}</td><td className="num">{x.a}</td><td className="num">{x.c}</td><td className="num">{eur(x.ca)}</td><td className="num">{pct(x.c, x.v)}</td></tr>)
              : <tr><td colSpan={6} className="note">Pas encore de visite sur la période.</td></tr>}</tbody>
          </table>

          <h2 className="titre-resume">Produits</h2>
          <table className="stats-table">
            <thead><tr><th>Produit</th><th className="num">Vues</th><th className="num">Ajouts au panier</th><th className="num">Taux d'ajout</th></tr></thead>
            <tbody>{produits.length ? produits.map((x) => <tr key={x.h}><td>{P[x.h]?.nom ?? x.h}</td><td className="num">{x.vues}</td><td className="num">{x.ajouts}</td><td className="num">{pct(x.ajouts, x.vues)}</td></tr>)
              : <tr><td colSpan={4} className="note">Pas encore de vue produit sur la période.</td></tr>}</tbody>
          </table>

          {codes.length > 0 && (
            <>
              <h2 className="titre-resume">Codes promo</h2>
              <table className="stats-table">
                <thead><tr><th>Code</th><th className="num">Commandes payées</th><th className="num">CA</th></tr></thead>
                <tbody>{codes.map((x) => <tr key={x.k}><td>{x.k}</td><td className="num">{x.n}</td><td className="num">{eur(x.ca)}</td></tr>)}</tbody>
              </table>
            </>
          )}

          <h2 className="titre-resume">Par jour</h2>
          <table className="stats-table">
            <thead><tr><th>Jour</th><th className="num">Visiteurs</th><th className="num">Ajouts</th><th className="num">Payées</th><th className="num">CA</th></tr></thead>
            <tbody>{parJour.length ? parJour.map((x) => <tr key={x.j}><td>{x.j.split('-').reverse().join('/')}</td><td className="num">{x.v}</td><td className="num">{x.a}</td><td className="num">{x.c}</td><td className="num">{eur(x.ca)}</td></tr>)
              : <tr><td colSpan={5} className="note">Rien sur la période.</td></tr>}</tbody>
          </table>
          <p className="note">Comptage du site lui-même, sans cookie, depuis le 26 octobre 2026. Tes propres visites ne sont pas comptées sur les appareils connectés à l'atelier. Une visite = un onglet ouvert sur le site.</p>
        </>
      )}
    </div>
  );
}
