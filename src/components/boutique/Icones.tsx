import type { ReactNode, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { epais?: number };
const base = (epais: number): SVGProps<SVGSVGElement> => ({
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: epais, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});
const mk = (d: ReactNode, defaut = 2) => ({ epais, ...p }: P) => <svg {...base(epais ?? defaut)} {...p}>{d}</svg>;

export const IcoFleche = mk(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IcoChevron = mk(<path d="m6 9 6 6 6-6" />);
export const IcoDroite = mk(<path d="m9 6 6 6-6 6" />);
export const IcoMoins = mk(<path d="M5 12h14" />);
export const IcoPlus = mk(<path d="M12 5v14M5 12h14" />);
export const IcoCamion = mk(<><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>, 1.8);
export const IcoBat = mk(<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="m10 14 2 2 4-4" /></>, 1.8);
export const IcoOutil = mk(<><rect x="8" y="2" width="8" height="10" rx="2" /><path d="M9 12v5M15 12v5" /><circle cx="12" cy="18" r="3.5" /></>, 1.8);
export const IcoCadenas = mk(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>, 1.8);
export const IcoEchange = mk(<path d="M4 9h13l-3-3M20 15H7l3 3" />, 1.8);
export const IcoColis = mk(<><path d="m3 7 9-4 9 4v10l-9 4-9-4z" /><path d="m3 7 9 4 9-4M12 11v10" /></>, 1.8);
export const IcoEtoile = mk(<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />, 1.8);
export const IcoOk = mk(<path d="m5 12.5 4.5 4.5L19 7.5" />, 2.4);
export const IcoSac = mk(<><path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>, 1.6);
export const IcoPanier = mk(<><path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>);
export const IcoMenu = mk(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IcoLoupe = mk(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const IcoCroix = mk(<path d="M6 6l12 12M18 6 6 18" />);
export const IcoLarge = mk(<><rect x="3" y="9" width="18" height="9" rx="2" /><path d="M7 9V5h10v4M12 18v3" /></>, 1.8);
export const IcoCarte = mk(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>, 1.8);

export function Marque({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect x="9" y="1.5" width="14" height="16" rx="4" fill="#1C1917" />
      <rect x="8.5" y="15" width="2.6" height="9" rx="1.2" fill="#1C1917" />
      <rect x="20.9" y="15" width="2.6" height="9" rx="1.2" fill="#1C1917" />
      <circle cx="16" cy="23" r="7.5" fill="#2B44E0" />
      <circle cx="16" cy="23" r="2.2" fill="#1C1917" />
    </svg>
  );
}
