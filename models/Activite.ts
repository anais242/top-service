import mongoose, { Document, Model, Schema } from 'mongoose';

export type TypeActivite   = 'permis' | 'reservation' | 'paiement';
export type ActionActivite =
  | 'permis_recto'
  | 'permis_verso'
  | 'reservation_creee'
  | 'reservation_confirmee'
  | 'reservation_annulee'
  | 'reservation_refusee'
  | 'reservation_terminee'
  | 'paiement_effectue';

export interface IActivite extends Document {
  client:    mongoose.Types.ObjectId;
  type:      TypeActivite;
  action:    ActionActivite;
  detail:    string;
  reference?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const activiteSchema = new Schema<IActivite>(
  {
    client:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['permis', 'reservation', 'paiement'], required: true },
    action:    { type: String, required: true },
    detail:    { type: String, default: '' },
    reference: { type: Schema.Types.ObjectId, ref: 'Reservation', default: null },
  },
  { timestamps: true }
);

activiteSchema.index({ client: 1, createdAt: -1 });

const Activite: Model<IActivite> =
  mongoose.models.Activite || mongoose.model<IActivite>('Activite', activiteSchema);

export default Activite;
