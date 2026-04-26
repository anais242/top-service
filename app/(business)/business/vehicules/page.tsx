'use client';

import { useEffect, useState } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import { useRouter } from 'next/navigation';
import NavbarBusiness from '@/app/components/NavbarBusiness';
import { CHAUFFEUR_JOUR, CHAUFFEUR_NUIT, tarifChauffeur } from '@/lib/tarifs';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number; couleur: string; ville: string;
  kilometrage: number; carburant: string; transmission: string; nombrePlaces: number;
  description: string; photos: string[];
}
interface Contrat {
  _id: string;
  vehicule: Vehicule;
  prixParJour: number;
  prixParHeure?: number | null;
  avecChauffeur: boolean;
}

export default function PageVehiculesBusiness() {
  const router = useRouter();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [chargement, setChargement] = useState(true);
  const [selectionne, setSelectionne] = useState<Contrat | null>(null);

  // Formulaire réservation
  const [typeLocation, setTypeLocation] = useState<'jour' | 'heure'>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [nombreHeures, setNombreHeures] = useState(1);
  const [avecChauffeur, setAvecChauffeur] = useState(false);
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [soumission, setSoumission] = useState(false);

  const aujourd_hui = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/business/vehicules').then((r) => r.json())
      .then((j) => { if (j.success) setContrats(j.data); })
      .finally(() => setChargement(false));
  }, []);

  function ouvrirReservation(c: Contrat) {
    setSelectionne(c);
    setTypeLocation('jour');
    setDateDebut(''); setDateFin('');
    setNombreHeures(1); setAvecChauffeur(false);
    setCguAcceptees(false); setMessage(''); setErreur('');
  }

  function calculerJours() {
    if (!dateDebut || !dateFin) return 0;
    return Math.max(0, Math.ceil((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86400000));
  }

  function calculerPrix() {
    if (!selectionne) return 0;
    const jours = calculerJours();
    const heureDebut = dateDebut ? new Date(dateDebut).getHours() : 8;
    const prixVehicule = typeLocation === 'heure'
      ? nombreHeures * (selectionne.prixParHeure ?? 0)
      : jours * selectionne.prixParJour;
    const prixChauffeur = avecChauffeur
      ? typeLocation === 'heure' ? tarifChauffeur(heureDebut) : jours * CHAUFFEUR_JOUR
      : 0;
    return prixVehicule + prixChauffeur;
  }

  async function handleReserver() {
    if (!selectionne) return;
    setErreur('');
    if (!dateDebut) { setErreur('Sélectionnez une date'); return; }
    if (typeLocation === 'jour' && !dateFin) { setErreur('Sélectionnez la date de fin'); return; }
    if (typeLocation === 'jour' && calculerJours() < 1) { setErreur('La date de fin doit être après la date de début'); return; }

    setSoumission(true);
    try {
      const body = typeLocation === 'heure'
        ? { vehiculeId: selectionne.vehicule._id, typeLocation: 'heure', dateDebut, nombreHeures, avecChauffeur, messageClient: message }
        : { vehiculeId: selectionne.vehicule._id, typeLocation: 'jour', dateDebut, dateFin, avecChauffeur, messageClient: message };

      const res = await fetch('/api/reservations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      router.push('/business/reservations?succes=1');
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setSoumission(false);
    }
  }

  const jours = calculerJours();
  const prixTotal = calculerPrix();
  const heureDebut = dateDebut ? new Date(dateDebut).getHours() : 8;

  return (
    <>
      <NavbarBusiness />
      <div className="container">
        <h1 style={{ marginBottom: '8px' }}>Mes véhicules</h1>
        <p style={{ color: 'var(--gris)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Flotte dédiée à vos conditions négociées
        </p>

        {chargement && <LoaderVoiture />}

        {!chargement && contrats.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
            <p style={{ fontWeight: 600 }}>Aucun véhicule attribué pour l'instant</p>
            <p style={{ fontSize: '0.875rem' }}>Contactez votre gestionnaire de compte.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {contrats.map((c) => {
            const v = c.vehicule;
            return (
              <div key={c._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {v.photos?.[0] ? (
                  <img src={v.photos[0]} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '190px', background: 'var(--gris-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gris)', fontSize: '0.875rem' }}>Pas de photo</div>
                )}
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{v.marque} {v.modele} {v.annee}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#1B3B8A', background: '#DBEAFE', padding: '2px 8px', borderRadius: '20px' }}>Corporate</span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: 'var(--gris)' }}>
                    {v.carburant} · {v.transmission} · {v.nombrePlaces} places · {v.ville === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville'}
                  </p>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B3B8A' }}>
                      {c.prixParJour.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--gris)' }}>FCFA/jour</span>
                    </div>
                    {c.prixParHeure && (
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--vert)' }}>
                        {c.prixParHeure.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--gris)' }}>FCFA/heure</span>
                      </div>
                    )}
                    {c.avecChauffeur && (
                      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--vert)', fontWeight: 600 }}>✓ Chauffeur disponible</div>
                    )}
                  </div>
                  <button className="btn" style={{ width: '100%', padding: '10px' }} onClick={() => ouvrirReservation(c)}>
                    Réserver
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modale réservation */}
        {selectionne && (
          <>
            <div onClick={() => setSelectionne(null)} style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(13,27,62,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 300, width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 16px 60px rgba(13,27,62,0.3)', animation: 'slideUp 0.25s ease', margin: '0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>
                    {selectionne.vehicule.marque} {selectionne.vehicule.modele}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>Tarif négocié · Corporate</p>
                </div>
                <button onClick={() => setSelectionne(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gris)', fontSize: '1.4rem', lineHeight: 1, padding: '4px' }}>×</button>
              </div>

              {/* Prix + toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1B3B8A' }}>{selectionne.prixParJour.toLocaleString()} FCFA</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gris)' }}> /jour</span>
                  {selectionne.prixParHeure && (
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--vert)' }}>
                      {selectionne.prixParHeure.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--gris)' }}>FCFA/h</span>
                    </span>
                  )}
                </div>
                {selectionne.prixParHeure && (
                  <div style={{ display: 'flex', background: 'var(--gris-light)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
                    {(['jour', 'heure'] as const).map((t) => (
                      <button key={t} onClick={() => { setTypeLocation(t); setDateDebut(''); setDateFin(''); }}
                        style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s', background: typeLocation === t ? 'white' : 'transparent', color: typeLocation === t ? 'var(--orange)' : 'var(--gris)', boxShadow: typeLocation === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                        Par {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {erreur && <div className="erreur">{erreur}</div>}

              {/* Dates */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                {typeLocation === 'jour' ? (
                  <>
                    <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                      <label>Date de début</label>
                      <input type="date" min={aujourd_hui} value={dateDebut} onChange={(e) => { setDateDebut(e.target.value); setDateFin(''); }} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                      <label>Date de fin</label>
                      <input type="date" min={dateDebut || aujourd_hui} value={dateFin} onChange={(e) => setDateFin(e.target.value)} disabled={!dateDebut} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group" style={{ flex: 2, minWidth: '180px' }}>
                      <label>Date et heure</label>
                      <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                      <label>Heures</label>
                      <select value={nombreHeures} onChange={(e) => setNombreHeures(Number(e.target.value))}>
                        {[1,2,3,4,5,6,7,8,10,12,24].map((h) => <option key={h} value={h}>{h}h</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Chauffeur */}
              {selectionne.avecChauffeur && (
                <div className="form-group">
                  <label>Chauffeur</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '4px' }}>
                    {([{ val: false, label: 'Sans' }, { val: true, label: 'Avec' }] as { val: boolean; label: string }[]).map(({ val, label }) => (
                      <button key={String(val)} onClick={() => setAvecChauffeur(val)}
                        style={{ padding: '9px', borderRadius: '8px', cursor: 'pointer', border: avecChauffeur === val ? '2px solid #1B3B8A' : '2px solid #E5E7EB', background: avecChauffeur === val ? 'rgba(27,59,138,0.07)' : '#FAFAFA', fontWeight: 600, fontSize: '0.825rem', color: avecChauffeur === val ? '#1B3B8A' : 'var(--gris)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gris)', margin: 0 }}>
                    Jour 7h–21h : <strong>{CHAUFFEUR_JOUR.toLocaleString()} FCFA</strong> · Nuit 21h–6h : <strong>{CHAUFFEUR_NUIT.toLocaleString()} FCFA</strong>
                  </p>
                </div>
              )}

              {/* Récap */}
              {prixTotal > 0 && (
                <div style={{ background: 'rgba(27,59,138,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid rgba(27,59,138,0.1)' }}>
                  {typeLocation === 'jour' && jours > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gris)', marginBottom: '4px' }}>
                      <span>{jours} jour{jours > 1 ? 's' : ''} × {selectionne.prixParJour.toLocaleString()} FCFA</span>
                      <span>{(jours * selectionne.prixParJour).toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {typeLocation === 'heure' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gris)', marginBottom: '4px' }}>
                      <span>{nombreHeures}h × {selectionne.prixParHeure!.toLocaleString()} FCFA</span>
                      <span>{(nombreHeures * selectionne.prixParHeure!).toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {avecChauffeur && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gris)', marginBottom: '4px' }}>
                      <span>Chauffeur ({heureDebut >= 21 || heureDebut < 6 ? 'nuit' : 'jour'})</span>
                      <span>{(typeLocation === 'jour' ? jours * CHAUFFEUR_JOUR : tarifChauffeur(heureDebut)).toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(27,59,138,0.1)', paddingTop: '8px', marginTop: '4px', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--orange)', fontSize: '1.05rem' }}>{prixTotal.toLocaleString()} FCFA</span>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Message (optionnel)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Informations supplémentaires..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.875rem', resize: 'vertical' }} />
              </div>

              {/* CGU */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '14px' }}>
                <input type="checkbox" checked={cguAcceptees} onChange={(e) => setCguAcceptees(e.target.checked)} style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#1B3B8A', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--gris)', lineHeight: 1.5 }}>
                  J'accepte les <a href="/conditions-generales" target="_blank" style={{ color: '#1B3B8A', fontWeight: 600 }}>conditions générales d'utilisation</a>
                </span>
              </label>

              <button className="btn" style={{ width: '100%' }} onClick={handleReserver}
                disabled={soumission || !dateDebut || (typeLocation === 'jour' && !dateFin) || !cguAcceptees}>
                {soumission ? 'Traitement...' : 'Confirmer la réservation'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
