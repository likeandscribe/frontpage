/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    // Adding thread-stream to external as a workaround for https://github.com/vercel/next.js/issues/86099
    // Note, this requires that we install the exact version of thread-stream that is failing the build.
    // At the time of writing this comment that version is 2.7.0 (@atproto/repo@0.8.11 > @atproto/common@0.5.2 > pino@8.21.0 > thread-stream@2.7.0).
    // You can check that by running `pnpm why thread-stream` inside packages/atproto-browser.
    // In next.js 16.1+ we will be able to remove the dependency and just add the package to serverExternalPackages without installing it directly.
    // This is because of improvements made to this feature in https://github.com/vercel/next.js/pull/86375
    "thread-stream",
  ],
};

export default nextConfig;
