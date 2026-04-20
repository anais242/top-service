// jose est utilisé car il est compatible avec l'Edge Runtime de Next.js (middleware)
import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types';

// Encodage des secrets en Uint8Array (requis par jose)
function getSecret(env: string | undefined, nom: string): Uint8Array {
  if (!env) throw new Error(`Variable ${nom} manquante dans .env.local`);
  return new TextEncoder().encode(env);
}

const ACCESS_SECRET = () => getSecret(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
const REFRESH_SECRET = () => getSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');

// ─── Génération des tokens ────────────────────────────────────────────────────

// Access token : courte durée (15 minutes)
export async function signerAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('top-service')
    .setAudience('top-service-app')
    .sign(ACCESS_SECRET());
}

// Refresh token : longue durée (7 jours) — contient seulement l'userId
export async function signerRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('top-service')
    .sign(REFRESH_SECRET());
}

// ─── Vérification des tokens ──────────────────────────────────────────────────

// Retourne le payload si valide, null sinon (token expiré, signature invalide...)
export async function verifierAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET(), {
      issuer: 'top-service',
      audience: 'top-service-app',
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Retourne l'userId si le refresh token est valide
export async function verifierRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET(), {
      issuer: 'top-service',
    });
    return (payload as { userId: string }).userId ?? null;
  } catch {
    return null;
  }
}
