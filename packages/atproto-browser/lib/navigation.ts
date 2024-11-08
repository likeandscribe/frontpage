import "server-only";

import { getAtUriPath } from "./util";
import { isValidHandle } from "@atproto/syntax";
import { redirect } from "next/navigation";
import { parse as parseHtml } from "node-html-parser";
import { parse as parseLinkHeader } from "http-link-header";
import { domainToASCII } from "url";
import { isDid } from "@atproto/did";

export async function navigateAtUri(input: string) {
  // Remove all zero-width characters and weird control codes from the input
  const sanitizedInput = input
    .replace(/[\u200B-\u200D\uFEFF\u202C]/g, "")
    .trim();

  const handle = parseHandle(sanitizedInput);

  if (handle) {
    redirect(
      getAtUriPath({
        host: handle,
      }),
    );
  } else if (sanitizedInput.startsWith("@")) {
    return {
      error: `Invalid handle: ${sanitizedInput}`,
    };
  }

  const result =
    sanitizedInput.startsWith("http://") ||
    sanitizedInput.startsWith("https://")
      ? await getAtUriFromHttp(sanitizedInput)
      : parseUri(
          // Add at:// to start if it's missing
          sanitizedInput.startsWith("at://")
            ? sanitizedInput
            : `at://${sanitizedInput}`,
        );

  if ("error" in result) {
    return result;
  }

  redirect(getAtUriPath(result.uri));
}

/**
 * Using our own type to allow for unicode handles/hosts which is not currently supported by the ATProto library
 */
type MinimalAtUri = {
  host: string;
  collection?: string;
  rkey?: string;
};

type UriParseResult =
  | {
      error: string;
    }
  | { uri: MinimalAtUri };

async function getAtUriFromHttp(url: string): Promise<UriParseResult> {
  const controller = new AbortController();
  const response = await fetch(url, {
    headers: {
      "User-Agent": "atproto-browser.vercel.app",
    },
    signal: controller.signal,
  });
  if (!response.ok) {
    controller.abort();
    return { error: `Failed to fetch ${url}` };
  }

  const linkHeader = response.headers.get("Link");
  if (linkHeader) {
    const ref = parseLinkHeader(linkHeader).refs.find(
      (ref) => ref.rel === "alternate" && ref.uri.startsWith("at://"),
    );
    const result = ref ? parseUri(ref.uri) : null;
    if (result && "uri" in result) {
      controller.abort();
      return result;
    }
  }

  const html = await response.text();
  let doc;
  try {
    doc = parseHtml(html);
  } catch (_) {
    return {
      error: `Failed to parse HTML from ${url}`,
    };
  }

  const alternates = doc.querySelectorAll('link[rel="alternate"]');
  // Choose the first AT URI found in the alternates, there's not really a better way to choose the right one
  const atUriAlternate = alternates.find((link) =>
    link.getAttribute("href")?.startsWith("at://"),
  );
  if (atUriAlternate) {
    const result = parseUri(
      decodeURIComponent(atUriAlternate.getAttribute("href")!),
    );
    if ("uri" in result) {
      return result;
    }
  }

  return {
    error: `No AT URI found in ${url}`,
  };
}

export const ATP_URI_REGEX =
  // proto-    --did--------------   name   --path----   --query--   --hash--
  /^(at:\/\/)?((?:did:[a-z0-9:%-]+)|(?:.*))(\/[^?#\s]*)?(\?[^#\s]+)?(#[^\s]+)?$/i;

/**
 * Parses an AT URI but allows the host to be a unicode handle.
 *
 * Unicode handles are preserved and not punycode encoded so that they can be displayed as-is in eg. the URL bar and URI form.
 *
 * There is potential for homograph attacks here, in the future we should consider punycode encoding ambiguous characters as per (for example) https://chromium.googlesource.com/chromium/src/+/main/docs/idn.md. This also applies to <DidHandle>
 */
function parseUri(input: string): UriParseResult {
  const match = ATP_URI_REGEX.exec(input);
  if (match) {
    if (!match[2]) {
      return {
        error: `Invalid URI: ${input}`,
      };
    }

    const host = match[2];

    if (host.startsWith("did:") && !isDid(host)) {
      return {
        error: `Invalid DID in URI: ${input}`,
      };
    }

    const pathname = match[3];
    return {
      uri: {
        host,
        collection: pathname?.split("/").filter(Boolean)[0],
        rkey: pathname?.split("/").filter(Boolean)[1],
      },
    };
  }

  return {
    error: `Invalid URI: ${input}`,
  };
}

function parseHandle(input: string): string | null {
  // Remove the leading @
  const handle = input.replace(/^@/, "");

  if (!isValidHandle(handle) && !isValidHandle(domainToASCII(handle))) {
    return null;
  }
  // We check for the punycode encoded version of the handle but always return the preserved input so that we can display the original handle
  return handle;
}
