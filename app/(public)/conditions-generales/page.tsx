import Link from 'next/link';
import NavbarPublique from '@/app/components/NavbarPublique';

const ARTICLES = [
  {
    num: '1',
    titre: 'Objet et champ d\'application',
    contenu: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Top Service, service de location de véhicules opérant à Brazzaville et Pointe-Noire, République du Congo.

Toute réservation effectuée sur la plateforme implique l'acceptation pleine et entière des présentes CGU. Ces conditions s'appliquent à toute personne physique majeure (18 ans et plus) disposant d'un permis de conduire en cours de validité.`,
  },
  {
    num: '2',
    titre: 'Création de compte et accès au service',
    contenu: `La création d'un compte est obligatoire pour effectuer une réservation. Le client s'engage à fournir des informations exactes, complètes et à jour (nom, adresse e-mail, numéro de téléphone).

Chaque compte est strictement personnel et ne peut être cédé. Le client est responsable de la confidentialité de ses identifiants. Toute utilisation frauduleuse portée à la connaissance du client doit être immédiatement signalée à Top Service.

Top Service se réserve le droit de suspendre ou supprimer tout compte en cas d'informations erronées, de comportement abusif ou de non-respect des présentes CGU.`,
  },
  {
    num: '3',
    titre: 'Processus de réservation',
    contenu: `La réservation s'effectue en ligne en sélectionnant un véhicule disponible, les dates de location, le type de location (à la journée ou à l'heure) et les options souhaitées (avec ou sans chauffeur).

La réservation n'est pas automatiquement confirmée : elle est soumise à la validation du gérant de l'agence dans un délai de 24 heures ouvrables. Le client reçoit une notification par e-mail ou via la plateforme dès que sa demande est traitée.

En cas de non-disponibilité du véhicule ou d'impossibilité technique, Top Service s'engage à en informer le client dans les meilleurs délais et à lui proposer une alternative.`,
  },
  {
    num: '4',
    titre: 'Tarifs et conditions de paiement',
    contenu: `Les tarifs affichés sur la plateforme sont exprimés en Francs CFA (FCFA) et s'entendent toutes taxes comprises.

Le paiement s'effectue selon les modalités convenues avec l'agence (espèces, Mobile Money ou virement). Aucun paiement en ligne n'est collecté directement via la plateforme à ce stade.

Le prix total affiché lors de la réservation est définitif et inclut : le tarif de location du véhicule (à la journée ou à l'heure), ainsi que, le cas échéant, le supplément chauffeur (7 500 FCFA pour une prestation de 7h à 21h, 10 000 FCFA pour une prestation de 21h à 6h).

Tout dépassement de la durée de location convenue fera l'objet d'une facturation supplémentaire au tarif horaire ou journalier en vigueur.`,
  },
  {
    num: '5',
    titre: 'Conditions de prise en charge et restitution du véhicule',
    contenu: `Le client doit se présenter au lieu de prise en charge convenu à l'heure indiquée, muni d'une pièce d'identité valide et de son permis de conduire en cours de validité.

Le véhicule est remis propre, avec le plein de carburant. Le client s'engage à restituer le véhicule dans le même état, au lieu et à l'heure convenus. Tout retard non signalé dans les délais sera facturé.

Un état des lieux contradictoire peut être effectué au départ et au retour du véhicule. Tout dommage constaté à la restitution et non préexistant à la location sera à la charge du locataire.`,
  },
  {
    num: '6',
    titre: 'Obligations et responsabilités du locataire',
    contenu: `Le locataire s'engage à :

— Utiliser le véhicule conformément à sa destination et au Code de la route en vigueur en République du Congo.
— Ne pas sous-louer, prêter ou céder le véhicule à un tiers non autorisé.
— Ne pas utiliser le véhicule pour le transport rémunéré de personnes ou de marchandises sans autorisation préalable.
— Ne pas conduire sous l'emprise de l'alcool, de stupéfiants ou de tout autre substance altérant les capacités.
— Signaler immédiatement à Top Service tout accident, vol, panne ou dommage survenu pendant la période de location.
— Respecter la capacité maximale de chargement et le nombre de places autorisé.

Le locataire est responsable de toute infraction au Code de la route commise pendant la période de location ainsi que des dommages causés au véhicule par un usage non conforme.`,
  },
  {
    num: '7',
    titre: 'Assurance et couverture',
    contenu: `Les véhicules mis à disposition par Top Service sont couverts par une assurance automobile conformément à la réglementation en vigueur en République du Congo.

En cas d'accident, le locataire est tenu de remplir un constat amiable, de recueillir les coordonnées des témoins et d'informer Top Service dans un délai de 24 heures. Tout accident non déclaré ou dont les circonstances sont litigieuses pourra engager la responsabilité personnelle du locataire.

Les dommages résultant d'une faute lourde, d'une utilisation non conforme ou d'actes délibérés ne sont pas couverts et resteront à la charge exclusive du locataire.`,
  },
  {
    num: '8',
    titre: 'Annulation et modification de réservation',
    contenu: `Le client peut annuler sa réservation depuis son espace personnel tant que celle-ci est en statut « En attente ». Une réservation déjà confirmée ne peut plus être annulée via la plateforme ; le client doit contacter directement l'agence.

Top Service se réserve le droit d'annuler une réservation en cas de force majeure, d'indisponibilité imprévue du véhicule ou de non-respect avéré des présentes CGU par le client.

En cas d'annulation à l'initiative de Top Service, aucune pénalité ne sera appliquée au client.`,
  },
  {
    num: '9',
    titre: 'Service avec chauffeur',
    contenu: `Lorsque le client opte pour la location avec chauffeur, Top Service s'engage à mettre à disposition un conducteur qualifié et expérimenté.

Les tarifs du service chauffeur sont les suivants :
— Prestation de jour (7h à 21h) : 7 500 FCFA
— Prestation de nuit (21h à 6h) : 10 000 FCFA

Le chauffeur est soumis à l'autorité et aux instructions de l'agence. Il n'est pas tenu d'effectuer des trajets ou des missions contraires à la réglementation en vigueur ou présentant un danger pour sa sécurité.

Le client est tenu de traiter le chauffeur avec respect. Tout comportement irrespectueux, violent ou discriminatoire pourra entraîner l'interruption immédiate de la prestation sans remboursement.`,
  },
  {
    num: '10',
    titre: 'Protection des données personnelles',
    contenu: `Top Service collecte et traite les données personnelles des clients (nom, e-mail, téléphone) dans le strict cadre de la gestion des réservations et de la relation client.

Ces données ne sont ni vendues, ni cédées à des tiers à des fins commerciales. Elles peuvent être transmises aux autorités compétentes sur réquisition judiciaire.

Conformément aux dispositions légales applicables, le client dispose d'un droit d'accès, de rectification et de suppression de ses données en adressant une demande à l'agence via la plateforme.

Les données sont conservées pour la durée nécessaire à la gestion des relations contractuelles et au respect des obligations légales.`,
  },
  {
    num: '11',
    titre: 'Limitation de responsabilité',
    contenu: `Top Service met tout en œuvre pour garantir la disponibilité et le bon fonctionnement de la plateforme, mais ne saurait être tenu responsable des interruptions de service dues à des pannes techniques, à des travaux de maintenance ou à des causes extérieures (force majeure, défaillance réseau, etc.).

La responsabilité de Top Service ne pourra être engagée pour les dommages indirects ou immatériels résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.`,
  },
  {
    num: '12',
    titre: 'Modification des CGU',
    contenu: `Top Service se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la plateforme.

En cas de modification substantielle, les clients enregistrés seront informés par e-mail. L'utilisation continue de la plateforme après notification vaut acceptation des nouvelles conditions.`,
  },
  {
    num: '13',
    titre: 'Droit applicable et règlement des litiges',
    contenu: `Les présentes CGU sont soumises au droit de la République du Congo.

En cas de litige, le client est invité à contacter Top Service en premier lieu pour rechercher une solution amiable. À défaut d'accord dans un délai de 30 jours, le litige sera soumis aux tribunaux compétents de Brazzaville.`,
  },
];

export default function PageCGU() {
  return (
    <>
      <NavbarPublique />
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* En-tête */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/vehicules" style={{ color: 'var(--gris)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Retour au catalogue
          </Link>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--brun)', margin: '20px 0 8px' }}>
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ color: 'var(--gris)', fontSize: '0.875rem' }}>
            Top Service · Location de véhicules · Brazzaville &amp; Pointe-Noire, République du Congo
          </p>
          <p style={{ color: 'var(--gris)', fontSize: '0.8rem', marginTop: '4px' }}>
            Dernière mise à jour : avril 2026
          </p>
        </div>

        {/* Intro */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', background: 'rgba(27,59,138,0.04)', border: '1px solid rgba(27,59,138,0.1)' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--brun)', lineHeight: 1.7 }}>
            En cochant la case « J'accepte les conditions générales d'utilisation » lors de votre réservation, vous reconnaissez avoir lu, compris et accepté sans réserve l'ensemble des dispositions ci-dessous.
          </p>
        </div>

        {/* Articles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ARTICLES.map((a) => (
            <div key={a.num} className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brun)', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #1B3B8A)',
                  color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {a.num}
                </span>
                {a.titre}
              </h2>
              <div style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.75 }}>
                {a.contenu.split('\n').map((ligne, i) => (
                  ligne.trim() === ''
                    ? <br key={i} />
                    : <p key={i} style={{ margin: '0 0 6px' }}>{ligne}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CGU */}
        <div style={{ marginTop: '32px', marginBottom: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--gris)', marginBottom: '16px' }}>
            Pour toute question relative aux présentes CGU, contactez-nous via la plateforme.
          </p>
          <Link href="/vehicules" className="btn" style={{ textDecoration: 'none', padding: '12px 32px' }}>
            Retour au catalogue
          </Link>
        </div>

      </div>
    </>
  );
}
