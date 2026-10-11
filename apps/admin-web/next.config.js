/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.pagapp.com.tr';
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${apiUrl}/api/v1/:path*`,
        },
        {
          source: '/ws',
          destination: `${apiUrl}/ws`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
