import "server-only";
import {
  DidDocument,
  DidResolver,
  getHandle,
  HandleResolver,
} from "@atproto/identity";
import { cache } from "react";
import { unstable_cache as nextCache } from "next/cache";
import { isValidHandle, NSID, InvalidNsidError } from "@atproto/syntax";
import { isDid } from "@atproto/did";
import { domainToASCII } from "url";
import { resolveTxt, NOTFOUND } from "node:dns/promises";

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

const didResolver = new DidResolver({});
const resolveDid = cache(
  nextCache(
    cache((did: string) =>
      timeoutWith(1000, didResolver.resolve(did), "DID timeout"),
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
  if (isValidHandle(domainToASCII(decoded))) {
    didFromHandle = await resolveHandle(domainToASCII(decoded)).catch(
      () => undefined,
    );
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

export async function resolveNsid(
  did: string,
  nsidStr: string,
): Promise<
  | { success: false; error: string }
  | {
      success: true;
      results: {
        domain: string;
        verified: boolean;
        verifiedDescription: string;
      }[];
    }
> {
  let nsid;
  try {
    nsid = NSID.parse(nsidStr);
  } catch (e) {
    if (e instanceof InvalidNsidError) {
      return { success: false, error: e.message };
    } else {
      throw e;
    }
  }

  const domainParts = nsid.segments.slice().reverse();

  const possibleVerificationDomains = domainParts.map(
    (_, i) => "_lexicon." + domainParts.slice(i).join("."),
  );

  return {
    success: true,
    results: await Promise.all(
      possibleVerificationDomains.map(async (domain) => {
        try {
          const record = (await resolveTxt(domain))[0]?.join("");
          if (!record) {
            return {
              domain,
              verified: false,
              verifiedDescription: "not_found",
            };
          }
          const verified = record === `did=${did}`;

          return {
            domain,
            verified,
            verifiedDescription: verified ? "valid" : "invalid",
          };
        } catch (e) {
          return {
            domain,
            verified: false,
            verifiedDescription:
              isObject(e) && "code" in e && typeof e.code === "string"
                ? e.code
                : "error",
          };
        }
      }),
    ),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
