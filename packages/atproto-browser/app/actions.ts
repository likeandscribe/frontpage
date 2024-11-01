"use server";

import { getAtUriPath } from "@/lib/util";
import { AtUri, isValidHandle } from "@atproto/syntax";
import { redirect } from "next/navigation";
import { parse as parseHtml } from "node-html-parser";
import { parse as parseLinkHeader } from "http-link-header";

export async function navigateUri(_state: unknown, formData: FormData) {
  const uriInput = formData.get("uri") as string;

  const handle = parseHandle(uriInput);

  if (handle) {
    redirect(getAtUriPath(new AtUri(`at://${handle}`)));
  }

  const result =
    uriInput.startsWith("http://") || uriInput.startsWith("https://")
      ? await getAtUriFromHttp(uriInput)
      : parseUri(uriInput);

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
  const response = await fetch(url);
  if (!response.ok) {
    return { error: `Failed to fetch ${url}` };
  }

  const linkHeader = response.headers.get("Link");
  if (linkHeader) {
    const ref = parseLinkHeader(linkHeader).refs.find(
      (ref) => ref.rel === "alternate" && ref.uri.startsWith("at://"),
    );
    const result = ref ? parseUri(ref.uri) : null;
    if (result && "uri" in result) {
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
    const result = parseUri(atUriAlternate.getAttribute("href")!);
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
  if (!input.startsWith("@")) return null;
  const handle = input.slice(1);
  if (!isValidHandle(handle)) return null;
  return handle;
}
