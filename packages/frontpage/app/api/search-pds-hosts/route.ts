import { getAtprotoClient } from "@/lib/data/atproto/repo";
import { unstable_cache } from "next/cache";

const getAllPdsHosts = unstable_cache(
  async () => {
    const atproto = getAtprotoClient("https://relay1.us-west.bsky.network");
    atproto.com.atproto.repo;
  },
  ["getAllPdsHosts"],
  {
    revalidate: 60 * 60 * 24, // 24 hours
  },
);
