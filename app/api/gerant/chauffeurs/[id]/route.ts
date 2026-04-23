export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';

function genererMotDePasse(): string {
  const suffixe = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `Top@${suffixe}`;
}

// PUT /api/gerant/chauffeurs/[id] — bloquer/débloquer ou réinitialiser le mot de passe
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

  await connectDB();
  const chauffeur = await User.findOne({ _id: params.id, role: 'chauffeur' });
  if (!chauffeur) return NextResponse.json<ApiResponse>({ success: false, message: 'Chauffeur introuvable' }, { status: 404 });

  // Bloquer / Débloquer
  if (typeof body.actif === 'boolean') {
    chauffeur.actif = body.actif;
    await chauffeur.save();
    return NextResponse.json<ApiResponse>({ success: true, data: { actif: chauffeur.actif } });
  }

  // Réinitialiser le mot de passe
  if (body.reinitialiserMdp) {
    const nouveauMdp = genererMotDePasse();
    chauffeur.motDePasse = await bcrypt.hash(nouveauMdp, 12);
    await chauffeur.save();
    return NextResponse.json<ApiResponse>({ success: true, data: { nouveauMotDePasse: nouveauMdp } });
  }

  return NextResponse.json<ApiResponse>({ success: false, message: 'Action non reconnue' }, { status: 400 });
}

// DELETE /api/gerant/chauffeurs/[id] — supprimer définitivement un chauffeur
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const chauffeur = await User.findOneAndDelete({ _id: params.id, role: 'chauffeur' });
  if (!chauffeur)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Chauffeur introuvable' }, { status: 404 });

  return NextResponse.json<ApiResponse>({ success: true, message: 'Chauffeur supprimé' });
}
