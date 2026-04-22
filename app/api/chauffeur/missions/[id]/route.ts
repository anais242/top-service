export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// PUT /api/chauffeur/missions/[id] — accepter ou refuser une mission
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'chauffeur')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.statutChauffeur || !['acceptee', 'refusee'].includes(body.statutChauffeur))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Statut invalide' }, { status: 400 });

  await connectDB();
  const reservation = await Reservation.findById(params.id);
  if (!reservation)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Mission introuvable' }, { status: 404 });

  if (reservation.chauffeur?.toString() !== payload.userId)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  reservation.statutChauffeur = body.statutChauffeur;
  await reservation.save();

  return NextResponse.json<ApiResponse>({ success: true, data: reservation });
}
