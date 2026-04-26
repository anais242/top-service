'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Vehicule {
  _id: string;
  marque: string; modele: string; annee: number; couleur: string; ville: string;
  prixParJour: number; prixParHeure?: number;
  kilometrage: number; carburant: string; transmission: string; nombrePlaces: number;
  description?: string;
  statut: 'disponible' | 'loue' | 'maintenance';
  visible: boolean;
  photos: string[];
  chauffeurDisponible?: boolean;
}

interface ResaActive {
  _id: string;
  vehicule: { _id: string };
  client: { nom: string };
  dateDebut: string; dateFin: string;
  statut: 'en_attente' | 'confirmee';
}

const STATUT_TECH = {
  disponible:  { bg: '#dcfce7', color: '#166534', label: 'Disponible' },
  loue:        { bg: '#fef9c3', color: '#713f12', label: 'Loué' },
  maintenance: { bg: '#fee2e2', color: '#991b1b', label: 'Maintenance' },
};

const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

function PageVehiculesGerantInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const depuisResas = searchParams.get('retour') === 'reservations';
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [resas, setResas] = useState<ResaActive[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [overlay, setOverlay] = useState<Vehicule | null>(null);

  async function charger() {
    try {
      const [vRes, rRes] = await Promise.all([
        fetch('/api/vehicules?limite=100').then((r) => r.json()),
        fetch('/api/reservations').then((r) => r.json()),
      ]);
      if (vRes.success) setVehicules(vRes.data.vehicules);
      else setErreur(vRes.message);
      if (rRes.success) {
        const auj = new Date();
        setResas((rRes.data as ResaActive[]).filter(
          (r) => ['en_attente', 'confirmee'].includes(r.statut) && new Date(r.dateFin) >= auj
        ));
      }
    } catch { setErreur('Impossible de charger les véhicules'); }
    finally { setChargement(false); }
  }

  async function toggleVisibilite(v: Vehicule) {
    const res  = await fetch(`/api/vehicules/${v._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible: !v.visible }) });
    const json = await res.json();
    if (json.success) {
      setVehicules((prev) => prev.map((x) => x._id === v._id ? { ...x, visible: json.data.visible } : x));
      setOverlay((prev) => prev?._id === v._id ? { ...prev, visible: json.data.visible } : prev);
    } else { alert(json.message); }
  }

  async function tousVisibilite(visible: boolean) {
    const cible = vehicules.filter((v) => v.visible !== visible);
    if (cible.length === 0) return;
    const label = visible ? 'Remettre tous les véhicules en ligne ?' : 'Masquer tous les véhicules du catalogue ?';
    if (!confirm(label)) return;
    await Promise.all(
      cible.map((v) =>
        fetch(`/api/vehicules/${v._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible }) })
      )
    );
    setVehicules((prev) => prev.map((x) => ({ ...x, visible })));
  }

  async function supprimer(id: string, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    const res = await fetch(`/api/vehicules/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) { setVehicules((v) => v.filter((x) => x._id !== id)); setOverlay(null); }
    else alert(json.message);
  }

  useEffect(() => { charger(); }, []);

  function resasDuVehicule(vid: string) {
    return resas
      .filter((r) => r.vehicule?._id?.toString() === vid)
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  function badgeDispo(vid: string) {
    const periodes = resasDuVehicule(vid);
    if (periodes.some((r) => r.statut === 'confirmee')) return { bg: '#fee2e2', color: '#991b1b', label: 'Réservé' };
    if (periodes.some((r) => r.statut === 'en_attente')) return { bg: '#fef9c3', color: '#713f12', label: 'En attente' };
    return { bg: '#dcfce7', color: '#166534', label: 'Libre' };
  }

  return (
    <div className="container">
      {depuisResas && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600 }}>
            Vous avez créé de nouveaux véhicules ? Retournez assigner dans les réservations.
          </span>
          <Link href="/gerant/reservations" style={{ padding: '8px 16px', background: '#1B3B8A', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            ← Réservations en attente
          </Link>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>Parc automobile</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => tousVisibilite(false)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fef9c3', color: '#713f12', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Tout masquer
          </button>
          <button
            onClick={() => tousVisibilite(true)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Tout afficher
          </button>
          <Link href="/gerant/tableau-de-bord" style={{ color: '#6b7280', textDecoration: 'none', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            ← Tableau de bord
          </Link>
          <Link href="/gerant/vehicules/nouveau" className="btn" style={{ textDecoration: 'none', padding: '8px 16px' }}>
            + Ajouter
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

      {/* Vue liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {vehicules.map((v) => {
          const s = STATUT_TECH[v.statut];
          const d = badgeDispo(v._id);
          const periodes = resasDuVehicule(v._id);
          return (
            <div
              key={v._id}
              onClick={() => setOverlay(v)}
              className="card"
              style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'box-shadow 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,59,138,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
            >
              {/* Miniature */}
              {v.photos[0] ? (
                <img src={v.photos[0]} alt="" style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '64px', height: '48px', background: '#f3f4f6', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#9ca3af' }}>
                  No photo
                </div>
              )}

              {/* Infos principales */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.marque} {v.modele} <span style={{ fontWeight: 400, color: '#6b7280' }}>{v.annee}</span></div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {v.ville === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville'} · {v.prixParJour.toLocaleString()} FCFA/j
                  {v.prixParHeure ? ` · ${v.prixParHeure.toLocaleString()} FCFA/h` : ''}
                </div>
              </div>

              {/* Créneaux actifs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '180px' }}>
                {periodes.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Aucune réservation</span>
                ) : periodes.slice(0, 2).map((r) => (
                  <span key={r._id} style={{ fontSize: '0.72rem', color: r.statut === 'confirmee' ? '#dc2626' : '#92400e', background: r.statut === 'confirmee' ? '#fef2f2' : '#fefce8', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    {r.statut === 'confirmee' ? '●' : '○'} {fmt(r.dateDebut)} → {fmt(r.dateFin)}
                  </span>
                ))}
                {periodes.length > 2 && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>+{periodes.length - 2} autre{periodes.length - 2 > 1 ? 's' : ''}</span>}
              </div>

              {/* Badges statut */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
                {!v.visible && (
                  <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '3px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>Masqué</span>
                )}
                <span style={{ background: s.bg, color: s.color, padding: '3px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>{s.label}</span>
                <span style={{ background: d.bg, color: d.color, padding: '3px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>{d.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay */}
      {overlay && (() => {
        const periodes = resasDuVehicule(overlay._id);
        const s = STATUT_TECH[overlay.statut];
        const d = badgeDispo(overlay._id);
        return (
          <div
            onClick={() => setOverlay(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            >
              {/* Photo */}
              {overlay.photos[0] && (
                <img src={overlay.photos[0]} alt="" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px 14px 0 0' }} />
              )}

              <div style={{ padding: '20px' }}>
                {/* Titre + badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px' }}>{overlay.marque} {overlay.modele}</h2>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{overlay.annee}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {!overlay.visible && (
                      <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Masqué</span>
                    )}
                    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ background: d.bg, color: d.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{d.label}</span>
                  </div>
                </div>

                {/* Infos en grille */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { l: 'Couleur', v: overlay.couleur },
                    { l: 'Ville', v: overlay.ville === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville' },
                    { l: 'Carburant', v: overlay.carburant },
                    { l: 'Transmission', v: overlay.transmission },
                    { l: 'Places', v: overlay.nombrePlaces },
                    { l: 'Kilométrage', v: `${overlay.kilometrage.toLocaleString()} km` },
                    { l: 'Prix / jour', v: `${overlay.prixParJour.toLocaleString()} FCFA` },
                    ...(overlay.prixParHeure ? [{ l: 'Prix / heure', v: `${overlay.prixParHeure.toLocaleString()} FCFA` }] : []),
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '2px' }}>{l}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {overlay.description && (
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px' }}>{overlay.description}</p>
                )}

                {/* Périodes de réservation */}
                {periodes.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Réservations actives / à venir</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {periodes.map((r) => {
                        const conf = r.statut === 'confirmee';
                        return (
                          <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: conf ? '#fef2f2' : '#fefce8', border: `1px solid ${conf ? '#fca5a5' : '#fde68a'}` }}>
                            <div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: conf ? '#dc2626' : '#92400e' }}>{conf ? '● Confirmé' : '○ En attente'}</span>
                              <span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: '8px' }}>{r.client?.nom}</span>
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{fmt(r.dateDebut)} → {fmt(r.dateFin)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleVisibilite(overlay)}
                    style={{ flex: 1, padding: '10px', background: overlay.visible ? '#fef9c3' : '#dcfce7', color: overlay.visible ? '#713f12' : '#166534', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    {overlay.visible ? 'Masquer du catalogue' : 'Remettre en ligne'}
                  </button>
                  <button
                    onClick={() => router.push(`/gerant/vehicules/${overlay._id}/modifier`)}
                    style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => router.push(`/gerant/vehicules/nouveau?dupliquer=${overlay._id}`)}
                    style={{ flex: 1, padding: '10px', background: 'rgba(27,59,138,0.08)', color: '#1B3B8A', border: '1px solid rgba(27,59,138,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    Dupliquer
                  </button>
                  <button
                    onClick={() => supprimer(overlay._id, `${overlay.marque} ${overlay.modele}`)}
                    style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function PageVehiculesGerant() {
  return (
    <Suspense>
      <PageVehiculesGerantInner />
    </Suspense>
  );
}
