'use client';

import { useEffect, useState, FormEvent } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';

interface VehiculeActuel { marque: string; modele: string; annee: number; dateDebut: string; dateFin: string; }

interface Chauffeur {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
  actif: boolean;
  estOccupe: boolean;
  aReservationAVenir: boolean;
  prochaineReservation?: string | null;
  createdAt: string;
  vehiculeActuel?: VehiculeActuel | null;
}

export default function PageChauffeurs() {
  const [chauffeurs, setChauffeurs]     = useState<Chauffeur[]>([]);
  const [chargement, setChargement]     = useState(true);
  const [formulaire, setFormulaire]     = useState(false);
  const [envoi, setEnvoi]               = useState(false);
  const [erreur, setErreur]             = useState('');
  const [succes, setSucces]             = useState('');
  const [mdpVisible, setMdpVisible]     = useState(false);
  const [nouveauMdp, setNouveauMdp]     = useState<Record<string, string>>({});
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [detailOuvert, setDetailOuvert] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gerant/chauffeurs')
      .then((r) => r.json())
      .then((j) => { if (j.success) setChauffeurs(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setSucces(''); setEnvoi(true);
    const form = new FormData(e.currentTarget);
    const body = {
      nom:        form.get('nom') as string,
      email:      form.get('email') as string,
      telephone:  form.get('telephone') as string,
      motDePasse: form.get('motDePasse') as string,
    };
    try {
      const res  = await fetch('/api/gerant/chauffeurs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur'); return; }
      setChauffeurs((prev) => [json.data, ...prev]);
      setSucces(`Compte créé — email : ${body.email} · mot de passe : ${body.motDePasse}`);
      setFormulaire(false);
      (e.target as HTMLFormElement).reset();
    } catch {
      setErreur('Impossible de contacter le serveur');
    } finally {
      setEnvoi(false);
    }
  }

  async function toggleBlocage(c: Chauffeur) {
    setActionEnCours(c._id);
    const res  = await fetch(`/api/gerant/chauffeurs/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actif: !c.actif }) });
    const json = await res.json();
    if (json.success) {
      setChauffeurs((prev) => prev.map((x) => x._id === c._id ? { ...x, actif: json.data.actif } : x));
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  async function supprimerChauffeur(c: Chauffeur) {
    if (!confirm(`Supprimer définitivement ${c.nom} ? Cette action est irréversible.`)) return;
    setActionEnCours(c._id);
    const res  = await fetch(`/api/gerant/chauffeurs/${c._id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      setChauffeurs((prev) => prev.filter((x) => x._id !== c._id));
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  async function reinitialiserMdp(id: string) {
    if (!confirm('Générer un nouveau mot de passe pour ce chauffeur ?')) return;
    setActionEnCours(id);
    const res  = await fetch(`/api/gerant/chauffeurs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reinitialiserMdp: true }) });
    const json = await res.json();
    if (json.success) {
      setNouveauMdp((prev) => ({ ...prev, [id]: json.data.nouveauMotDePasse }));
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Chauffeurs</h1>
        <button onClick={() => { setFormulaire((f) => !f); setErreur(''); }} className="btn" style={{ padding: '8px 20px' }}>
          {formulaire ? 'Annuler' : '+ Nouveau chauffeur'}
        </button>
      </div>

      {succes && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 500, fontSize: '0.875rem' }}>
          {succes}
        </div>
      )}

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
                <input name="email" type="email" required placeholder="jean@topservice.cg" />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input name="telephone" required placeholder="+242 06 xxx xxxx" />
              </div>
              <div className="form-group">
                <label>Mot de passe provisoire</label>
                <div style={{ position: 'relative' }}>
                  <input name="motDePasse" type={mdpVisible ? 'text' : 'password'} required minLength={8} placeholder="Min 8 caractères" style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setMdpVisible((v) => !v)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#6b7280' }}>
                    {mdpVisible ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginTop: '8px' }} disabled={envoi}>
              {envoi ? 'Création...' : 'Créer le compte'}
            </button>
          </form>
        </div>
      )}

      {chargement && <LoaderVoiture />}

      {!chargement && chauffeurs.length === 0 && !formulaire && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>Aucun chauffeur enregistré</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chauffeurs.map((c) => {
          const ouvert = detailOuvert === c._id;
          const enAction = actionEnCours === c._id;
          const badgeConfig = !c.actif
            ? { label: 'Bloqué', bg: '#fee2e2', color: '#991b1b' }
            : c.estOccupe
            ? { label: 'En mission', bg: '#fef9c3', color: '#713f12' }
            : c.aReservationAVenir
            ? { label: 'Disponible · Réservé', bg: '#dbeafe', color: '#1e40af' }
            : { label: 'Disponible', bg: '#dcfce7', color: '#166534' };

          return (
            <div key={c._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Ligne principale — clic pour ouvrir/fermer */}
              <div
                onClick={() => setDetailOuvert(ouvert ? null : c._id)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                  {c.nom[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>{c.nom}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>{c.telephone} · {c.email}</p>
                  {c.vehiculeActuel && (
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#1B3B8A', fontWeight: 600 }}>
                      Véhicule : {c.vehiculeActuel.marque} {c.vehiculeActuel.modele} {c.vehiculeActuel.annee} · {fmt(c.vehiculeActuel.dateDebut)} → {fmt(c.vehiculeActuel.dateFin)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ background: badgeConfig.bg, color: badgeConfig.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {badgeConfig.label}
                  </span>
                  {c.aReservationAVenir && c.prochaineReservation && (
                    <span style={{ fontSize: '0.7rem', color: '#1e40af' }}>
                      Prochaine : {fmt(c.prochaineReservation)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--gris)' }}>{ouvert ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Panneau d'actions */}
              {ouvert && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* Infos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#374151' }}>
                    <span>Compte créé le {fmt(c.createdAt)}</span>
                    <span>Email : {c.email}</span>
                  </div>

                  {/* Nouveau mot de passe affiché */}
                  {nouveauMdp[c._id] && (
                    <div style={{ padding: '10px 14px', background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: '8px', fontSize: '0.875rem' }}>
                      Nouveau mot de passe généré : <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{nouveauMdp[c._id]}</strong>
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#92400e' }}>(noter et communiquer au chauffeur)</span>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleBlocage(c)}
                      disabled={enAction}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: enAction ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', background: c.actif ? '#fee2e2' : '#dcfce7', color: c.actif ? '#991b1b' : '#166534' }}
                    >
                      {enAction ? '...' : c.actif ? 'Bloquer l\'accès' : 'Débloquer l\'accès'}
                    </button>
                    <button
                      onClick={() => reinitialiserMdp(c._id)}
                      disabled={enAction}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: enAction ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', background: 'white', color: '#374151' }}
                    >
                      Réinitialiser mot de passe
                    </button>
                    <button
                      onClick={() => supprimerChauffeur(c)}
                      disabled={enAction}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: enAction ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', background: '#111827', color: 'white', marginLeft: 'auto' }}
                    >
                      {enAction ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
