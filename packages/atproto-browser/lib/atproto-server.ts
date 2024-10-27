import "server-only";
import {
  DidDocument,
  DidResolver,
  getHandle,
  HandleResolver,
} from "@atproto/identity";
import { cache } from "react";
import { unstable_cache as nextCache } from "next/cache";
import { isValidHandle } from "@atproto/syntax";
import { isDid } from "@atproto/did";
import { z } from "zod";

function timeoutWith<T>(
  timeout: number,
  promise: Promise<T>,
  errorMessage: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_res, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeout),
    ),
  ]);
}

const PlcDocument = z.object({
  id: z.string(),
  alsoKnownAs: z.array(z.string()),
  service: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      serviceEndpoint: z.string(),
    }),
  ),
});

export const getDidDoc = cache(async (did: string) => {
  const url = process.env.PLC_DIRECTORY_URL ?? "https://plc.directory";
  const response = await fetch(`${url}/${did}`, {
    next: {
      // TODO: Also revalidate this when we receive an identity change event
      // That would allow us to extend the revalidation time to 1 day
      revalidate: 60 * 60, // 1 hour
    },
  });

  return PlcDocument.parse(await response.json());
});

const didResolver = new DidResolver({});
const resolveDid = cache(
  nextCache(
    cache((did: string) =>
      // this uses atproto lib, lets use our own func
      // timeoutWith(1000, didResolver.resolve(did), "DID timeout"),
      timeoutWith(1000, getDidDoc(did), "DID timeout"),
    ),
    ["did-doc"],
    {
      revalidate: 10,
    },
  ),
);
const handleResolver = new HandleResolver({});
const resolveHandle = cache(
  nextCache(
    cache((handle: string) =>
      timeoutWith(3000, handleResolver.resolve(handle), "Handle timeout"),
    ),
    ["handle-from-did"],
    {
      revalidate: 10,
    },
  ),
);

export async function resolveIdentity(
  didOrHandle: string,
): Promise<
  | { success: true; didDocument: DidDocument; handle: string | null }
  | { success: false; error: string }
> {
  const decoded = decodeURIComponent(didOrHandle);
  let didStr;
  let didFromHandle = null;
  if (isValidHandle(decoded)) {
    didFromHandle = await resolveHandle(decoded).catch(() => undefined);
    didStr = didFromHandle;
    if (!didStr) {
      return {
        success: false,
        error: `Could not resolve did from handle: ${decoded}`,
      };
    }
  } else {
    if (!isDid(decoded)) {
      return { success: false, error: `Invalid DID: ${decoded}` };
    }
    didStr = decoded;
  }

  const didDocument = await resolveDid(didStr);
  if (!didDocument) {
    return { success: false, error: `Could not resolve DID: ${didStr}` };
  }

  const handle = getHandle(didDocument);
  if (!handle) {
    return {
      success: false,
      error: `Could not find handle in DID document: ${didStr}`,
    };
  }

  if (didFromHandle === null) {
    didFromHandle = await resolveHandle(handle).catch(() => undefined);
  }

  return {
    success: true,
    didDocument: didDocument,
    handle: didFromHandle === didDocument.id ? handle : null,
  };
}
