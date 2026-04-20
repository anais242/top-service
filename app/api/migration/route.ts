export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Vehicule from '@/models/Vehicule';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';

// POST /api/migration — gérant seulement, patch les véhicules sans ville
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const result = await Vehicule.updateMany(
    { ville: { $in: [null, undefined, ''] } },
    { $set: { ville: 'brazzaville' } }
  );

  return NextResponse.json({
    success: true,
    message: `${result.modifiedCount} véhicule(s) mis à jour → brazzaville`,
  });
}
