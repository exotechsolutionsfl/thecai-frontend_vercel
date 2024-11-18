/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/autom8t-image-database/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thecai-backend-d97aad1e3385.herokuapp.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL} https://thecai-backend-d97aad1e3385.herokuapp.com https://vercel.live wss://ws-us3.pusher.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
              style-src 'self' 'unsafe-inline' https://vercel.live;
              img-src 'self' data: blob: https://*.googleapis.com https://*.googleusercontent.com https://thecai-backend-d97aad1e3385.herokuapp.com https://vercel.live https://vercel.com;
              font-src 'self' data: https://vercel.live https://assets.vercel.com;
              worker-src 'self' blob:;
              child-src 'self' blob:;
              frame-src 'self' https://*.googleapis.com https://*.googleusercontent.com https://storage.cloud.google.com https://vercel.live;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}

export default nextConfig;