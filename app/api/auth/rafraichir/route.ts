import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifierRefreshToken, signerAccessToken, signerRefreshToken } from '@/lib/auth/jwt';
import { poserCookiesAuth, supprimerCookiesAuth, COOKIE_REFRESH } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Lecture du refresh token depuis le cookie httpOnly
    const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;
    if (!refreshToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Vérification du refresh token
    const userId = await verifierRefreshToken(refreshToken);
    if (!userId) {
      // Token invalide ou expiré → on supprime les cookies corrompus
      const reponse = NextResponse.json<ApiResponse>(
        { success: false, message: 'Session expirée, veuillez vous reconnecter' },
        { status: 401 }
      );
      return supprimerCookiesAuth(reponse);
    }

    // 3. Vérification que l'utilisateur existe toujours et est actif
    await connectDB();
    const utilisateur = await User.findById(userId).lean();
    if (!utilisateur || !utilisateur.actif) {
      const reponse = NextResponse.json<ApiResponse>(
        { success: false, message: 'Compte introuvable ou désactivé' },
        { status: 401 }
      );
      return supprimerCookiesAuth(reponse);
    }

    // 4. Génération d'un nouveau couple de tokens (rotation du refresh token)
    const payload = {
      userId: utilisateur._id.toString(),
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
    };

    const [nouvelAccessToken, nouveauRefreshToken] = await Promise.all([
      signerAccessToken(payload),
      signerRefreshToken(utilisateur._id.toString()),
    ]);

    // 5. Mise à jour des cookies
    const reponse = NextResponse.json<ApiResponse>(
      { success: true, message: 'Token rafraîchi' },
      { status: 200 }
    );

    return poserCookiesAuth(reponse, nouvelAccessToken, nouveauRefreshToken);
  } catch (error) {
    console.error('[POST /api/auth/rafraichir]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
