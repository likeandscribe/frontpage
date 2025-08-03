"use client";

import { useEffect } from "react";

/**
 * Prefetches the OG image so that it is ready when the page is shared.
 */
export function PrefetchOgImage({ path }: { path: string }) {
  useEffect(() => {
    const controller = new AbortController();
    void fetch(path, {
      method: "HEAD",
      signal: controller.signal,
    }).catch((err) => {
      // Log error to console except if it's an abort error
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error(err);
    });

    return () => {
      controller.abort();
    };
  }, [path]);
  return null;
}
