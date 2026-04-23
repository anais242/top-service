export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';
import User from '@/models/User';
import Vehicule from '@/models/Vehicule';
import { envoyerEmailStatutReservation } from '@/lib/emails/resend';

// GET /api/reservations/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, message: 'Non authentifié' }, { status: 401 });

    await connectDB();
    const reservation = await Reservation.findById(params.id)
      .populate('vehicule', 'marque modele annee photos prixParJour')
      .populate('client', 'nom email telephone')
      .lean();

    if (!reservation) return NextResponse.json<ApiResponse>({ success: false, message: 'Réservation introuvable' }, { status: 404 });

    // Client ne peut voir que ses propres réservations
    if (payload.role === 'client' && reservation.client._id?.toString() !== payload.userId)
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    return NextResponse.json<ApiResponse>({ success: true, data: reservation });
  } catch (error) {
    console.error('[GET /api/reservations/[id]]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/reservations/[id] — changer le statut
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, message: 'Non authentifié' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Corps invalide' }, { status: 400 });

    await connectDB();
    const reservation = await Reservation.findById(params.id);
    if (!reservation) return NextResponse.json<ApiResponse>({ success: false, message: 'Réservation introuvable' }, { status: 404 });

    // Gérant peut confirmer, refuser, terminer, assigner un chauffeur ou un véhicule
    if (payload.role === 'gerant') {
      if (body.statut) {
        // Changement de statut (avec chauffeur/véhicule optionnels en même temps)
        const statutsAutorisesGerant = ['confirmee', 'refusee', 'terminee'];
        if (!statutsAutorisesGerant.includes(body.statut))
          return NextResponse.json<ApiResponse>({ success: false, message: 'Statut invalide' }, { status: 400 });
        reservation.statut = body.statut;
        if (body.messageGerant) reservation.messageGerant = body.messageGerant;

        // Véhicule pré-sélectionné
        if (body.vehiculeId) reservation.vehicule = body.vehiculeId;

        // Chauffeur : pré-sélectionné > auto-assignation
        if (body.chauffeurId !== undefined) {
          reservation.chauffeur = body.chauffeurId || null;
          reservation.statutChauffeur = body.chauffeurId ? 'en_attente' : 'non_attribue';
        } else if (body.statut === 'confirmee' && reservation.avecChauffeur && !reservation.chauffeur) {
          const reservationsActives = await Reservation.find({
            statut: 'confirmee',
            statutChauffeur: { $in: ['en_attente', 'acceptee'] },
            chauffeur: { $ne: null },
          }).select('chauffeur').lean();
          const occupe = new Set(reservationsActives.map((r) => r.chauffeur?.toString()));
          const chauffeurLibre = await User.findOne({ role: 'chauffeur', actif: true, _id: { $nin: Array.from(occupe) } }).lean();
          if (chauffeurLibre) {
            reservation.chauffeur = chauffeurLibre._id;
            reservation.statutChauffeur = 'en_attente';
          }
        }
      } else if (body.chauffeurId !== undefined) {
        // Assignation chauffeur seul (post-confirmation)
        reservation.chauffeur = body.chauffeurId || null;
        reservation.statutChauffeur = body.chauffeurId ? 'en_attente' : 'non_attribue';
        await reservation.save();
        return NextResponse.json<ApiResponse>({ success: true, data: reservation });
      } else if (body.vehiculeId !== undefined) {
        // Assignation véhicule seul (post-confirmation)
        if (!body.vehiculeId)
          return NextResponse.json<ApiResponse>({ success: false, message: 'vehiculeId requis' }, { status: 400 });
        reservation.vehicule = body.vehiculeId;
        await reservation.save();
        const updated = await reservation.populate('vehicule', 'marque modele annee photos');
        return NextResponse.json<ApiResponse>({ success: true, data: updated });
      } else {
        return NextResponse.json<ApiResponse>({ success: false, message: 'Paramètre manquant' }, { status: 400 });
      }
    }
    // Client peut uniquement annuler ses propres réservations en attente
    else if (payload.role === 'client') {
      if (reservation.client.toString() !== payload.userId)
        return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });
      if (body.statut !== 'annulee' || reservation.statut !== 'en_attente')
        return NextResponse.json<ApiResponse>({ success: false, message: 'Annulation impossible' }, { status: 400 });
      reservation.statut = 'annulee';
    } else {
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });
    }

    await reservation.save();
    const updated = await reservation.populate([
      { path: 'vehicule', select: 'marque modele annee photos' },
      { path: 'chauffeur', select: 'nom' },
    ]);

    // Email au client si confirmée ou refusée
    if (payload.role === 'gerant' && ['confirmee', 'refusee'].includes(body.statut)) {
      const [client, vehicule] = await Promise.all([
        User.findById(reservation.client).select('nom email').lean(),
        Vehicule.findById(reservation.vehicule).select('marque modele').lean(),
      ]);
      if (client && vehicule) {
        const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR');
        envoyerEmailStatutReservation(
          client.email, client.nom,
          body.statut as 'confirmee' | 'refusee',
          `${vehicule.marque} ${vehicule.modele}`,
          fmt(reservation.dateDebut), fmt(reservation.dateFin),
          reservation.prixTotal, body.messageGerant
        ).catch((e) => console.error('[email statut réservation]', e));
      }
    }

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch (error) {
    console.error('[PUT /api/reservations/[id]]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
