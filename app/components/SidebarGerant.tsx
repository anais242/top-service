'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Notifs { reservations: number; clients: number; }

const LIENS: { href: string; label: string; notifKey?: keyof Notifs; icone: React.ReactNode }[] = [
  {
    href: '/gerant/tableau-de-bord',
    label: 'Tableau de bord',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/gerant/vehicules',
    label: 'Parc auto',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/><path d="M19 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
        <rect x="5" y="5" width="14" height="14" rx="2"/><circle cx="8.5" cy="16.5" r="1.5"/><circle cx="15.5" cy="16.5" r="1.5"/>
        <path d="M5 9h14"/><path d="M9 5l-2 4"/><path d="M15 5l2 4"/>
      </svg>
    ),
  },
  {
    href: '/gerant/reservations',
    label: 'Réservations',
    notifKey: 'reservations',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/>
      </svg>
    ),
  },
  {
    href: '/gerant/chauffeurs',
    label: 'Chauffeurs',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    href: '/gerant/clients',
    label: 'Clients',
    notifKey: 'clients',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/gerant/business',
    label: 'Corporate',
    icone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="8" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
];

export default function SidebarGerant() {
  const pathname = usePathname();
  const [notifs, setNotifs] = useState<Notifs>({ reservations: 0, clients: 0 });

  useEffect(() => {
    function charger() {
      fetch('/api/gerant/notifications')
        .then((r) => r.json())
        .then((j) => { if (j.success) setNotifs(j.data); })
        .catch(() => {});
    }
    charger();
    const interval = setInterval(charger, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav style={{
      width: '100%',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      height: '48px',
      position: 'sticky',
      top: '60px',
      zIndex: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {LIENS.map(({ href, label, icone, notifKey }) => {
        const actif  = pathname.startsWith(href);
        const count  = notifKey ? notifs[notifKey] : 0;
        return (
          <Link key={href} href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '0 14px',
            height: '100%',
            textDecoration: 'none',
            fontWeight: actif ? 700 : 500,
            fontSize: '0.875rem',
            color: actif ? '#1B3B8A' : '#6b7280',
            borderBottom: actif ? '2px solid #1B3B8A' : '2px solid transparent',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}>
            <span style={{ flexShrink: 0, opacity: actif ? 1 : 0.7 }}>{icone}</span>
            {label}
            {count > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: '10px',
                minWidth: '16px',
                textAlign: 'center',
              }}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
