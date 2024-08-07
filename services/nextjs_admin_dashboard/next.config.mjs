/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: process.env.NODE_ENV !== 'development',
      },
    ];
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        experimental: {
          turbotrace: {},
        },
      }
    : {}),
  output: 'standalone',
};

export default nextConfig;
