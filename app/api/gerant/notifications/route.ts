export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/gerant/notifications — compteurs pour la sidebar
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();

  const depuis48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [reservations, clients] = await Promise.all([
    Reservation.countDocuments({ statut: 'en_attente' }),
    User.countDocuments({ role: 'client', createdAt: { $gte: depuis48h } }),
  ]);

  return NextResponse.json<ApiResponse>({ success: true, data: { reservations, clients } });
}
