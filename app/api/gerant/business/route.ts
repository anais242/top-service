export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

// GET /api/gerant/business — liste tous les clients corporate
export async function GET(req: NextRequest) {
  if (!await verifierGerant(req))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const clients = await User.find({ role: 'business' }).select('-motDePasse').sort({ createdAt: -1 }).lean();

  // Pour chaque client, compter les véhicules sous contrat
  const ids = clients.map((c) => c._id);
  const counts = await ContratVehicule.aggregate([
    { $match: { client: { $in: ids }, actif: true } },
    { $group: { _id: '$client', nb: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.nb]));

  const data = clients.map((c) => ({ ...c, nbVehicules: countMap[c._id.toString()] ?? 0 }));
  return NextResponse.json<ApiResponse>({ success: true, data });
}

// POST /api/gerant/business — créer un compte corporate + contrats véhicules
export async function POST(req: NextRequest) {
  if (!await verifierGerant(req))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.nom || !body?.email || !body?.telephone || !body?.motDePasse)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Champs requis manquants' }, { status: 400 });

  await connectDB();

  if (await User.findOne({ email: body.email.toLowerCase() }))
    return NextResponse.json<ApiResponse>({ success: false, message: 'Email déjà utilisé' }, { status: 409 });

  const hash = await bcrypt.hash(body.motDePasse, 12);
  const client = await User.create({
    nom: body.nom.trim(),
    email: body.email.toLowerCase().trim(),
    telephone: body.telephone.trim(),
    motDePasse: hash,
    role: 'business',
  });

  // Créer les contrats véhicules
  const contrats: { vehicule: string; prixParJour: number; prixParHeure?: number; avecChauffeur: boolean; chauffeur?: string }[] =
    Array.isArray(body.contrats) ? body.contrats : [];

  if (contrats.length > 0) {
    // Valider disponibilité des véhicules
    const vehiculeIds = contrats.map((c) => c.vehicule);
    const vehiculesDB = await Vehicule.find({ _id: { $in: vehiculeIds } }).select('statut marque modele').lean();
    const vehiculeMap = Object.fromEntries(vehiculesDB.map((v) => [v._id.toString(), v]));
    for (const c of contrats) {
      const v = vehiculeMap[c.vehicule];
      if (!v) return NextResponse.json<ApiResponse>({ success: false, message: `Véhicule introuvable` }, { status: 400 });
      if (v.statut !== 'disponible')
        return NextResponse.json<ApiResponse>({ success: false, message: `${v.marque} ${v.modele} est ${v.statut} — impossible de l'ajouter au contrat` }, { status: 400 });
    }

    // Valider disponibilité des chauffeurs
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
        client: client._id,
        vehicule: c.vehicule,
        prixParJour: c.prixParJour,
        prixParHeure: c.prixParHeure ?? null,
        avecChauffeur: c.avecChauffeur ?? false,
        chauffeur: c.chauffeur || null,
      }))
    );
  }

  return NextResponse.json<ApiResponse>({ success: true, data: client }, { status: 201 });
}
