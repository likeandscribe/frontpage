import "server-only";
import {
  type DidDocument,
  DidResolver,
  getHandle,
  HandleResolver,
} from "@atproto/identity";
import { cache } from "react";
import { unstable_cache as nextCache } from "next/cache";
import { isValidHandle, type NSID } from "@atproto/syntax";
import { isDid } from "@atproto/did";
import { domainToASCII } from "url";
import { resolveTxt } from "node:dns/promises";

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

const didResolver = new DidResolver({
  plcUrl: process.env.PLC_URL,
});

export const PLC_URL = process.env.PLC_URL ?? "https://plc.directory";

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
      success: true,
      didDocument,
      handle: null,
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

export async function resolveNsidAuthority(
  nsid: NSID,
): Promise<
  { success: false; error: string } | { success: true; authorityDid: string }
> {
  const domainParts = nsid.segments.slice().reverse();
  const authority = "_lexicon." + domainParts.slice(1).join(".");

  try {
    const record = (await resolveTxt(authority))[0]?.join("");
    const did = record?.split("=")[1];
    if (!did) {
      return {
        success: false,
        error: "not found",
      };
    }
    return {
      success: true,
      authorityDid: did,
    };
  } catch (e) {
    const errorMsg =
      isObject(e) && "code" in e && typeof e.code === "string"
        ? e.code
        : e instanceof Error
          ? e.message
          : `error`;

    return {
      success: false,
      error: `${errorMsg} (${authority})`,
    };
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
