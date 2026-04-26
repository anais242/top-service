# CONTEXTE PROJET — Plateforme de location de voitures TOP SERVICE

## Qui je suis
Entrepreneur sans formation technique. Tu es mon développeur principal.
Pas d'équipe externe. Le code doit être déployable en production tel quel.

## Le projet
Site web complet de location de voitures avec **5 espaces** :
- Espace public : catalogue, fiche véhicule, formulaire de réservation
- Espace client : mes réservations, annulation, notifications
- Espace gérant : parc auto, réservations, chauffeurs, business, stats
- Espace chauffeur : missions, accepter/refuser
- Espace business (corporate) : véhicules contractuels, réservations à tarif négocié

## Stack technique IMPOSÉE
- Framework : Next.js 14 (App Router) — frontend + API dans un seul projet
- Base de données : MongoDB Atlas (gratuit) — connexion directe (pas SRV) avec `replicaSet=atlas-rl5rr9-shard-0`
- Auth : JWT maison + bcrypt (PAS de NextAuth) — librairie `jose` pour Edge Runtime
- Rate limiting : Upstash Redis (gratuit)
- Emails : Resend (DÉSACTIVÉ, `EMAILS_ACTIFS = false` dans `lib/emails/resend.ts`)
- Stockage photos : Cloudinary (`top-service/vehicules/`, `top-service/hero/`, `top-service/permis/{userId}/`, max 8 photos, 5 Mo)
- Hébergement : Vercel (déployé en production)

## Contexte business
- Afrique francophone — Congo Brazzaville / Pointe-Noire
- Petite agence locale (< 50 réservations/mois au lancement)
- Budget hébergement : 0€/mois
- Le gérant ajoute/gère les véhicules lui-même via le back-office
- PAS d'inscription publique pour le compte gérant (créé manuellement en base)

## Règles de code ABSOLUES
- Valider et sanitizer TOUTES les entrées utilisateur côté serveur
- Protéger contre XSS, CSRF, injections NoSQL
- bcrypt avec coût minimum 12
- JWT : access token 15 min + refresh token 7 jours (httpOnly cookie)
- Rate limiting sur tous les endpoints /api/auth/*
- Ne jamais exposer stack traces au client
- TOUTES les clés et secrets dans .env — jamais en dur dans le code
- Gestion complète des erreurs avec try/catch partout
- `export const dynamic = 'force-dynamic'` sur toutes les routes API
- Pages avec `useSearchParams` wrappées dans `<Suspense>`

---

## URLs de production

- **Site live :** `https://top-service-git-main-packafrancois-gmailcoms-projects.vercel.app`
- **GitHub :** `https://github.com/anais242/top-service` (public, branche main)
- **Vercel project ID :** `prj_mu6ZBfBZr84RYqtAE65jRAcNlodN`

---

## État d'avancement — TOUS MODULES TERMINÉS + DÉPLOYÉ (mis à jour 2026-04-26)

| # | Module | Statut |
|---|--------|--------|
| 1 | Authentification (email ou téléphone, overlay profil) | ✅ |
| 2 | Catalogue véhicules (CRUD gérant + upload Cloudinary + affichage public) | ✅ |
| 3 | Réservations (formulaire public, espace client, gestion gérant) | ✅ |
| 4 | Back-office / Stats (dashboard gérant, Recharts BarChart + PieChart) | ✅ |
| 5 | Emails (Resend intégré mais désactivé, réactivable via `EMAILS_ACTIFS = true`) | ✅ |
| 6 | Design (charte bleue/blanche, voitures flottantes monochrome, hero slider Cloudinary) | ✅ |
| 7 | Déploiement Vercel — LIVE en production | ✅ |
| 8 | Filtre ville + location à l'heure (Brazzaville / Pointe-Noire, min 10 000 FCFA/h) | ✅ |
| 9 | Interface chauffeur (nouveau rôle, missions, gestion gérant) | ✅ |
| 10 | Assignation véhicule par le gérant (dropdown sur réservations confirmées) | ✅ |
| 11 | Responsive (mobile first, page détail colonne unique) | ✅ |
| 12 | Tarifs chauffeur fixes (7 500 FCFA jour / 10 000 FCFA nuit, `lib/tarifs.ts`) | ✅ |
| 13 | CGU (case obligatoire + page `/conditions-generales` 13 articles) | ✅ |
| 14 | Clients Corporate (comptes négociés, véhicules contractuels, tarification dédiée) | ✅ |
| 15 | Logo dans les navbars (Cloudinary `top-service/logo.png`, 5 navbars) | ✅ |
| 16 | Auto-assignation chauffeur (confirmation → premier chauffeur libre auto-assigné) | ✅ |
| 17 | Anti-double-booking + assignation véhicule | ✅ |
| 18 | Permis de conduire recto/verso (upload Cloudinary, obligatoire sans chauffeur) | ✅ |
| 19 | Parc auto liste + overlay + duplication véhicule | ✅ |
| 20 | Notification client + recalcul prix sur changement véhicule | ✅ |
| 21 | Clôture automatique + annulation gérant avec bilan | ✅ |
| 22 | Gestion clients gérant (liste, bloquer, réinitialiser mdp, supprimer) | ✅ |
| 23 | Visibilité véhicules (masquer/afficher catalogue sans supprimer, bulk tout masquer/afficher) | ✅ |
| 24 | Badges de notification sidebar gérant (réservations en_attente + nouveaux clients 48h, polling 15s) | ✅ |
| 25 | Animation loader voiture (SVG animé sur toutes les pages + connexion/inscription) | ✅ |
| — | Paiement Mobile Money | ⏳ à intégrer en dernier |

---

## Comptes production (base nettoyée 2026-04-23)

```
Gérant      : gerant@topservice.cg  /  Admin@2025
Chauffeur 1 : 06-945-97-92          /  12345678  — BAKANA MAHOUKOU Rayne Schadrac (schadracraybakana@gmail.com)
Chauffeur 2 : 064457084             /  12345678  — MAGNANGOU DION Ben Oni Kedna (benonikednam@gmail.com)
Corporate   : compte créé manuellement par le gérant après négociation
```

Connexion possible par **email OU numéro de téléphone** pour tous les rôles.

---

## Charte graphique

Variables CSS (noms gardent `--orange` mais valeurs bleues) :
```css
--orange:      #1B3B8A;
--orange-dark: #0D1B3E;
--orange-light:#DBEAFE;
--creme:       #F0F5FF;
--brun:        #0D1B3E;
--gris:        #64748B;
--gris-light:  #EEF2FF;
```
Boutons : `linear-gradient(135deg, #2563EB 0%, #1B3B8A 100%)`

---

## Tarifs chauffeur (`lib/tarifs.ts`)

```ts
CHAUFFEUR_JOUR = 7_500   // forfait 7h–21h
CHAUFFEUR_NUIT = 10_000  // forfait 21h–6h
```
- Location/jour : 7 500 FCFA × nombre de jours
- Location/heure : 7 500 ou 10 000 selon heure de début

---

## Règles métier importantes

**Anti-double-booking :**
- Seules les réservations `statut=confirmee` bloquent un véhicule
- Les `en_attente` n'occupent rien
- Un client peut réserver plusieurs véhicules différents pour les mêmes dates

**Permis de conduire :**
- Obligatoire pour `role=client` qui réserve SANS chauffeur
- Clients `role=business` et réservations avec chauffeur : pas d'obligation
- Deux photos : recto + verso (Cloudinary `top-service/permis/{userId}/`)

**Clôture automatique (cron Vercel) :**
- Cron `"0 1 * * *"` → route `app/api/cron/cloturer-reservations/route.ts`
- Protégé par header `Authorization: Bearer <CRON_SECRET>`
- Variable env `CRON_SECRET` à configurer sur Vercel

**Notification client :**
- Champ `notifClient: Mixed` sur Reservation — appeler `markModified('notifClient')` après mutation
- Même règle pour `annulationInfo: Mixed`

**Statuts chauffeur :** `non_attribue | en_attente | acceptee | refusee`

---

## Bugs connus à ne pas reproduire

- **MongoDB SRV DNS** : connexion directe avec 3 hosts + `replicaSet=`
- **TypeScript strict `ApiResponse`** : `ApiResponse<T = unknown>` avec `message?: string`
- **`delete` sur props Mongoose** : utiliser `ret.prop = undefined` avec type `Record<string, unknown>`
- **Navbar dropdown bloqué par overlay** : z-index navbar > z-index overlay (300 > 199)
- **Vercel SSO** : désactivé via `PATCH /v9/projects/...` avec `ssoProtection: null`
- **Chauffeur login 500** : schema sans `timestamps: true` → `createdAt` undefined. Fix : `?.` dans connexion/route.ts
- **PUT assignation chauffeur bloqué** : tester `chauffeurId`/`vehiculeId` EN PREMIER, puis `statut`
- **TypeScript function declaration dans bloc strict** : `const fn = async () =>` (pas `async function fn()`)
- **useSearchParams sans Suspense** : wrapper inner component + export default avec `<Suspense>`
- **"créneau déjà réservé" faux positif** : utiliser `statut: 'confirmee'` uniquement (pas `en_attente`)
- **Mixed type Mongoose non persisté** : appeler `markModified('nomDuChamp')` avant `save()`

---

## Variables d'environnement Vercel (toutes configurées)

```
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
CLOUDINARY_CLOUD_NAME       # dfwyskgso
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
GERANT_EMAIL                # packa.francois@gmail.com
NEXT_PUBLIC_APP_URL
CRON_SECRET                 # ⚠️ À CONFIGURER sur Vercel (pour le cron de clôture)
```

---

## Scripts disponibles

```bash
npm run seed                                                    # crée le gérant
npm run clean-db                                                # vide tout sauf gérant
npx tsx --env-file=.env.local scripts/seed-vehicules.ts        # 8 véhicules de test
npx tsx --env-file=.env.local scripts/seed-chauffeurs-live.ts  # 2 chauffeurs production
```

---

## Arborescence complète

```
app/
├── layout.tsx / globals.css / page.tsx
├── components/
│   ├── BgAnime.tsx, HeroSlider.tsx
│   ├── NavbarClient.tsx, NavbarGerant.tsx, NavbarChauffeur.tsx
│   ├── NavbarBusiness.tsx, NavbarPublique.tsx
│   └── OverlayProfil.tsx
├── (auth)/connexion/page.tsx
├── (auth)/inscription/page.tsx
├── (public)/
│   ├── vehicules/page.tsx
│   ├── vehicules/[id]/page.tsx          # réservation + permis + CGU
│   └── conditions-generales/page.tsx
├── (client)/layout.tsx
│   └── client/ tableau-de-bord / vehicules / reservations
├── (gerant)/layout.tsx
│   └── gerant/ tableau-de-bord / vehicules / vehicules/nouveau
│         vehicules/[id]/modifier / reservations / chauffeurs
│         business / business/nouveau / business/[id]
├── (chauffeur)/layout.tsx
│   └── chauffeur/ tableau-de-bord / missions
├── (business)/layout.tsx
│   └── business/ tableau-de-bord / vehicules / reservations
└── api/
    ├── auth/ connexion / inscription / deconnexion / rafraichir / moi / profil
    ├── vehicules/ [id]/ [id]/photos/ [id]/disponibilite/
    ├── reservations/ [id]/
    ├── gerant/chauffeurs/ [id]/
    ├── gerant/clients/ [id]/
    ├── gerant/business/ [id]/
    ├── gerant/auto-assigner/
    ├── gerant/notifications/          # compteurs sidebar (réservations + clients)
    ├── business/vehicules/
    ├── chauffeur/missions/ [id]/
    ├── upload/permis/
    ├── stats/
    └── cron/cloturer-reservations/

lib/
├── auth/ jwt.ts / cookies.ts
├── db/ mongodb.ts
├── security/ rate-limit.ts / sanitize.ts
├── validation/ (auth, vehicule, reservation schemas)
├── cloudinary.ts
├── tarifs.ts
└── emails/resend.ts

models/ User.ts / Vehicule.ts / Reservation.ts / ContratVehicule.ts
types/index.ts
middleware.ts
vercel.json                              # cron config
scripts/ seed-gerant / seed-vehicules / seed-chauffeurs-live / clean-db
```

---

## Document admin (dossier `Document admin/`)

- **Offre Crédit du Congo** — offre commerciale de mobilité soumise au Crédit du Congo (24/04/2026)
  - Navette aéroport (Essentiel 550k / Confort 1,2M / Premium 1,95M FCFA/mois)
  - Services VIP aéroport (20k passage unitaire / 150k forfait 10 passages/mois)
  - Suivi GPS flotte client (10k installation + 10k abonnement/véhicule/mois)
- **Présentation Gamma** : https://gamma.app/docs/xx791gsqowu3hvz (générée le 2026-04-24, thème Marine)

---

## Prochaines étapes potentielles

- Activer Resend (passer `EMAILS_ACTIFS = true`) — nécessite domaine vérifié
- Configurer `CRON_SECRET` sur Vercel
- Intégrer paiement Mobile Money
- Domaine personnalisé (ex: topservice.cg)
