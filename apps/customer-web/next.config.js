/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/gizlilik',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/kvkk',
        destination: '/user-privacy',
        permanent: true,
      },
      {
        source: '/iletisim',
        destination: '/support',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
