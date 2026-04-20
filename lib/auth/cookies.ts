// Noms des cookies utilisés dans l'application
export const COOKIE_ACCESS = 'ts_access';
export const COOKIE_REFRESH = 'ts_refresh';

const PROD = process.env.NODE_ENV === 'production';

// Construit la directive Set-Cookie
function buildCookie(nom: string, valeur: string, maxAge: number): string {
  const parts = [
    `${nom}=${valeur}`,
    'Path=/',
    'HttpOnly',                         // Inaccessible depuis JS client
    `Max-Age=${maxAge}`,
    'SameSite=Lax',                     // Protection CSRF de base
  ];
  if (PROD) parts.push('Secure');       // HTTPS uniquement en production
  return parts.join('; ');
}

// Ajoute les deux cookies auth sur une réponse existante
export function poserCookiesAuth(
  res: Response,
  accessToken: string,
  refreshToken: string
): Response {
  const headers = new Headers(res.headers);
  headers.append('Set-Cookie', buildCookie(COOKIE_ACCESS,  accessToken,  60 * 15));       // 15 min
  headers.append('Set-Cookie', buildCookie(COOKIE_REFRESH, refreshToken, 60 * 60 * 24 * 7)); // 7 jours
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

// Supprime les deux cookies (déconnexion)
export function supprimerCookiesAuth(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.append('Set-Cookie', buildCookie(COOKIE_ACCESS,  '', 0));
  headers.append('Set-Cookie', buildCookie(COOKIE_REFRESH, '', 0));
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
