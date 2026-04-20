'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number; couleur: string;
  prixParJour: number; prixParHeure?: number; kilometrage: number; carburant: string; transmission: string;
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
  const [message, setMessage] = useState('');
  const [erreurForm, setErreurForm] = useState('');
  const [soumission, setSoumission] = useState(false);

  const aujourd_hui = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicules/${id}`).then((r) => r.json()),
      fetch(`/api/vehicules/${id}/disponibilite`).then((r) => r.json()),
    ]).then(([vj, dj]) => {
      if (vj.success) setVehicule(vj.data);
      if (dj.success) setPlages(dj.data);
    }).finally(() => setChargement(false));
  }, [id]);

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
        ? { vehiculeId: id, typeLocation: 'heure', dateDebut, nombreHeures, messageClient: message }
        : { vehiculeId: id, typeLocation: 'jour', dateDebut, dateFin, messageClient: message };

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

  if (chargement) return <div className="container"><p style={{ textAlign: 'center' }}>Chargement...</p></div>;
  if (!vehicule) return <div className="container"><div className="erreur">Véhicule introuvable</div></div>;

  const jours = calculerJours();
  const prixTotal = typeLocation === 'heure'
    ? nombreHeures * (vehicule.prixParHeure ?? 0)
    : jours * vehicule.prixParJour;

  const infos = [
    { label: 'Année', val: vehicule.annee },
    { label: 'Couleur', val: vehicule.couleur },
    { label: 'Carburant', val: vehicule.carburant },
    { label: 'Transmission', val: vehicule.transmission },
    { label: 'Places', val: vehicule.nombrePlaces },
    { label: 'Kilométrage', val: `${vehicule.kilometrage.toLocaleString()} km` },
  ];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Link href="/vehicules" style={{ color: '#6b7280', textDecoration: 'none' }}>← Retour au catalogue</Link>
        <Link href="/connexion" style={{ color: '#1a56db', textDecoration: 'none', fontSize: '0.875rem' }}>Se connecter</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Colonne gauche */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
            {vehicule.photos.length > 0 ? (
              <div>
                <img src={vehicule.photos[photoActive]} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                {vehicule.photos.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
                    {vehicule.photos.map((url, i) => (
                      <img key={url} src={url} alt="" onClick={() => setPhotoActive(i)} style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', opacity: i === photoActive ? 1 : 0.5, border: i === photoActive ? '2px solid #1a56db' : 'none' }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: '240px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Pas de photo</div>
            )}
            <div style={{ padding: '20px' }}>
              <h1 style={{ margin: '0 0 8px' }}>{vehicule.marque} {vehicule.modele}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '16px 0' }}>
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
        </div>

        {/* Colonne droite — formulaire réservation */}
        <div className="card" style={{ position: 'sticky', top: '20px' }}>
          {/* Prix */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--orange)' }}>{vehicule.prixParJour.toLocaleString()} FCFA</span>
              <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}> /jour</span>
            </div>
            {vehicule.prixParHeure && (
              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--vert)' }}>{vehicule.prixParHeure.toLocaleString()} FCFA</span>
                <span style={{ color: 'var(--gris)', fontSize: '0.8rem' }}> /heure</span>
              </div>
            )}
          </div>

          {/* Toggle jour / heure */}
          {vehicule.prixParHeure && (
            <div style={{ display: 'flex', background: 'var(--gris-light)', borderRadius: '10px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
              {(['jour', 'heure'] as const).map((t) => (
                <button key={t} onClick={() => { setTypeLocation(t); setDateDebut(''); setDateFin(''); }}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
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

          {erreurForm && <div className="erreur" style={{ marginBottom: '12px' }}>{erreurForm}</div>}

          {typeLocation === 'jour' ? (
            <>
              <div className="form-group">
                <label>Date de début</label>
                <input type="date" min={aujourd_hui} value={dateDebut}
                  onChange={(e) => { setDateDebut(e.target.value); setDateFin(''); }} />
              </div>
              <div className="form-group">
                <label>Date de fin</label>
                <input type="date" min={dateDebut || aujourd_hui} value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)} disabled={!dateDebut} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Date et heure de début</label>
                <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nombre d'heures</label>
                <select value={nombreHeures} onChange={(e) => setNombreHeures(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,10,12,24].map((h) => (
                    <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {prixTotal > 0 && (
            <div style={{ background: 'rgba(249,115,22,0.06)', borderRadius: '10px', padding: '12px', marginBottom: '16px', border: '1px solid rgba(249,115,22,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>
                  {typeLocation === 'heure'
                    ? `${nombreHeures} heure${nombreHeures > 1 ? 's' : ''} × ${vehicule.prixParHeure!.toLocaleString()} FCFA`
                    : `${jours} jour${jours > 1 ? 's' : ''} × ${vehicule.prixParJour.toLocaleString()} FCFA`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--orange)' }}>{prixTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Message (optionnel)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Informations supplémentaires..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }} />
          </div>

          <button className="btn" style={{ width: '100%' }} onClick={handleReserver} disabled={soumission || !dateDebut || !dateFin}>
            {soumission ? 'Traitement...' : 'Réserver ce véhicule'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '12px' }}>
            Une connexion est requise pour confirmer
          </p>
        </div>
      </div>
    </div>
  );
}
