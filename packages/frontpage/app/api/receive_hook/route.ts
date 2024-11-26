import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { Commit } from "@/lib/data/atproto/event";
import * as atprotoPost from "@/lib/data/atproto/post";
import * as atprotoComment from "@/lib/data/atproto/comment";
import * as atprotoVote from "@/lib/data/atproto/vote";
import { getPdsUrl } from "@/lib/data/atproto/did";
import { handleComment, handlePost, handleVote } from "@/lib/api/relayHandler";

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.DRAINPIPE_CONSUMER_SECRET}`) {
    console.error("Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }
  const commit = Commit.safeParse(await request.json());
  if (!commit.success) {
    console.error("Could not parse commit from drainpipe", commit.error);
    return new Response("Invalid request", { status: 400 });
  }

  const { ops, repo, seq } = commit.data;
  const service = await getPdsUrl(repo);
  if (!service) {
    throw new Error("No AtprotoPersonalDataServer service found");
  }

  const promises = ops.map(async (op) => {
    const { collection, rkey } = op.path;
    console.log("Processing", collection, rkey, op.action);

    switch (collection) {
      case atprotoPost.PostCollection:
        await handlePost({ op, repo, rkey });
        break;
      case atprotoComment.CommentCollection:
        await handleComment({ op, repo, rkey });
        break;
      case atprotoVote.VoteCollection:
        await handleVote({ op, repo, rkey });
        break;
      default:
        throw new Error(`Unknown collection: ${collection}, ${op}`);
    }

    await db.insert(schema.ConsumedOffset).values({ offset: seq });
  });

  await Promise.all(promises);

  return new Response("OK");
}
