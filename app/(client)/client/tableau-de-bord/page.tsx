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
  const initiale = nom[0]?.toUpperCase() ?? 'C';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>

      {/* Hero bannière */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(22,163,74,0.07) 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.1)',
        padding: '40px 24px 48px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--orange), var(--vert))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.5rem',
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
          }}>
            {initiale}
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--gris)', fontWeight: 500 }}>
              Bienvenue sur Top Service
            </p>
            <h1 style={{
              margin: 0, fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--brun)',
            }}>
              Bonjour, {nom}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--gris)' }}>{email}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Actions rapides */}
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Que souhaitez-vous faire ?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <Link href="/vehicules" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '28px', cursor: 'pointer', borderTop: '3px solid var(--orange)', transition: 'all 0.25s' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--orange)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 17H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-3m-6 0v2m0-2h6m-6 0H8m0 2v-2" />
                </svg>
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: 'var(--brun)' }}>Voir les véhicules</p>
              <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.85rem', lineHeight: 1.5 }}>Parcourez notre flotte et réservez en quelques clics</p>
              <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'var(--orange)', fontWeight: 600 }}>Explorer le catalogue →</p>
            </div>
          </Link>

          <Link href="/client/reservations" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '28px', cursor: 'pointer', borderTop: '3px solid var(--vert)', transition: 'all 0.25s' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--vert)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: 'var(--brun)' }}>Mes réservations</p>
              <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.85rem', lineHeight: 1.5 }}>Suivez l'état de vos demandes et locations en cours</p>
              <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'var(--vert)', fontWeight: 600 }}>Voir mes réservations →</p>
            </div>
          </Link>
        </div>

        {/* Comment ça marche */}
        <div className="card" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(22,163,74,0.04))' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
            Comment réserver
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
            {[
              { num: '1', titre: 'Choisissez', texte: 'Parcourez la flotte et sélectionnez votre véhicule', couleur: 'var(--orange)' },
              { num: '2', titre: 'Réservez', texte: 'Choisissez vos dates et envoyez votre demande', couleur: 'var(--vert)' },
              { num: '3', titre: 'Confirmé', texte: 'Le gérant confirme sous 24h. C\'est tout !', couleur: '#EAB308' },
            ].map(({ num, titre, texte, couleur }) => (
              <div key={num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: couleur, color: 'white', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {num}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9rem' }}>{titre}</p>
                  <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.8rem', lineHeight: 1.5 }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
