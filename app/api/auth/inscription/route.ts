export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { schemaInscription } from '@/lib/validation/auth.schemas';
import { sanitiserObjet, extraireIP } from '@/lib/security/sanitize';
import { verifierRateLimit } from '@/lib/security/rate-limit';
import type { ApiResponse, UtilisateurPublic } from '@/types';
import { envoyerEmailBienvenue } from '@/lib/emails/resend';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting — 5 tentatives / 15 min par IP
    const ip = extraireIP(req);
    const limite = await verifierRateLimit(`inscription:${ip}`);
    if (!limite.autorise) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: `Trop de tentatives. Réessayez dans ${limite.resetDans}s.` },
        { status: 429 }
      );
    }

    // 2. Lecture et sanitisation du body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Corps de requête invalide' },
        { status: 400 }
      );
    }
    const bodyPropre = sanitiserObjet(body as Record<string, unknown>);

    // 3. Validation Zod
    const validation = schemaInscription.safeParse(bodyPropre);
    if (!validation.success) {
      const erreurs = validation.error.flatten().fieldErrors;
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Données invalides', errors: erreurs as Record<string, string[]> },
        { status: 422 }
      );
    }

    const { nom, email, telephone, motDePasse } = validation.data;

    // 4. Connexion MongoDB
    await connectDB();

    // 5. Vérification email unique (index unique en base, double vérification ici)
    const existant = await User.findOne({ email }).lean();
    if (existant) {
      // Message volontairement vague pour ne pas confirmer l'existence d'un compte
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Impossible de créer le compte avec ces informations' },
        { status: 409 }
      );
    }

    // 6. Hash du mot de passe — coût 12 (recommandation OWASP)
    const motDePasseHash = await bcrypt.hash(motDePasse, 12);

    // 7. Création de l'utilisateur
    const utilisateur = await User.create({
      nom,
      email,
      telephone,
      motDePasse: motDePasseHash,
      role: 'client', // L'inscription publique crée TOUJOURS un client
    });

    // 8. Réponse sans données sensibles
    const donnees: UtilisateurPublic = {
      id: utilisateur._id.toString(),
      nom: utilisateur.nom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      role: utilisateur.role,
      createdAt: utilisateur.createdAt.toISOString(),
    };

    // Email bienvenue — non bloquant (échec silencieux)
    envoyerEmailBienvenue(email, nom).catch((e) => console.error('[email bienvenue]', e));

    return NextResponse.json<ApiResponse<UtilisateurPublic>>(
      { success: true, message: 'Compte créé avec succès', data: donnees },
      { status: 201 }
    );
  } catch (error) {
    // Ne jamais exposer les détails de l'erreur au client
    console.error('[POST /api/auth/inscription]', error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
