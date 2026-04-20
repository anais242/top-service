import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Reservation from '@/models/Reservation';
import Vehicule from '@/models/Vehicule';
import User from '@/models/User';
import { verifierAccessToken } from '@/lib/auth/jwt';
import { COOKIE_ACCESS } from '@/lib/auth/cookies';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_ACCESS)?.value;
    const payload = token ? await verifierAccessToken(token) : null;
    if (!payload || payload.role !== 'gerant')
      return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });

    await connectDB();

    const maintenant = new Date();
    const debutMois  = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const debutAn    = new Date(maintenant.getFullYear(), 0, 1);

    // Requêtes parallèles pour la performance
    const [
      totalVehicules,
      vehiculesParStatut,
      totalClients,
      reservationsParStatut,
      revenusMois,
      revenusTotal,
      dernieresReservations,
      revenusParMois,
      vehiculesPlusLoues,
    ] = await Promise.all([
      // Nombre total de véhicules
      Vehicule.countDocuments(),

      // Véhicules par statut
      Vehicule.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),

      // Nombre de clients
      User.countDocuments({ role: 'client' }),

      // Réservations par statut
      Reservation.aggregate([
        { $group: { _id: '$statut', count: { $sum: 1 } } }
      ]),

      // Revenus ce mois (réservations confirmées + terminées)
      Reservation.aggregate([
        { $match: { statut: { $in: ['confirmee', 'terminee'] }, createdAt: { $gte: debutMois } } },
        { $group: { _id: null, total: { $sum: '$prixTotal' } } }
      ]),

      // Revenus totaux
      Reservation.aggregate([
        { $match: { statut: { $in: ['confirmee', 'terminee'] } } },
        { $group: { _id: null, total: { $sum: '$prixTotal' } } }
      ]),

      // 5 dernières réservations
      Reservation.find()
        .populate('vehicule', 'marque modele photos')
        .populate('client', 'nom telephone')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Revenus par mois sur les 6 derniers mois
      Reservation.aggregate([
        {
          $match: {
            statut: { $in: ['confirmee', 'terminee'] },
            createdAt: { $gte: new Date(maintenant.getFullYear(), maintenant.getMonth() - 5, 1) }
          }
        },
        {
          $group: {
            _id: { annee: { $year: '$createdAt' }, mois: { $month: '$createdAt' } },
            revenus: { $sum: '$prixTotal' },
            nombre:  { $sum: 1 },
          }
        },
        { $sort: { '_id.annee': 1, '_id.mois': 1 } }
      ]),

      // Top 5 véhicules les plus loués
      Reservation.aggregate([
        { $match: { statut: { $in: ['confirmee', 'terminee'] } } },
        { $group: { _id: '$vehicule', nombre: { $sum: 1 }, revenus: { $sum: '$prixTotal' } } },
        { $sort: { nombre: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'vehicules', localField: '_id', foreignField: '_id', as: 'vehicule' } },
        { $unwind: '$vehicule' },
        { $project: { nombre: 1, revenus: 1, 'vehicule.marque': 1, 'vehicule.modele': 1, 'vehicule.photos': 1 } }
      ]),
    ]);

    // Formatage revenus par mois (remplir les mois sans données)
    const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const graphiqueMois = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const trouve = revenusParMois.find(
        (r: { _id: { annee: number; mois: number } }) => r._id.annee === d.getFullYear() && r._id.mois === d.getMonth() + 1
      );
      graphiqueMois.push({
        mois:    MOIS[d.getMonth()],
        revenus: trouve?.revenus ?? 0,
        nombre:  trouve?.nombre  ?? 0,
      });
    }

    // Statuts réservations en objet
    const statuts: Record<string, number> = {};
    for (const s of reservationsParStatut) statuts[s._id] = s.count;

    // Taux d'occupation = véhicules loués / total
    const vehiculesLoues = vehiculesParStatut.find((v: { _id: string }) => v._id === 'loue')?.count ?? 0;
    const tauxOccupation = totalVehicules > 0 ? Math.round((vehiculesLoues / totalVehicules) * 100) : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        kpis: {
          totalVehicules,
          tauxOccupation,
          totalClients,
          revenusMois:  revenusMois[0]?.total  ?? 0,
          revenusTotal: revenusTotal[0]?.total ?? 0,
          reservationsEnAttente: statuts['en_attente'] ?? 0,
          reservationsConfirmees: statuts['confirmee'] ?? 0,
          reservationsTerminees:  statuts['terminee']  ?? 0,
        },
        vehiculesParStatut: vehiculesParStatut.map((v: { _id: string; count: number }) => ({
          statut: v._id, count: v.count,
        })),
        graphiqueMois,
        vehiculesPlusLoues,
        dernieresReservations,
      },
    });
  } catch (error) {
    console.error('[GET /api/stats]', error);
    return NextResponse.json<ApiResponse>({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
