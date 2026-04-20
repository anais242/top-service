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
    if (!body?.statut) return NextResponse.json<ApiResponse>({ success: false, message: 'Statut manquant' }, { status: 400 });

    await connectDB();
    const reservation = await Reservation.findById(params.id);
    if (!reservation) return NextResponse.json<ApiResponse>({ success: false, message: 'Réservation introuvable' }, { status: 404 });

    // Gérant peut confirmer, refuser, terminer
    if (payload.role === 'gerant') {
      const statutsAutorisesGerant = ['confirmee', 'refusee', 'terminee'];
      if (!statutsAutorisesGerant.includes(body.statut))
        return NextResponse.json<ApiResponse>({ success: false, message: 'Statut invalide' }, { status: 400 });
      reservation.statut = body.statut;
      if (body.messageGerant) reservation.messageGerant = body.messageGerant;
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
    const updated = await reservation.populate('vehicule', 'marque modele annee photos');

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
