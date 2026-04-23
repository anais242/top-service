'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LIENS = [
  { href: '/gerant/tableau-de-bord', label: 'Tableau de bord', icone: '▦' },
  { href: '/gerant/vehicules',       label: 'Parc auto',       icone: '🚗' },
  { href: '/gerant/reservations',    label: 'Réservations',    icone: '📋' },
  { href: '/gerant/chauffeurs',      label: 'Chauffeurs',      icone: '👤' },
  { href: '/gerant/business',        label: 'Corporate',       icone: '🏢' },
];

export default function SidebarGerant() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      minHeight: 'calc(100vh - 60px)',
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'sticky',
      top: '60px',
      alignSelf: 'flex-start',
    }}>
      {LIENS.map(({ href, label, icone }) => {
        const actif = pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: actif ? 700 : 500,
            fontSize: '0.9rem',
            color: actif ? '#1B3B8A' : '#374151',
            background: actif ? 'rgba(27,59,138,0.08)' : 'transparent',
            transition: 'all 0.15s',
            borderLeft: actif ? '3px solid #1B3B8A' : '3px solid transparent',
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icone}</span>
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
