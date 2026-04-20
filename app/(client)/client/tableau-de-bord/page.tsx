import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/auth/cookies';
import Link from 'next/link';

async function deconnexion() {
  'use server';
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_ACCESS);
  cookieStore.delete(COOKIE_REFRESH);
  redirect('/connexion');
}

export default function TableauDeBordClient() {
  const headersList = headers();
  const nom   = headersList.get('x-user-nom')   ?? 'Client';
  const email = headersList.get('x-user-email') ?? '';

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
          Bonjour, {nom}
        </h1>
        <p style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>{email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Link href="/vehicules" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '28px', cursor: 'pointer', borderLeft: '4px solid var(--orange)' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem' }}>Catalogue vehicules</p>
            <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>Parcourir les vehicules disponibles et reserver</p>
          </div>
        </Link>
        <Link href="/client/reservations" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '28px', cursor: 'pointer', borderLeft: '4px solid var(--vert)' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem' }}>Mes reservations</p>
            <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>Suivre l'etat de vos demandes en cours</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
