import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContratVehicule extends Document {
  client: mongoose.Types.ObjectId;
  vehicule: mongoose.Types.ObjectId;
  prixParJour: number;
  prixParHeure?: number | null;
  avecChauffeur: boolean;
  chauffeur?: mongoose.Types.ObjectId | null;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contratVehiculeSchema = new Schema<IContratVehicule>(
  {
    client:        { type: Schema.Types.ObjectId, ref: 'User',     required: true },
    vehicule:      { type: Schema.Types.ObjectId, ref: 'Vehicule', required: true },
    prixParJour:   { type: Number, required: true, min: 0 },
    prixParHeure:  { type: Number, default: null,  min: 0 },
    avecChauffeur: { type: Boolean, default: false },
    chauffeur:     { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actif:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

contratVehiculeSchema.index({ client: 1, vehicule: 1 }, { unique: true });

const ContratVehicule: Model<IContratVehicule> =
  mongoose.models.ContratVehicule ||
  mongoose.model<IContratVehicule>('ContratVehicule', contratVehiculeSchema);

export default ContratVehicule;
