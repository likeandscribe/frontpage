import "server-only";

import { getAtUriPath } from "./util";
import { AtUri, isValidHandle } from "@atproto/syntax";
import { redirect } from "next/navigation";
import { parse as parseHtml } from "node-html-parser";
import { parse as parseLinkHeader } from "http-link-header";
import { domainToASCII } from "url";

export async function navigateAtUri(input: string) {
  // Remove all zero-width characters and weird control codes from the input
  const sanitizedInput = input.replace(/[\u200B-\u200D\uFEFF\u202C]/g, "");

  // Try punycode encoding the input as a domain name and parse it as a handle
  const handle = parseHandle(domainToASCII(sanitizedInput) || sanitizedInput);

  if (handle) {
    redirect(getAtUriPath(new AtUri(`at://${handle}`)));
  }

  const result =
    sanitizedInput.startsWith("http://") ||
    sanitizedInput.startsWith("https://")
      ? await getAtUriFromHttp(sanitizedInput)
      : parseUri(sanitizedInput);

  if ("error" in result) {
    return result;
  }

  redirect(getAtUriPath(result.uri));
}

type UriParseResult =
  | {
      error: string;
    }
  | { uri: AtUri };

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
      redirect(getAtUriPath(result.uri));
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
    console.log(atUriAlternate.getAttribute("href"));
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

function parseUri(input: string): UriParseResult {
  try {
    return { uri: new AtUri(input) };
  } catch (_) {
    return {
      error: `Invalid URI: ${input}`,
    };
  }
}

function parseHandle(input: string): string | null {
  // Remove the leading @
  const handle = input.replace(/^@/, "");
  if (!isValidHandle(handle)) return null;
  return handle;
}
