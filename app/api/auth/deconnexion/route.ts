import { NextResponse } from 'next/server';
import { supprimerCookiesAuth } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

export async function POST() {
  try {
    const reponse = NextResponse.json<ApiResponse>(
      { success: true, message: 'Déconnexion réussie' },
      { status: 200 }
    );
    // Supprime les deux cookies en les réinitialisant avec Max-Age=0
    return supprimerCookiesAuth(reponse);
  } catch (error) {
    console.error('[POST /api/auth/deconnexion]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
