'use client';

import { useEffect, useState } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarPublique from '@/app/components/NavbarPublique';
import { CHAUFFEUR_JOUR, CHAUFFEUR_NUIT, tarifChauffeur } from '@/lib/tarifs';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number; couleur: string; ville: string;
  prixParJour: number; prixParHeure?: number;
  chauffeurDisponible?: boolean; prixChauffeurParJour?: number;
  kilometrage: number; carburant: string; transmission: string;
  nombrePlaces: number; description: string; photos: string[];
}

interface PlageOccupee { debut: string; fin: string; }

export default function PageDetailPublic() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [chargement, setChargement] = useState(true);
  const [photoActive, setPhotoActive] = useState(0);
  const [plages, setPlages] = useState<PlageOccupee[]>([]);

  // Formulaire réservation
  const [typeLocation, setTypeLocation] = useState<'jour' | 'heure'>('jour');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [nombreHeures, setNombreHeures] = useState(1);
  const [avecChauffeur, setAvecChauffeur] = useState(false);
  const [plagesChauffeur, setPlagesChauffeur] = useState<Set<'jour' | 'nuit'>>(new Set<'jour' | 'nuit'>(['jour']));
  const [message, setMessage] = useState('');
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [erreurForm, setErreurForm] = useState('');
  const [soumission, setSoumission] = useState(false);

  // Permis de conduire
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permisRecto, setPermisRecto] = useState<string | null>(null);
  const [permisVerso, setPermisVerso] = useState<string | null>(null);
  const [uploadPermisEnCours, setUploadPermisEnCours] = useState<'recto' | 'verso' | null>(null);

  const aujourd_hui = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicules/${id}`).then((r) => r.json()),
      fetch(`/api/vehicules/${id}/disponibilite`).then((r) => r.json()),
      fetch('/api/auth/moi').then((r) => r.json()),
    ]).then(([vj, dj, mj]) => {
      if (vj.success) setVehicule(vj.data);
      if (dj.success) setPlages(dj.data);
      if (mj.success) {
        setUserRole(mj.data.role);
        setPermisRecto(mj.data.permisRecto ?? null);
        setPermisVerso(mj.data.permisVerso ?? null);
      }
    }).finally(() => setChargement(false));
  }, [id]);

  async function handleUploadPermis(e: React.ChangeEvent<HTMLInputElement>, side: 'recto' | 'verso') {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setUploadPermisEnCours(side);
    const form = new FormData();
    form.append('photo', fichier);
    form.append('side', side);
    try {
      const res = await fetch('/api/upload/permis', { method: 'POST', body: form });
      const json = await res.json();
      if (json.success) {
        setPermisRecto(json.data.permisRecto);
        setPermisVerso(json.data.permisVerso);
      } else {
        alert(json.message);
      }
    } catch { alert('Erreur upload'); }
    finally { setUploadPermisEnCours(null); e.target.value = ''; }
  }

  function estDateOccupee(date: string): boolean {
    const d = new Date(date);
    return plages.some((p) => d >= new Date(p.debut) && d <= new Date(p.fin));
  }

  function calculerJours(): number {
    if (!dateDebut || !dateFin) return 0;
    const ms = new Date(dateFin).getTime() - new Date(dateDebut).getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  async function handleReserver() {
    setErreurForm('');
    if (!dateDebut) { setErreurForm('Sélectionnez une date'); return; }
    if (typeLocation === 'jour' && !dateFin) { setErreurForm('Sélectionnez la date de fin'); return; }
    if (typeLocation === 'jour' && calculerJours() < 1) { setErreurForm('La date de fin doit être après la date de début'); return; }

    setSoumission(true);
    try {
      const body = typeLocation === 'heure'
        ? { vehiculeId: id, typeLocation: 'heure', dateDebut, nombreHeures, avecChauffeur, messageClient: message }
        : { vehiculeId: id, typeLocation: 'jour', dateDebut, dateFin, avecChauffeur, messageClient: message };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (res.status === 401) {
        // Non connecté → redirect vers connexion avec retour
        router.push(`/connexion?retour=/vehicules/${id}`);
        return;
      }
      if (!res.ok) { setErreurForm(json.message || 'Erreur'); return; }

      router.push('/client/reservations?succes=1');
    } catch {
      setErreurForm('Impossible de contacter le serveur');
    } finally {
      setSoumission(false);
    }
  }

  if (chargement) return <div className="container"><LoaderVoiture /></div>;
  if (!vehicule) return <div className="container"><div className="erreur">Véhicule introuvable</div></div>;

  const jours = calculerJours();

  // Tarif chauffeur selon les plages sélectionnées
  const tarifChauffeurParPeriode =
    (plagesChauffeur.has('jour') ? CHAUFFEUR_JOUR : 0) +
    (plagesChauffeur.has('nuit') ? CHAUFFEUR_NUIT : 0);
  const labelTarifChauffeur = [
    plagesChauffeur.has('jour') && `Jour (7h–21h) : ${CHAUFFEUR_JOUR.toLocaleString()} FCFA`,
    plagesChauffeur.has('nuit') && `Nuit (21h–6h) : ${CHAUFFEUR_NUIT.toLocaleString()} FCFA`,
  ].filter(Boolean).join(' + ');

  const prixBaseChauffeur = avecChauffeur
    ? jours > 0
      ? jours * tarifChauffeurParPeriode
      : tarifChauffeurParPeriode
    : 0;
  const prixTotal = typeLocation === 'heure'
    ? nombreHeures * (vehicule.prixParHeure ?? 0) + prixBaseChauffeur
    : jours * vehicule.prixParJour + prixBaseChauffeur;

  const infos = [
    { label: 'Ville', val: vehicule.ville === 'pointe-noire' ? 'Pointe-Noire' : 'Brazzaville' },
    { label: 'Année', val: vehicule.annee },
    { label: 'Couleur', val: vehicule.couleur },
    { label: 'Carburant', val: vehicule.carburant },
    { label: 'Transmission', val: vehicule.transmission },
    { label: 'Places', val: vehicule.nombrePlaces },
    { label: 'Kilométrage', val: `${vehicule.kilometrage.toLocaleString()} km` },
  ];

  return (
    <>
    <NavbarPublique />
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <Link href="/vehicules" style={{ color: 'var(--gris)', textDecoration: 'none', fontSize: '0.9rem' }}>← Retour au catalogue</Link>
      </div>

      {/* Fiche véhicule */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
        {vehicule.photos.length > 0 ? (
          <div>
            <img src={vehicule.photos[photoActive]} alt="" style={{ width: '100%', height: '340px', objectFit: 'cover' }} />
            {vehicule.photos.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
                {vehicule.photos.map((url, i) => (
                  <img key={url} src={url} alt="" onClick={() => setPhotoActive(i)} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, opacity: i === photoActive ? 1 : 0.5, border: i === photoActive ? '2px solid #1B3B8A' : 'none' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '240px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Pas de photo</div>
        )}
        <div style={{ padding: '24px' }}>
          <h1 style={{ margin: '0 0 16px' }}>{vehicule.marque} {vehicule.modele}</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {infos.map(({ label, val }) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{val}</div>
              </div>
            ))}
          </div>
          {vehicule.description && <p style={{ color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{vehicule.description}</p>}
        </div>
      </div>

      {/* Formulaire réservation */}
      <div className="card">

        {/* Prix + toggle en haut */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--orange)' }}>{vehicule.prixParJour.toLocaleString()} FCFA</span>
              <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}> /jour</span>
            </div>
            {vehicule.prixParHeure && (
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--vert)' }}>{vehicule.prixParHeure.toLocaleString()} FCFA</span>
                <span style={{ color: 'var(--gris)', fontSize: '0.8rem' }}> /heure</span>
              </div>
            )}
          </div>
          {vehicule.prixParHeure && (
            <div style={{ display: 'flex', background: 'var(--gris-light)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
              {(['jour', 'heure'] as const).map((t) => (
                <button key={t} onClick={() => { setTypeLocation(t); setDateDebut(''); setDateFin(''); }}
                  style={{
                    padding: '7px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                    background: typeLocation === t ? 'white' : 'transparent',
                    color: typeLocation === t ? 'var(--orange)' : 'var(--gris)',
                    boxShadow: typeLocation === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}>
                  Par {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {erreurForm && <div className="erreur">{erreurForm}</div>}

        {/* Champs en ligne : dates + chauffeur */}
        <div className="resa-form-row">
          {typeLocation === 'jour' ? (
            <>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label>Date de début</label>
                <input type="date" min={aujourd_hui} value={dateDebut}
                  onChange={(e) => { setDateDebut(e.target.value); setDateFin(''); }} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '160px' }}>
                <label>Date de fin</label>
                <input type="date" min={dateDebut || aujourd_hui} value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)} disabled={!dateDebut} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
                <label>Date et heure de début</label>
                <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label>Nombre d'heures</label>
                <select value={nombreHeures} onChange={(e) => setNombreHeures(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,10,12,24].map((h) => (
                    <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Chauffeur */}
          <div className="form-group" style={{ minWidth: '200px' }}>
            <label>Chauffeur</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {([
                { val: false, label: 'Sans' },
                { val: true,  label: 'Avec' },
              ] as { val: boolean; label: string }[]).map(({ val, label }) => (
                <button key={String(val)} onClick={() => { setAvecChauffeur(val); }}
                  style={{
                    padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                    border: avecChauffeur === val ? '2px solid #1B3B8A' : '2px solid #E5E7EB',
                    background: avecChauffeur === val ? 'rgba(27,59,138,0.07)' : '#FAFAFA',
                    fontWeight: 600, fontSize: '0.825rem',
                    color: avecChauffeur === val ? '#1B3B8A' : 'var(--gris)',
                    transition: 'all 0.2s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Sélecteur plage horaire — visible uniquement avec chauffeur */}
            {avecChauffeur && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brun)', margin: '0 0 6px' }}>Plage horaire</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {([
                    { val: 'jour' as const, label: 'Jour', sous: `7h–21h · ${CHAUFFEUR_JOUR.toLocaleString()} FCFA` },
                    { val: 'nuit' as const, label: 'Nuit', sous: `21h–6h · ${CHAUFFEUR_NUIT.toLocaleString()} FCFA` },
                  ]).map(({ val, label, sous }) => {
                    const actif = plagesChauffeur.has(val);
                    return (
                      <button key={val} type="button" onClick={() => {
                        setPlagesChauffeur((prev) => {
                          const next = new Set(prev);
                          if (next.has(val) && next.size > 1) next.delete(val);
                          else next.add(val);
                          return next;
                        });
                      }}
                        style={{
                          padding: '8px 6px', borderRadius: '8px', cursor: 'pointer',
                          border: actif ? '2px solid #1B3B8A' : '2px solid #E5E7EB',
                          background: actif ? 'rgba(27,59,138,0.07)' : '#FAFAFA',
                          fontWeight: 600, fontSize: '0.8rem', textAlign: 'center',
                          color: actif ? '#1B3B8A' : 'var(--gris)',
                          transition: 'all 0.2s',
                        }}>
                        <div>{label}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: '2px' }}>{sous}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Récap prix */}
        {prixTotal > 0 && (
          <div style={{ background: 'rgba(27,59,138,0.04)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', border: '1px solid rgba(27,59,138,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: avecChauffeur && prixBaseChauffeur > 0 ? '6px' : 0 }}>
              <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>
                {typeLocation === 'heure'
                  ? `${nombreHeures} heure${nombreHeures > 1 ? 's' : ''} × ${vehicule.prixParHeure!.toLocaleString()} FCFA`
                  : `${jours} jour${jours > 1 ? 's' : ''} × ${vehicule.prixParJour.toLocaleString()} FCFA`}
              </span>
              <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>
                {typeLocation === 'heure'
                  ? (nombreHeures * (vehicule.prixParHeure ?? 0)).toLocaleString()
                  : (jours * vehicule.prixParJour).toLocaleString()} FCFA
              </span>
            </div>
            {avecChauffeur && prixBaseChauffeur > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>
                  Chauffeur — {typeLocation === 'jour'
                    ? `${jours} jour${jours > 1 ? 's' : ''} × ${CHAUFFEUR_JOUR.toLocaleString()} FCFA`
                    : labelTarifChauffeur}
                </span>
                <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>{prixBaseChauffeur.toLocaleString()} FCFA</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(27,59,138,0.1)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--orange)' }}>{prixTotal.toLocaleString()} FCFA</span>
            </div>
          </div>
        )}

        {/* Permis de conduire — obligatoire si sans chauffeur et rôle client */}
        {userRole === 'client' && !avecChauffeur && (
          <div style={{ marginBottom: '16px', padding: '14px 16px', background: (!permisRecto || !permisVerso) ? '#fef9c3' : '#f0fdf4', border: `1.5px solid ${(!permisRecto || !permisVerso) ? '#fde68a' : '#86efac'}`, borderRadius: '10px' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.875rem', color: (!permisRecto || !permisVerso) ? '#92400e' : '#166534' }}>
              {(!permisRecto || !permisVerso) ? '⚠ Permis de conduire requis pour réserver sans chauffeur' : '✓ Permis de conduire enregistré'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(['recto', 'verso'] as const).map((side) => {
                const url = side === 'recto' ? permisRecto : permisVerso;
                const enCours = uploadPermisEnCours === side;
                return (
                  <div key={side}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{side}</p>
                    {url ? (
                      <div style={{ position: 'relative' }}>
                        <img src={url} alt={`Permis ${side}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #86efac' }} />
                        <label style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                          Changer
                          <input type="file" accept="image/*" onChange={(e) => handleUploadPermis(e, side)} style={{ display: 'none' }} disabled={!!uploadPermisEnCours} />
                        </label>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', border: '2px dashed #fde68a', borderRadius: '8px', cursor: enCours ? 'wait' : 'pointer', background: '#fffbeb', gap: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{enCours ? '⏳' : '📷'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>{enCours ? 'Upload...' : `Ajouter ${side}`}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleUploadPermis(e, side)} style={{ display: 'none' }} disabled={!!uploadPermisEnCours} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message + bouton */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Message (optionnel)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
              placeholder="Informations supplémentaires..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cguAcceptees}
                onChange={(e) => setCguAcceptees(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#1B3B8A', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--gris)', lineHeight: 1.5 }}>
                J'accepte les{' '}
                <a href="/conditions-generales" target="_blank" style={{ color: '#1B3B8A', fontWeight: 600, textDecoration: 'underline' }}>
                  conditions générales d'utilisation
                </a>
              </span>
            </label>
            <button className="btn" onClick={handleReserver}
              disabled={soumission || !dateDebut || (typeLocation === 'jour' && !dateFin) || !cguAcceptees || (userRole === 'client' && !avecChauffeur && (!permisRecto || !permisVerso))}
              style={{ width: '100%' }}>
              {soumission ? 'Traitement...' : 'Réserver ce véhicule'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
              Une connexion est requise pour confirmer
            </p>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
