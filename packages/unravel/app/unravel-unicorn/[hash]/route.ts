import { notFound } from "next/navigation";
import unicorn from "./unravel-unicorn.json";
import crypto from "node:crypto";

const HASH = crypto
  .createHash("md5")
  .update(JSON.stringify(unicorn))
  .digest("hex");

export const dynamic = "force-static";

type Params = { hash: string };

export function generateStaticParams(): Params[] {
  console.log("Generated unravel-unicorn hash:", HASH);

  return [{ hash: HASH }];
}

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  const { hash } = await params;
  if (hash !== HASH) notFound();
  return Response.json(unicorn, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
