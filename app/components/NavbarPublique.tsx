'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavbarPublique() {
  const router = useRouter();
  const [user, setUser] = useState<{ nom: string; role: string } | null>(null);
  const [verifie, setVerifie] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    fetch('/api/auth/moi')
      .then((r) => r.json())
      .then((j) => { if (j.success) setUser(j.data); })
      .finally(() => setVerifie(true));
  }, []);

  async function deconnexion() {
    await fetch('/api/auth/deconnexion', { method: 'POST' });
    setUser(null);
    setMenuOuvert(false);
    router.refresh();
  }

  const lienTableauBord = user?.role === 'gerant'   ? '/gerant/tableau-de-bord'
    : user?.role === 'chauffeur' ? '/chauffeur/tableau-de-bord'
    : user?.role === 'business'  ? '/business/tableau-de-bord'
    : '/client/tableau-de-bord';
  const initiale = user?.nom?.[0]?.toUpperCase() ?? '';

  return (
    <>
      {menuOuvert && (
        <div onClick={() => setMenuOuvert(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
      )}

      <nav className="navbar">
        <Link href="/vehicules" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://res.cloudinary.com/dfwyskgso/image/upload/w_80,h_80,c_fill/top-service/logo.png" alt="Top Service" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
          Top Service
        </Link>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!verifie ? (
            <div style={{ width: '80px', height: '36px', borderRadius: '50px', background: 'var(--gris-light)' }} />
          ) : user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOuvert((o) => !o)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: menuOuvert ? 'rgba(249,115,22,0.1)' : 'var(--gris-light)',
                border: '1.5px solid', borderColor: menuOuvert ? 'var(--orange)' : 'transparent',
                borderRadius: '50px', padding: '6px 16px 6px 6px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--vert))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {initiale}
                </div>
                <span className="navbar-nom" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brun)' }}>{user.nom}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: menuOuvert ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4" stroke="var(--gris)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuOuvert && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 200, background: 'white', borderRadius: '16px', width: '220px', boxShadow: '0 8px 40px rgba(28,25,23,0.15)', border: '1px solid rgba(249,115,22,0.12)', animation: 'slideUp 0.2s ease', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(249,115,22,0.07), rgba(22,163,74,0.05))', borderBottom: '1px solid rgba(249,115,22,0.08)' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{user.nom}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--gris)' }}>{user.role === 'gerant' ? 'Gérant' : user.role === 'chauffeur' ? 'Chauffeur' : 'Client'}</p>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <Link href={lienTableauBord} onClick={() => setMenuOuvert(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: '10px', color: 'var(--brun)', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>
                      Tableau de bord
                    </Link>
                    {user.role === 'client' && (
                      <Link href="/client/reservations" onClick={() => setMenuOuvert(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: '10px', color: 'var(--brun)', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>
                        Mes réservations
                      </Link>
                    )}
                  </div>
                  <div style={{ padding: '8px', borderTop: '1px solid var(--gris-light)' }}>
                    <button onClick={deconnexion} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left' }}>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/connexion" className="btn-ghost btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                Connexion
              </Link>
              <Link href="/inscription" className="btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
