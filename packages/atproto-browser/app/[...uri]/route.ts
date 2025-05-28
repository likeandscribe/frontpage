import { getAtUriPath } from "@/lib/util";
import { AtUri } from "@atproto/api";
import { notFound, redirect } from "next/navigation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uri: string[] }> },
) {
  let uri;
  try {
    // Trim off first element because it's always at:
    uri = new AtUri(`at://${(await params).uri.slice(1).join("/")}`);
  } catch (_) {
    notFound();
  }
  redirect(getAtUriPath(uri));
}
