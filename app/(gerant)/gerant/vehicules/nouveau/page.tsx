'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface VehiculeSource {
  marque: string; modele: string; annee: number; couleur: string; ville: string;
  prixParJour: number; prixParHeure?: number;
  chauffeurDisponible?: boolean; prixChauffeurParJour?: number;
  kilometrage: number; carburant: string; transmission: string;
  nombrePlaces: number; description?: string; statut: string;
}

function FormNouveauVehicule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dupliquerDe = searchParams.get('dupliquer');

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [vehiculeId, setVehiculeId] = useState<string | null>(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [source, setSource] = useState<VehiculeSource | null>(null);
  const [chargementSource, setChargementSource] = useState(false);

  useEffect(() => {
    if (!dupliquerDe) return;
    setChargementSource(true);
    fetch(`/api/vehicules/${dupliquerDe}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setSource(j.data); })
      .finally(() => setChargementSource(false));
  }, [dupliquerDe]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    const form = new FormData(e.currentTarget);
    const donnees = {
      marque:       form.get('marque') as string,
      modele:       form.get('modele') as string,
      annee:        parseInt(form.get('annee') as string),
      couleur:      form.get('couleur') as string,
      ville:        form.get('ville') as string,
      prixParJour:  parseFloat(form.get('prixParJour') as string),
      prixParHeure:         form.get('prixParHeure') ? parseFloat(form.get('prixParHeure') as string) : null,
      chauffeurDisponible:  form.get('chauffeurDisponible') === 'on',
      prixChauffeurParJour: form.get('prixChauffeurParJour') ? parseFloat(form.get('prixChauffeurParJour') as string) : null,
      kilometrage:  parseInt(form.get('kilometrage') as string),
      carburant:    form.get('carburant') as string,
      transmission: form.get('transmission') as string,
      nombrePlaces: parseInt(form.get('nombrePlaces') as string),
      description:  form.get('description') as string,
      statut:       form.get('statut') as string,
    };

    try {
      const res = await fetch('/api/vehicules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      setVehiculeId(json.data._id);
      if (json.data.autoAssignes > 0) {
        alert(`✅ Véhicule créé. ${json.data.autoAssignes} réservation${json.data.autoAssignes > 1 ? 's' : ''} en attente ${json.data.autoAssignes > 1 ? 'ont été automatiquement réassignées' : 'a été automatiquement réassignée'} à ce véhicule.`);
      }
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setChargement(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!vehiculeId || !e.target.files?.[0]) return;
    setUploadEnCours(true);
    const form = new FormData();
    form.append('photo', e.target.files[0]);
    try {
      const res = await fetch(`/api/vehicules/${vehiculeId}/photos`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.success) setPhotos(json.data.photos);
      else alert(json.message);
    } catch { alert('Erreur upload'); }
    finally { setUploadEnCours(false); e.target.value = ''; }
  }

  async function supprimerPhoto(url: string) {
    if (!vehiculeId) return;
    const res = await fetch(`/api/vehicules/${vehiculeId}/photos`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (json.success) setPhotos(json.data.photos);
  }

  if (vehiculeId) {
    return (
      <div className="container">
        <div className="card">
          <h1>Photos du véhicule</h1>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px' }}>
            Véhicule {dupliquerDe ? 'dupliqué' : 'créé'}. Ajoutez jusqu'à 8 photos (optionnel).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {photos.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                <button onClick={() => supprimerPhoto(url)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          {photos.length < 8 && (
            <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px' }}>
              {uploadEnCours ? 'Upload en cours...' : '+ Ajouter une photo'}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} disabled={uploadEnCours} />
            </label>
          )}
          <button onClick={() => router.push('/gerant/vehicules')} className="btn">Terminer</button>
        </div>
      </div>
    );
  }

  if (chargementSource) {
    return <div className="container"><p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement...</p></div>;
  }

  const d = source; // raccourci pour les valeurs par défaut

  return (
    <div className="container">
      <div className="card">
        <h1>{dupliquerDe ? `Dupliquer — ${d?.marque ?? ''} ${d?.modele ?? ''}` : 'Nouveau véhicule'}</h1>
        {dupliquerDe && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '16px', padding: '10px 14px', background: 'rgba(27,59,138,0.05)', borderRadius: '8px', border: '1px solid rgba(27,59,138,0.1)' }}>
            Informations pré-remplies depuis le véhicule d'origine. Les photos ne sont pas copiées.
          </p>
        )}

        {erreur && <div className="erreur">{erreur}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Marque</label>
              <input name="marque" required placeholder="Toyota" defaultValue={d?.marque ?? ''} />
            </div>
            <div className="form-group">
              <label>Modèle</label>
              <input name="modele" required placeholder="Corolla" defaultValue={d?.modele ?? ''} />
            </div>
            <div className="form-group">
              <label>Année</label>
              <input name="annee" type="number" required min="1990" max={new Date().getFullYear() + 1} placeholder="2020" defaultValue={d?.annee ?? ''} />
            </div>
            <div className="form-group">
              <label>Couleur</label>
              <input name="couleur" required placeholder="Blanc" defaultValue={d?.couleur ?? ''} />
            </div>
            <div className="form-group">
              <label>Ville</label>
              <select name="ville" required defaultValue={d?.ville ?? 'brazzaville'}>
                <option value="brazzaville">Brazzaville</option>
                <option value="pointe-noire">Pointe-Noire</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prix / jour (FCFA)</label>
              <input name="prixParJour" type="number" required min="0" placeholder="25000" defaultValue={d?.prixParJour ?? ''} />
            </div>
            <div className="form-group">
              <label>Prix / heure (FCFA) <span style={{ fontWeight: 400, color: 'var(--gris)' }}>— optionnel</span></label>
              <input name="prixParHeure" type="number" min="0" placeholder="10000" defaultValue={d?.prixParHeure ?? ''} />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Option chauffeur</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 400 }}>
                <input name="chauffeurDisponible" type="checkbox" defaultChecked={d?.chauffeurDisponible ?? false} />
                Chauffeur disponible pour ce véhicule
              </label>
            </div>
            <div className="form-group">
              <label>Prix chauffeur / jour (FCFA) <span style={{ fontWeight: 400, color: 'var(--gris)' }}>— optionnel</span></label>
              <input name="prixChauffeurParJour" type="number" min="0" placeholder="15000" defaultValue={d?.prixChauffeurParJour ?? ''} />
            </div>
            <div className="form-group">
              <label>Kilométrage</label>
              <input name="kilometrage" type="number" required min="0" placeholder="50000" defaultValue={d?.kilometrage ?? ''} />
            </div>
            <div className="form-group">
              <label>Carburant</label>
              <select name="carburant" required defaultValue={d?.carburant ?? 'essence'}>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="electrique">Électrique</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select name="transmission" required defaultValue={d?.transmission ?? 'manuelle'}>
                <option value="manuelle">Manuelle</option>
                <option value="automatique">Automatique</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nombre de places</label>
              <input name="nombrePlaces" type="number" required min="1" max="20" placeholder="5" defaultValue={d?.nombrePlaces ?? ''} />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select name="statut" defaultValue={d?.statut ?? 'disponible'}>
                <option value="disponible">Disponible</option>
                <option value="loue">Loué</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={3} placeholder="Description du véhicule..." defaultValue={d?.description ?? ''} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/gerant/vehicules" style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, textAlign: 'center', textDecoration: 'none', color: '#374151' }}>
              Annuler
            </Link>
            <button type="submit" className="btn" style={{ flex: 2 }} disabled={chargement}>
              {chargement ? 'Création...' : dupliquerDe ? 'Créer le doublon' : 'Créer le véhicule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PageNouveauVehicule() {
  return (
    <Suspense>
      <FormNouveauVehicule />
    </Suspense>
  );
}
