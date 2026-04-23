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
import ContratVehicule from '@/models/ContratVehicule';
import { CHAUFFEUR_JOUR, tarifChauffeur } from '@/lib/tarifs';

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

    // Vérifie qu'un véhicule est libre sur la période (exclut la réservation courante)
    const verifierDisponibiliteVehicule = async (vehiculeId: string): Promise<string | null> => {
      const conflit = await Reservation.findOne({
        _id: { $ne: params.id },
        vehicule: vehiculeId,
        statut: 'confirmee',
        dateDebut: { $lt: reservation!.dateFin },
        dateFin:   { $gt: reservation!.dateDebut },
      }).populate('client', 'nom').lean();
      if (!conflit) return null;
      const nom = (conflit.client as { nom?: string })?.nom ?? 'un client';
      const debut = new Date(conflit.dateDebut).toLocaleDateString('fr-FR');
      const fin   = new Date(conflit.dateFin).toLocaleDateString('fr-FR');
      return `Ce véhicule est déjà réservé par ${nom} du ${debut} au ${fin}`;
    };

    // Recalcule le prix total si le véhicule change
    const recalculerPrix = async (vehiculeId: string): Promise<number> => {
      const v = await Vehicule.findById(vehiculeId).lean();
      if (!v) return reservation.prixTotal;
      const contrat = await ContratVehicule.findOne({ client: reservation.client, vehicule: vehiculeId, actif: true }).lean();
      const prixJour  = contrat ? contrat.prixParJour  : v.prixParJour;
      const prixHeure = contrat ? contrat.prixParHeure : v.prixParHeure;
      let prix = reservation.typeLocation === 'heure' && reservation.nombreHeures && prixHeure
        ? reservation.nombreHeures * prixHeure
        : reservation.nombreJours * prixJour;
      if (reservation.avecChauffeur) {
        prix += reservation.typeLocation === 'heure'
          ? tarifChauffeur(new Date(reservation.dateDebut).getHours())
          : reservation.nombreJours * CHAUFFEUR_JOUR;
      }
      return prix;
    };

    // Gérant peut confirmer, refuser, terminer, assigner un chauffeur ou un véhicule
    if (payload.role === 'gerant') {
      if (body.statut) {
        // Changement de statut (avec chauffeur/véhicule optionnels en même temps)
        const statutsAutorisesGerant = ['confirmee', 'refusee', 'terminee', 'annulee'];
        if (!statutsAutorisesGerant.includes(body.statut))
          return NextResponse.json<ApiResponse>({ success: false, message: 'Statut invalide' }, { status: 400 });

        // Véhicule pré-sélectionné ou véhicule actuel : vérifier disponibilité à la confirmation
        if (body.statut === 'confirmee') {
          const vehiculeAVerifier = (body.vehiculeId || reservation.vehicule).toString();
          const erreur = await verifierDisponibiliteVehicule(vehiculeAVerifier);
          if (erreur) return NextResponse.json<ApiResponse>({ success: false, message: erreur }, { status: 409 });
        }

        // Annulation d'une réservation déjà confirmée — calcul part consommée
        if (body.statut === 'annulee' && reservation.statut === 'confirmee') {
          const now = new Date();
          const debut = new Date(reservation.dateDebut);
          const fin   = new Date(reservation.dateFin);
          let montantConsomme = 0;
          let montantRembourse = reservation.prixTotal;
          if (now > debut) {
            if (reservation.typeLocation === 'heure' || now >= fin) {
              montantConsomme  = reservation.prixTotal;
              montantRembourse = 0;
            } else {
              const joursConsommes = Math.min(Math.ceil((now.getTime() - debut.getTime()) / 86400000), reservation.nombreJours);
              montantConsomme  = Math.round((joursConsommes / reservation.nombreJours) * reservation.prixTotal);
              montantRembourse = reservation.prixTotal - montantConsomme;
            }
          }
          reservation.annulationInfo = { montantConsomme, montantRembourse, date: now };
          reservation.markModified('annulationInfo');
          // Libère le véhicule si aucune autre réservation confirmée active
          const autreActive = await Reservation.findOne({ _id: { $ne: params.id }, vehicule: reservation.vehicule, statut: 'confirmee', dateFin: { $gt: now } });
          if (!autreActive) await Vehicule.findByIdAndUpdate(reservation.vehicule, { statut: 'disponible' });
          // Libère le chauffeur
          reservation.statutChauffeur = 'non_attribue';
        }

        reservation.statut = body.statut;
        if (body.messageGerant) reservation.messageGerant = body.messageGerant;
        if (body.vehiculeId && body.vehiculeId.toString() !== reservation.vehicule.toString()) {
          const nouveauPrix = await recalculerPrix(body.vehiculeId);
          const vDoc = await Vehicule.findById(body.vehiculeId).select('marque modele').lean();
          const nomV = vDoc ? `${vDoc.marque} ${vDoc.modele}` : 'nouveau véhicule';
          reservation.vehicule  = body.vehiculeId;
          reservation.prixTotal = nouveauPrix;
          reservation.notifClient = { message: `Réservation confirmée — véhicule attribué : ${nomV}. Prix total : ${nouveauPrix.toLocaleString('fr-FR')} FCFA`, lu: false, date: new Date() };
          reservation.markModified('notifClient');
        } else if (body.vehiculeId) {
          reservation.vehicule = body.vehiculeId;
        }

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
        // Assignation véhicule seul (post-confirmation) : vérifier disponibilité
        if (!body.vehiculeId)
          return NextResponse.json<ApiResponse>({ success: false, message: 'vehiculeId requis' }, { status: 400 });
        const erreur = await verifierDisponibiliteVehicule(body.vehiculeId);
        if (erreur) return NextResponse.json<ApiResponse>({ success: false, message: erreur }, { status: 409 });
        if (body.vehiculeId.toString() !== reservation.vehicule.toString()) {
          const nouveauPrix = await recalculerPrix(body.vehiculeId);
          const vDoc = await Vehicule.findById(body.vehiculeId).select('marque modele').lean();
          const nomV = vDoc ? `${vDoc.marque} ${vDoc.modele}` : 'nouveau véhicule';
          reservation.vehicule  = body.vehiculeId;
          reservation.prixTotal = nouveauPrix;
          reservation.notifClient = { message: `Le gérant a modifié votre véhicule : ${nomV}. Nouveau prix : ${nouveauPrix.toLocaleString('fr-FR')} FCFA`, lu: false, date: new Date() };
          reservation.markModified('notifClient');
        } else {
          reservation.vehicule = body.vehiculeId;
        }
        await reservation.save();
        const updated = await reservation.populate('vehicule', 'marque modele annee photos');
        return NextResponse.json<ApiResponse>({ success: true, data: updated });
      } else {
        return NextResponse.json<ApiResponse>({ success: false, message: 'Paramètre manquant' }, { status: 400 });
      }
    }
    // Client peut annuler ses réservations en attente ou marquer une notif comme lue
    else if (payload.role === 'client') {
      if (reservation.client.toString() !== payload.userId)
        return NextResponse.json<ApiResponse>({ success: false, message: 'Accès refusé' }, { status: 403 });
      if (body.marquerNotifLue) {
        if (reservation.notifClient) {
          (reservation.notifClient as Record<string, unknown>).lu = true;
          reservation.markModified('notifClient');
        }
        await reservation.save();
        return NextResponse.json<ApiResponse>({ success: true });
      }
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
