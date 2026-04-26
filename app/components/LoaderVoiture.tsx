export default function LoaderVoiture({ texte = 'Chargement...' }: { texte?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px' }}>
      <div className="loader-scene">

        {/* Route */}
        <div className="loader-route">
          <span /><span /><span /><span /><span /><span /><span />
        </div>

        {/* Mur */}
        <div className="loader-mur">
          <svg width="18" height="52" viewBox="0 0 18 52" fill="none">
            {/* rangée 1 */}
            <rect x="0" y="0"  width="8"  height="12" rx="1" fill="#78716C"/>
            <rect x="9" y="0"  width="9"  height="12" rx="1" fill="#78716C"/>
            {/* rangée 2 */}
            <rect x="0" y="13" width="5"  height="12" rx="1" fill="#6B6560"/>
            <rect x="6" y="13" width="8"  height="12" rx="1" fill="#6B6560"/>
            <rect x="15" y="13" width="3" height="12" rx="1" fill="#6B6560"/>
            {/* rangée 3 */}
            <rect x="0" y="26" width="8"  height="12" rx="1" fill="#78716C"/>
            <rect x="9" y="26" width="9"  height="12" rx="1" fill="#78716C"/>
            {/* rangée 4 */}
            <rect x="0" y="39" width="5"  height="13" rx="1" fill="#6B6560"/>
            <rect x="6" y="39" width="8"  height="13" rx="1" fill="#6B6560"/>
            <rect x="15" y="39" width="3" height="13" rx="1" fill="#6B6560"/>
          </svg>
        </div>

        {/* Étincelles d'impact */}
        <div className="loader-sparks">
          <span className="spark sp1" />
          <span className="spark sp2" />
          <span className="spark sp3" />
          <span className="spark sp4" />
          <span className="spark sp5" />
          <span className="spark sp6" />
        </div>

        {/* Voiture */}
        <div className="loader-voiture">
          <svg width="80" height="44" viewBox="0 0 80 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="24" width="72" height="14" rx="5" fill="#1B3B8A" />
            <path d="M20 24 L26 10 Q28 7 32 7 L50 7 Q54 7 56 10 L62 24 Z" fill="#1B3B8A" />
            <path d="M52 24 L57 12 Q58 10 56 10 L50 10 Q48 10 47 12 L44 24 Z" fill="#DBEAFE" opacity="0.9" />
            <path d="M28 24 L31 12 Q32 10 34 10 L44 10 L41 24 Z" fill="#DBEAFE" opacity="0.9" />
            <rect x="68" y="26" width="6" height="5" rx="2" fill="#FEF08A" />
            <rect x="6"  y="26" width="5" height="5" rx="2" fill="#ef4444" opacity="0.8" />
            <circle cx="22" cy="38" r="6" fill="#0D1B3E" />
            <circle cx="22" cy="38" r="3" fill="#e5e7eb" />
            <circle cx="22" cy="38" r="1" fill="#0D1B3E" />
            <circle cx="58" cy="38" r="6" fill="#0D1B3E" />
            <circle cx="58" cy="38" r="3" fill="#e5e7eb" />
            <circle cx="58" cy="38" r="1" fill="#0D1B3E" />
          </svg>
        </div>
      </div>

      {texte && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{texte}</p>
      )}

      <style>{`
        .loader-scene {
          position: relative;
          width: 220px;
          height: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          overflow: hidden;
        }

        /* ── Route ── */
        .loader-route {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          gap: 10px;
          padding: 0 4px;
          align-items: center;
        }
        .loader-route span {
          display: block;
          width: 18px;
          height: 3px;
          background: #d1d5db;
          border-radius: 2px;
          flex-shrink: 0;
          animation: loaderRoute 0.5s linear infinite;
        }
        .loader-route span:nth-child(1) { animation-delay: 0s; }
        .loader-route span:nth-child(2) { animation-delay: 0.07s; }
        .loader-route span:nth-child(3) { animation-delay: 0.14s; }
        .loader-route span:nth-child(4) { animation-delay: 0.21s; }
        .loader-route span:nth-child(5) { animation-delay: 0.28s; }
        .loader-route span:nth-child(6) { animation-delay: 0.35s; }
        .loader-route span:nth-child(7) { animation-delay: 0.42s; }
        @keyframes loaderRoute {
          0%   { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(-28px); }
        }

        /* ── Mur ── */
        .loader-mur {
          position: absolute;
          right: 4px;
          bottom: 4px;
          animation: murShake 2.4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes murShake {
          0%, 57%, 100% { transform: translateX(0) rotate(0deg); }
          60%            { transform: translateX(5px) rotate(1.5deg); }
          62%            { transform: translateX(-4px) rotate(-1deg); }
          64%            { transform: translateX(3px) rotate(0.5deg); }
          66%            { transform: translateX(0) rotate(0deg); }
        }

        /* ── Voiture ── */
        .loader-voiture {
          position: absolute;
          bottom: 4px;
          left: 0;
          animation: carCrash 2.4s ease-in-out infinite;
          transform-origin: right center;
        }
        @keyframes carCrash {
          0%   { transform: translateX(-90px) scaleX(1);   opacity: 1; }
          50%  { transform: translateX(80px)  scaleX(1);   opacity: 1; }
          58%  { transform: translateX(116px) scaleX(0.6); opacity: 1; } /* impact */
          63%  { transform: translateX(104px) scaleX(1.2); opacity: 1; } /* rebond */
          68%  { transform: translateX(110px) scaleX(1);   opacity: 1; } /* repos */
          82%  { transform: translateX(110px) scaleX(1);   opacity: 1; }
          83%  { transform: translateX(-90px) scaleX(1);   opacity: 0; } /* téléport */
          84%  { transform: translateX(-90px) scaleX(1);   opacity: 1; }
          100% { transform: translateX(-20px) scaleX(1);   opacity: 1; }
        }

        /* ── Étincelles ── */
        .loader-sparks {
          position: absolute;
          right: 22px;
          bottom: 20px;
          pointer-events: none;
        }
        .spark {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FCD34D;
        }
        .sp1 { animation: spark1 2.4s ease-out infinite; }
        .sp2 { animation: spark2 2.4s ease-out infinite; }
        .sp3 { animation: spark3 2.4s ease-out infinite; }
        .sp4 { animation: spark4 2.4s ease-out infinite; }
        .sp5 { animation: spark5 2.4s ease-out infinite; }
        .sp6 { animation: spark6 2.4s ease-out infinite; background: #F87171; }

        @keyframes spark1 {
          0%,57%  { opacity:0; transform: translate(0,0) scale(0); }
          59%     { opacity:1; transform: translate(-8px,-12px) scale(1); }
          70%     { opacity:0; transform: translate(-14px,-20px) scale(0.5); }
          100%    { opacity:0; }
        }
        @keyframes spark2 {
          0%,57%  { opacity:0; transform: translate(0,0) scale(0); }
          59%     { opacity:1; transform: translate(-16px,-6px) scale(1.2); }
          70%     { opacity:0; transform: translate(-26px,-8px) scale(0.4); }
          100%    { opacity:0; }
        }
        @keyframes spark3 {
          0%,57%  { opacity:0; transform: translate(0,0) scale(0); }
          59%     { opacity:1; transform: translate(-6px,6px) scale(0.9); }
          70%     { opacity:0; transform: translate(-10px,14px) scale(0.3); }
          100%    { opacity:0; }
        }
        @keyframes spark4 {
          0%,57%  { opacity:0; transform: translate(0,0) scale(0); }
          60%     { opacity:1; transform: translate(-20px,-14px) scale(1); }
          72%     { opacity:0; transform: translate(-32px,-22px) scale(0.3); }
          100%    { opacity:0; }
        }
        @keyframes spark5 {
          0%,57%  { opacity:0; transform: translate(0,0) scale(0); }
          60%     { opacity:1; transform: translate(-12px,10px) scale(0.8); }
          72%     { opacity:0; transform: translate(-18px,18px) scale(0.2); }
          100%    { opacity:0; }
        }
        @keyframes spark6 {
          0%,58%  { opacity:0; transform: translate(0,0) scale(0); }
          61%     { opacity:1; transform: translate(-22px,-4px) scale(1.3); }
          73%     { opacity:0; transform: translate(-34px,-6px) scale(0.2); }
          100%    { opacity:0; }
        }
      `}</style>
    </div>
  );
}
