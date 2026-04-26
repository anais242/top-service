export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Vehicule from '@/models/Vehicule';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// GET /api/gerant/business/disponibilites
// Retourne véhicules (avec statut) + chauffeurs actifs (avec flag dispo)
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();

  const [vehicules, chauffeurs] = await Promise.all([
    Vehicule.find().select('marque modele annee prixParJour prixParHeure photos statut chauffeurDisponible').sort({ marque: 1 }).lean(),
    User.find({ role: 'chauffeur', actif: true }).select('nom telephone').sort({ nom: 1 }).lean(),
  ]);

  // Chauffeurs en mission MAINTENANT
  const now = new Date();
  const ids = chauffeurs.map((c) => c._id);

  const [resasEnCours, resasFutures] = await Promise.all([
    Reservation.find({
      chauffeur: { $in: ids },
      statut: 'confirmee',
      statutChauffeur: { $in: ['en_attente', 'acceptee'] },
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    }).select('chauffeur').lean(),
    Reservation.find({
      chauffeur: { $in: ids },
      statut: 'confirmee',
      statutChauffeur: { $in: ['en_attente', 'acceptee'] },
      dateDebut: { $gt: now },
    }).select('chauffeur dateDebut').lean(),
  ]);

  const enMission = new Set(resasEnCours.map((r) => r.chauffeur?.toString()));
  const aVenir    = new Set(resasFutures.map((r) => r.chauffeur?.toString()));

  const prochaineParChauffeur: Record<string, Date> = {};
  for (const r of resasFutures) {
    const cid = r.chauffeur?.toString();
    if (cid && (!prochaineParChauffeur[cid] || r.dateDebut < prochaineParChauffeur[cid]))
      prochaineParChauffeur[cid] = r.dateDebut;
  }

  const chauffeursAvecDispo = chauffeurs.map((c) => {
    const cid = c._id.toString();
    return {
      ...c,
      estOccupe: enMission.has(cid),
      aReservationAVenir: aVenir.has(cid) && !enMission.has(cid),
      prochaineReservation: prochaineParChauffeur[cid] ?? null,
    };
  });

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { vehicules, chauffeurs: chauffeursAvecDispo },
  });
}
