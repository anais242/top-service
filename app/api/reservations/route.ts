export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import Vehicule from '@/models/Vehicule';
import { schemaReservation } from '@/lib/validation/reservation.schemas';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';
import { envoyerEmailReservationClient, envoyerEmailReservationGerant } from '@/lib/emails/resend';
import User from '@/models/User';
import ContratVehicule from '@/models/ContratVehicule';
import { CHAUFFEUR_JOUR, tarifChauffeur } from '@/lib/tarifs';

// GET /api/reservations — liste selon le rôle
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, message: 'Non authentifié' }, { status: 401 });

    await connectDB();

    const filtre = payload.role === 'gerant'
      ? {}                                          // gérant voit tout
      : { client: payload.userId };                 // client voit les siennes

    const reservations = await Reservation.find(filtre)
      .populate('vehicule', 'marque modele annee photos prixParJour')
      .populate('client', 'nom email telephone')
      .populate('chauffeur', 'nom email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json<ApiResponse>({ success: true, data: reservations });
  } catch (error) {
    console.error('[GET /api/reservations]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/reservations — créer une réservation (client connecté)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || !['client', 'business'].includes(payload.role))
      return NextResponse.json<ApiResponse>({ success: false, message: 'Connexion requise' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

    const validation = schemaReservation.safeParse(body);
    if (!validation.success)
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Données invalides', errors: validation.error.flatten().fieldErrors as Record<string, string[]> },
        { status: 422 }
      );

    const { vehiculeId, typeLocation, messageClient, avecChauffeur } = validation.data;
    const dateDebut = new Date(validation.data.dateDebut);

    // Vérification que la date de début est dans le futur
    if (dateDebut < new Date())
      return NextResponse.json<ApiResponse>({ success: false, message: 'La date de début doit être dans le futur' }, { status: 400 });

    await connectDB();

    // Vérification existence et disponibilité du véhicule
    const vehicule = await Vehicule.findById(vehiculeId);
    if (!vehicule || vehicule.statut !== 'disponible')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Véhicule indisponible' }, { status: 400 });

    // Pour les clients corporate, récupérer le contrat négocié
    let contrat = null;
    if (payload.role === 'business') {
      contrat = await ContratVehicule.findOne({ client: payload.userId, vehicule: vehiculeId, actif: true });
      if (!contrat)
        return NextResponse.json<ApiResponse>({ success: false, message: 'Ce véhicule ne fait pas partie de votre contrat' }, { status: 403 });
    }

    // Calcul dateFin, durée et prix selon le type
    let dateFin: Date;
    let nombreJours = 0;
    let nombreHeures: number | null = null;
    let prixTotal: number;

    // Tarifs : utilise le contrat corporate si disponible, sinon tarif standard
    const prixJour  = contrat ? contrat.prixParJour  : vehicule.prixParJour;
    const prixHeure = contrat ? contrat.prixParHeure : vehicule.prixParHeure;

    if (typeLocation === 'heure') {
      if (!prixHeure)
        return NextResponse.json<ApiResponse>({ success: false, message: 'Ce véhicule ne propose pas de location à l\'heure' }, { status: 400 });
      nombreHeures = (validation.data as { nombreHeures: number }).nombreHeures;
      dateFin = new Date(dateDebut.getTime() + nombreHeures * 60 * 60 * 1000);
      prixTotal = nombreHeures * prixHeure;
    } else {
      const dF = (validation.data as { dateFin: string }).dateFin;
      dateFin = new Date(dF);
      const ms = dateFin.getTime() - dateDebut.getTime();
      nombreJours = Math.ceil(ms / (1000 * 60 * 60 * 24));
      prixTotal = nombreJours * prixJour;
    }

    // Tarif chauffeur en supplément (tarifs fixes : 7 500 F jour / 10 000 F nuit)
    if (avecChauffeur) {
      // Pour un corporate, vérifier que le contrat autorise le chauffeur
      if (contrat && !contrat.avecChauffeur)
        return NextResponse.json<ApiResponse>({ success: false, message: 'Le chauffeur n\'est pas inclus dans votre contrat pour ce véhicule' }, { status: 400 });
      if (typeLocation === 'jour') {
        prixTotal += nombreJours * CHAUFFEUR_JOUR;
      } else if (typeLocation === 'heure') {
        prixTotal += tarifChauffeur(dateDebut.getHours());
      }
    }

    // Vérification conflit de dates
    const conflit = await Reservation.findOne({
      vehicule: vehiculeId,
      statut: { $in: ['en_attente', 'confirmee'] },
      $or: [{ dateDebut: { $lt: dateFin }, dateFin: { $gt: dateDebut } }],
    });
    if (conflit)
      return NextResponse.json<ApiResponse>({ success: false, message: 'Ce créneau est déjà réservé' }, { status: 409 });

    const reservation = await Reservation.create({
      vehicule: vehiculeId,
      client: payload.userId,
      typeLocation,
      dateDebut,
      dateFin,
      nombreJours,
      nombreHeures,
      prixTotal,
      avecChauffeur: avecChauffeur ?? false,
      messageClient,
    });

    const reservationPeuplee = await reservation.populate('vehicule', 'marque modele annee photos');
    const client = await User.findById(payload.userId).select('nom email telephone').lean();

    if (client) {
      const nomVehicule = `${vehicule.marque} ${vehicule.modele}`;
      const fmt = (d: Date) => d.toLocaleDateString('fr-FR');
      envoyerEmailReservationClient(
        client.email, client.nom, nomVehicule,
        fmt(dateDebut), fmt(dateFin), nombreJours, prixTotal
      ).catch((e) => console.error('[email réservation client]', e));

      envoyerEmailReservationGerant(
        client.nom, client.telephone, nomVehicule,
        fmt(dateDebut), fmt(dateFin), nombreJours, prixTotal, reservation._id.toString()
      ).catch((e) => console.error('[email réservation gérant]', e));
    }

    return NextResponse.json<ApiResponse>({ success: true, data: reservationPeuplee }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/reservations]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
