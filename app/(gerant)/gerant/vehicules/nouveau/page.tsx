'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PageNouveauVehicule() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [vehiculeId, setVehiculeId] = useState<string | null>(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);

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
      prixParHeure: form.get('prixParHeure') ? parseFloat(form.get('prixParHeure') as string) : null,
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
    } catch {
      alert('Erreur upload');
    } finally {
      setUploadEnCours(false);
      e.target.value = '';
    }
  }

  async function supprimerPhoto(url: string) {
    if (!vehiculeId) return;
    const res = await fetch(`/api/vehicules/${vehiculeId}/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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
            Véhicule créé. Ajoutez jusqu'à 8 photos (optionnel).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {photos.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                <button onClick={() => supprimerPhoto(url)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>

          {photos.length < 8 && (
            <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px' }}>
              {uploadEnCours ? 'Upload en cours...' : '+ Ajouter une photo'}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} disabled={uploadEnCours} />
            </label>
          )}

          <button onClick={() => router.push('/gerant/vehicules')} className="btn">
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Nouveau véhicule</h1>

        {erreur && <div className="erreur">{erreur}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Marque</label>
              <input name="marque" required placeholder="Toyota" />
            </div>
            <div className="form-group">
              <label>Modèle</label>
              <input name="modele" required placeholder="Corolla" />
            </div>
            <div className="form-group">
              <label>Année</label>
              <input name="annee" type="number" required min="1990" max={new Date().getFullYear() + 1} placeholder="2020" />
            </div>
            <div className="form-group">
              <label>Couleur</label>
              <input name="couleur" required placeholder="Blanc" />
            </div>
            <div className="form-group">
              <label>Ville</label>
              <select name="ville" required>
                <option value="brazzaville">Brazzaville</option>
                <option value="pointe-noire">Pointe-Noire</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prix / jour (FCFA)</label>
              <input name="prixParJour" type="number" required min="0" placeholder="25000" />
            </div>
            <div className="form-group">
              <label>Prix / heure (FCFA) <span style={{ fontWeight: 400, color: 'var(--gris)' }}>— optionnel</span></label>
              <input name="prixParHeure" type="number" min="0" placeholder="10000" />
            </div>
            <div className="form-group">
              <label>Kilométrage</label>
              <input name="kilometrage" type="number" required min="0" placeholder="50000" />
            </div>
            <div className="form-group">
              <label>Carburant</label>
              <select name="carburant" required>
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="electrique">Électrique</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select name="transmission" required>
                <option value="manuelle">Manuelle</option>
                <option value="automatique">Automatique</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nombre de places</label>
              <input name="nombrePlaces" type="number" required min="1" max="20" placeholder="5" />
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select name="statut">
                <option value="disponible">Disponible</option>
                <option value="loue">Loué</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={3} placeholder="Description du véhicule..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/gerant/vehicules" style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, textAlign: 'center', textDecoration: 'none', color: '#374151' }}>
              Annuler
            </Link>
            <button type="submit" className="btn" style={{ flex: 2 }} disabled={chargement}>
              {chargement ? 'Création...' : 'Créer le véhicule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
