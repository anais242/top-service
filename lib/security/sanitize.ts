// Protections contre XSS et injections NoSQL MongoDB

// Supprime les caractères HTML dangereux (XSS)
const PATTERN_XSS = /[<>"'`]/g;

// Supprime les opérateurs MongoDB (injection NoSQL)
const PATTERN_NOSQL = /\$[a-zA-Z]+/g;

// Nettoie une chaîne
export function sanitiserChaine(valeur: unknown): string {
  if (typeof valeur !== 'string') return '';
  return valeur
    .trim()
    .replace(PATTERN_XSS, '')
    .replace(PATTERN_NOSQL, '')
    .slice(0, 1000); // Plafond de longueur
}

// Nettoie récursivement un objet (body de requête)
export function sanitiserObjet(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const resultat: Record<string, unknown> = {};
  for (const [cle, valeur] of Object.entries(obj)) {
    // Bloque les clés MongoDB (ex: { "$where": "..." })
    if (cle.startsWith('$')) continue;

    if (typeof valeur === 'string') {
      resultat[cle] = sanitiserChaine(valeur);
    } else if (
      typeof valeur === 'object' &&
      valeur !== null &&
      !Array.isArray(valeur)
    ) {
      resultat[cle] = sanitiserObjet(valeur as Record<string, unknown>);
    } else {
      resultat[cle] = valeur;
    }
  }
  return resultat;
}

// Extrait l'IP réelle (Vercel place l'IP dans x-forwarded-for)
export function extraireIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'ip-inconnue'
  );
}
