'use client';

import { useEffect, useState } from 'react';

interface Mission {
  _id: string;
  vehicule: { marque: string; modele: string; annee: number; photos: string[]; ville: string };
  client: { nom: string; email: string; telephone: string };
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  nombreHeures?: number;
  typeLocation: string;
  prixTotal: number;
  statut: string;
  statutChauffeur: string;
  messageClient: string;
  avecChauffeur: boolean;
}

const STATUT_CHAUFFEUR: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente de votre réponse', bg: '#fef9c3', color: '#713f12' },
  acceptee:   { label: 'Acceptée',                   bg: '#dcfce7', color: '#166534' },
  refusee:    { label: 'Refusée',                    bg: '#fee2e2', color: '#991b1b' },
};

const STATUT_REZ: Record<string, string> = {
  en_attente: 'Réservation en attente',
  confirmee:  'Réservation confirmée',
  refusee:    'Réservation refusée',
  annulee:    'Annulée',
  terminee:   'Terminée',
};

export default function PageMissionsChauffeur() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous');

  useEffect(() => {
    fetch('/api/chauffeur/missions')
      .then((r) => r.json())
      .then((j) => { if (j.success) setMissions(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function repondre(id: string, statutChauffeur: 'acceptee' | 'refusee') {
    const res = await fetch(`/api/chauffeur/missions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statutChauffeur }),
    });
    const json = await res.json();
    if (json.success) {
      setMissions((prev) => prev.map((m) => m._id === id ? { ...m, statutChauffeur } : m));
    } else {
      alert(json.message);
    }
  }

  const filtrees = filtre === 'tous' ? missions : missions.filter((m) => m.statutChauffeur === filtre);
  const enAttente = missions.filter((m) => m.statutChauffeur === 'en_attente').length;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>Mes missions</h1>
          {enAttente > 0 && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#713f12', fontWeight: 600, background: '#fef9c3', display: 'inline-block', padding: '2px 10px', borderRadius: '20px' }}>
              {enAttente} en attente de réponse
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { val: 'tous',       label: `Toutes (${missions.length})` },
          { val: 'en_attente', label: `En attente (${enAttente})` },
          { val: 'acceptee',   label: 'Acceptées' },
          { val: 'refusee',    label: 'Refusées' },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setFiltre(val)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '0.875rem',
            background: filtre === val ? 'var(--vert)' : '#fff',
            color: filtre === val ? '#fff' : '#374151',
            fontWeight: filtre === val ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {chargement && <p style={{ textAlign: 'center', color: 'var(--gris)' }}>Chargement...</p>}
      {!chargement && filtrees.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600 }}>Aucune mission</p>
          <p style={{ fontSize: '0.875rem' }}>Le gérant vous assignera des missions prochainement</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtrees.map((m) => {
          const sc = STATUT_CHAUFFEUR[m.statutChauffeur] ?? STATUT_CHAUFFEUR.en_attente;
          const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
          const ville = m.vehicule?.ville === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville';

          return (
            <div key={m._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {m.vehicule?.photos?.[0] ? (
                  <img src={m.vehicule.photos[0]} alt="" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '100px', height: '70px', background: 'var(--gris-light)', borderRadius: '8px', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 2px' }}>{m.vehicule?.marque} {m.vehicule?.modele} {m.vehicule?.annee}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>{ville} · {STATUT_REZ[m.statut]}</p>
                    </div>
                    <span style={{ background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </div>

                  <div style={{ margin: '10px 0', padding: '10px 14px', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--gris)', fontWeight: 600 }}>CLIENT</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{m.client?.nom}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--gris)' }}>{m.client?.telephone} · {m.client?.email}</p>
                  </div>

                  <p style={{ margin: '4px 0', color: 'var(--gris)', fontSize: '0.875rem' }}>
                    {m.typeLocation === 'heure'
                      ? `${fmt(m.dateDebut)} · ${m.nombreHeures}h`
                      : `${fmt(m.dateDebut)} → ${fmt(m.dateFin)} · ${m.nombreJours} jour${m.nombreJours > 1 ? 's' : ''}`}
                  </p>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--orange)' }}>{m.prixTotal.toLocaleString()} FCFA</p>

                  {m.messageClient && (
                    <p style={{ margin: '8px 0 0', padding: '8px 12px', background: 'rgba(249,115,22,0.05)', borderRadius: '6px', fontSize: '0.875rem', color: '#374151', border: '1px solid rgba(249,115,22,0.1)' }}>
                      Message : {m.messageClient}
                    </p>
                  )}
                </div>
              </div>

              {m.statutChauffeur === 'en_attente' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => repondre(m._id, 'acceptee')} style={{ flex: 1, padding: '10px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    ✓ Accepter la mission
                  </button>
                  <button onClick={() => repondre(m._id, 'refusee')} style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    ✗ Refuser
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
