// ─── Rôles utilisateur ────────────────────────────────────────────────────────
export type UserRole = 'client' | 'gerant' | 'chauffeur';

// ─── Payload stocké dans les JWT ──────────────────────────────────────────────
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  nom: string;
}

// ─── Réponse API standardisée ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ─── Données publiques d'un utilisateur (sans mot de passe) ───────────────────
export interface UtilisateurPublic {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: UserRole;
  createdAt: string;
}
