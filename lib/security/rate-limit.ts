import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Connexion Redis Upstash (gratuit jusqu'à 10 000 requêtes/jour)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 tentatives par 15 minutes par identifiant (IP ou email)
// Sliding window : la fenêtre glisse en temps réel (plus strict que fixed window)
export const rateLimiterAuth = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'),
  analytics: true,
  prefix: 'ts:auth',
});

// Vérifie la limite et retourne un résultat lisible
export async function verifierRateLimit(identifiant: string): Promise<{
  autorise: boolean;
  restantes: number;
  resetDans: number; // secondes avant réinitialisation
}> {
  const { success, remaining, reset } = await rateLimiterAuth.limit(identifiant);
  return {
    autorise: success,
    restantes: remaining,
    resetDans: Math.ceil((reset - Date.now()) / 1000),
  };
}
