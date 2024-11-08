export const utcDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}

export function getAtUriPath(uri: {
  host: string;
  collection?: string;
  rkey?: string;
}): string {
  return `/at/${[uri.host, uri.collection, uri.rkey]
    .filter(Boolean)
    .map((c) => c && decodeURIComponent(c))
    .join("/")}`;
}
