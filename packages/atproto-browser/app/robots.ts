import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Disallow all paths except for the root path.
      allow: "/$",
      disallow: "/",
    },
  };
}
