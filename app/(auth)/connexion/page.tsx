'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retour = searchParams.get('retour');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), motDePasse: form.get('motDePasse') }),
      });
      const json = await res.json();
      if (!res.ok) { setErreur(json.message || 'Erreur de connexion'); return; }
      const role = json.data?.role;
      const dest = retour ? retour : role === 'gerant' ? '/gerant/tableau-de-bord' : '/client/tableau-de-bord';
      router.push(dest);
      router.refresh();
    } catch {
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="container-sm">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/vehicules" className="navbar-brand" style={{ fontSize: '2rem' }}>
          Top Service
        </Link>
        <p style={{ color: 'var(--gris)', marginTop: '8px', fontSize: '0.9rem' }}>
          Location de véhicules en toute confiance
        </p>
      </div>

      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
          Connexion
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--gris)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Accédez à votre espace personnel
        </p>

        {erreur && <div className="erreur">{erreur}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Adresse email</label>
            <input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input name="motDePasse" type="password" autoComplete="current-password" required placeholder="••••••••" />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }} disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <div className="lien">
          Pas encore de compte ? <Link href="/inscription">Créer un compte</Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--gris)' }}>
        <Link href="/vehicules" style={{ color: 'var(--orange)', textDecoration: 'none' }}>
          ← Voir les véhicules sans connexion
        </Link>
      </p>
    </div>
  );
}

export default function PageConnexion() {
  return (
    <Suspense>
      <FormulaireConnexion />
    </Suspense>
  );
}
