export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/chauffeur/missions — missions assignées au chauffeur connecté
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'chauffeur')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const missions = await Reservation.find({ chauffeur: payload.userId })
    .populate('vehicule', 'marque modele annee photos ville')
    .populate('client', 'nom email telephone')
    .sort({ dateDebut: 1 })
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: missions });
}
