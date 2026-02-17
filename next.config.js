/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', 'playwright'],
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
