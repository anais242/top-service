export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import Vehicule from '@/models/Vehicule';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

// Assigne automatiquement un véhicule libre aux réservations en_attente dont le véhicule est occupé.
// Si vehiculeId est fourni, on essaie uniquement ce véhicule (ex: juste après sa création).
// Sinon on parcourt tout le parc disponible.
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'gerant')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const vehiculeIdCible: string | null = body.vehiculeId ?? null;

    await connectDB();

    // Réservations en attente avec leur véhicule
    const pending = await Reservation.find({ statut: 'en_attente' })
      .populate('vehicule', '_id marque modele annee')
      .lean();

    // Véhicules candidats à l'assignation
    const candidats = vehiculeIdCible
      ? await Vehicule.find({ _id: vehiculeIdCible }).lean()
      : await Vehicule.find({ statut: 'disponible' }).lean();

    let assignees = 0;
    const detailsAssignes: { reservationId: string; vehicule: string }[] = [];

    for (const resa of pending) {
      const vidActuel = (resa.vehicule as { _id: { toString(): string } })?._id?.toString();

      // Vérifie si le véhicule actuel est déjà confirmé sur ces dates
      const conflit = vidActuel ? await Reservation.findOne({
        _id: { $ne: resa._id },
        vehicule: vidActuel,
        statut: 'confirmee',
        dateDebut: { $lt: resa.dateFin },
        dateFin:   { $gt: resa.dateDebut },
      }).lean() : true;

      if (!conflit) continue; // Pas de conflit → pas besoin de réassigner

      // Cherche le premier candidat libre sur ces dates
      for (const v of candidats) {
        if (v._id.toString() === vidActuel) continue;

        const occupe = await Reservation.findOne({
          _id: { $ne: resa._id },
          vehicule: v._id,
          statut: 'confirmee',
          dateDebut: { $lt: resa.dateFin },
          dateFin:   { $gt: resa.dateDebut },
        }).lean();

        if (!occupe) {
          await Reservation.findByIdAndUpdate(resa._id, { vehicule: v._id });
          assignees++;
          detailsAssignes.push({ reservationId: resa._id.toString(), vehicule: `${v.marque} ${v.modele} ${v.annee}` });
          break; // Passe à la réservation suivante
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { assignees, details: detailsAssignes },
      message: assignees > 0
        ? `${assignees} réservation${assignees > 1 ? 's' : ''} réassignée${assignees > 1 ? 's' : ''} automatiquement`
        : 'Aucune réassignation nécessaire',
    });
  } catch (error) {
    console.error('[POST /api/gerant/auto-assigner]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
