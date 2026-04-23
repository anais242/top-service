export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import Vehicule from '@/models/Vehicule';

// Appelé automatiquement chaque nuit à 1h par Vercel Cron
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ success: false }, { status: 401 });

  await connectDB();
  const now = new Date();

  const expirees = await Reservation.find({
    statut: 'confirmee',
    dateFin: { $lt: now },
  }).lean();

  let count = 0;
  for (const r of expirees) {
    await Reservation.findByIdAndUpdate(r._id, { statut: 'terminee' });

    // Libère le véhicule si aucune autre réservation confirmée active
    const autreActive = await Reservation.findOne({
      vehicule: r.vehicule,
      statut: 'confirmee',
      dateFin: { $gt: now },
    });
    if (!autreActive) {
      await Vehicule.findByIdAndUpdate(r.vehicule, { statut: 'disponible' });
    }
    count++;
  }

  return NextResponse.json({ success: true, terminees: count });
}
