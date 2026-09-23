/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors නිසා build එක fail වීම නතර කරයි
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors නිසා build එක fail වීම නතර කරයි
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;