import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { Commit } from "@/lib/data/atproto/event";
import { getPdsUrl } from "@/lib/data/atproto/did";
import { handleComment, handlePost, handleVote } from "./handlers";
import { eq } from "drizzle-orm";
import { exhaustiveCheck } from "@/lib/utils";
import { nsids } from "@/lib/data/atproto/repo";
import { timingSafeEqual } from "node:crypto";

const EXPECTED_AUTH_HEADER = Buffer.from(
  `Bearer ${process.env.DRAINPIPE_CONSUMER_SECRET}`,
);

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (!auth || !timingSafeEqual(Buffer.from(auth), EXPECTED_AUTH_HEADER)) {
    console.error("Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }

  const commit = Commit.safeParse(await request.json());
  if (!commit.success) {
    console.error("Could not parse commit from drainpipe", commit.error);
    return new Response("Invalid request", { status: 400 });
  }

  const { ops, repo, seq } = commit.data;
  const row = await db
    .select()
    .from(schema.ConsumedOffset)
    .where(eq(schema.ConsumedOffset.offset, seq))
    .limit(1);

  const operationConsumed = Boolean(row[0]);
  if (operationConsumed) {
    console.log("Already consumed sequence:", seq);
    return new Response("OK");
  }

  const service = await getPdsUrl(repo);
  if (!service) {
    throw new Error("No AtprotoPersonalDataServer service found");
  }
  const promises = ops.map(async (op) => {
    const { collection, rkey } = op.path;
    console.log("Processing", collection, rkey, op.action);

    switch (collection) {
      case nsids.FyiUnravelFrontpagePost:
        await handlePost({ op, repo, rkey });
        break;
      case nsids.FyiUnravelFrontpageComment:
        await handleComment({ op, repo, rkey });
        break;
      case nsids.FyiUnravelFrontpageVote:
        await handleVote({ op, repo, rkey });
        break;
      default:
        exhaustiveCheck(collection, `Unknown collection ${JSON.stringify(op)}`);
    }
  });

  await Promise.all(promises);
  await db.insert(schema.ConsumedOffset).values({ offset: seq });
  return new Response("OK");
}
