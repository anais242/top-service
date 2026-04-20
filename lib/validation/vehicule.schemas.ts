import { z } from 'zod';

export const schemaVehicule = z.object({
  marque:       z.string().min(1).max(50).trim(),
  modele:       z.string().min(1).max(50).trim(),
  annee:        z.number().int().min(1990).max(new Date().getFullYear() + 1),
  couleur:      z.string().min(1).max(30).trim(),
  prixParJour:  z.number().min(0),
  kilometrage:  z.number().int().min(0),
  carburant:    z.enum(['essence', 'diesel', 'electrique', 'hybride']),
  transmission: z.enum(['manuelle', 'automatique']),
  nombrePlaces: z.number().int().min(1).max(20),
  description:  z.string().max(1000).trim().optional().default(''),
  statut:       z.enum(['disponible', 'loue', 'maintenance']).optional().default('disponible'),
});

export type VehiculeInput = z.infer<typeof schemaVehicule>;
