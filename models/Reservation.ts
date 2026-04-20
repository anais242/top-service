import mongoose, { Document, Model, Schema } from 'mongoose';

export type StatutReservation = 'en_attente' | 'confirmee' | 'refusee' | 'annulee' | 'terminee';

export interface IReservation extends Document {
  vehicule: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  prixTotal: number;
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
    dateDebut:     { type: Date, required: true },
    dateFin:       { type: Date, required: true },
    nombreJours:   { type: Number, required: true, min: 1 },
    prixTotal:     { type: Number, required: true, min: 0 },
    statut:        { type: String, enum: ['en_attente', 'confirmee', 'refusee', 'annulee', 'terminee'], default: 'en_attente' },
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
