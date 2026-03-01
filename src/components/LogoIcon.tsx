export default function LogoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Toit */}
      <path
        d="M16 3L30 14H2L16 3Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Cheminée */}
      <rect x="21" y="6" width="3.5" height="8" rx="0.5" fill="white" fillOpacity="0.7" />

      {/* Corps de la maison */}
      <rect x="3" y="13" width="26" height="16" rx="1.5" fill="white" fillOpacity="0.85" />

      {/* Porte */}
      <rect x="13" y="20" width="6" height="9" rx="1" fill="#f97316" />

      {/* Carton — ouvert, posé devant la porte */}
      <rect x="9" y="18" width="14" height="10" rx="1" fill="#fbbf24" />
      {/* Rabat gauche du carton */}
      <path
        d="M9 18 L16 21.5"
        stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Rabat droit du carton */}
      <path
        d="M23 18 L16 21.5"
        stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Ligne de séparation du carton */}
      <line x1="9" y1="22" x2="23" y2="22" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2 1.5" />

      {/* Petite île Réunion stylisée (ovale incliné) dans le coin */}
      <ellipse
        cx="26.5" cy="7.5"
        rx="3.2" ry="2"
        transform="rotate(-20 26.5 7.5)"
        fill="white" fillOpacity="0.5"
      />
    </svg>
  );
}
