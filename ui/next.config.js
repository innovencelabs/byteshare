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
}

module.exports = nextConfig
