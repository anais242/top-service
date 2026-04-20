'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Reservation {
  _id: string;
  vehicule: { marque: string; modele: string; annee: number; photos: string[] };
  client: { nom: string; email: string; telephone: string };
  dateDebut: string; dateFin: string; nombreJours: number;
  prixTotal: number; statut: string; messageClient: string; createdAt: string;
}

const STATUT: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente',  bg: '#fef9c3', color: '#713f12' },
  confirmee:  { label: 'Confirmée',   bg: '#dcfce7', color: '#166534' },
  refusee:    { label: 'Refusée',     bg: '#fee2e2', color: '#991b1b' },
  annulee:    { label: 'Annulée',     bg: '#f3f4f6', color: '#6b7280' },
  terminee:   { label: 'Terminée',    bg: '#e0e7ff', color: '#3730a3' },
};

export default function PageReservationsGerant() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [messageGerant, setMessageGerant] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/reservations')
      .then((r) => r.json())
      .then((j) => { if (j.success) setReservations(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function changerStatut(id: string, statut: string) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut, messageGerant: messageGerant[id] || '' }),
    });
    const json = await res.json();
    if (json.success) setReservations((r) => r.map((x) => x._id === id ? { ...x, statut } : x));
    else alert(json.message);
  }

  const reservationsFiltrees = filtre === 'tous'
    ? reservations
    : reservations.filter((r) => r.statut === filtre);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Réservations</h1>
        <Link href="/gerant/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          ← Tableau de bord
        </Link>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { val: 'tous', label: `Toutes (${reservations.length})` },
          { val: 'en_attente', label: `En attente (${reservations.filter((r) => r.statut === 'en_attente').length})` },
          { val: 'confirmee', label: 'Confirmées' },
          { val: 'refusee', label: 'Refusées' },
          { val: 'terminee', label: 'Terminées' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setFiltre(val)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.875rem',
            background: filtre === val ? '#1a56db' : '#fff', color: filtre === val ? '#fff' : '#374151', fontWeight: filtre === val ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {chargement && <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement...</p>}
      {!chargement && reservationsFiltrees.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}><p>Aucune réservation.</p></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reservationsFiltrees.map((r) => {
          const s = STATUT[r.statut] ?? STATUT.en_attente;
          return (
            <div key={r._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {r.vehicule?.photos?.[0] && (
                  <img src={r.vehicule.photos[0]} alt="" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px' }}>{r.vehicule?.marque} {r.vehicule?.modele} {r.vehicule?.annee}</h3>
                      <p style={{ margin: '0', fontSize: '0.875rem', color: '#6b7280' }}>
                        Client : <strong>{r.client?.nom}</strong> · {r.client?.telephone}
                      </p>
                    </div>
                    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <p style={{ margin: '8px 0 4px', color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date(r.dateDebut).toLocaleDateString('fr-FR')} → {new Date(r.dateFin).toLocaleDateString('fr-FR')} · {r.nombreJours} jour{r.nombreJours > 1 ? 's' : ''}
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{r.prixTotal.toLocaleString()} FCFA</p>
                  {r.messageClient && (
                    <p style={{ margin: '8px 0 0', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '0.875rem', color: '#374151' }}>
                      Message client : {r.messageClient}
                    </p>
                  )}
                </div>
              </div>

              {r.statut === 'en_attente' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.875rem' }}>Message au client (optionnel)</label>
                    <input
                      type="text" placeholder="Ex : Rendez-vous à l'agence à 9h"
                      value={messageGerant[r._id] || ''}
                      onChange={(e) => setMessageGerant((m) => ({ ...m, [r._id]: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => changerStatut(r._id, 'confirmee')} style={{ flex: 1, padding: '10px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Confirmer
                    </button>
                    <button onClick={() => changerStatut(r._id, 'refusee')} style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              )}

              {r.statut === 'confirmee' && (
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <button onClick={() => changerStatut(r._id, 'terminee')} style={{ padding: '8px 20px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Marquer comme terminée
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
