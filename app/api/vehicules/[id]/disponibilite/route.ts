export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import type { ApiResponse } from '@/types';

// GET /api/vehicules/[id]/disponibilite?mois=2025-06
// Retourne les dates occupées pour un véhicule donné
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mois = searchParams.get('mois'); // format YYYY-MM

    let debut: Date, fin: Date;
    if (mois && /^\d{4}-\d{2}$/.test(mois)) {
      const [annee, m] = mois.split('-').map(Number);
      debut = new Date(annee, m - 1, 1);
      fin   = new Date(annee, m + 1, 0); // dernier jour du mois suivant (fenêtre 2 mois)
    } else {
      debut = new Date();
      fin   = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 jours
    }

    const reservations = await Reservation.find({
      vehicule: params.id,
      statut: { $in: ['en_attente', 'confirmee'] },
      dateDebut: { $lte: fin },
      dateFin:   { $gte: debut },
    }).select('dateDebut dateFin statut').lean();

    // Retourne les plages occupées
    const plages = reservations.map((r) => ({
      debut:  r.dateDebut,
      fin:    r.dateFin,
      statut: r.statut,
    }));

    return NextResponse.json<ApiResponse>({ success: true, data: plages });
  } catch (error) {
    console.error('[GET disponibilite]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
