/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    reactCompiler: true,
  },

  rewrites: () => [
    {
      source: "/.well-known/security.txt",
      destination: "/security.txt",
    },
  ],
};

export default nextConfig;
