export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Vehicule from '@/models/Vehicule';
import Reservation from '@/models/Reservation';
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
    .populate('vehicule', 'marque modele annee photos prixParJour prixParHeure statut')
    .populate('chauffeur', 'nom telephone')
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

  const contrats: { vehicule: string; prixParJour: number; prixParHeure?: number; avecChauffeur: boolean; chauffeur?: string }[] =
    Array.isArray(body.contrats) ? body.contrats : [];

  if (contrats.length > 0) {
    // Valider dispo véhicules (uniquement ceux qui n'étaient pas déjà dans le contrat)
    const anciensContrats = await ContratVehicule.find({ client: params.id }).select('vehicule').lean();
    const anciensVehiculeIds = new Set(anciensContrats.map((c) => c.vehicule.toString()));
    const nouveauxVehiculeIds = contrats.filter((c) => !anciensVehiculeIds.has(c.vehicule)).map((c) => c.vehicule);

    if (nouveauxVehiculeIds.length > 0) {
      const vehiculesDB = await Vehicule.find({ _id: { $in: nouveauxVehiculeIds } }).select('statut marque modele').lean();
      for (const v of vehiculesDB) {
        if (v.statut !== 'disponible')
          return NextResponse.json<ApiResponse>({ success: false, message: `${v.marque} ${v.modele} est ${v.statut} — impossible de l'ajouter au contrat` }, { status: 400 });
      }
    }

    // Valider dispo chauffeurs (nouveaux seulement)
    const now = new Date();
    const chauffeurIds = contrats.filter((c) => c.chauffeur).map((c) => c.chauffeur as string);
    if (chauffeurIds.length > 0) {
      const enMission = await Reservation.find({
        chauffeur: { $in: chauffeurIds },
        statut: 'confirmee',
        statutChauffeur: { $in: ['en_attente', 'acceptee'] },
        dateDebut: { $lte: now },
        dateFin: { $gte: now },
      }).select('chauffeur').lean();
      const occupes = new Set(enMission.map((r) => r.chauffeur?.toString()));
      const chauffeurDB = await User.find({ _id: { $in: chauffeurIds }, role: 'chauffeur' }).select('nom').lean();
      const chauffeurMap = Object.fromEntries(chauffeurDB.map((c) => [c._id.toString(), c]));
      for (const id of chauffeurIds) {
        if (occupes.has(id)) {
          const ch = chauffeurMap[id];
          return NextResponse.json<ApiResponse>({ success: false, message: `${ch?.nom ?? 'Ce chauffeur'} est en mission — impossible de l'assigner` }, { status: 400 });
        }
      }
    }

    await ContratVehicule.insertMany(
      contrats.map((c) => ({
        client: params.id,
        vehicule: c.vehicule,
        prixParJour: c.prixParJour,
        prixParHeure: c.prixParHeure ?? null,
        avecChauffeur: c.avecChauffeur ?? false,
        chauffeur: c.chauffeur || null,
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
    .populate('vehicule', 'marque modele annee photos prixParJour statut')
    .populate('chauffeur', 'nom telephone')
    .lean();

  return NextResponse.json<ApiResponse>({ success: true, data: contratsUpdated });
}
