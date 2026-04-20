import Link from 'next/link';

export default function Accueil() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>🚗 Top Service</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Location de voitures — simple, rapide, fiable
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/connexion" className="btn" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            Se connecter
          </Link>
          <Link href="/inscription" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            Créer un compte client
          </Link>
        </div>
      </div>
    </div>
  );
}
