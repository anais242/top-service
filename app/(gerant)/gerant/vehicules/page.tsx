'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Vehicule {
  _id: string;
  marque: string;
  modele: string;
  annee: number;
  prixParJour: number;
  statut: 'disponible' | 'loue' | 'maintenance';
  photos: string[];
}

const COULEUR_STATUT = {
  disponible:  { bg: '#dcfce7', color: '#166534', label: 'Disponible' },
  loue:        { bg: '#fef9c3', color: '#713f12', label: 'Loué' },
  maintenance: { bg: '#fee2e2', color: '#991b1b', label: 'Maintenance' },
};

export default function PageVehiculesGerant() {
  const router = useRouter();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  async function charger() {
    try {
      const res = await fetch('/api/vehicules?limite=50');
      const json = await res.json();
      if (json.success) setVehicules(json.data.vehicules);
      else setErreur(json.message);
    } catch {
      setErreur('Impossible de charger les véhicules');
    } finally {
      setChargement(false);
    }
  }

  async function supprimer(id: string, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    const res = await fetch(`/api/vehicules/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) setVehicules((v) => v.filter((x) => x._id !== id));
    else alert(json.message);
  }

  useEffect(() => { charger(); }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Parc automobile</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/gerant/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            ← Tableau de bord
          </Link>
          <Link href="/gerant/vehicules/nouveau" className="btn" style={{ textDecoration: 'none', padding: '8px 16px' }}>
            + Ajouter un véhicule
          </Link>
        </div>
      </div>

      {erreur && <div className="erreur">{erreur}</div>}
      {chargement && <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement...</p>}

      {!chargement && vehicules.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Aucun véhicule dans le parc.</p>
          <Link href="/gerant/vehicules/nouveau" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '12px' }}>
            Ajouter le premier véhicule
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {vehicules.map((v) => {
          const s = COULEUR_STATUT[v.statut];
          return (
            <div key={v._id} className="card" style={{ padding: '16px' }}>
              {v.photos[0] ? (
                <img src={v.photos[0]} alt={`${v.marque} ${v.modele}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
              ) : (
                <div style={{ width: '100%', height: '180px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  Pas de photo
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{v.marque} {v.modele}</h3>
                  <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: '0.875rem' }}>{v.annee}</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{v.prixParJour.toLocaleString()} FCFA / jour</p>
                </div>
                <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {s.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => router.push(`/gerant/vehicules/${v._id}/modifier`)} style={{ flex: 1, padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                  Modifier
                </button>
                <button onClick={() => supprimer(v._id, `${v.marque} ${v.modele}`)} style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
