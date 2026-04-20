# CONTEXTE PROJET — Plateforme de location de voitures

## Qui je suis
Entrepreneur sans formation technique. Tu es mon développeur principal.
Pas d'équipe externe. Le code doit être déployable en production tel quel.

## Le projet
Site web complet de location de voitures avec 3 espaces :
- Espace client : rechercher, réserver, payer
- Espace gérant : gérer le parc auto, confirmer/refuser les réservations
- Back-office : tableau de bord, statistiques

## Stack technique IMPOSÉE
- Framework : Next.js 14 (App Router) — frontend + API dans un seul projet
- Base de données : MongoDB Atlas (gratuit)
- Auth : JWT maison + bcrypt (PAS de NextAuth)
- Rate limiting : Upstash Redis (gratuit)
- Paiement : à intégrer en dernière étape (opérateur Mobile Money local)
- Emails : Resend (gratuit jusqu'à 3000/mois)
- Stockage photos véhicules : Cloudinary (gratuit)
- Hébergement cible : Vercel (gratuit)

## Contexte business
- Afrique francophone
- Petite agence locale (< 50 réservations/mois au lancement)
- Budget hébergement : 0€/mois
- Le gérant ajoute/gère les véhicules lui-même via le back-office
- PAS d'inscription publique pour le compte gérant (créé manuellement en base)

## Règles de code ABSOLUES — à respecter sur chaque fichier

### Sécurité (OWASP)
- Valider et sanitizer TOUTES les entrées utilisateur côté serveur
- Protéger contre XSS, CSRF, injections NoSQL
- bcrypt avec coût minimum 12 pour les mots de passe
- JWT : access token 15 min + refresh token 7 jours (httpOnly cookie)
- Rate limiting sur tous les endpoints d'authentification
- Ne jamais exposer stack traces ou détails techniques au client
- Headers HTTP de sécurité configurés (CORS restrictif, CSP, X-Frame-Options)
- TOUTES les clés et secrets dans .env — jamais en dur dans le code

### Qualité production
- Gestion complète des erreurs avec try/catch partout
- Logging structuré (console structuré ou Winston)
- Code commenté en français pour les parties complexes
- Structure modulaire : un fichier = une responsabilité
- Variables d'environnement pour toute configuration sensible

### Format de livraison attendu pour chaque module
1. RÉSUMÉ : ce que fait le code (langage simple)
2. ARCHITECTURE : schéma des fichiers et de leurs interactions
3. SÉCURITÉ : protections intégrées et menaces couvertes
4. CODE : complet, commenté en français
5. INSTALLATION : commandes exactes à copier-coller
6. TESTS : comment vérifier que ça fonctionne
7. ALERTES : ce qui pourrait casser, limites connues

### Auto-critique obligatoire après chaque livraison
- Jouer le rôle d'un hacker : 3 failles tentées + corrections appliquées
- Jouer le rôle d'un utilisateur malveillant : 3 scénarios d'abus
- Jouer le rôle d'un expert performance : goulots d'étranglement identifiés

---

## État d'avancement (mis à jour le 2026-04-20)

### ✅ Module 1 — Authentification (TERMINÉ)
- Inscription client (nom, email, téléphone, mot de passe)
- Connexion client et gérant (même endpoint, rôles différents)
- JWT access token 15 min + refresh token 7 jours (httpOnly cookie)
- Rate limiting Upstash Redis sur /api/auth/*
- Middleware de protection des routes par rôle
- Script seed gérant : `npm run seed`
- Script seed test : `npx tsx scripts/seed-test.ts`

**Comptes de test :**
- Client : client@test.com / Test1234!
- Gérant : gerant@topservice.cg / Admin@2025

**Note technique :** MongoDB Atlas connecté en connexion directe (sans SRV) à cause du DNS local.
URI dans .env.local utilise les hostnames directs + replicaSet=atlas-rl5rr9-shard-0.

### ✅ Module 2 — Catalogue de véhicules (TERMINÉ)
- Modèle Vehicule (marque, modèle, année, couleur, prix/jour, km, carburant, transmission, places, description, photos, statut)
- API CRUD complète : GET /api/vehicules, POST, GET /api/vehicules/[id], PUT, DELETE
- Upload photos Cloudinary : POST /api/vehicules/[id]/photos (max 8 photos, max 5 Mo)
- Suppression photos : DELETE /api/vehicules/[id]/photos
- Page gérant : /gerant/vehicules (liste + actions)
- Page gérant : /gerant/vehicules/nouveau (formulaire création)
- Page gérant : /gerant/vehicules/[id]/modifier (formulaire édition + gestion photos)
- Page client connecté : /client/vehicules (catalogue)
- Page client connecté : /client/vehicules/[id] (fiche détail)
- Script seed véhicules : `npx tsx scripts/seed-vehicules.ts` (8 véhicules avec photos Unsplash)

### ✅ Module 5 — Back-office gérant (TERMINÉ)
- API stats : GET /api/stats (KPIs, graphiques, top véhicules, dernières réservations)
- Tableau de bord refait avec : 6 KPIs, graphique revenus 6 mois (Recharts BarChart), camembert état du parc (PieChart), top 5 véhicules les plus loués, 5 dernières réservations
- Navigation directe vers véhicules et réservations depuis le header
- Déconnexion via fetch (client component)

### ✅ Module 3 — Système de réservation (TERMINÉ)
- Modèle Reservation (vehicule, client, dateDebut, dateFin, nombreJours, prixTotal, statut, messages)
- Statuts : en_attente → confirmee / refusee / annulee / terminee
- API : GET+POST /api/reservations, GET+PUT /api/reservations/[id]
- API disponibilité : GET /api/vehicules/[id]/disponibilite
- **Pages publiques (sans compte) :** /vehicules (catalogue), /vehicules/[id] (fiche + formulaire réservation)
- Si non connecté → clic "Réserver" redirige vers /connexion?retour=/vehicules/[id]
- Page client : /client/reservations (mes réservations + annulation)
- Page gérant : /gerant/reservations (toutes les réservations + filtres + confirmer/refuser/terminer)
- Vérification conflits de dates côté serveur

---

## Ordre de développement des modules
1. ✅ Authentification
2. ✅ Catalogue de véhicules
3. ✅ Système de réservation
4. ⏳ Paiement Mobile Money (à intégrer en dernier)
5. ✅ Back-office gérant (tableau de bord, statistiques)
6. ⏳ Notifications email (confirmation réservation, rappels)

---

## Structure des fichiers (état actuel)

```
app/
  (auth)/connexion/page.tsx
  (auth)/inscription/page.tsx
  (public)/vehicules/page.tsx              ← catalogue public
  (public)/vehicules/[id]/page.tsx         ← fiche + réservation public
  (client)/layout.tsx                      ← garde route client
  (client)/client/tableau-de-bord/page.tsx
  (client)/client/vehicules/page.tsx
  (client)/client/vehicules/[id]/page.tsx
  (client)/client/reservations/page.tsx
  (gerant)/layout.tsx                      ← garde route gérant
  (gerant)/gerant/tableau-de-bord/page.tsx
  (gerant)/gerant/vehicules/page.tsx
  (gerant)/gerant/vehicules/nouveau/page.tsx
  (gerant)/gerant/vehicules/[id]/modifier/page.tsx
  (gerant)/gerant/reservations/page.tsx
  api/auth/inscription/route.ts
  api/auth/connexion/route.ts
  api/auth/deconnexion/route.ts
  api/auth/rafraichir/route.ts
  api/vehicules/route.ts
  api/vehicules/[id]/route.ts
  api/vehicules/[id]/photos/route.ts
  api/vehicules/[id]/disponibilite/route.ts
  api/reservations/route.ts
  api/reservations/[id]/route.ts

models/
  User.ts
  Vehicule.ts
  Reservation.ts

lib/
  auth/jwt.ts
  auth/cookies.ts
  db/mongodb.ts
  cloudinary.ts
  security/rate-limit.ts
  security/sanitize.ts
  validation/auth.schemas.ts
  validation/vehicule.schemas.ts
  validation/reservation.schemas.ts

scripts/
  seed-gerant.ts
  seed-test.ts
  seed-vehicules.ts
```

## Variables d'environnement (.env.local)
```
MONGODB_URI=mongodb://...(connexion directe sans SRV)
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
UPSTASH_REDIS_REST_URL=https://awaited-beetle-103031.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
CLOUDINARY_CLOUD_NAME=dfwyskgso
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
