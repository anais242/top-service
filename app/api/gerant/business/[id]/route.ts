export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import ContratVehicule from '@/models/ContratVehicule';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

async function verifierGerant(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant') return null;
  return payload;
}

// GET /api/gerant/business/[id] — détails client + ses contrats
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifierGerant(req))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const client = await User.findById(params.id).select('-motDePasse').lean();
  if (!client || client.role !== 'business')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Client introuvable' }, { status: 404 });

  const contrats = await ContratVehicule.find({ client: params.id, actif: true })
    .populate('vehicule', 'marque modele annee photos prixParJour prixParHeure')
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: { client, contrats } });
}

// PUT /api/gerant/business/[id] — mettre à jour les contrats véhicules
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifierGerant(req))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

  await connectDB();

  // Supprimer tous les anciens contrats et remplacer
  await ContratVehicule.deleteMany({ client: params.id });

  const contrats: { vehicule: string; prixParJour: number; prixParHeure?: number; avecChauffeur: boolean }[] =
    Array.isArray(body.contrats) ? body.contrats : [];

  if (contrats.length > 0) {
    await ContratVehicule.insertMany(
      contrats.map((c) => ({
        client: params.id,
        vehicule: c.vehicule,
        prixParJour: c.prixParJour,
        prixParHeure: c.prixParHeure ?? null,
        avecChauffeur: c.avecChauffeur ?? false,
      }))
    );
  }

  // Mettre à jour infos client si fournies
  if (body.nom || body.telephone) {
    await User.findByIdAndUpdate(params.id, {
      ...(body.nom       && { nom: body.nom.trim() }),
      ...(body.telephone && { telephone: body.telephone.trim() }),
      ...(body.actif !== undefined && { actif: body.actif }),
    });
  }

  const contratsUpdated = await ContratVehicule.find({ client: params.id })
    .populate('vehicule', 'marque modele annee photos prixParJour')
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: contratsUpdated });
}
