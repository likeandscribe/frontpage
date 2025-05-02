import { unstable_cache } from "next/cache";
import {
  AtpBaseClient,
  ComAtprotoSyncListHosts,
} from "@repo/frontpage-atproto-client";
import { createApiRoute } from "@/lib/api-route";

const getAllPdsHosts = unstable_cache(
  async () => {
    const atproto = new AtpBaseClient("https://relay1.us-west.bsky.network");

    let maxPages = 10;
    let cursor;

    const results = [];

    while (maxPages > 0) {
      const { data, success } = await atproto.com.atproto.sync.listHosts({
        cursor,
      });

      if (!success) {
        console.error("Error fetching PDS hosts");
        break;
      }

      if (success) {
        cursor = data.cursor;
        results.push(...data.hosts);
        maxPages--;
      } else {
        console.error("Failed to fetch PDS hosts");
        break;
      }
    }

    // Deduplicate the results by .hostname
    const uniqueResults = new Map(results.map((host) => [host.hostname, host]));

    return Array.from(uniqueResults.values());
  },
  ["getAllPdsHosts"],
  {
    revalidate: 60 * 60 * 24, // 24 hours
  },
);

export const GET = createApiRoute(
  async (
    request: Request,
  ): Promise<ComAtprotoSyncListHosts.OutputSchema["hosts"]> => {
    const search = new URL(request.url).searchParams.get("search");
    const hosts = await getAllPdsHosts();
    const filteredHosts = hosts
      .filter((host) =>
        host.hostname.toLowerCase().includes(search?.toLowerCase() || ""),
      )
      .sort((a, b) => a.hostname.localeCompare(b.hostname));

    return filteredHosts.slice(0, 20);
  },
);
