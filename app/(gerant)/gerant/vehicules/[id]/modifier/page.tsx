'use client';

import { useState, useEffect, FormEvent } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Vehicule {
  _id: string; marque: string; modele: string; annee: number; couleur: string; ville: string;
  prixParJour: number; prixParHeure?: number;
  chauffeurDisponible?: boolean; prixChauffeurParJour?: number;
  kilometrage: number; carburant: string; transmission: string;
  nombrePlaces: number; description: string; statut: string; photos: string[];
}

export default function PageModifierVehicule() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState('');
  const [uploadEnCours, setUploadEnCours] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicules/${id}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setVehicule(j.data); else setErreur(j.message); })
      .catch(() => setErreur('Erreur chargement'))
      .finally(() => setChargement(false));
  }, [id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setSauvegarde(true);
    const form = new FormData(e.currentTarget);
    const donnees = {
      marque: form.get('marque'), modele: form.get('modele'),
      annee: parseInt(form.get('annee') as string),
      couleur: form.get('couleur'),
      ville: form.get('ville'),
      prixParJour: parseFloat(form.get('prixParJour') as string),
      prixParHeure: form.get('prixParHeure') ? parseFloat(form.get('prixParHeure') as string) : null,
      chauffeurDisponible: form.get('chauffeurDisponible') === 'on',
      prixChauffeurParJour: form.get('prixChauffeurParJour') ? parseFloat(form.get('prixChauffeurParJour') as string) : null,
      kilometrage: parseInt(form.get('kilometrage') as string),
      carburant: form.get('carburant'), transmission: form.get('transmission'),
      nombrePlaces: parseInt(form.get('nombrePlaces') as string),
      description: form.get('description'), statut: form.get('statut'),
    };
    try {
      const res = await fetch(`/api/vehicules/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(donnees),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message); return; }
      router.push('/gerant/vehicules');
    } catch { setErreur('Erreur serveur'); }
    finally { setSauvegarde(false); }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploadEnCours(true);
    const form = new FormData();
    form.append('photo', e.target.files[0]);
    try {
      const res = await fetch(`/api/vehicules/${id}/photos`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.success) setVehicule((v) => v ? { ...v, photos: json.data.photos } : v);
      else alert(json.message);
    } catch { alert('Erreur upload'); }
    finally { setUploadEnCours(false); e.target.value = ''; }
  }

  async function supprimerPhoto(url: string) {
    const res = await fetch(`/api/vehicules/${id}/photos`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (json.success) setVehicule((v) => v ? { ...v, photos: json.data.photos } : v);
  }

  if (chargement) return <div className="container"><LoaderVoiture /></div>;
  if (!vehicule) return <div className="container"><div className="erreur">{erreur || 'Véhicule introuvable'}</div></div>;

  return (
    <div className="container">
      <div className="card">
        <h1>Modifier le véhicule</h1>
        {erreur && <div className="erreur">{erreur}</div>}

        {/* Photos */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Photos</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            {vehicule.photos.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                <button onClick={() => supprimerPhoto(url)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
              </div>
            ))}
            {vehicule.photos.length < 8 && (
              <label style={{ border: '2px dashed #e5e7eb', borderRadius: '8px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}>
                {uploadEnCours ? '...' : '+'}
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} disabled={uploadEnCours} />
              </label>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Marque</label><input name="marque" required defaultValue={vehicule.marque} /></div>
            <div className="form-group"><label>Modèle</label><input name="modele" required defaultValue={vehicule.modele} /></div>
            <div className="form-group"><label>Année</label><input name="annee" type="number" required defaultValue={vehicule.annee} /></div>
            <div className="form-group"><label>Couleur</label><input name="couleur" required defaultValue={vehicule.couleur} /></div>
            <div className="form-group">
              <label>Ville</label>
              <select name="ville" defaultValue={vehicule.ville}>
                <option value="brazzaville">Brazzaville</option>
                <option value="pointe-noire">Pointe-Noire</option>
              </select>
            </div>
            <div className="form-group"><label>Prix / jour (FCFA)</label><input name="prixParJour" type="number" required defaultValue={vehicule.prixParJour} /></div>
            <div className="form-group">
              <label>Prix / heure (FCFA) <span style={{ fontWeight: 400, color: 'var(--gris)' }}>— optionnel</span></label>
              <input name="prixParHeure" type="number" min="0" placeholder="10000" defaultValue={vehicule.prixParHeure ?? ''} />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Option chauffeur</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 400 }}>
                <input name="chauffeurDisponible" type="checkbox" defaultChecked={vehicule.chauffeurDisponible ?? false} />
                Chauffeur disponible pour ce véhicule
              </label>
            </div>
            <div className="form-group">
              <label>Prix chauffeur / jour (FCFA) <span style={{ fontWeight: 400, color: 'var(--gris)' }}>— optionnel</span></label>
              <input name="prixChauffeurParJour" type="number" min="0" placeholder="15000" defaultValue={vehicule.prixChauffeurParJour ?? ''} />
            </div>
            <div className="form-group"><label>Kilométrage</label><input name="kilometrage" type="number" required defaultValue={vehicule.kilometrage} /></div>
            <div className="form-group">
              <label>Carburant</label>
              <select name="carburant" defaultValue={vehicule.carburant}>
                <option value="essence">Essence</option><option value="diesel">Diesel</option>
                <option value="electrique">Électrique</option><option value="hybride">Hybride</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select name="transmission" defaultValue={vehicule.transmission}>
                <option value="manuelle">Manuelle</option><option value="automatique">Automatique</option>
              </select>
            </div>
            <div className="form-group"><label>Places</label><input name="nombrePlaces" type="number" required defaultValue={vehicule.nombrePlaces} /></div>
            <div className="form-group">
              <label>Statut</label>
              <select name="statut" defaultValue={vehicule.statut}>
                <option value="disponible">Disponible</option><option value="loue">Loué</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={3} defaultValue={vehicule.description} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/gerant/vehicules" style={{ flex: 1, padding: '12px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', color: '#374151', fontWeight: 500 }}>
              Annuler
            </Link>
            <button type="submit" className="btn" style={{ flex: 2 }} disabled={sauvegarde}>
              {sauvegarde ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
