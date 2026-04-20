'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number;
  prixParJour: number; carburant: string; transmission: string;
  nombrePlaces: number; photos: string[]; statut: string;
}

export default function PageCatalogueClient() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetch('/api/vehicules?statut=disponible&limite=50')
      .then((r) => r.json())
      .then((j) => { if (j.success) setVehicules(j.data.vehicules); else setErreur(j.message); })
      .catch(() => setErreur('Impossible de charger les véhicules'))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Véhicules disponibles</h1>
        <Link href="/client/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          ← Tableau de bord
        </Link>
      </div>

      {erreur && <div className="erreur">{erreur}</div>}
      {chargement && <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement...</p>}

      {!chargement && vehicules.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Aucun véhicule disponible pour le moment.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {vehicules.map((v) => (
          <Link key={v._id} href={`/client/vehicules/${v._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s', border: '1px solid #e5e7eb' }}>
              {v.photos[0] ? (
                <img src={v.photos[0]} alt={`${v.marque} ${v.modele}`} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '180px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  Pas de photo
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 4px' }}>{v.marque} {v.modele}</h3>
                <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '0.875rem' }}>{v.annee} · {v.carburant} · {v.transmission}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1a56db' }}>{v.prixParJour.toLocaleString()} FCFA<span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.8rem' }}>/jour</span></span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{v.nombrePlaces} places</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
