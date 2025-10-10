import withVercelToolbar from "@vercel/toolbar/plugins/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  rewrites: () => [
    {
      source: "/.well-known/security.txt",
      destination: "/security.txt",
    },
  ],
};

export default withVercelToolbar()(nextConfig);
