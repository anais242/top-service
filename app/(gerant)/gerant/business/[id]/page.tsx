'use client';

import { useEffect, useState } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface VehiculeDisponible {
  _id: string; marque: string; modele: string; annee: number;
  prixParJour: number; prixParHeure?: number; photos: string[];
  statut: 'disponible' | 'loue' | 'maintenance';
}
interface ChauffeurDisponible {
  _id: string; nom: string; telephone: string;
  estOccupe: boolean; aReservationAVenir: boolean;
}
interface ContratExistant {
  vehicule: VehiculeDisponible; prixParJour: number; prixParHeure?: number | null;
  avecChauffeur: boolean; chauffeur?: { _id: string; nom: string; telephone: string } | null;
}
interface Client { _id: string; nom: string; email: string; telephone: string; actif: boolean; createdAt: string; }
interface LigneContrat {
  vehiculeId: string; prixParJour: string; prixParHeure: string;
  avecChauffeur: boolean; chauffeurId: string;
}

const BADGE_STATUT: Record<string, { label: string; bg: string; color: string }> = {
  loue:        { label: 'Loué',        bg: '#FEF3C7', color: '#92400E' },
  maintenance: { label: 'Maintenance', bg: '#FEE2E2', color: '#991B1B' },
  disponible:  { label: 'Disponible',  bg: '#D1FAE5', color: '#065F46' },
};

export default function PageDetailCorporate() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [tousVehicules, setTousVehicules] = useState<VehiculeDisponible[]>([]);
  const [chauffeurs, setChauffeurs] = useState<ChauffeurDisponible[]>([]);
  const [contrats, setContrats] = useState<Record<string, LigneContrat>>({});
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/gerant/business/${id}`).then((r) => r.json()),
      fetch('/api/gerant/business/disponibilites').then((r) => r.json()),
    ]).then(([bj, dj]) => {
      if (bj.success) {
        setClient(bj.data.client);
        const map: Record<string, LigneContrat> = {};
        (bj.data.contrats as ContratExistant[]).forEach((c) => {
          map[c.vehicule._id] = {
            vehiculeId: c.vehicule._id,
            prixParJour: String(c.prixParJour),
            prixParHeure: c.prixParHeure ? String(c.prixParHeure) : '',
            avecChauffeur: c.avecChauffeur,
            chauffeurId: c.chauffeur?._id ?? '',
          };
        });
        setContrats(map);
      }
      if (dj.success) {
        setTousVehicules(dj.data.vehicules ?? []);
        setChauffeurs(dj.data.chauffeurs ?? []);
      }
    }).finally(() => setChargement(false));
  }, [id]);

  function toggleVehicule(v: VehiculeDisponible) {
    const dejaDansContrat = !!contrats[v._id];
    if (!dejaDansContrat && v.statut !== 'disponible') return;
    setContrats((prev) => {
      if (prev[v._id]) { const next = { ...prev }; delete next[v._id]; return next; }
      return { ...prev, [v._id]: { vehiculeId: v._id, prixParJour: String(v.prixParJour), prixParHeure: v.prixParHeure ? String(v.prixParHeure) : '', avecChauffeur: false, chauffeurId: '' } };
    });
  }

  function updateContrat(vehiculeId: string, champ: keyof LigneContrat, valeur: string | boolean) {
    setContrats((prev) => {
      const ligne = { ...prev[vehiculeId], [champ]: valeur };
      if (champ === 'avecChauffeur' && valeur === false) ligne.chauffeurId = '';
      return { ...prev, [vehiculeId]: ligne };
    });
  }

  async function sauvegarder() {
    setErreur(''); setSucces('');
    const contratsValides = Object.values(contrats).filter((c) => Number(c.prixParJour) > 0);
    setEnvoi(true);
    try {
      const res = await fetch(`/api/gerant/business/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrats: contratsValides.map((c) => ({
            vehicule: c.vehiculeId, prixParJour: Number(c.prixParJour),
            prixParHeure: c.prixParHeure ? Number(c.prixParHeure) : null,
            avecChauffeur: c.avecChauffeur,
            chauffeur: c.chauffeurId || null,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      setSucces('Contrat mis à jour avec succès.');
    } catch { setErreur('Impossible de contacter le serveur'); }
    finally { setEnvoi(false); }
  }

  if (chargement) return <div className="container"><LoaderVoiture /></div>;
  if (!client) return <div className="container"><div className="erreur">Client introuvable</div></div>;

  const nbSelectionnes = Object.keys(contrats).length;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/gerant/business" style={{ color: 'var(--gris)', textDecoration: 'none', fontSize: '0.875rem' }}>← Clients Corporate</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0 }}>
            {client.nom[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: '0 0 2px' }}>{client.nom}</h1>
            <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>{client.email} · {client.telephone}</p>
          </div>
        </div>
      </div>

      {succes && <div className="succes">{succes}</div>}
      {erreur && <div className="erreur">{erreur}</div>}

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Véhicules & chauffeurs du contrat</h2>
          {nbSelectionnes > 0 && (
            <span style={{ background: '#DBEAFE', color: '#1B3B8A', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              {nbSelectionnes} véhicule{nbSelectionnes > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tousVehicules.map((v) => {
            const selectionne = !!contrats[v._id];
            const c = contrats[v._id];
            const disponible = v.statut === 'disponible';
            const peutCliquer = disponible || selectionne;
            const badge = BADGE_STATUT[v.statut];

            return (
              <div key={v._id} style={{ border: `2px solid ${selectionne ? '#1B3B8A' : disponible ? '#E5E7EB' : '#F3F4F6'}`, borderRadius: '12px', overflow: 'hidden', opacity: peutCliquer ? 1 : 0.5, transition: 'border-color 0.2s' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: peutCliquer ? 'pointer' : 'not-allowed', background: selectionne ? 'rgba(27,59,138,0.04)' : 'white' }}
                  onClick={() => toggleVehicule(v)}
                >
                  {v.photos?.[0] && <img src={v.photos[0]} alt="" style={{ width: '60px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9rem' }}>{v.marque} {v.modele} {v.annee}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gris)' }}>Standard : {v.prixParJour.toLocaleString()} FCFA/jour{v.prixParHeure ? ` · ${v.prixParHeure.toLocaleString()} FCFA/h` : ''}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: badge.bg, color: badge.color, marginRight: '8px', flexShrink: 0 }}>
                    {badge.label}
                  </span>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${selectionne ? '#1B3B8A' : '#D1D5DB'}`, background: selectionne ? '#1B3B8A' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {selectionne && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>

                {selectionne && (
                  <div style={{ padding: '12px 16px 14px', background: 'rgba(27,59,138,0.03)', borderTop: '1px solid rgba(27,59,138,0.1)' }}>
                    {!disponible && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#92400E', background: '#FEF3C7', padding: '6px 10px', borderRadius: '6px' }}>
                        Ce véhicule est actuellement {v.statut === 'loue' ? 'loué' : 'en maintenance'}. Il reste au contrat mais le client ne peut pas l'utiliser tant qu'il est indisponible.
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem' }}>Prix/jour (FCFA) *</label>
                        <input type="number" min="0" value={c.prixParJour} onChange={(e) => updateContrat(v._id, 'prixParJour', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.875rem' }} />
                      </div>
                      {v.prixParHeure && (
                        <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                          <label style={{ fontSize: '0.78rem' }}>Prix/heure (FCFA)</label>
                          <input type="number" min="0" value={c.prixParHeure} onChange={(e) => updateContrat(v._id, 'prixParHeure', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.875rem' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brun)' }}>Chauffeur au contrat</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {([{ val: false, label: 'Non' }, { val: true, label: 'Oui' }] as { val: boolean; label: string }[]).map(({ val, label }) => (
                            <button key={String(val)} type="button" onClick={() => updateContrat(v._id, 'avecChauffeur', val)}
                              style={{ flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', border: c.avecChauffeur === val ? '2px solid #1B3B8A' : '2px solid #E5E7EB', background: c.avecChauffeur === val ? 'rgba(27,59,138,0.07)' : '#FAFAFA', fontWeight: 600, fontSize: '0.8rem', color: c.avecChauffeur === val ? '#1B3B8A' : 'var(--gris)' }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {c.avecChauffeur && (
                        <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                          <label style={{ fontSize: '0.78rem' }}>Chauffeur assigné</label>
                          <select value={c.chauffeurId} onChange={(e) => updateContrat(v._id, 'chauffeurId', e.target.value)} style={{ padding: '8px 12px', fontSize: '0.875rem', width: '100%' }}>
                            <option value="">— Aucun (assigner plus tard) —</option>
                            {chauffeurs.map((ch) => (
                              <option key={ch._id} value={ch._id} disabled={ch.estOccupe}>
                                {ch.nom}{ch.estOccupe ? ' (en mission)' : ch.aReservationAVenir ? ' (mission à venir)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Link href="/gerant/business" style={{ padding: '11px 24px', borderRadius: '10px', border: '1.5px solid #E5E7EB', color: 'var(--gris)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          Annuler
        </Link>
        <button className="btn" onClick={sauvegarder} disabled={envoi}>
          {envoi ? 'Sauvegarde...' : 'Sauvegarder le contrat'}
        </button>
      </div>
    </div>
  );
}
