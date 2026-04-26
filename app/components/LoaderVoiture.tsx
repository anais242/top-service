export default function LoaderVoiture({ texte = 'Chargement...' }: { texte?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <div className="loader-voiture-wrap">
        {/* Route */}
        <div className="loader-route">
          <span /><span /><span /><span /><span />
        </div>

        {/* Voiture */}
        <div className="loader-voiture">
          <svg width="80" height="44" viewBox="0 0 80 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Carrosserie basse */}
            <rect x="4" y="24" width="72" height="14" rx="5" fill="#1B3B8A" />
            {/* Toit */}
            <path d="M20 24 L26 10 Q28 7 32 7 L50 7 Q54 7 56 10 L62 24 Z" fill="#1B3B8A" />
            {/* Vitre avant */}
            <path d="M52 24 L57 12 Q58 10 56 10 L50 10 Q48 10 47 12 L44 24 Z" fill="#DBEAFE" opacity="0.9" />
            {/* Vitre arrière */}
            <path d="M28 24 L31 12 Q32 10 34 10 L44 10 L41 24 Z" fill="#DBEAFE" opacity="0.9" />
            {/* Phare avant */}
            <rect x="68" y="26" width="6" height="5" rx="2" fill="#FEF08A" />
            {/* Phare arrière */}
            <rect x="6" y="26" width="5" height="5" rx="2" fill="#ef4444" opacity="0.8" />
            {/* Roue arrière */}
            <circle cx="22" cy="38" r="6" fill="#0D1B3E" />
            <circle cx="22" cy="38" r="3" fill="#e5e7eb" className="loader-roue" />
            <circle cx="22" cy="38" r="1" fill="#0D1B3E" />
            {/* Roue avant */}
            <circle cx="58" cy="38" r="6" fill="#0D1B3E" />
            <circle cx="58" cy="38" r="3" fill="#e5e7eb" className="loader-roue" />
            <circle cx="58" cy="38" r="1" fill="#0D1B3E" />
          </svg>
        </div>
      </div>

      {texte && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{texte}</p>
      )}

      <style>{`
        .loader-voiture-wrap {
          position: relative;
          width: 120px;
          height: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .loader-voiture {
          animation: loaderBounce 0.5s ease-in-out infinite alternate;
          position: relative;
          z-index: 1;
        }
        .loader-route {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .loader-route span {
          display: block;
          width: 14px;
          height: 3px;
          background: #d1d5db;
          border-radius: 2px;
          animation: loaderRoute 0.6s linear infinite;
        }
        .loader-route span:nth-child(1) { animation-delay: 0s; }
        .loader-route span:nth-child(2) { animation-delay: 0.12s; }
        .loader-route span:nth-child(3) { animation-delay: 0.24s; }
        .loader-route span:nth-child(4) { animation-delay: 0.36s; }
        .loader-route span:nth-child(5) { animation-delay: 0.48s; }

        @keyframes loaderBounce {
          from { transform: translateY(0px); }
          to   { transform: translateY(-4px); }
        }
        @keyframes loaderRoute {
          0%   { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-20px); }
        }
      `}</style>
    </div>
  );
}
