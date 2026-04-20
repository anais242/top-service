'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface Stats {
  kpis: {
    totalVehicules: number; tauxOccupation: number; totalClients: number;
    revenusMois: number; revenusTotal: number;
    reservationsEnAttente: number; reservationsConfirmees: number; reservationsTerminees: number;
  };
  vehiculesParStatut: { statut: string; count: number }[];
  graphiqueMois: { mois: string; revenus: number; nombre: number }[];
  vehiculesPlusLoues: { nombre: number; revenus: number; vehicule: { marque: string; modele: string; photos: string[] } }[];
  dernieresReservations: {
    _id: string; statut: string; prixTotal: number; nombreJours: number;
    vehicule: { marque: string; modele: string; photos: string[] };
    client: { nom: string; telephone: string };
  }[];
}

const STATUT_RES: Record<string, { label: string; classe: string }> = {
  en_attente: { label: 'En attente', classe: 'badge-or' },
  confirmee:  { label: 'Confirmee',  classe: 'badge-vert' },
  refusee:    { label: 'Refusee',    classe: 'badge-rouge' },
  annulee:    { label: 'Annulee',    classe: 'badge-gris' },
  terminee:   { label: 'Terminee',   classe: 'badge-bleu' },
};

const COULEURS_PIE = ['#16A34A', '#F97316', '#EF4444'];

function KPI({ label, valeur, sub, couleur }: { label: string; valeur: string | number; sub?: string; couleur?: string }) {
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value" style={{ color: couleur }}>{valeur}</p>
      {sub && <p className="kpi-sub">{sub}</p>}
    </div>
  );
}

export default function TableauDeBordGerant() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); })
      .finally(() => setChargement(false));
  }, []);

  const pieData = stats?.vehiculesParStatut.map((v) => ({
    name: v.statut === 'disponible' ? 'Disponible' : v.statut === 'loue' ? 'Loue' : 'Maintenance',
    value: v.count,
  })) ?? [];

  return (
    <div style={{ background: 'var(--gris-light)', minHeight: '100vh', padding: '32px 0' }}>
      <div className="container">
        {chargement && (
          <p style={{ textAlign: 'center', color: 'var(--gris)', padding: '60px' }}>Chargement des statistiques...</p>
        )}

        {stats && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              <KPI label="Revenus ce mois" valeur={`${stats.kpis.revenusMois.toLocaleString()} FCFA`} couleur="var(--orange)" />
              <KPI label="Revenus total"   valeur={`${stats.kpis.revenusTotal.toLocaleString()} FCFA`} />
              <KPI label="En attente"      valeur={stats.kpis.reservationsEnAttente}  sub="a traiter" couleur={stats.kpis.reservationsEnAttente > 0 ? '#D97706' : undefined} />
              <KPI label="Confirmees"      valeur={stats.kpis.reservationsConfirmees} sub="en cours" couleur="var(--vert)" />
              <KPI label="Parc auto"       valeur={`${stats.kpis.totalVehicules} vehicules`} sub={`${stats.kpis.tauxOccupation}% occupe`} />
              <KPI label="Clients"         valeur={stats.kpis.totalClients} sub="inscrits" />
            </div>

            {/* Graphiques */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <p className="titre-section">Revenus — 6 derniers mois</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.graphiqueMois}>
                    <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} FCFA`, 'Revenus']} />
                    <Bar dataKey="revenus" fill="var(--orange)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <p className="titre-section">Etat du parc</p>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COULEURS_PIE[i % COULEURS_PIE.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--gris)', marginTop: '60px' }}>Aucun vehicule</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COULEURS_PIE[i] }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top vehicules + Dernières reservations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <p className="titre-section">Top vehicules</p>
                {stats.vehiculesPlusLoues.length === 0 ? (
                  <p style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>Pas encore de donnees</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.vehiculesPlusLoues.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: i === 0 ? 'var(--or)' : i === 1 ? '#9CA3AF' : '#CD7F32',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 700,
                        }}>{i + 1}</div>
                        {v.vehicule.photos?.[0] && (
                          <img src={v.vehicule.photos[0]} alt="" style={{ width: '52px', height: '38px', objectFit: 'cover', borderRadius: '8px' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{v.vehicule.marque} {v.vehicule.modele}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gris)' }}>{v.nombre} location{v.nombre > 1 ? 's' : ''} · {v.revenus.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p className="titre-section" style={{ marginBottom: 0 }}>Dernieres reservations</p>
                  <Link href="/gerant/reservations" style={{ fontSize: '0.8rem', color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>
                    Voir tout
                  </Link>
                </div>
                {stats.dernieresReservations.length === 0 ? (
                  <p style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>Aucune reservation</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.dernieresReservations.map((r) => {
                      const s = STATUT_RES[r.statut] ?? STATUT_RES.en_attente;
                      return (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gris-light)', borderRadius: '10px' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{r.vehicule?.marque} {r.vehicule?.modele}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gris)' }}>{r.client?.nom} · {r.nombreJours}j</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${s.classe}`} style={{ display: 'block', marginBottom: '3px' }}>{s.label}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.prixTotal.toLocaleString()} F</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
