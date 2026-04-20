import Link from 'next/link';

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

      {/* Hero */}
      <section style={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '50px', padding: '6px 18px', marginBottom: '28px',
          fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange)', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'pulse-ring 1.5s ease infinite' }} />
          Location de véhicules au Congo
        </div>

        <h1 className="titre-hero" style={{ maxWidth: '720px', marginBottom: '20px' }}>
          Le véhicule qu'il vous faut,<br />
          <span style={{ color: 'var(--orange)' }}>quand vous en avez besoin</span>
        </h1>

        <p style={{
          maxWidth: '520px', color: 'var(--gris)', fontSize: '1.05rem',
          lineHeight: 1.7, marginBottom: '40px',
        }}>
          Réservez en quelques clics parmi notre flotte de véhicules disponibles.
          Confirmation rapide, prix transparents, service de confiance.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/vehicules" className="btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Voir les véhicules
          </Link>
          <Link href="/inscription" className="btn-ghost btn" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Créer un compte gratuit
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '32px', marginTop: '64px',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { val: '100%', label: 'Gratuit à l\'inscription' },
            { val: '< 24h', label: 'Confirmation garantie' },
            { val: 'Flotte', label: 'Diversifiée & entretenue' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brun)', margin: 0 }}>{val}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--gris)', margin: '4px 0 0', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
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
                couleur: 'var(--orange)',
                bg: 'rgba(249,115,22,0.06)',
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
                couleur: '#EAB308',
                bg: 'rgba(234,179,8,0.06)',
                icone: 'F',
              },
              {
                titre: 'Flotte entretenue',
                texte: 'Tous nos véhicules sont régulièrement contrôlés et disponibles dans les meilleures conditions.',
                couleur: 'var(--orange)',
                bg: 'rgba(249,115,22,0.06)',
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

      {/* Comment ça marche */}
      <section style={{ padding: '80px 24px' }}>
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
                    background: 'linear-gradient(135deg, var(--orange), var(--orange-dark))',
                    color: 'white', fontWeight: 900, fontSize: '1.3rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  }}>
                    {num}
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700 }}>{titre}</h3>
                  <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.8rem', lineHeight: 1.6 }}>{texte}</p>
                </div>
                {i < 2 && (
                  <div key={`arrow-${i}`} className="steps-arrow" style={{ color: 'var(--orange-light)', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
                    →
                  </div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: '80px 24px 100px' }}>
        <div style={{
          maxWidth: '680px', margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(22,163,74,0.06) 100%)',
          border: '1px solid rgba(249,115,22,0.15)', borderRadius: '24px', padding: '56px 32px',
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--brun)', marginBottom: '16px' }}>
            Prêt à réserver votre véhicule ?
          </h2>
          <p style={{ color: 'var(--gris)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Rejoignez nos clients satisfaits. Inscription gratuite, sans engagement.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/vehicules" className="btn" style={{ padding: '14px 32px' }}>
              Voir les véhicules
            </Link>
            <Link href="/inscription" className="btn-ghost btn" style={{ padding: '14px 32px' }}>
              S'inscrire gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(249,115,22,0.1)',
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
        fontSize: '0.8rem', color: 'var(--gris)',
      }}>
        <span className="navbar-brand" style={{ fontSize: '1.1rem' }}>Top Service</span>
        <span>Location de véhicules · Congo</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/vehicules" style={{ color: 'var(--gris)', textDecoration: 'none' }}>Catalogue</Link>
          <Link href="/connexion" style={{ color: 'var(--gris)', textDecoration: 'none' }}>Connexion</Link>
        </div>
      </footer>
    </>
  );
}
