import { Resend } from 'resend';

// Mettre à true quand le domaine est vérifié sur Resend
const EMAILS_ACTIFS = false;

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM  ?? 'Top Service <onboarding@resend.dev>';
const GERANT  = process.env.GERANT_EMAIL ?? 'packa.francois@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Sans domaine vérifié, tous les emails vont sur GERANT
function dest(email: string): string {
  return process.env.RESEND_DOMAINE_VERIFIE === 'true' ? email : GERANT;
}

export async function envoyerEmailBienvenue(destinataire: string, nom: string) {
  if (!EMAILS_ACTIFS) return;
  await resend.emails.send({
    from: FROM, to: dest(destinataire),
    subject: 'Bienvenue sur Top Service !',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px">
        <h1 style="color:#1a56db">Bienvenue, ${nom} !</h1>
        <p>Votre compte a été créé avec succès sur <strong>Top Service</strong>.</p>
        <p>Vous pouvez maintenant parcourir notre catalogue et réserver un véhicule.</p>
        <a href="${APP_URL}/vehicules" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Voir les véhicules
        </a>
        <p style="margin-top:32px;color:#6b7280;font-size:0.875rem">Top Service — Location de véhicules</p>
      </div>
    `,
  });
}

export async function envoyerEmailReservationClient(
  destinataire: string, nom: string,
  vehicule: string, dateDebut: string, dateFin: string,
  nombreJours: number, prixTotal: number
) {
  if (!EMAILS_ACTIFS) return;
  await resend.emails.send({
    from: FROM, to: dest(destinataire),
    subject: `Réservation reçue — ${vehicule}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px">
        <h1 style="color:#1a56db">Réservation reçue</h1>
        <p>Bonjour <strong>${nom}</strong>,</p>
        <p>Votre demande a bien été enregistrée. Le gérant va la traiter prochainement.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Véhicule :</strong> ${vehicule}</p>
          <p style="margin:0 0 8px"><strong>Du :</strong> ${dateDebut}</p>
          <p style="margin:0 0 8px"><strong>Au :</strong> ${dateFin}</p>
          <p style="margin:0 0 8px"><strong>Durée :</strong> ${nombreJours} jour${nombreJours > 1 ? 's' : ''}</p>
          <p style="margin:0;font-weight:700;color:#1a56db">Total : ${prixTotal.toLocaleString()} FCFA</p>
        </div>
        <a href="${APP_URL}/client/reservations" style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Voir mes réservations
        </a>
        <p style="margin-top:32px;color:#6b7280;font-size:0.875rem">Top Service — Location de véhicules</p>
      </div>
    `,
  });
}

export async function envoyerEmailReservationGerant(
  nomClient: string, telephoneClient: string,
  vehicule: string, dateDebut: string, dateFin: string,
  nombreJours: number, prixTotal: number, reservationId: string
) {
  if (!EMAILS_ACTIFS) return;
  await resend.emails.send({
    from: FROM, to: GERANT,
    subject: `Nouvelle réservation — ${vehicule}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px">
        <h1 style="color:#713f12">Nouvelle demande de réservation</h1>
        <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Client :</strong> ${nomClient}</p>
          <p style="margin:0 0 8px"><strong>Téléphone :</strong> ${telephoneClient}</p>
          <p style="margin:0 0 8px"><strong>Véhicule :</strong> ${vehicule}</p>
          <p style="margin:0 0 8px"><strong>Du :</strong> ${dateDebut}</p>
          <p style="margin:0 0 8px"><strong>Au :</strong> ${dateFin}</p>
          <p style="margin:0 0 8px"><strong>Durée :</strong> ${nombreJours} jour${nombreJours > 1 ? 's' : ''}</p>
          <p style="margin:0;font-weight:700;color:#713f12">Total : ${prixTotal.toLocaleString()} FCFA</p>
        </div>
        <a href="${APP_URL}/gerant/reservations" style="display:inline-block;padding:12px 24px;background:#713f12;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Gérer les réservations
        </a>
        <p style="margin-top:32px;color:#6b7280;font-size:0.875rem">Top Service — Back-office</p>
      </div>
    `,
  });
}

export async function envoyerEmailStatutReservation(
  destinataire: string, nom: string, statut: 'confirmee' | 'refusee',
  vehicule: string, dateDebut: string, dateFin: string,
  prixTotal: number, messageGerant?: string
) {
  if (!EMAILS_ACTIFS) return;
  const confirme = statut === 'confirmee';
  await resend.emails.send({
    from: FROM, to: dest(destinataire),
    subject: confirme ? `✅ Réservation confirmée — ${vehicule}` : `❌ Réservation refusée — ${vehicule}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px">
        <h1 style="color:${confirme ? '#166534' : '#991b1b'}">
          ${confirme ? 'Réservation confirmée !' : 'Réservation refusée'}
        </h1>
        <p>Bonjour <strong>${nom}</strong>,</p>
        <p>${confirme
          ? 'Bonne nouvelle ! Votre réservation a été confirmée par le gérant.'
          : "Nous sommes désolés, votre réservation n'a pas pu être acceptée."
        }</p>
        <div style="background:${confirme ? '#dcfce7' : '#fee2e2'};border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Véhicule :</strong> ${vehicule}</p>
          <p style="margin:0 0 8px"><strong>Du :</strong> ${dateDebut}</p>
          <p style="margin:0 0 8px"><strong>Au :</strong> ${dateFin}</p>
          <p style="margin:0;font-weight:700">Total : ${prixTotal.toLocaleString()} FCFA</p>
        </div>
        ${messageGerant ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px"><p style="margin:0;font-size:0.875rem"><strong>Message du gérant :</strong> ${messageGerant}</p></div>` : ''}
        <a href="${APP_URL}/client/reservations" style="display:inline-block;padding:12px 24px;background:${confirme ? '#166534' : '#991b1b'};color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Voir mes réservations
        </a>
        <p style="margin-top:32px;color:#6b7280;font-size:0.875rem">Top Service — Location de véhicules</p>
      </div>
    `,
  });
}
