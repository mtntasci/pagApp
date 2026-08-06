/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pag/shared", "lucide-react"],
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig;
