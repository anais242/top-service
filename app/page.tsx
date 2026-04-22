import Link from 'next/link';
import HeroSlider from './components/HeroSlider';

export default function Accueil() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand">Top Service</span>
        <div className="landing-nav-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link href="/connexion" className="btn-ghost btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
            Connexion
          </Link>
          <Link href="/inscription" className="btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Features */}
      <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Pourquoi choisir Top Service
          </p>
          <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--brun)', marginBottom: '56px' }}>
            Simple, rapide, fiable
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              {
                titre: 'Réservation en ligne',
                texte: 'Choisissez votre véhicule, sélectionnez vos dates et envoyez votre demande en moins de 2 minutes.',
                couleur: '#2563EB',
                bg: 'rgba(37,99,235,0.06)',
                icone: '→',
              },
              {
                titre: 'Confirmation rapide',
                texte: 'Notre équipe traite chaque demande dans les 24h. Vous recevez une confirmation directement.',
                couleur: 'var(--vert)',
                bg: 'rgba(22,163,74,0.06)',
                icone: '✓',
              },
              {
                titre: 'Prix transparents',
                texte: 'Tarif par jour affiché clairement, sans frais cachés. Payez uniquement ce que vous voyez.',
                couleur: '#1B3B8A',
                bg: 'rgba(27,59,138,0.06)',
                icone: 'F',
              },
              {
                titre: 'Flotte entretenue',
                texte: 'Tous nos véhicules sont régulièrement contrôlés et disponibles dans les meilleures conditions.',
                couleur: '#2563EB',
                bg: 'rgba(37,99,235,0.06)',
                icone: '◆',
              },
            ].map(({ titre, texte, couleur, bg, icone }) => (
              <div key={titre} className="card" style={{ padding: '28px', border: 'none', background: bg }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: couleur, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1.1rem', marginBottom: '16px',
                }}>
                  {icone}
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700 }}>{titre}</h3>
                <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem', lineHeight: 1.6 }}>{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services à l'heure */}
      <section style={{ background: 'var(--creme)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Nos tarifs à l'heure
          </p>
          <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--brun)', marginBottom: '48px' }}>
            Location courte durée
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { modele: 'Toyota RAV4', gen: '4ème Génération', prix: '5 000', zone: 'Zone Océan uniquement' },
              { modele: 'Jetour', gen: 'Nouvelle génération', prix: '10 000', zone: 'Centre ville uniquement' },
            ].map(({ modele, gen, prix, zone }) => (
              <div key={modele} style={{
                background: '#FFFFFF', borderRadius: '16px', padding: '32px',
                border: '1px solid rgba(27,59,138,0.1)',
                boxShadow: '0 4px 20px rgba(27,59,138,0.08)',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{gen}</p>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brun)', marginBottom: '16px' }}>{modele}</h3>
                <div style={{
                  display: 'inline-block', background: '#1B3B8A', color: 'white',
                  borderRadius: '8px', padding: '8px 16px', marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{prix}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 400 }}> FCFA / Heure</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--gris)', margin: 0 }}>📍 {zone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--vert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Comment ça marche
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--brun)', marginBottom: '52px' }}>
            3 étapes pour louer
          </h2>

          <div className="steps-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            {[
              { num: '1', titre: 'Créez votre compte', texte: 'Inscription gratuite en 30 secondes, aucune carte requise.' },
              { num: '2', titre: 'Choisissez un véhicule', texte: 'Parcourez la flotte, consultez les détails et les tarifs.' },
              { num: '3', titre: 'Confirmez la réservation', texte: 'Envoyez votre demande, le gérant confirme sous 24h.' },
            ].map(({ num, titre, texte }, i) => (
              <>
                <div key={num} style={{ textAlign: 'center', padding: '24px 16px', flex: '1', minWidth: '180px', maxWidth: '240px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB, #1B3B8A)',
                    color: 'white', fontWeight: 900, fontSize: '1.3rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                  }}>
                    {num}
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700 }}>{titre}</h3>
                  <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.8rem', lineHeight: 1.6 }}>{texte}</p>
                </div>
                {i < 2 && (
                  <div key={`arrow-${i}`} className="steps-arrow" style={{ color: '#93C5FD', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                    →
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '80px 24px 100px', background: 'var(--creme)' }}>
        <div style={{
          maxWidth: '680px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, #1B3B8A 0%, #0D1B3E 100%)',
          borderRadius: '24px', padding: '56px 32px',
          boxShadow: '0 12px 48px rgba(27,59,138,0.3)',
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
            Prêt à réserver votre véhicule ?
          </h2>
          <p style={{ color: '#CBD5E1', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Rejoignez nos clients satisfaits. Inscription gratuite, sans engagement.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vehicules" style={{
              padding: '14px 32px', fontWeight: 700, borderRadius: '10px',
              background: '#FFFFFF', color: '#1B3B8A', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}>
              Voir les véhicules
            </Link>
            <Link href="/inscription" style={{
              padding: '14px 32px', fontWeight: 700, borderRadius: '10px',
              border: '2px solid rgba(219,234,254,0.5)', color: '#DBEAFE',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
            }}>
              S'inscrire gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(27,59,138,0.1)',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
        fontSize: '0.8rem', color: 'var(--gris)',
        background: '#FFFFFF',
      }}>
        <span className="navbar-brand" style={{ fontSize: '1.1rem' }}>Top Service</span>
        <span>Location de véhicules · Congo · Aéroport Agostinho-Neto</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/vehicules" style={{ color: 'var(--gris)', textDecoration: 'none' }}>Catalogue</Link>
          <Link href="/connexion" style={{ color: 'var(--gris)', textDecoration: 'none' }}>Connexion</Link>
        </div>
      </footer>
    </>
  );
}
