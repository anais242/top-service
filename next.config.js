/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers de sécurité appliqués sur toutes les pages
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Interdit l'affichage du site dans une iframe (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Empêche le navigateur de deviner le type MIME
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limite les infos envoyées dans le Referer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Désactive les APIs sensibles du navigateur
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy : sources autorisées
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Images Cloudinary autorisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
