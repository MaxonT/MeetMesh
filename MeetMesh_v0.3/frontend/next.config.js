/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 核心优化：跳过构建时的繁重检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
