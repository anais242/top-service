import { NextRequest, NextResponse } from 'next/server';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';

// Routes accessibles sans connexion
const ROUTES_PUBLIQUES = ['/', '/connexion', '/inscription'];

// Routes réservées au gérant
const ROUTES_GERANT = ['/gerant'];

// Routes réservées au client
const ROUTES_CLIENT = ['/client'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore les fichiers statiques et les routes API internes de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Lecture de l'access token depuis le cookie httpOnly
  const accessToken = req.cookies.get(COOKIE_ACCESS)?.value;

  // Vérification et décodage du token
  const utilisateur = accessToken ? await verifierAccessToken(accessToken) : null;

  const estConnecte  = utilisateur !== null;
  const estClient    = utilisateur?.role === 'client';
  const estGerant    = utilisateur?.role === 'gerant';
  const estChauffeur = utilisateur?.role === 'chauffeur';
  const estBusiness  = utilisateur?.role === 'business';

  // ── Redirection si déjà connecté et sur une route auth ──────────────────────
  const estRouteAuth = ['/connexion', '/inscription'].includes(pathname);
  if (estConnecte && estRouteAuth) {
    let destination = '/client/tableau-de-bord';
    if (estGerant)    destination = '/gerant/tableau-de-bord';
    if (estChauffeur) destination = '/chauffeur/tableau-de-bord';
    if (estBusiness)  destination = '/business/tableau-de-bord';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // ── Protection de l'espace gérant ───────────────────────────────────────────
  if (pathname.startsWith('/gerant')) {
    if (!estConnecte) return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    if (!estGerant)   return NextResponse.redirect(new URL('/connexion', req.url));
  }

  // ── Protection de l'espace client ───────────────────────────────────────────
  if (pathname.startsWith('/client')) {
    if (!estConnecte) return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    if (!estClient)   return NextResponse.redirect(new URL('/connexion', req.url));
  }

  // ── Protection de l'espace chauffeur ────────────────────────────────────────
  if (pathname.startsWith('/chauffeur')) {
    if (!estConnecte)  return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    if (!estChauffeur) return NextResponse.redirect(new URL('/connexion', req.url));
  }

  // ── Protection de l'espace business ─────────────────────────────────────────
  if (pathname.startsWith('/business')) {
    if (!estConnecte)  return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    if (!estBusiness)  return NextResponse.redirect(new URL('/connexion', req.url));
  }

  // ── Injection des infos utilisateur dans les headers (pour les Server Components) ──
  if (estConnecte && utilisateur) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id',    utilisateur.userId);
    requestHeaders.set('x-user-role',  utilisateur.role);
    requestHeaders.set('x-user-email', utilisateur.email);
    requestHeaders.set('x-user-nom',   utilisateur.nom);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

// Applique le middleware sur toutes les routes sauf fichiers statiques
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
