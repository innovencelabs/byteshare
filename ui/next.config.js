/** @type {import('next').NextConfig} */
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "production"

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  ...(environment === 'dev' && { output: 'standalone' }),
  ...(environment === 'app' && { output: 'export', images: { unoptimized: true } }),
}

module.exports = nextConfig
