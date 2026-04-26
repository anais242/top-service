'use client';

import { useEffect, useState } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import Link from 'next/link';

interface ClientCorporate {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
  actif: boolean;
  createdAt: string;
  nbVehicules: number;
}

export default function PageBusinessGerant() {
  const [clients, setClients] = useState<ClientCorporate[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch('/api/gerant/business').then((r) => r.json())
      .then((j) => { if (j.success) setClients(j.data); })
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 style={{ margin: '0 0 4px' }}>Clients Corporate</h1>
          <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>
            {clients.length} compte{clients.length > 1 ? 's' : ''} actif{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="page-header-actions">
          <Link href="/gerant/business/nouveau" className="btn" style={{ textDecoration: 'none', padding: '8px 20px' }}>
            + Nouveau client corporate
          </Link>
          <Link href="/gerant/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            ← Tableau de bord
          </Link>
        </div>
      </div>

      {chargement && <LoaderVoiture />}

      {!chargement && clients.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '8px' }}>Aucun client corporate</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>Créez le premier compte après signature d'un accord commercial.</p>
          <Link href="/gerant/business/nouveau" className="btn" style={{ textDecoration: 'none', padding: '10px 24px' }}>
            + Créer un compte corporate
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clients.map((c) => (
          <Link key={c._id} href={`/gerant/business/${c._id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                {c.nom[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>{c.nom}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.telephone} · {c.email}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                  <span style={{ background: c.nbVehicules > 0 ? '#DBEAFE' : '#f3f4f6', color: c.nbVehicules > 0 ? '#1B3B8A' : '#6b7280', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {c.nbVehicules} véhicule{c.nbVehicules > 1 ? 's' : ''}
                  </span>
                  <span style={{ background: c.actif ? '#dcfce7' : '#f3f4f6', color: c.actif ? '#166534' : '#6b7280', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {c.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gris)' }}>
                  Depuis le {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
