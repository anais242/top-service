export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';

// GET /api/gerant/chauffeurs — liste tous les chauffeurs
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const chauffeurs = await User.find({ role: 'chauffeur' }).select('-motDePasse').sort({ createdAt: -1 }).lean();
  return NextResponse.json<ApiResponse>({ success: true, data: chauffeurs });
}

// POST /api/gerant/chauffeurs — créer un compte chauffeur
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.nom || !body?.email || !body?.telephone || !body?.motDePasse)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Champs requis manquants' }, { status: 400 });

  await connectDB();

  const existe = await User.findOne({ email: body.email.toLowerCase() });
  if (existe)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Email déjà utilisé' }, { status: 409 });

  const hash = await bcrypt.hash(body.motDePasse, 12);
  const chauffeur = await User.create({
    nom: body.nom.trim(),
    email: body.email.toLowerCase().trim(),
    telephone: body.telephone.trim(),
    motDePasse: hash,
    role: 'chauffeur',
  });

  return NextResponse.json<ApiResponse>({ success: true, data: chauffeur }, { status: 201 });
}
