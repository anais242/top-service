import { z } from 'zod';

export const schemaReservation = z.object({
  vehiculeId:    z.string().min(1),
  typeLocation:  z.enum(['jour', 'heure']).default('jour'),
  dateDebut:     z.string().refine((d) => !isNaN(Date.parse(d)), 'Date invalide'),
  dateFin:       z.string().refine((d) => !isNaN(Date.parse(d)), 'Date invalide').optional(),
  nombreHeures:  z.number().min(1).max(24).optional(),
  messageClient: z.string().max(500).optional().default(''),
}).refine((d) => {
  if (d.typeLocation === 'jour') return !!d.dateFin && new Date(d.dateFin) > new Date(d.dateDebut);
  if (d.typeLocation === 'heure') return !!d.nombreHeures && d.nombreHeures >= 1;
  return false;
}, { message: 'Données de réservation invalides' });
