export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';

// GET /api/gerant/chauffeurs — liste tous les chauffeurs avec flag estOccupe
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  await connectDB();
  const chauffeurs = await User.find({ role: 'chauffeur' }).select('-motDePasse').sort({ createdAt: -1 }).lean();

  const now = new Date();
  const ids = chauffeurs.map((c) => c._id);

  // Réservations EN COURS maintenant
  const resasEnCours = await Reservation.find({
    chauffeur: { $in: ids },
    statut: 'confirmee',
    statutChauffeur: { $in: ['en_attente', 'acceptee'] },
    dateDebut: { $lte: now },
    dateFin:   { $gte: now },
  }).populate('vehicule', 'marque modele annee').select('chauffeur vehicule dateDebut dateFin').lean();

  // Réservations FUTURES (pas encore commencées)
  const resasFutures = await Reservation.find({
    chauffeur: { $in: ids },
    statut: 'confirmee',
    statutChauffeur: { $in: ['en_attente', 'acceptee'] },
    dateDebut: { $gt: now },
  }).select('chauffeur dateDebut dateFin').lean();

  const enMission   = new Set(resasEnCours.map((r) => r.chauffeur?.toString()));
  const aVenir      = new Set(resasFutures.map((r) => r.chauffeur?.toString()));

  const vehiculeParChauffeur: Record<string, { marque: string; modele: string; annee: number; dateDebut: Date; dateFin: Date }> = {};
  for (const r of resasEnCours) {
    const cid = r.chauffeur?.toString();
    if (cid && r.vehicule && typeof r.vehicule === 'object' && 'marque' in r.vehicule) {
      const v = r.vehicule as unknown as { marque: string; modele: string; annee: number };
      vehiculeParChauffeur[cid] = { marque: v.marque, modele: v.modele, annee: v.annee, dateDebut: r.dateDebut, dateFin: r.dateFin };
    }
  }

  // Prochaine réservation par chauffeur
  const prochaineParChauffeur: Record<string, Date> = {};
  for (const r of resasFutures) {
    const cid = r.chauffeur?.toString();
    if (cid && (!prochaineParChauffeur[cid] || r.dateDebut < prochaineParChauffeur[cid])) {
      prochaineParChauffeur[cid] = r.dateDebut;
    }
  }

  const data = chauffeurs.map((c) => {
    const cid = c._id.toString();
    return {
      ...c,
      estOccupe:       enMission.has(cid),
      aReservationAVenir: aVenir.has(cid) && !enMission.has(cid),
      prochaineReservation: prochaineParChauffeur[cid] ?? null,
      vehiculeActuel:  vehiculeParChauffeur[cid] ?? null,
    };
  });
  return NextResponse.json<ApiResponse>({ success: true, data });
}

// POST /api/gerant/chauffeurs — créer un compte chauffeur
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  const payload = token ? await verifierAccessToken(token) : null;
  if (!payload || payload.role !== 'gerant')
    return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.nom || !body?.email || !body?.telephone || !body?.motDePasse)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Champs requis manquants' }, { status: 400 });

  await connectDB();

  const existe = await User.findOne({ email: body.email.toLowerCase() });
  if (existe)
    return NextResponse.json<ApiResponse>({ success: false, message: 'Email déjà utilisé' }, { status: 409 });

  const hash = await bcrypt.hash(body.motDePasse, 12);
  const chauffeur = await User.create({
    nom: body.nom.trim(),
    email: body.email.toLowerCase().trim(),
    telephone: body.telephone.trim(),
    motDePasse: hash,
    role: 'chauffeur',
  });

  return NextResponse.json<ApiResponse>({ success: true, data: chauffeur }, { status: 201 });
}
