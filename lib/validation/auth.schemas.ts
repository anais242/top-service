import { z } from 'zod';

// ─── Inscription client ───────────────────────────────────────────────────────
export const schemaInscription = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne doit contenir que des lettres'),

  email: z
    .string()
    .email("Format d'email invalide")
    .max(255, "L'email est trop long")
    .transform((v) => v.toLowerCase()),

  telephone: z
    .string()
    .regex(
      /^\+?[0-9\s\-]{8,15}$/,
      'Format invalide (ex: +242 06 123 4567)'
    ),

  motDePasse: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
});

// ─── Connexion ────────────────────────────────────────────────────────────────
export const schemaConnexion = z.object({
  identifiant: z.string().min(1, "L'identifiant est requis").max(255),
  motDePasse:  z.string().min(1, 'Le mot de passe est requis').max(128),
});

export type DonneesInscription = z.infer<typeof schemaInscription>;
export type DonneesConnexion   = z.infer<typeof schemaConnexion>;
