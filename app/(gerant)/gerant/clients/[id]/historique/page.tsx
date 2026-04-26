'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoaderVoiture from '@/app/components/LoaderVoiture';

interface Activite {
  _id: string;
  type: 'permis' | 'reservation' | 'paiement';
  action: string;
  detail: string;
  createdAt: string;
}

interface Client {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
}

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

export default function PageHistoriqueClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient]       = useState<Client | null>(null);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`/api/gerant/clients/${id}/historique`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) { setClient(j.data.client); setActivites(j.data.activites); }
        else router.push('/gerant/clients');
      })
      .finally(() => setChargement(false));
  }, [id, router]);

  if (chargement) return <div className="container"><LoaderVoiture /></div>;
  if (!client)    return null;

  return (
    <div className="container">
      {/* En-tête */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/gerant/clients" style={{ fontSize: '0.875rem', color: 'var(--gris)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          ← Retour aux clients
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1B3B8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
            {client.nom[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: '1.2rem' }}>{client.nom}</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--gris)' }}>{client.telephone} · {client.email}</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--gris)', fontWeight: 500 }}>
            {activites.length} événement{activites.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {activites.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--gris)' }}>
          <p style={{ fontWeight: 600 }}>Aucune activité enregistrée pour ce client</p>
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
