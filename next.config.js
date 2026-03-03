/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true,

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolibre.com.ar",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.mlstatic.com https://*.mercadopago.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com https://*.mlstatic.com",
              "connect-src 'self' https://api.openai.com https://cdn1.suno.ai https://vitals.vercel-insights.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com",
              "frame-src 'self' https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com",
              "media-src 'self' https://cdn1.suno.ai blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.mercadopago.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;