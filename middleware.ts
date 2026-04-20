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

  const estConnecte = utilisateur !== null;
  const estClient   = utilisateur?.role === 'client';
  const estGerant   = utilisateur?.role === 'gerant';

  // ── Redirection si déjà connecté et sur une route auth ──────────────────────
  const estRouteAuth = ['/connexion', '/inscription'].includes(pathname);
  if (estConnecte && estRouteAuth) {
    const destination = estGerant ? '/gerant/tableau-de-bord' : '/client/tableau-de-bord';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // ── Protection de l'espace gérant ───────────────────────────────────────────
  if (pathname.startsWith('/gerant')) {
    if (!estConnecte) {
      return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    }
    if (!estGerant) {
      // Un client qui essaie d'accéder à l'espace gérant → redirection
      return NextResponse.redirect(new URL('/client/tableau-de-bord', req.url));
    }
  }

  // ── Protection de l'espace client ───────────────────────────────────────────
  if (pathname.startsWith('/client')) {
    if (!estConnecte) {
      return NextResponse.redirect(new URL('/connexion?retour=' + pathname, req.url));
    }
    if (!estClient) {
      // Un gérant qui essaie d'accéder à l'espace client → redirection
      return NextResponse.redirect(new URL('/gerant/tableau-de-bord', req.url));
    }
  }

  // ── Injection des infos utilisateur dans les headers (pour les Server Components) ──
  if (estConnecte && utilisateur) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id',    utilisateur.userId);
    requestHeaders.set('x-user-role',  utilisateur.role);
    requestHeaders.set('x-user-email', utilisateur.email);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

// Applique le middleware sur toutes les routes sauf fichiers statiques
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
