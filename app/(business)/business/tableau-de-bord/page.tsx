import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import { verifierAccessToken } from '@/lib/auth/jwt';
import Link from 'next/link';
import NavbarBusiness from '@/app/components/NavbarBusiness';

export default async function TableauDeBordBusiness() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'business') redirect('/connexion');

  const nom = payload.nom;
  const initiale = nom[0]?.toUpperCase() ?? 'B';

  return (
    <>
      <NavbarBusiness nom={nom} />
      <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>

        {/* Bannière */}
        <div style={{ background: 'linear-gradient(135deg, rgba(27,59,138,0.08) 0%, rgba(37,99,235,0.05) 100%)', borderBottom: '1px solid rgba(27,59,138,0.1)', padding: '40px 24px 48px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>
              {initiale}
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Espace Corporate</p>
              <h1 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: 'var(--brun)' }}>
                Bonjour, {nom}
              </h1>
            </div>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '8px' }}>

            <Link href="/business/vehicules" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '28px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Mes véhicules</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gris)', lineHeight: 1.5 }}>
                  Consultez votre flotte dédiée et effectuez vos réservations aux tarifs négociés.
                </p>
              </div>
            </Link>

            <Link href="/business/reservations" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '28px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--vert), #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>Mes réservations</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gris)', lineHeight: 1.5 }}>
                  Suivez l'état de vos demandes et l'historique de vos locations.
                </p>
              </div>
            </Link>

          </div>

          <div className="card" style={{ marginTop: '20px', padding: '20px 24px', background: 'rgba(27,59,138,0.03)', border: '1px solid rgba(27,59,138,0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gris)', lineHeight: 1.7 }}>
              Vos véhicules et tarifs ont été définis par votre gestionnaire de compte. Pour toute modification ou demande spéciale, contactez directement l'agence Top Service.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
