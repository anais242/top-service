export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/gerant/notifications — compteurs pour la sidebar
// Paramètres optionnels : depuis_reservations, depuis_clients (timestamps ISO)
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();

  const { searchParams } = new URL(req.url);

  const depuisResas    = searchParams.get('depuis_reservations');
  const depuisClients  = searchParams.get('depuis_clients');

  const filtreResas: Record<string, unknown> = { statut: 'en_attente' };
  if (depuisResas) filtreResas.createdAt = { $gte: new Date(depuisResas) };

  const filtreClients: Record<string, unknown> = { role: 'client' };
  if (depuisClients) {
    filtreClients.createdAt = { $gte: new Date(depuisClients) };
  } else {
    filtreClients.createdAt = { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) };
  }

  const [reservations, clients] = await Promise.all([
    Reservation.countDocuments(filtreResas),
    User.countDocuments(filtreClients),
  ]);

  return NextResponse.json<ApiResponse>({ success: true, data: { reservations, clients } });
}
