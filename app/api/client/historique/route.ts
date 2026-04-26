export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Activite from '@/models/Activite';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/client/historique?type=&depuis=&jusqu=
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || !['client', 'business'].includes(payload.role))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Non authentifié' }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const type   = searchParams.get('type');
  const depuis = searchParams.get('depuis');
  const jusqu  = searchParams.get('jusqu');

  const filtre: Record<string, unknown> = { client: payload.userId };
  if (type && type !== 'tous') filtre.type = type;
  if (depuis || jusqu) {
    const range: Record<string, Date> = {};
    if (depuis) range.$gte = new Date(depuis);
    if (jusqu)  range.$lte = new Date(new Date(jusqu).setHours(23, 59, 59, 999));
    filtre.createdAt = range;
  }

  const activites = await Activite.find(filtre)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: activites });
}
