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

  // Allow Cloudflare tunnels in local dev
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default withVercelToolbar()(nextConfig);
