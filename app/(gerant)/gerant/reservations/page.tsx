'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Chauffeur { _id: string; nom: string; estOccupe?: boolean; }
interface VehiculeOption { _id: string; marque: string; modele: string; annee: number; }

interface Reservation {
  _id: string;
  vehicule: { _id?: string; marque: string; modele: string; annee: number; photos: string[] };
  client: { nom: string; email: string; telephone: string };
  dateDebut: string; dateFin: string; nombreJours: number;
  prixTotal: number; statut: string; messageClient: string; createdAt: string;
  avecChauffeur?: boolean;
  chauffeur?: { _id: string; nom: string } | null;
  statutChauffeur?: string;
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
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<VehiculeOption[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous');
  const [messageGerant, setMessageGerant] = useState<Record<string, string>>({});
  const [chauffeurSelectionne, setChauffeurSelectionne] = useState<Record<string, string>>({});
  const [vehiculeSelectionne, setVehiculeSelectionne] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/reservations').then((r) => r.json()),
      fetch('/api/gerant/chauffeurs').then((r) => r.json()),
      fetch('/api/vehicules').then((r) => r.json()),
    ]).then(([rj, cj, vj]) => {
      if (rj.success) setReservations(rj.data);
      if (cj.success) setChauffeurs(cj.data);
      if (vj.success) setVehicules(vj.data);
    }).finally(() => setChargement(false));
  }, []);

  async function changerStatut(id: string, statut: string, opts?: { chauffeurId?: string; vehiculeId?: string }) {
    const body: Record<string, unknown> = { statut, messageGerant: messageGerant[id] || '' };
    if (opts?.chauffeurId !== undefined) body.chauffeurId = opts.chauffeurId || null;
    if (opts?.vehiculeId) body.vehiculeId = opts.vehiculeId;
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.success) {
      const updated = json.data;
      // updated.chauffeur est maintenant { _id, nom } grâce au populate
      const chauffeurData = updated.chauffeur && typeof updated.chauffeur === 'object' && 'nom' in updated.chauffeur
        ? updated.chauffeur as { _id: string; nom: string }
        : undefined;
      setReservations((r) => r.map((x) => x._id === id
        ? { ...x, statut, chauffeur: chauffeurData ?? x.chauffeur, statutChauffeur: updated.statutChauffeur ?? x.statutChauffeur }
        : x
      ));
      // Rafraîchir la liste des chauffeurs pour mettre à jour estOccupe
      if (statut === 'confirmee') {
        fetch('/api/gerant/chauffeurs').then((r) => r.json()).then((j) => { if (j.success) setChauffeurs(j.data); });
      }
    } else {
      alert(json.message);
    }
  }

  async function assignerChauffeur(id: string) {
    const chauffeurId = chauffeurSelectionne[id] || null;
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chauffeurId }),
    });
    const json = await res.json();
    if (json.success) {
      const chauffeur = chauffeurId ? chauffeurs.find((c) => c._id === chauffeurId) : null;
      setReservations((prev) => prev.map((x) => x._id === id
        ? { ...x, chauffeur: chauffeur ? { _id: chauffeur._id, nom: chauffeur.nom } : null, statutChauffeur: chauffeurId ? 'en_attente' : 'non_attribue' }
        : x
      ));
      // Rafraîchir estOccupe sur les chauffeurs
      fetch('/api/gerant/chauffeurs').then((r) => r.json()).then((j) => { if (j.success) setChauffeurs(j.data); });
    } else {
      alert(json.message);
    }
  }

  async function assignerVehicule(id: string) {
    const vehiculeId = vehiculeSelectionne[id];
    if (!vehiculeId) { alert('Sélectionnez un véhicule'); return; }
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehiculeId }),
    });
    const json = await res.json();
    if (json.success) {
      const v = vehicules.find((x) => x._id === vehiculeId);
      if (v) {
        setReservations((prev) => prev.map((x) => x._id === id
          ? { ...x, vehicule: { ...x.vehicule, _id: v._id, marque: v.marque, modele: v.modele, annee: v.annee } }
          : x
        ));
      }
    } else {
      alert(json.message);
    }
  }

  const reservationsFiltrees = filtre === 'tous'
    ? reservations
    : reservations.filter((r) => r.statut === filtre);

  return (
    <div className="container">
      <div className="page-header">
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
              <div className="resa-card-inner">
                {r.vehicule?.photos?.[0] && (
                  <img src={r.vehicule.photos[0]} alt="" className="resa-thumb" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
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
                  {r.avecChauffeur && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(22,163,74,0.1)', color: 'var(--vert)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                        Avec chauffeur
                      </span>
                      {r.chauffeur && (
                        <span style={{ fontSize: '0.8rem', color: '#374151' }}>
                          Assigné : <strong>{r.chauffeur.nom}</strong>
                          {r.statutChauffeur === 'acceptee' && <span style={{ color: 'var(--vert)', marginLeft: '4px' }}>✓ Accepté</span>}
                          {r.statutChauffeur === 'refusee' && <span style={{ color: '#dc2626', marginLeft: '4px' }}>✗ Refusé</span>}
                          {r.statutChauffeur === 'en_attente' && <span style={{ color: '#713f12', marginLeft: '4px' }}>En attente</span>}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {r.statut === 'en_attente' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                  {/* Sélection véhicule */}
                  {vehicules.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                        Véhicule : <span style={{ color: '#1B3B8A' }}>{r.vehicule?.marque} {r.vehicule?.modele} {r.vehicule?.annee}</span>
                      </p>
                      <select
                        value={vehiculeSelectionne[r._id] || ''}
                        onChange={(e) => setVehiculeSelectionne((s) => ({ ...s, [r._id]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', background: 'white' }}
                      >
                        <option value="">— Garder le véhicule actuel —</option>
                        {vehicules.map((v) => (
                          <option key={v._id} value={v._id}>{v.marque} {v.modele} {v.annee}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Sélection chauffeur */}
                  {r.avecChauffeur && chauffeurs.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>Chauffeur</p>
                      <select
                        value={chauffeurSelectionne[r._id] || ''}
                        onChange={(e) => setChauffeurSelectionne((s) => ({ ...s, [r._id]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', background: 'white' }}
                      >
                        <option value="">— Auto-assignation —</option>
                        {chauffeurs.map((c) => (
                          <option key={c._id} value={c._id} disabled={!!c.estOccupe}>
                            {c.nom}{c.estOccupe ? ' (occupé)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Message */}
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.875rem' }}>Message au client (optionnel)</label>
                    <input
                      type="text" placeholder="Ex : Rendez-vous à l'agence à 9h"
                      value={messageGerant[r._id] || ''}
                      onChange={(e) => setMessageGerant((m) => ({ ...m, [r._id]: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => changerStatut(r._id, 'confirmee', { chauffeurId: chauffeurSelectionne[r._id], vehiculeId: vehiculeSelectionne[r._id] })} style={{ flex: 1, padding: '10px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Confirmer
                    </button>
                    <button onClick={() => changerStatut(r._id, 'refusee')} style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      ✗ Refuser
                    </button>
                  </div>
                </div>
              )}

              {r.statut === 'confirmee' && (
                <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  {/* Assignation véhicule */}
                  {vehicules.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                        Véhicule assigné : <span style={{ color: '#1B3B8A' }}>{r.vehicule?.marque} {r.vehicule?.modele} {r.vehicule?.annee}</span>
                      </p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          value={vehiculeSelectionne[r._id] || ''}
                          onChange={(e) => setVehiculeSelectionne((s) => ({ ...s, [r._id]: e.target.value }))}
                          style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', background: 'white' }}
                        >
                          <option value="">— Changer de véhicule —</option>
                          {vehicules.map((v) => (
                            <option key={v._id} value={v._id}>{v.marque} {v.modele} {v.annee}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignerVehicule(r._id)}
                          style={{ padding: '8px 16px', background: 'rgba(27,59,138,0.08)', color: '#1B3B8A', border: '1px solid rgba(27,59,138,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                        >
                          Assigner
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Assignation chauffeur */}
                  {r.avecChauffeur && chauffeurs.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={chauffeurSelectionne[r._id] || ''}
                        onChange={(e) => setChauffeurSelectionne((s) => ({ ...s, [r._id]: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', background: 'white' }}
                      >
                        <option value="">— Sélectionner un chauffeur —</option>
                        {chauffeurs.map((c) => (
                          <option key={c._id} value={c._id} disabled={!!c.estOccupe}>
                            {c.nom}{c.estOccupe ? ' (occupé)' : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => assignerChauffeur(r._id)}
                        style={{ padding: '8px 16px', background: 'rgba(22,163,74,0.1)', color: 'var(--vert)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                      >
                        Assigner
                      </button>
                    </div>
                  )}
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => changerStatut(r._id, 'terminee')} style={{ padding: '8px 20px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      Marquer comme terminée
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
