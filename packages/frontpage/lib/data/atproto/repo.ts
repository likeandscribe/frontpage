import { AtpBaseClient } from "@repo/frontpage-atproto-client";
import { getUser } from "../user";
import { fetchAuthenticatedAtproto } from "@/lib/auth";
import { cache } from "react";

export { ids as nsids } from "@repo/frontpage-atproto-client/lexicons";

export const getAtprotoClient = cache(
  (service?: string) =>
    new AtpBaseClient(async (url: string, init: RequestInit) => {
      const user = await getUser();
      if (service && user) {
        console.warn(
          "Service URL provided, but user is authenticated. Using user authentication.",
        );
      }
      const s = service ?? user?.pdsUrl;
      if (!s) {
        throw new Error("No service url");
      }

      const u = new URL(url, s);

      if (user) {
        return fetchAuthenticatedAtproto(u, init);
      }

      return fetch(u, init);
    }),
);
