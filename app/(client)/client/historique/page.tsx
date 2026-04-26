'use client';

import { useEffect, useState } from 'react';
import LoaderVoiture from '@/app/components/LoaderVoiture';

interface Activite {
  _id: string;
  type: 'permis' | 'reservation' | 'paiement';
  action: string;
  detail: string;
  createdAt: string;
}

const TYPES = [
  { val: 'tous',        label: 'Tout' },
  { val: 'reservation', label: 'Réservations' },
  { val: 'permis',      label: 'Permis' },
  { val: 'paiement',    label: 'Paiements' },
];

const ICONES: Record<string, string> = {
  reservation_creee:    '📋',
  reservation_confirmee:'✅',
  reservation_annulee:  '❌',
  reservation_refusee:  '🚫',
  reservation_terminee: '🏁',
  permis_recto:         '🪪',
  permis_verso:         '🪪',
  paiement_effectue:    '💳',
};

const COULEURS: Record<string, { bg: string; color: string }> = {
  reservation_creee:    { bg: '#eff6ff', color: '#1e40af' },
  reservation_confirmee:{ bg: '#dcfce7', color: '#166534' },
  reservation_annulee:  { bg: '#fee2e2', color: '#991b1b' },
  reservation_refusee:  { bg: '#fee2e2', color: '#991b1b' },
  reservation_terminee: { bg: '#f3f4f6', color: '#374151' },
  permis_recto:         { bg: '#fef9c3', color: '#713f12' },
  permis_verso:         { bg: '#fef9c3', color: '#713f12' },
  paiement_effectue:    { bg: '#f0fdf4', color: '#166534' },
};

const LABELS: Record<string, string> = {
  reservation_creee:    'Réservation créée',
  reservation_confirmee:'Réservation confirmée',
  reservation_annulee:  'Réservation annulée',
  reservation_refusee:  'Réservation refusée',
  reservation_terminee: 'Réservation clôturée',
  permis_recto:         'Permis recto déposé',
  permis_verso:         'Permis verso déposé',
  paiement_effectue:    'Paiement effectué',
};

function fmt(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PageHistorique() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [chargement, setChargement] = useState(true);
  const [type, setType]     = useState('tous');
  const [depuis, setDepuis] = useState('');
  const [jusqu, setJusqu]   = useState('');

  useEffect(() => {
    setChargement(true);
    const params = new URLSearchParams();
    if (type !== 'tous') params.set('type', type);
    if (depuis) params.set('depuis', depuis);
    if (jusqu)  params.set('jusqu',  jusqu);
    fetch(`/api/client/historique?${params}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setActivites(j.data); })
      .finally(() => setChargement(false));
  }, [type, depuis, jusqu]);

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px' }}>Historique</h1>
        <p style={{ margin: 0, color: 'var(--gris)', fontSize: '0.875rem' }}>Toutes vos activités sur le site</p>
      </div>

      {/* Filtres */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        {/* Filtre type */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {TYPES.map((t) => (
            <button
              key={t.val}
              onClick={() => setType(t.val)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem',
                background: type === t.val ? '#1B3B8A' : '#f3f4f6',
                color: type === t.val ? 'white' : '#374151',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtre dates */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Du</label>
            <input type="date" value={depuis} onChange={(e) => setDepuis(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Au</label>
            <input type="date" value={jusqu} onChange={(e) => setJusqu(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          </div>
          {(depuis || jusqu) && (
            <button onClick={() => { setDepuis(''); setJusqu(''); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', marginTop: '18px' }}>
              Effacer
            </button>
          )}
        </div>
      </div>

      {chargement && <LoaderVoiture />}

      {!chargement && activites.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600 }}>Aucune activité trouvée</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activites.map((a) => {
          const couleur = COULEURS[a.action] ?? { bg: '#f9fafb', color: '#374151' };
          const icone   = ICONES[a.action]   ?? '•';
          const label   = LABELS[a.action]   ?? a.action;
          return (
            <div key={a._id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: couleur.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {icone}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9rem', color: couleur.color }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>{fmt(a.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
