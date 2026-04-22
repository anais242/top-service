// Tarifs chauffeur — fixes, indépendants du véhicule
export const CHAUFFEUR_JOUR = 7_500;   // 7h – 21h
export const CHAUFFEUR_NUIT = 10_000;  // 21h – 6h

/**
 * Retourne le tarif chauffeur applicable selon l'heure de début.
 * Pour une location à la journée on passe heure = 7 (service de jour par défaut).
 */
export function tarifChauffeur(heure: number): number {
  return (heure >= 21 || heure < 6) ? CHAUFFEUR_NUIT : CHAUFFEUR_JOUR;
}
