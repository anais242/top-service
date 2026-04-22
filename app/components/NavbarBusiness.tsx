'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LIENS = [
  { href: '/business/tableau-de-bord', label: 'Tableau de bord' },
  { href: '/business/vehicules',       label: 'Mes véhicules' },
  { href: '/business/reservations',    label: 'Réservations' },
];

export default function NavbarBusiness({ nom }: { nom?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function deconnexion() {
    await fetch('/api/auth/deconnexion', { method: 'POST' });
    router.push('/connexion');
    router.refresh();
  }

  return (
    <>
      {ouvert && (
        <div onClick={() => setOuvert(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
      )}

      <nav className="navbar">
        <Link href="/business/tableau-de-bord" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="https://res.cloudinary.com/dfwyskgso/image/upload/w_80,h_80,c_fill/top-service/logo.png" alt="Top Service" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
          Top Service
        </Link>

        <div className="navbar-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {LIENS.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: '7px 14px', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem',
              color: pathname.startsWith(href) ? 'var(--orange)' : 'var(--gris)',
              background: pathname.startsWith(href) ? 'rgba(27,59,138,0.08)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1B3B8A', background: '#DBEAFE', padding: '3px 10px', borderRadius: '20px', marginLeft: '4px' }}>
            Corporate
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setOuvert((o) => !o)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: ouvert ? 'rgba(27,59,138,0.1)' : 'var(--gris-light)',
            border: '1.5px solid', borderColor: ouvert ? 'var(--orange)' : 'transparent',
            borderRadius: '50px', padding: '6px 16px 6px 6px', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {nom ? nom[0].toUpperCase() : 'B'}
            </div>
            <span className="navbar-nom" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brun)' }}>{nom ?? 'Corporate'}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: ouvert ? 'rotate(180deg)' : 'none' }}>
              <path d="M2 4l4 4 4-4" stroke="var(--gris)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {ouvert && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 200, background: 'white', borderRadius: '16px', width: '230px', boxShadow: '0 8px 40px rgba(28,25,23,0.15)', border: '1px solid rgba(27,59,138,0.12)', animation: 'slideUp 0.2s ease', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(27,59,138,0.07), rgba(37,99,235,0.04))', borderBottom: '1px solid rgba(27,59,138,0.08)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--brun)' }}>{nom ?? 'Corporate'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--gris)' }}>Espace client corporate</p>
              </div>
              <div style={{ padding: '8px' }}>
                {LIENS.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setOuvert(false)} style={{
                    display: 'block', padding: '10px 12px', borderRadius: '10px',
                    color: pathname.startsWith(href) ? 'var(--orange)' : 'var(--brun)',
                    background: pathname.startsWith(href) ? 'rgba(27,59,138,0.07)' : 'transparent',
                    textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.15s',
                  }}>
                    {label}
                  </Link>
                ))}
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid var(--gris-light)' }}>
                <button onClick={deconnexion} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left' }}>
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
