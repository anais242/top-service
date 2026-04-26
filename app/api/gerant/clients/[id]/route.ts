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

// PUT /api/gerant/clients/[id] — bloquer/débloquer ou réinitialiser le mot de passe
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

  await connectDB();
  const client = await User.findOne({ _id: params.id, role: 'client' });
  if (!client) return NextResponse.json<ApiResponse>({ success: false, message: 'Client introuvable' }, { status: 404 });

  if (typeof body.actif === 'boolean') {
    client.actif = body.actif;
    await client.save();
    return NextResponse.json<ApiResponse>({ success: true, data: { actif: client.actif } });
  }

  if (body.reinitialiserMdp) {
    const nouveauMdp = genererMotDePasse();
    client.motDePasse = await bcrypt.hash(nouveauMdp, 12);
    await client.save();
    return NextResponse.json<ApiResponse>({ success: true, data: { nouveauMotDePasse: nouveauMdp } });
  }

  return NextResponse.json<ApiResponse>({ success: false, message: 'Action non reconnue' }, { status: 400 });
}

// DELETE /api/gerant/clients/[id] — supprimer définitivement un client
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const client = await User.findOneAndDelete({ _id: params.id, role: 'client' });
  if (!client)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Client introuvable' }, { status: 404 });

  return NextResponse.json<ApiResponse>({ success: true, message: 'Client supprimé' });
}
