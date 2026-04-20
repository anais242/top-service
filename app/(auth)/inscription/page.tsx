'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PageInscription() {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(''); setSucces(''); setChargement(true);
    const form = new FormData(e.currentTarget);
    const donnees = {
      nom: form.get('nom'), email: form.get('email'),
      telephone: form.get('telephone'), motDePasse: form.get('motDePasse'),
    };
    if (donnees.motDePasse !== form.get('confirmation')) {
      setErreur('Les mots de passe ne correspondent pas');
      setChargement(false); return;
    }
    try {
      const res = await fetch('/api/auth/inscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });
      const json = await res.json();
      if (!res.ok) {
        setErreur(json.errors ? Object.values(json.errors).flat().join(' — ') : json.message);
        return;
      }
      setSucces('Compte créé ! Redirection...');
      setTimeout(() => router.push('/connexion'), 1500);
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
          Créez votre compte gratuitement
        </p>
      </div>

      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
          Créer un compte
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--gris)', marginBottom: '28px', fontSize: '0.875rem' }}>
          Rejoignez Top Service en quelques secondes
        </p>

        {erreur && <div className="erreur">{erreur}</div>}
        {succes && <div className="succes">{succes}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Nom complet</label>
            <input name="nom" type="text" autoComplete="name" required placeholder="Jean Dupont" />
          </div>
          <div className="form-group">
            <label>Adresse email</label>
            <input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input name="telephone" type="tel" autoComplete="tel" required placeholder="+242 06 123 4567" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Mot de passe</label>
              <input name="motDePasse" type="password" autoComplete="new-password" required placeholder="Min. 8 caractères" />
            </div>
            <div className="form-group">
              <label>Confirmer</label>
              <input name="confirmation" type="password" autoComplete="new-password" required placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }} disabled={chargement}>
            {chargement ? 'Création...' : 'Créer mon compte →'}
          </button>
        </form>

        <div className="lien">
          Déjà un compte ? <Link href="/connexion">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
