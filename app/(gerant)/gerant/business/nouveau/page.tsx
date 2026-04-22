'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VehiculeDisponible {
  _id: string; marque: string; modele: string; annee: number; prixParJour: number; prixParHeure?: number; photos: string[];
}
interface LigneContrat {
  vehiculeId: string;
  prixParJour: string;
  prixParHeure: string;
  avecChauffeur: boolean;
}

export default function PageNouveauCorporate() {
  const router = useRouter();
  const [vehicules, setVehicules] = useState<VehiculeDisponible[]>([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [contrats, setContrats] = useState<Record<string, LigneContrat>>({});

  useEffect(() => {
    fetch('/api/vehicules?limite=50').then((r) => r.json())
      .then((j) => { if (j.success) setVehicules(j.data.vehicules ?? j.data); })
      .finally(() => setChargement(false));
  }, []);

  function toggleVehicule(v: VehiculeDisponible) {
    setContrats((prev) => {
      if (prev[v._id]) {
        const next = { ...prev };
        delete next[v._id];
        return next;
      }
      return { ...prev, [v._id]: { vehiculeId: v._id, prixParJour: String(v.prixParJour), prixParHeure: v.prixParHeure ? String(v.prixParHeure) : '', avecChauffeur: false } };
    });
  }

  function updateContrat(vehiculeId: string, champ: keyof LigneContrat, valeur: string | boolean) {
    setContrats((prev) => ({ ...prev, [vehiculeId]: { ...prev[vehiculeId], [champ]: valeur } }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    const form = new FormData(e.currentTarget);

    const contratsValides = Object.values(contrats).filter((c) => Number(c.prixParJour) > 0);
    if (contratsValides.length === 0) { setErreur('Sélectionnez au moins un véhicule et renseignez son tarif.'); return; }

    setEnvoi(true);
    try {
      const res = await fetch('/api/gerant/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom:        form.get('nom'),
          email:      form.get('email'),
          telephone:  form.get('telephone'),
          motDePasse: form.get('motDePasse'),
          contrats: contratsValides.map((c) => ({
            vehicule:      c.vehiculeId,
            prixParJour:   Number(c.prixParJour),
            prixParHeure:  c.prixParHeure ? Number(c.prixParHeure) : null,
            avecChauffeur: c.avecChauffeur,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      router.push('/gerant/business');
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setEnvoi(false);
    }
  }

  const nbSelectionnes = Object.keys(contrats).length;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/gerant/business" style={{ color: 'var(--gris)', textDecoration: 'none', fontSize: '0.875rem' }}>← Clients Corporate</Link>
        <h1 style={{ margin: '12px 0 4px' }}>Nouveau client corporate</h1>
        <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>Créez le compte et définissez les véhicules et tarifs négociés.</p>
      </div>

      {erreur && <div className="erreur">{erreur}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Infos client */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>Informations du compte</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Nom / Raison sociale</label>
              <input name="nom" required placeholder="Entreprise SARL" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" required placeholder="contact@entreprise.cg" />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input name="telephone" required placeholder="+242 06 xxx xxxx" />
            </div>
            <div className="form-group">
              <label>Mot de passe provisoire</label>
              <input name="motDePasse" type="password" required minLength={8} placeholder="Min 8 caractères" />
            </div>
          </div>
        </div>

        {/* Sélection véhicules */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Véhicules & tarifs négociés</h2>
            {nbSelectionnes > 0 && (
              <span style={{ background: '#DBEAFE', color: '#1B3B8A', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {nbSelectionnes} véhicule{nbSelectionnes > 1 ? 's' : ''} sélectionné{nbSelectionnes > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {chargement && <p style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>Chargement des véhicules...</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vehicules.map((v) => {
              const selectionne = !!contrats[v._id];
              const c = contrats[v._id];
              return (
                <div key={v._id} style={{ border: `2px solid ${selectionne ? '#1B3B8A' : '#E5E7EB'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {/* En-tête véhicule */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', background: selectionne ? 'rgba(27,59,138,0.04)' : 'white' }} onClick={() => toggleVehicule(v)}>
                    {v.photos?.[0] && <img src={v.photos[0]} alt="" style={{ width: '60px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9rem' }}>{v.marque} {v.modele} {v.annee}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gris)' }}>
                        Tarif standard : {v.prixParJour.toLocaleString()} FCFA/jour
                        {v.prixParHeure ? ` · ${v.prixParHeure.toLocaleString()} FCFA/h` : ''}
                      </p>
                    </div>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${selectionne ? '#1B3B8A' : '#D1D5DB'}`, background: selectionne ? '#1B3B8A' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                      {selectionne && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>

                  {/* Champs tarifs — visible seulement si sélectionné */}
                  {selectionne && (
                    <div style={{ padding: '12px 16px 14px', background: 'rgba(27,59,138,0.03)', borderTop: '1px solid rgba(27,59,138,0.1)' }}>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                          <label style={{ fontSize: '0.78rem' }}>Prix/jour négocié (FCFA) *</label>
                          <input type="number" min="0" required value={c.prixParJour} onChange={(e) => updateContrat(v._id, 'prixParJour', e.target.value)} placeholder="ex : 45000" style={{ padding: '8px 12px', fontSize: '0.875rem' }} />
                        </div>
                        {v.prixParHeure && (
                          <div className="form-group" style={{ flex: 1, minWidth: '140px', marginBottom: 0 }}>
                            <label style={{ fontSize: '0.78rem' }}>Prix/heure négocié (FCFA)</label>
                            <input type="number" min="0" value={c.prixParHeure} onChange={(e) => updateContrat(v._id, 'prixParHeure', e.target.value)} placeholder="ex : 8000" style={{ padding: '8px 12px', fontSize: '0.875rem' }} />
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '150px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--brun)' }}>Chauffeur inclus au contrat</label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {([{ val: false, label: 'Non' }, { val: true, label: 'Oui' }] as { val: boolean; label: string }[]).map(({ val, label }) => (
                              <button key={String(val)} type="button" onClick={() => updateContrat(v._id, 'avecChauffeur', val)}
                                style={{ flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', border: c.avecChauffeur === val ? '2px solid #1B3B8A' : '2px solid #E5E7EB', background: c.avecChauffeur === val ? 'rgba(27,59,138,0.07)' : '#FAFAFA', fontWeight: 600, fontSize: '0.8rem', color: c.avecChauffeur === val ? '#1B3B8A' : 'var(--gris)' }}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
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
          <button type="submit" className="btn" disabled={envoi || nbSelectionnes === 0}>
            {envoi ? 'Création...' : 'Créer le compte corporate'}
          </button>
        </div>
      </form>
    </div>
  );
}
