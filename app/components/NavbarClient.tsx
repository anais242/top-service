'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LIENS = [
  { href: '/vehicules',           label: 'Nos véhicules' },
  { href: '/client/reservations', label: 'Mes réservations' },
  { href: '/client/tableau-de-bord', label: 'Tableau de bord' },
];

export default function NavbarClient({ nom }: { nom?: string }) {
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
      {/* Overlay sombre */}
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(28,25,23,0.45)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/vehicules" className="navbar-brand">Top Service</Link>

        {/* Liens desktop */}
        <div className="navbar-links" style={{ display: 'flex', gap: '4px' }}>
          {LIENS.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: '7px 14px', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem',
              color: pathname === href ? 'var(--orange)' : 'var(--gris)',
              background: pathname === href ? 'rgba(249,115,22,0.08)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Avatar + menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOuvert((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: ouvert ? 'rgba(249,115,22,0.1)' : 'var(--gris-light)',
              border: '1.5px solid', borderColor: ouvert ? 'var(--orange)' : 'transparent',
              borderRadius: '50px', padding: '6px 16px 6px 6px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--orange), var(--vert))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}>
              {nom ? nom[0].toUpperCase() : 'C'}
            </div>
            <span className="navbar-nom" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brun)' }}>
              {nom ?? 'Client'}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: ouvert ? 'rotate(180deg)' : 'none' }}>
              <path d="M2 4l4 4 4-4" stroke="var(--gris)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown overlay */}
          {ouvert && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 200,
              background: 'white', borderRadius: '16px', width: '240px',
              boxShadow: '0 8px 40px rgba(28,25,23,0.15)',
              border: '1px solid rgba(249,115,22,0.12)',
              animation: 'slideUp 0.2s ease',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(249,115,22,0.07), rgba(22,163,74,0.05))', borderBottom: '1px solid rgba(249,115,22,0.08)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--brun)' }}>{nom ?? 'Client'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--gris)' }}>Espace client</p>
              </div>

              {/* Liens */}
              <div style={{ padding: '8px' }}>
                {LIENS.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setOuvert(false)} style={{
                    display: 'block', padding: '10px 12px', borderRadius: '10px',
                    color: pathname === href ? 'var(--orange)' : 'var(--brun)',
                    background: pathname === href ? 'rgba(249,115,22,0.07)' : 'transparent',
                    textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem',
                    transition: 'all 0.15s',
                  }}>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Déconnexion */}
              <div style={{ padding: '8px', borderTop: '1px solid var(--gris-light)' }}>
                <button onClick={deconnexion} style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#DC2626', fontWeight: 600, fontSize: '0.875rem',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Se deconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
