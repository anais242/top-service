import { z } from 'zod';

export const schemaReservation = z.object({
  vehiculeId:    z.string().min(1),
  dateDebut:     z.string().refine((d) => !isNaN(Date.parse(d)), 'Date invalide'),
  dateFin:       z.string().refine((d) => !isNaN(Date.parse(d)), 'Date invalide'),
  messageClient: z.string().max(500).optional().default(''),
}).refine((d) => new Date(d.dateFin) > new Date(d.dateDebut), {
  message: 'La date de fin doit être après la date de début',
  path: ['dateFin'],
});
