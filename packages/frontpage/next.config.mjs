import withVercelToolbar from "@vercel/toolbar/plugins/next";

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
    devtoolSegmentExplorer: true,
  },

  rewrites: () => [
    {
      source: "/.well-known/security.txt",
      destination: "/security.txt",
    },
  ],
};

export default withVercelToolbar()(nextConfig);
