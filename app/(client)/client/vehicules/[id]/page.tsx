'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number; couleur: string;
  prixParJour: number; kilometrage: number; carburant: string; transmission: string;
  nombrePlaces: number; description: string; photos: string[]; statut: string;
}

export default function PageDetailVehicule() {
  const { id } = useParams<{ id: string }>();
  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [chargement, setChargement] = useState(true);
  const [photoActive, setPhotoActive] = useState(0);

  useEffect(() => {
    fetch(`/api/vehicules/${id}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setVehicule(j.data); })
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <div className="container"><p style={{ textAlign: 'center' }}>Chargement...</p></div>;
  if (!vehicule) return <div className="container"><div className="erreur">Véhicule introuvable</div></div>;

  const infos = [
    { label: 'Année', val: vehicule.annee },
    { label: 'Couleur', val: vehicule.couleur },
    { label: 'Carburant', val: vehicule.carburant },
    { label: 'Transmission', val: vehicule.transmission },
    { label: 'Places', val: vehicule.nombrePlaces },
    { label: 'Kilométrage', val: `${vehicule.kilometrage.toLocaleString()} km` },
  ];

  return (
    <div className="container">
      <Link href="/client/vehicules" style={{ color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
        ← Retour au catalogue
      </Link>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Galerie photos */}
        {vehicule.photos.length > 0 ? (
          <div>
            <img src={vehicule.photos[photoActive]} alt="" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
            {vehicule.photos.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
                {vehicule.photos.map((url, i) => (
                  <img key={url} src={url} alt="" onClick={() => setPhotoActive(i)} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', opacity: i === photoActive ? 1 : 0.5, border: i === photoActive ? '2px solid #1a56db' : 'none' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', height: '240px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Pas de photo
          </div>
        )}

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px' }}>{vehicule.marque} {vehicule.modele}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a56db' }}>{vehicule.prixParJour.toLocaleString()} FCFA</div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>par jour</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {infos.map(({ label, val }) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>

          {vehicule.description && (
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>{vehicule.description}</p>
          )}

          <button className="btn" style={{ width: '100%' }} disabled>
            Réserver — disponible dans le Module 3
          </button>
        </div>
      </div>
    </div>
  );
}
