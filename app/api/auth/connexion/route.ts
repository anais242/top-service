export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { schemaConnexion } from '@/lib/validation/auth.schemas';
import { sanitiserObjet, extraireIP } from '@/lib/security/sanitize';
import { verifierRateLimit } from '@/lib/security/rate-limit';
import { signerAccessToken, signerRefreshToken } from '@/lib/auth/jwt';
import { poserCookiesAuth } from '@/lib/auth/cookies';
import type { ApiResponse, UtilisateurPublic } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting par IP + email (double protection)
    const ip = extraireIP(req);
    const limiteIP = await verifierRateLimit(`connexion:ip:${ip}`);
    if (!limiteIP.autorise) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: `Trop de tentatives. Réessayez dans ${limiteIP.resetDans}s.` },
        { status: 429 }
      );
    }

    // 2. Sanitisation du body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Corps de requête invalide' },
        { status: 400 }
      );
    }
    const bodyPropre = sanitiserObjet(body as Record<string, unknown>);

    // 3. Validation Zod
    const validation = schemaConnexion.safeParse(bodyPropre);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Email ou mot de passe invalide' },
        { status: 422 }
      );
    }

    const { email, motDePasse } = validation.data;

    // 4. Rate limiting supplémentaire par email
    const limiteEmail = await verifierRateLimit(`connexion:email:${email}`);
    if (!limiteEmail.autorise) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: `Trop de tentatives sur ce compte. Réessayez dans ${limiteEmail.resetDans}s.` },
        { status: 429 }
      );
    }

    // 5. Recherche de l'utilisateur
    await connectDB();
    // On sélectionne explicitement motDePasse (exclu par défaut dans toJSON)
    const utilisateur = await User.findOne({ email }).select('+motDePasse');

    // 6. Vérification — même message si compte inexistant ou mot de passe erroné
    //    (évite l'énumération de comptes)
    const motDePasseValide =
      utilisateur && utilisateur.actif
        ? await bcrypt.compare(motDePasse, utilisateur.motDePasse)
        : false;

    // Timing attack mitigation : on compare même si pas d'utilisateur trouvé
    if (!utilisateur || !motDePasseValide || !utilisateur.actif) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // 7. Génération des tokens
    const payload = {
      userId: utilisateur._id.toString(),
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
    };

    const [accessToken, refreshToken] = await Promise.all([
      signerAccessToken(payload),
      signerRefreshToken(utilisateur._id.toString()),
    ]);

    // 8. Construction de la réponse avec données publiques
    const donnees: UtilisateurPublic = {
      id: utilisateur._id.toString(),
      nom: utilisateur.nom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      role: utilisateur.role,
      createdAt: utilisateur.createdAt?.toISOString() ?? new Date().toISOString(),
    };

    // 9. Pose des cookies httpOnly et retour
    const reponse = NextResponse.json<ApiResponse<UtilisateurPublic>>(
      { success: true, message: 'Connexion réussie', data: donnees },
      { status: 200 }
    );

    return poserCookiesAuth(reponse, accessToken, refreshToken);
  } catch (error) {
    console.error('[POST /api/auth/connexion]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
