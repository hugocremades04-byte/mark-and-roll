import { useEffect, useId, useState } from 'react';
import { POLICES, TAILLES, encre, estLarge, police, un, type Roue, type Taille } from '@/lib/catalogue';

/* Aperçu de l'empreinte, à l'échelle : même logique de répétition que le générateur de roues. */

type Mesure = (texte: string, css: string) => number;
const estime: Mesure = (t) => (t || ' ').length * 6.5;
let toile: HTMLCanvasElement | null = null;
const mesureToile: Mesure = (t, css) => {
  try {
    toile ||= document.createElement('canvas');
    const ctx = toile.getContext('2d');
    if (!ctx) return estime(t, css);
    ctx.font = `11px ${css}`;
    return ctx.measureText(t || ' ').width || estime(t, css);
  } catch {
    return estime(t, css);
  }
};

export function useMesure(): Mesure {
  const [m, setM] = useState<{ f: Mesure }>({ f: estime });
  useEffect(() => {
    let vivant = true;
    setM({ f: mesureToile });
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.load) {
      Promise.all(POLICES.map((p) => fonts.load(`11px ${p.css.split(',')[0]}`).catch(() => null))).then(() => {
        if (vivant) setM({ f: (a, b) => mesureToile(a, b) });
      });
    }
    return () => { vivant = false; };
  }, []);
  return m.f;
}

export interface Ajustement { reps: number; seg: number; fs: number; w: number; h: number; lettres: number }
export function ajuste(r: Roue, t: Taille, mesure: Mesure): Ajustement {
  const T = TAILLES[t];
  if (r.mode === 'logo') {
    const h = T.motif, w = h * (r.ratio || 3);
    const reps = Math.max(1, Math.round(T.tour / (w + 10)));
    const seg = T.tour / reps, e = Math.max(0.05, Math.min(1, (seg - 10) / w));
    return { reps, seg, fs: 0, w: w * e, h: h * e, lettres: h * e };
  }
  const pol = police(r.police);
  const F = estLarge(t) ? T.motif : 11;
  const w0 = (mesure(r.texte.trim() ? r.texte : 'VOTRE MARQUE', pol.css) * pol.cond * F) / 11;
  const reps = Math.max(1, Math.round(T.tour / (w0 + 10)));
  const seg = T.tour / reps, e = Math.max(0.05, Math.min(1, (seg - 10) / Math.max(w0, 1)));
  return { reps, seg, fs: F * e, w: 0, h: 0, lettres: F * e * 0.72 };
}

export function infoApercu(r: Roue, fit: Ajustement): { alerte: boolean; texte: string } {
  if (fit.lettres < 4.5) return { alerte: true, texte: `Lettres de ${un(fit.lettres)} mm : raccourcissez ou passez à une roue plus grande.` };
  if (r.mode === 'texte') return { alerte: false, texte: `Lettres de ${un(fit.lettres)} mm, ${fit.reps} répétition${fit.reps > 1 ? 's' : ''} par tour` };
  return { alerte: false, texte: `Motif de ${un(fit.h)} mm de haut, ${fit.reps} par tour` };
}

function Sep({ id, x, y, k }: { id: string; x: number; y: number; k: number }) {
  if (id === 'etoile') {
    const p: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = ((-90 + i * 36) * Math.PI) / 180, r = (i % 2 ? 1.4 : 3.4) * k;
      p.push(`${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`);
    }
    return <polygon points={p.join(' ')} />;
  }
  if (id === 'point') return <circle cx={x.toFixed(2)} cy={y} r={1.6 * k} />;
  if (id === 'coeur') return <path transform={`translate(${x.toFixed(2)} ${y + 0.2}) scale(${k})`} d="M0 2.7C-3.6 .2-3.7-2.7-1.85-3C-.9-3.15-.2-2.5 0-1.85C.2-2.5.9-3.15 1.85-3C3.7-2.7 3.6.2 0 2.7Z" />;
  return null;
}

export function Apercu({ roue: r, taille: t, mesure }: { roue: Roue; taille: Taille; mesure: Mesure }) {
  const T = TAILLES[t], fit = ajuste(r, t, mesure);
  const brut = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `ap${brut}`;
  const W = Math.max(150, T.tour + 24), H = Math.max(40, T.bande + 20), y = Math.round((H - 6) / 2) + 3, x0 = 8;
  const k = estLarge(t) ? (T.motif / 11) * 0.6 : 1;
  const hex = encre(r.usage, r.encre).hex;
  const [R, G, B] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const fond = r.usage === 'textile' ? '#D9CDB0' : '#C49A6B';
  const pol = police(r.police);
  const motifs = [];
  for (let n = 0; x0 + n * fit.seg < W + 4; n++) {
    const xs = x0 + n * fit.seg, xc = xs + fit.seg / 2;
    motifs.push(<Sep key={`s${n}`} id={r.sep} x={xs} y={y} k={k} />);
    if (r.mode === 'logo') {
      motifs.push(r.logo
        ? <image key={`l${n}`} href={r.logo} x={(xc - fit.w / 2).toFixed(2)} y={(y - fit.h / 2).toFixed(2)} width={fit.w.toFixed(2)} height={fit.h.toFixed(2)} preserveAspectRatio="xMidYMid meet" filter={`url(#${id}-m)`} />
        : <text key={`l${n}`} x={xc.toFixed(2)} y={y} textAnchor="middle" dominantBaseline="central" fontSize={4.6 * k} style={{ fontFamily: 'var(--f-body)', fontWeight: 800 }}>VOTRE LOGO</text>);
    } else {
      motifs.push(<text key={`t${n}`} transform={`translate(${xc.toFixed(2)} ${y}) scale(${pol.cond} 1)`} textAnchor="middle" dominantBaseline="central" fontSize={fit.fs.toFixed(2)} style={{ fontFamily: pol.css }} opacity={r.texte.trim() ? 1 : 0.4}>{r.texte.trim() ? r.texte : 'VOTRE MARQUE'}</text>);
    }
  }
  const graduations = [];
  for (let mm = 0; x0 + mm <= W; mm += 10) graduations.push(<line key={mm} x1={x0 + mm} y1={H - 4} x2={x0 + mm} y2={H - (mm % 50 ? 5.2 : 6.6)} stroke="rgba(0,0,0,.3)" strokeWidth={0.3} />);
  const fin = x0 + T.tour;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Aperçu de l'empreinte sur ${r.usage === 'textile' ? 'tissu' : 'carton'}`}>
      <defs>
        <filter id={`${id}-t`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={r.usage === 'textile' ? '1.6' : '.9 .07'} numOctaves={3} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 .3 0 0 0 0 .2 0 0 0 0 .1 1.5 0 0 0 -.6" />
        </filter>
        <filter id={`${id}-g`} x="-2%" y="-20%" width="104%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale=".45" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.6 2.15" result="k" />
          <feComposite in="d" in2="k" operator="in" />
        </filter>
        <filter id={`${id}-m`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`0 0 0 0 ${R.toFixed(3)} 0 0 0 0 ${G.toFixed(3)} 0 0 0 0 ${B.toFixed(3)} -.2126 -.7152 -.0722 1 0`} />
          <feComponentTransfer><feFuncA type="linear" slope="2.2" intercept="-.6" /></feComponentTransfer>
        </filter>
      </defs>
      <rect width={W} height={H} fill={fond} />
      <rect width={W} height={H} fill="#000" filter={`url(#${id}-t)`} />
      <g fill={hex} filter={`url(#${id}-g)`} style={{ mixBlendMode: r.encre === 'blanc' ? 'normal' : 'multiply' }} opacity={0.95}>{motifs}</g>
      <line x1={0} y1={H - 4} x2={W} y2={H - 4} stroke="rgba(0,0,0,.28)" strokeWidth={0.3} />
      {graduations}
      {fin <= W && <path d={`M${x0} ${H - 1.4}V${H - 0.4}H${fin}V${H - 1.4}`} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth={0.35} />}
    </svg>
  );
}
