import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { atprotoGetRecord } from "@/lib/data/atproto/record";
import { Commit } from "@/lib/data/atproto/event";
import * as atprotoPost from "@/lib/data/atproto/post";
import * as dbPost from "@/lib/data/db/post";
import * as atprotoComment from "@/lib/data/atproto/comment";
import { VoteRecord } from "@/lib/data/atproto/vote";
import { getPdsUrl } from "@/lib/data/atproto/did";
import {
  unauthed_createComment,
  unauthed_deleteComment,
} from "@/lib/data/db/comment";
import {
  unauthed_createPostVote,
  unauthed_deleteVote,
  unauthed_createCommentVote,
} from "@/lib/data/db/vote";
import { unauthed_createNotification } from "@/lib/data/db/notification";
import { isBanned } from "@/lib/data/db/user";

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
  if (await isBanned(repo)) {
    throw new Error("[naughty] User is banned");
  }

  const service = await getPdsUrl(repo);
  if (!service) {
    throw new Error("No AtprotoPersonalDataServer service found");
  }

  const promises = ops.map(async (op) => {
    const { collection, rkey } = op.path;
    console.log("Processing", collection, rkey, op.action);

    if (collection === atprotoPost.PostCollection) {
      if (op.action === "create") {
        const record = await atprotoGetRecord({
          serviceEndpoint: service,
          repo,
          collection,
          rkey,
        });
        const postRecord = atprotoPost.PostRecord.parse(record.value);
        await dbPost.unauthed_createPost({
          post: postRecord,
          rkey,
          authorDid: repo,
          cid: record.cid,
          offset: seq,
        });
      } else if (op.action === "delete") {
        await dbPost.unauthed_deletePost({
          rkey,
          authorDid: repo,
          offset: seq,
        });
      }
    }
    // repo is actually the did of the user
    if (collection === atprotoComment.CommentCollection) {
      if (op.action === "create") {
        const comment = await atprotoComment.getComment({ rkey, repo });

        const createdComment = await unauthed_createComment({
          cid: comment.cid,
          comment,
          repo,
          rkey,
        });

        const didToNotify = createdComment.parent
          ? createdComment.parent.authorDid
          : createdComment.post.authordid;

        if (didToNotify !== repo) {
          await unauthed_createNotification({
            commentId: createdComment.id,
            did: didToNotify,
            reason: createdComment.parent ? "commentReply" : "postComment",
          });
        }
      } else if (op.action === "delete") {
        await unauthed_deleteComment({ rkey, repo });
      }

      await db.transaction(async (tx) => {
        await tx.insert(schema.ConsumedOffset).values({ offset: seq });
      });
    }

    if (collection === "fyi.unravel.frontpage.vote") {
      if (op.action === "create") {
        const hydratedRecord = await atprotoGetRecord({
          serviceEndpoint: service,
          repo,
          collection,
          rkey,
        });
        const hydratedVoteRecordValue = VoteRecord.parse(hydratedRecord.value);

        if (
          hydratedVoteRecordValue.subject.uri.collection ===
          atprotoPost.PostCollection
        ) {
          await unauthed_createPostVote({
            repo,
            rkey,
            vote: hydratedVoteRecordValue,
            cid: hydratedRecord.cid,
          });
        } else if (
          hydratedVoteRecordValue.subject.uri.collection ===
          atprotoComment.CommentCollection
        ) {
          await unauthed_createCommentVote({
            cid: hydratedRecord.cid,
            vote: hydratedVoteRecordValue,
            repo,
            rkey,
          });
        }
      } else if (op.action === "delete") {
        await unauthed_deleteVote(rkey, repo);
      }

      await db.transaction(async (tx) => {
        await tx.insert(schema.ConsumedOffset).values({ offset: seq });
      });
    }
  });

  await Promise.all(promises);

  return new Response("OK");
}
