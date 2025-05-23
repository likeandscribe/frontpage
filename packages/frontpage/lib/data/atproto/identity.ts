import { cache } from "react";
import { type DID, getDidDoc, isDid, parseDid } from "./did";
import { unstable_cache } from "next/cache";
import { z } from "zod";

export const getVerifiedDid = cache(async (handle: string) => {
  const [dnsDid, httpDid] = await Promise.all([
    getAtprotoDidFromDns(handle).catch((_) => {
      return null;
    }),
    getAtprotoFromHttps(handle).catch((_) => {
      return null;
    }),
  ]);

  if (dnsDid && httpDid && dnsDid !== httpDid) {
    return null;
  }

  const did = dnsDid ?? (httpDid ? parseDid(httpDid) : null);
  if (!did) {
    return null;
  }

  const plcDoc = await getDidDoc(did);
  const plcHandle = plcDoc.alsoKnownAs
    .find((handle) => handle.startsWith("at://"))
    ?.replace("at://", "");

  if (!plcHandle) return null;

  return plcHandle.toLowerCase() === handle.toLowerCase() ? did : null;
});

const DnsQueryResponse = z.object({
  Answer: z.array(
    z.object({
      name: z.string(),
      type: z.number(),
      TTL: z.number(),
      data: z.string(),
    }),
  ),
});

// See https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
async function getAtprotoDidFromDns(handle: string) {
  const url = new URL("https://cloudflare-dns.com/dns-query");
  url.searchParams.set("type", "TXT");
  url.searchParams.set("name", `_atproto.${handle}`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/dns-json",
    },
    next: {
      revalidate: 60 * 60 * 24, // 24 hours
    },
  });

  const { Answer } = DnsQueryResponse.parse(await response.json());
  // Answer[0].data is "\"did=...\"" (with quotes)
  const val = Answer[0]?.data
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      JSON.parse(Answer[0]?.data).split("did=")[1]
    : null;

  return val
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parseDid(val)
    : null;
}

const getAtprotoFromHttps = unstable_cache(
  async (handle: string) => {
    let res;
    const timeoutSignal = AbortSignal.timeout(1500);
    try {
      res = await fetch(`https://${handle}/.well-known/atproto-did`, {
        signal: timeoutSignal,
      });
    } catch (_e) {
      // We're caching failures here, we should at some point invalidate the cache by listening to handle changes on the network
      return null;
    }

    if (!res.ok) {
      return null;
    }
    return parseDid((await res.text()).trim());
  },
  ["did", "https"],
  {
    revalidate: 60 * 60 * 24, // 24 hours
  },
);

/**
 * Returns the DID of the the handle or the DID itself if it's a DID. Or null if the handle doesn't resolve to a DID.
 */
export const getDidFromHandleOrDid = cache(async (handleOrDid: string) => {
  const decodedHandleOrDid = decodeURIComponent(handleOrDid);
  if (isDid(decodedHandleOrDid)) {
    return decodedHandleOrDid;
  }

  return getVerifiedDid(decodedHandleOrDid);
});

export const getVerifiedHandle = cache(async (did: DID) => {
  const plcDoc = await getDidDoc(did);
  const plcHandle = plcDoc.alsoKnownAs
    .find((handle) => handle.startsWith("at://"))
    ?.replace("at://", "");

  if (!plcHandle) return null;

  const resolvedDid = await getVerifiedDid(plcHandle);

  return resolvedDid ? plcHandle : null;
});
