/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Google Cloud Run Docker deployment
  output: 'standalone',
  // Disable telemetry in production
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
