'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoaderVoiture from '@/app/components/LoaderVoiture';

interface Client {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
  actif: boolean;
  nbReservations: number;
  createdAt: string;
}

export default function PageClients() {
  const [clients, setClients]               = useState<Client[]>([]);
  const [chargement, setChargement]         = useState(true);
  const [nouveauMdp, setNouveauMdp]         = useState<Record<string, string>>({});
  const [actionEnCours, setActionEnCours]   = useState<string | null>(null);
  const [detailOuvert, setDetailOuvert]     = useState<string | null>(null);
  const [recherche, setRecherche]           = useState('');

  useEffect(() => {
    fetch('/api/gerant/clients')
      .then((r) => r.json())
      .then((j) => { if (j.success) setClients(j.data); })
      .finally(() => setChargement(false));
  }, []);

  async function toggleBlocage(c: Client) {
    setActionEnCours(c._id);
    const res  = await fetch(`/api/gerant/clients/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actif: !c.actif }) });
    const json = await res.json();
    if (json.success) {
      setClients((prev) => prev.map((x) => x._id === c._id ? { ...x, actif: json.data.actif } : x));
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  async function supprimerClient(c: Client) {
    if (!confirm(`Supprimer définitivement ${c.nom} ? Cette action est irréversible.`)) return;
    setActionEnCours(c._id);
    const res  = await fetch(`/api/gerant/clients/${c._id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      setClients((prev) => prev.filter((x) => x._id !== c._id));
      setDetailOuvert(null);
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  async function reinitialiserMdp(id: string) {
    if (!confirm('Générer un nouveau mot de passe pour ce client ?')) return;
    setActionEnCours(id);
    const res  = await fetch(`/api/gerant/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reinitialiserMdp: true }) });
    const json = await res.json();
    if (json.success) {
      setNouveauMdp((prev) => ({ ...prev, [id]: json.data.nouveauMotDePasse }));
    } else { alert(json.message); }
    setActionEnCours(null);
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  const clientsFiltres = clients.filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.email.toLowerCase().includes(recherche.toLowerCase()) ||
    c.telephone.includes(recherche)
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Clients</h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--gris)', fontWeight: 500 }}>
          {clients.length} compte{clients.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Barre de recherche */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
        />
      </div>

      {chargement && <LoaderVoiture />}

      {!chargement && clientsFiltres.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>
            {recherche ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clientsFiltres.map((c) => {
          const ouvert   = detailOuvert === c._id;
          const enAction = actionEnCours === c._id;
          const badge    = c.actif
            ? { label: 'Actif', bg: '#dcfce7', color: '#166534' }
            : { label: 'Bloqué', bg: '#fee2e2', color: '#991b1b' };

          return (
            <div key={c._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {/* Ligne principale */}
              <div
                onClick={() => setDetailOuvert(ouvert ? null : c._id)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                  {c.nom[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/gerant/clients/${c._id}/historique`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem', color: '#1B3B8A', textDecoration: 'none', display: 'inline-block' }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {c.nom}
                  </Link>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>{c.telephone} · {c.email}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gris)' }}>
                    {c.nbReservations} résa · {ouvert ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Panneau d'actions */}
              {ouvert && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#374151' }}>
                    <span>Inscrit le {fmt(c.createdAt)}</span>
                    <span>{c.nbReservations} réservation{c.nbReservations > 1 ? 's' : ''} au total</span>
                  </div>

                  {nouveauMdp[c._id] && (
                    <div style={{ padding: '10px 14px', background: '#fef9c3', border: '1.5px solid #fde68a', borderRadius: '8px', fontSize: '0.875rem' }}>
                      Nouveau mot de passe : <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{nouveauMdp[c._id]}</strong>
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#92400e' }}>(à communiquer au client)</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleBlocage(c)}
                      disabled={enAction}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: enAction ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', background: c.actif ? '#fee2e2' : '#dcfce7', color: c.actif ? '#991b1b' : '#166534' }}
                    >
                      {enAction ? '...' : c.actif ? "Bloquer l'accès" : "Débloquer l'accès"}
                    </button>
                    <button
                      onClick={() => reinitialiserMdp(c._id)}
                      disabled={enAction}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: enAction ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', background: 'white', color: '#374151' }}
                    >
                      Réinitialiser mot de passe
                    </button>
                    <button
                      onClick={() => supprimerClient(c)}
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
