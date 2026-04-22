import { cookies, headers } from 'next/headers';
import Link from 'next/link';

export default function TableauDeBordChauffeur() {
  const headersList = headers();
  const nom      = headersList.get('x-user-nom')   ?? 'Chauffeur';
  const email    = headersList.get('x-user-email') ?? '';
  const initiale = nom[0]?.toUpperCase() ?? 'C';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(13,148,136,0.07) 100%)',
        borderBottom: '1px solid rgba(22,163,74,0.1)',
        padding: '40px 24px 48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--vert), #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.5rem',
            boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
          }}>
            {initiale}
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--gris)', fontWeight: 500 }}>
              Espace chauffeur · Top Service
            </p>
            <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--brun)' }}>
              Bonjour, {nom}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--gris)' }}>{email}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--vert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Vos missions
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <Link href="/chauffeur/missions" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '28px', cursor: 'pointer', borderTop: '3px solid var(--vert)', transition: 'all 0.25s' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--vert)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: 'var(--brun)' }}>Mes missions</p>
              <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.85rem', lineHeight: 1.5 }}>Consultez et gérez vos missions assignées</p>
              <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'var(--vert)', fontWeight: 600 }}>Voir mes missions →</p>
            </div>
          </Link>

          <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(22,163,74,0.05), rgba(13,148,136,0.03))' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--vert)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: 'var(--brun)' }}>Comment ça marche</p>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--gris)', fontSize: '0.85rem', lineHeight: 1.8 }}>
              <li>Le gérant vous assigne une mission</li>
              <li>Vous acceptez ou refusez</li>
              <li>Vous assurez le transport du client</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
