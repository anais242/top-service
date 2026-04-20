import mongoose, { Document, Model, Schema } from 'mongoose';

export type StatutVehicule = 'disponible' | 'loue' | 'maintenance';
export type Carburant = 'essence' | 'diesel' | 'electrique' | 'hybride';
export type Transmission = 'manuelle' | 'automatique';

export interface IVehicule extends Document {
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  prixParJour: number;
  kilometrage: number;
  carburant: Carburant;
  transmission: Transmission;
  nombrePlaces: number;
  description: string;
  photos: string[];          // URLs Cloudinary
  statut: StatutVehicule;
  createdAt: Date;
  updatedAt: Date;
}

const vehiculeSchema = new Schema<IVehicule>(
  {
    marque:        { type: String, required: true, trim: true, maxlength: 50 },
    modele:        { type: String, required: true, trim: true, maxlength: 50 },
    annee:         { type: Number, required: true, min: 1990, max: new Date().getFullYear() + 1 },
    couleur:       { type: String, required: true, trim: true, maxlength: 30 },
    prixParJour:   { type: Number, required: true, min: 0 },
    kilometrage:   { type: Number, required: true, min: 0 },
    carburant:     { type: String, enum: ['essence', 'diesel', 'electrique', 'hybride'], required: true },
    transmission:  { type: String, enum: ['manuelle', 'automatique'], required: true },
    nombrePlaces:  { type: Number, required: true, min: 1, max: 20 },
    description:   { type: String, trim: true, maxlength: 1000, default: '' },
    photos:        { type: [String], default: [] },
    statut:        { type: String, enum: ['disponible', 'loue', 'maintenance'], default: 'disponible' },
  },
  { timestamps: true }
);

vehiculeSchema.index({ statut: 1 });
vehiculeSchema.index({ prixParJour: 1 });

const Vehicule: Model<IVehicule> =
  mongoose.models.Vehicule || mongoose.model<IVehicule>('Vehicule', vehiculeSchema);

export default Vehicule;
