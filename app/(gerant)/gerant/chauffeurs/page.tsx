'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Chauffeur {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
  actif: boolean;
  createdAt: string;
}

export default function PageChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [formulaire, setFormulaire] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => {
    fetch('/api/gerant/chauffeurs')
      .then((r) => r.json())
      .then((j) => { if (j.success) setChauffeurs(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setSucces('');
    setEnvoi(true);

    const form = new FormData(e.currentTarget);
    const body = {
      nom:         form.get('nom') as string,
      email:       form.get('email') as string,
      telephone:   form.get('telephone') as string,
      motDePasse:  form.get('motDePasse') as string,
    };

    try {
      const res = await fetch('/api/gerant/chauffeurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      setChauffeurs((prev) => [json.data, ...prev]);
      setSucces(`Chauffeur ${json.data.nom} créé avec succès`);
      setFormulaire(false);
      (e.target as HTMLFormElement).reset();
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Chauffeurs</h1>
        <button onClick={() => { setFormulaire((f) => !f); setErreur(''); }} className="btn" style={{ padding: '8px 20px' }}>
          {formulaire ? 'Annuler' : '+ Nouveau chauffeur'}
        </button>
      </div>

      {succes && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 500 }}>{succes}</div>}

      {formulaire && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Créer un compte chauffeur</h2>
          {erreur && <div className="erreur" style={{ marginBottom: '12px' }}>{erreur}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Nom complet</label>
                <input name="nom" required placeholder="Jean Mbemba" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" required placeholder="jean@example.com" />
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
            <button type="submit" className="btn" style={{ marginTop: '8px' }} disabled={envoi}>
              {envoi ? 'Création...' : 'Créer le compte'}
            </button>
          </form>
        </div>
      )}

      {chargement && <p style={{ textAlign: 'center', color: 'var(--gris)' }}>Chargement...</p>}

      {!chargement && chauffeurs.length === 0 && !formulaire && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>Aucun chauffeur enregistré</p>
          <p style={{ fontSize: '0.875rem' }}>Créez le premier compte chauffeur ci-dessus</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chauffeurs.map((c) => (
          <div key={c._id} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--vert), #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1rem',
            }}>
              {c.nom[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>{c.nom}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>{c.telephone} · {c.email}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: c.actif ? '#dcfce7' : '#f3f4f6',
                color: c.actif ? '#166534' : '#6b7280',
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              }}>
                {c.actif ? 'Actif' : 'Inactif'}
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--gris)' }}>
                Depuis le {new Date(c.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
