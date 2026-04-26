'use client';

import { useEffect, useState, Suspense } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Reservation {
  _id: string;
  vehicule: { marque: string; modele: string; annee: number; photos: string[] };
  dateDebut: string; dateFin: string; nombreJours: number;
  prixTotal: number; statut: string; messageGerant: string; createdAt: string;
  notifClient?: { message: string; lu: boolean; date: string } | null;
}

const STATUT: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente',  bg: '#fef9c3', color: '#713f12' },
  confirmee:  { label: 'Confirmée',   bg: '#dcfce7', color: '#166534' },
  refusee:    { label: 'Refusée',     bg: '#fee2e2', color: '#991b1b' },
  annulee:    { label: 'Annulée',     bg: '#f3f4f6', color: '#6b7280' },
  terminee:   { label: 'Terminée',    bg: '#e0e7ff', color: '#3730a3' },
};

function ContenuReservations() {
  const searchParams = useSearchParams();
  const succes = searchParams.get('succes');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch('/api/reservations')
      .then((r) => r.json())
      .then((j) => { if (j.success) setReservations(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function marquerNotifLue(id: string) {
    await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marquerNotifLue: true }),
    });
    setReservations((prev) => prev.map((x) => x._id === id
      ? { ...x, notifClient: x.notifClient ? { ...x.notifClient, lu: true } : null }
      : x
    ));
  }

  async function annuler(id: string) {
    if (!confirm('Annuler cette réservation ?')) return;
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: 'annulee' }),
    });
    const json = await res.json();
    if (json.success) setReservations((r) => r.map((x) => x._id === id ? { ...x, statut: 'annulee' } : x));
    else alert(json.message);
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 style={{ margin: 0 }}>Mes réservations</h1>
        <div className="page-header-actions">
          <Link href="/vehicules" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ padding: '8px 16px' }}>+ Nouvelle réservation</button>
          </Link>
          <Link href="/client/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            ← Tableau de bord
          </Link>
        </div>
      </div>

      {succes && (
        <div className="succes" style={{ marginBottom: '20px' }}>
          Réservation envoyée ! Le gérant va la confirmer prochainement.
        </div>
      )}

      {chargement && <LoaderVoiture />}

      {!chargement && reservations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Aucune réservation pour le moment.</p>
          <Link href="/vehicules" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '12px' }}>
            Voir les véhicules
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reservations.map((r) => {
          const s = STATUT[r.statut] ?? STATUT.en_attente;
          return (
            <div key={r._id} className="card" style={{ padding: '20px' }}>
              {r.notifClient && !r.notifClient.lu && (
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', padding: '12px 14px', background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔔</span>
                    <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600 }}>{r.notifClient.message}</span>
                  </div>
                  <button onClick={() => marquerNotifLue(r._id)} style={{ flexShrink: 0, padding: '4px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    Vu
                  </button>
                </div>
              )}
              <div className="resa-card-inner">
                {r.vehicule?.photos?.[0] && (
                  <img src={r.vehicule.photos[0]} alt="" className="resa-thumb" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: '0 0 4px' }}>{r.vehicule?.marque} {r.vehicule?.modele} {r.vehicule?.annee}</h3>
                    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date(r.dateDebut).toLocaleDateString('fr-FR')} → {new Date(r.dateFin).toLocaleDateString('fr-FR')} · {r.nombreJours} jour{r.nombreJours > 1 ? 's' : ''}
                  </p>
                  <p style={{ margin: '4px 0', fontWeight: 600 }}>{r.prixTotal.toLocaleString()} FCFA</p>
                  {r.messageGerant && (
                    <p style={{ margin: '8px 0 0', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '0.875rem', color: '#374151' }}>
                      Gérant : {r.messageGerant}
                    </p>
                  )}
                </div>
              </div>
              {r.statut === 'en_attente' && (
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <button onClick={() => annuler(r._id)} style={{ padding: '6px 16px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Annuler
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PageReservationsClient() {
  return (
    <Suspense>
      <ContenuReservations />
    </Suspense>
  );
}
