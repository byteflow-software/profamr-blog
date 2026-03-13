import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      // WordPress legacy: /category/<slug> → /blog?categoria=<slug>
      {
        source: '/category/:slug',
        destination: '/blog?categoria=:slug',
        permanent: true,
      },
      // WordPress legacy: /tag/<slug> → /blog?tag=<slug>
      {
        source: '/tag/:slug',
        destination: '/blog?tag=:slug',
        permanent: true,
      },
      // WordPress legacy: /page/<num> → /blog?page=<num>
      {
        source: '/page/:num',
        destination: '/blog?page=:num',
        permanent: true,
      },
      // WordPress legacy: /<year>/<month>/<slug> → lookup by slug
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // WordPress legacy: /<year>/<month>/<day>/<slug>
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
