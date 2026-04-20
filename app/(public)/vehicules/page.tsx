'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number;
  prixParJour: number; prixParHeure?: number; carburant: string; transmission: string;
  nombrePlaces: number; photos: string[];
}

export default function PageCataloguePublic() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    fetch('/api/vehicules?statut=disponible&limite=50')
      .then((r) => r.json())
      .then((j) => { if (j.success) setVehicules(j.data.vehicules); })
      .finally(() => setChargement(false));
  }, []);

  const filtres = vehicules.filter((v) =>
    `${v.marque} ${v.modele}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(22,163,74,0.06) 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.1)',
        padding: '48px 32px 40px',
        textAlign: 'center',
      }}>
        {/* Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 40px' }}>
          <span className="navbar-brand" style={{ fontSize: '1.5rem' }}>Top Service</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/connexion" className="btn-ghost btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
              Connexion
            </Link>
            <Link href="/inscription" className="btn" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
              Créer un compte
            </Link>
          </div>
        </div>

        <h1 className="titre-hero" style={{ marginBottom: '12px' }}>
          Louez le véhicule<br />
          <span style={{ color: 'var(--orange)' }}>qu'il vous faut</span>
        </h1>
        <p style={{ color: 'var(--gris)', fontSize: '1rem', marginBottom: '28px' }}>
          Catalogue complet · Réservation en ligne · Confirmation rapide
        </p>

        {/* Barre de recherche */}
        <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', padding: '14px 20px 14px 48px',
              border: '2px solid rgba(249,115,22,0.2)', borderRadius: '50px',
              fontSize: '0.95rem', outline: 'none', background: 'white',
              boxShadow: '0 4px 20px rgba(249,115,22,0.1)',
              fontFamily: 'inherit',
            }}
          />
          <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gris)', fontSize: '0.9rem', fontWeight: 500 }}>Recherche</span>
        </div>
      </div>

      <div className="container">
        {/* Stats rapides */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { val: `${vehicules.length}`, label: 'Vehicules disponibles' },
            { val: 'Gratuit', label: 'Inscription et reservation' },
            { val: '< 24h', label: 'Confirmation garantie' },
          ].map(({ val, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.8)', padding: '10px 18px', borderRadius: '50px', border: '1px solid rgba(249,115,22,0.1)', fontSize: '0.875rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
              <span><strong>{val}</strong> {label}</span>
            </div>
          ))}
        </div>

        {chargement && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gris)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--orange-light)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin-loader 0.8s linear infinite', margin: '0 auto 16px' }} />
            Chargement des vehicules...
          </div>
        )}

        {!chargement && filtres.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Aucun vehicule trouve</p>
            <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Modifiez votre recherche</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtres.map((v, i) => (
            <Link key={v._id} href={`/vehicules/${v._id}`} className="car-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                {v.photos[0] ? (
                  <img src={v.photos[0]} alt={`${v.marque} ${v.modele}`} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'var(--gris-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gris)', fontSize: '0.875rem' }}>Pas de photo</div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge badge-vert">Disponible</span>
                </div>
              </div>
              <div className="car-card-body">
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>{v.marque} {v.modele}</h3>
                <p style={{ margin: '0 0 12px', color: 'var(--gris)', fontSize: '0.85rem' }}>
                  {v.annee} · {v.carburant} · {v.transmission} · {v.nombrePlaces} places
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="car-card-price">
                      {v.prixParJour.toLocaleString()} FCFA <span>/jour</span>
                    </div>
                    {v.prixParHeure && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--vert)', fontWeight: 600, marginTop: '2px' }}>
                        {v.prixParHeure.toLocaleString()} FCFA /heure
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--orange)', fontWeight: 600 }}>Réserver →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
