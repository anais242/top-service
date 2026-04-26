export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/gerant/clients — liste tous les clients avec leur nombre de réservations
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const clients = await User.find({ role: 'client' }).select('-motDePasse').sort({ createdAt: -1 }).lean();

  const ids = clients.map((c) => c._id);

  const totaux = await Reservation.aggregate([
    { $match: { client: { $in: ids } } },
    { $group: { _id: '$client', total: { $sum: 1 } } },
  ]);

  const totalParClient: Record<string, number> = {};
  for (const t of totaux) totalParClient[t._id.toString()] = t.total;

  const data = clients.map((c) => ({
    ...c,
    nbReservations: totalParClient[c._id.toString()] ?? 0,
  }));

  return NextResponse.json<ApiResponse>({ success: true, data });
}
