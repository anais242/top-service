export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Activite from '@/models/Activite';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/gerant/clients/[id]/historique
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();

  const client = await User.findOne({ _id: params.id, role: 'client' }).select('nom email telephone').lean();
  if (!client)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Client introuvable' }, { status: 404 });

  const activites = await Activite.find({ client: params.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: { client, activites } });
}
