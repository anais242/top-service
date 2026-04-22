import mongoose, { Document, Model, Schema } from 'mongoose';

export type StatutReservation = 'en_attente' | 'confirmee' | 'refusee' | 'annulee' | 'terminee';
export type TypeLocation = 'jour' | 'heure';
export type StatutChauffeur = 'non_attribue' | 'en_attente' | 'acceptee' | 'refusee';

export interface IReservation extends Document {
  vehicule: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  typeLocation: TypeLocation;
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  nombreHeures?: number;
  prixTotal: number;
  avecChauffeur: boolean;
  chauffeur?: mongoose.Types.ObjectId;
  statutChauffeur: StatutChauffeur;
  statut: StatutReservation;
  messageClient: string;
  messageGerant: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    vehicule:      { type: Schema.Types.ObjectId, ref: 'Vehicule', required: true },
    client:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    typeLocation:  { type: String, enum: ['jour', 'heure'], default: 'jour' },
    dateDebut:     { type: Date, required: true },
    dateFin:       { type: Date, required: true },
    nombreJours:   { type: Number, required: true, min: 0 },
    nombreHeures:  { type: Number, min: 1, default: null },
    prixTotal:     { type: Number, required: true, min: 0 },
    statut:        { type: String, enum: ['en_attente', 'confirmee', 'refusee', 'annulee', 'terminee'], default: 'en_attente' },
    avecChauffeur:   { type: Boolean, default: false },
    chauffeur:       { type: Schema.Types.ObjectId, ref: 'User', default: null },
    statutChauffeur: { type: String, enum: ['non_attribue', 'en_attente', 'acceptee', 'refusee'], default: 'non_attribue' },
    messageClient: { type: String, maxlength: 500, default: '' },
    messageGerant: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

reservationSchema.index({ vehicule: 1, dateDebut: 1, dateFin: 1 });
reservationSchema.index({ client: 1, statut: 1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', reservationSchema);

export default Reservation;
