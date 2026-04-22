export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import ContratVehicule from '@/models/ContratVehicule';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/business/vehicules — véhicules sous contrat pour le client connecté
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'business')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const contrats = await ContratVehicule.find({ client: payload.userId, actif: true })
    .populate('vehicule', 'marque modele annee couleur ville kilometrage carburant transmission nombrePlaces description photos prixParJour prixParHeure chauffeurDisponible statut')
    .lean();

  // Ne retourner que les contrats dont le véhicule est encore disponible
  const actifs = contrats.filter((c) => (c.vehicule as { statut?: string }).statut === 'disponible');

  return NextResponse.json<ApiResponse>({ success: true, data: actifs });
}
