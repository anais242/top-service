'use client';

import { useState, useEffect, FormEvent } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';

interface Props {
  onClose: () => void;
  onSave: (nom: string) => void;
}

export default function OverlayProfil({ onClose, onSave }: Props) {
  const [chargement, setChargement] = useState(true);
  const [nom, setNom]               = useState('');
  const [telephone, setTelephone]   = useState('');
  const [envoi, setEnvoi]           = useState(false);
  const [erreur, setErreur]         = useState('');
  const [succes, setSucces]         = useState('');
  const [mdpVisible, setMdpVisible] = useState(false);

  useEffect(() => {
    fetch('/api/auth/moi')
      .then(r => r.json())
      .then(j => { if (j.success) { setNom(j.data.nom); setTelephone(j.data.telephone ?? ''); } })
      .finally(() => setChargement(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setSucces(''); setEnvoi(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      nom:       (form.get('nom') as string).trim(),
      telephone: (form.get('telephone') as string).trim(),
    };
    const ancien  = (form.get('ancienMotDePasse') as string).trim();
    const nouveau = (form.get('nouveauMotDePasse') as string).trim();
    if (nouveau) { body.ancienMotDePasse = ancien; body.nouveauMotDePasse = nouveau; }

    try {
      const res  = await fetch('/api/auth/profil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      setSucces('Profil mis à jour');
      setNom(json.data.nom);
      onSave(json.data.nom);
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(4px)' }} />

      <div style={{ position: 'relative', background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 60px rgba(28,25,23,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Mon profil</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6b7280', lineHeight: 1 }}>✕</button>
        </div>

        {chargement ? (
          <LoaderVoiture />
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
            {erreur && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.875rem', fontWeight: 500 }}>{erreur}</div>}
            {succes && <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.875rem', fontWeight: 500 }}>{succes}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Nom complet</label>
                <input name="nom" value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Téléphone</label>
                <input name="telephone" value={telephone} onChange={e => setTelephone(e.target.value)} required />
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Changer le mot de passe</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Ancien mot de passe</label>
                    <input name="ancienMotDePasse" type={mdpVisible ? 'text' : 'password'} placeholder="Laisser vide si inchangé" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input name="nouveauMotDePasse" type={mdpVisible ? 'text' : 'password'} placeholder="Min 6 caractères" style={{ paddingRight: '44px' }} />
                      <button type="button" onClick={() => setMdpVisible(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        {mdpVisible ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#374151' }}>
                Annuler
              </button>
              <button type="submit" className="btn" style={{ flex: 2, padding: '10px' }} disabled={envoi}>
                {envoi ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
