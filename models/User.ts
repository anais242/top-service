import mongoose, { Document, Model, Schema } from 'mongoose';
import { UserRole } from '@/types';

// Interface TypeScript du document MongoDB
export interface IUser extends Document {
  nom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: UserRole;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est obligatoire'],
      trim: true,
      match: [/^\+?[0-9\s\-]{8,15}$/, 'Format de téléphone invalide'],
    },
    // Le mot de passe est stocké hashé — jamais en clair
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
    },
    role: {
      type: String,
      enum: ['client', 'gerant'],
      default: 'client',
    },
    // Permet de désactiver un compte sans le supprimer
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Supprime le mot de passe et __v de toutes les réponses JSON
      transform: (_, ret) => {
        delete ret.motDePasse;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index pour accélérer les recherches par email
userSchema.index({ email: 1 });

// Singleton : évite la re-compilation du modèle pendant le hot reload (Next.js dev)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
