export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload) return NextResponse.json<ApiResponse>({ success: false, message: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

  const { nom, telephone, ancienMotDePasse, nouveauMotDePasse } = body;

  await connectDB();
  const utilisateur = await User.findById(payload.userId).select('+motDePasse');
  if (!utilisateur) return NextResponse.json<ApiResponse>({ success: false, message: 'Utilisateur introuvable' }, { status: 404 });

  if (nom?.trim())       utilisateur.nom       = nom.trim();
  if (telephone?.trim()) utilisateur.telephone = telephone.trim();

  if (nouveauMotDePasse) {
    if (!ancienMotDePasse) return NextResponse.json<ApiResponse>({ success: false, message: 'Ancien mot de passe requis' }, { status: 400 });
    const valide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
    if (!valide) return NextResponse.json<ApiResponse>({ success: false, message: 'Ancien mot de passe incorrect' }, { status: 400 });
    if (nouveauMotDePasse.length < 6) return NextResponse.json<ApiResponse>({ success: false, message: 'Minimum 6 caractères' }, { status: 400 });
    utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, 12);
  }

  await utilisateur.save();
  return NextResponse.json<ApiResponse>({ success: true, message: 'Profil mis à jour', data: { nom: utilisateur.nom, telephone: utilisateur.telephone } });
}
