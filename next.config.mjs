/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enables src/instrumentation.ts register() hook (daily sync scheduler)
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
