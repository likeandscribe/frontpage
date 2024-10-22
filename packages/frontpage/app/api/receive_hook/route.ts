import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
import { atprotoGetRecord } from "@/lib/data/atproto/record";
import { Commit } from "@/lib/data/atproto/event";
import * as atprotoPost from "@/lib/data/atproto/post";
import * as dbPost from "@/lib/data/db/post";
import { CommentCollection, getComment } from "@/lib/data/atproto/comment";
import { VoteRecord } from "@/lib/data/atproto/vote";
import { getPdsUrl } from "@/lib/data/atproto/did";
import {
  unauthed_createComment,
  unauthed_createCommentVote,
  unauthed_deleteComment,
} from "@/lib/data/db/comment";
import { unauthed_createPostVote } from "@/lib/data/db/vote";

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
    if (collection === CommentCollection) {
      await db.transaction(async (tx) => {
        if (op.action === "create") {
          const comment = await getComment({ rkey, repo });

          const parentComment =
            comment.parent != null
              ? (
                  await tx
                    .select()
                    .from(schema.Comment)
                    .where(eq(schema.Comment.cid, comment.parent.cid))
                )[0]
              : null;

          const post = (
            await tx
              .select()
              .from(schema.Post)
              .where(eq(schema.Post.cid, comment.post.cid))
          )[0];

          if (!post) {
            throw new Error("Post not found");
          }

          if (post.status !== "live") {
            throw new Error(
              `[naughty] Cannot comment on deleted post. ${repo}`,
            );
          }
          await unauthed_createComment({
            comment: {
              cid: comment.cid,
              content: comment.content,
              createdAt: comment.createdAt,
            },
            postId: post.id,
            repo,
            rkey,
            parentCommentId: parentComment?.id,
          });
        } else if (op.action === "delete") {
          await unauthed_deleteComment({ rkey, repo });
        }

        await tx.insert(schema.ConsumedOffset).values({ offset: seq });
      });
    }

    if (collection === "fyi.unravel.frontpage.vote") {
      await db.transaction(async (tx) => {
        if (op.action === "create") {
          const hydratedRecord = await atprotoGetRecord({
            serviceEndpoint: service,
            repo,
            collection,
            rkey,
          });
          const hydratedVoteRecordValue = VoteRecord.parse(
            hydratedRecord.value,
          );

          //lookup the collection to see if it is a post or comment vote
          const subjectTable = {
            [atprotoPost.PostCollection]: schema.Post,
            [CommentCollection]: schema.Comment,
          }[hydratedVoteRecordValue.subject.uri.collection];

          const subject = (
            await tx
              .select()
              .from(subjectTable)
              .where(
                eq(subjectTable.rkey, hydratedVoteRecordValue.subject.uri.rkey),
              )
          )[0];

          if (!subject) {
            throw new Error(
              `Subject not found with uri: ${hydratedVoteRecordValue.subject.uri.value}`,
            );
          }

          if (subject.authorDid === repo) {
            throw new Error(`[naughty] Cannot vote on own content ${repo}`);
          }

          if (
            hydratedVoteRecordValue.subject.uri.collection ===
            atprotoPost.PostCollection
          ) {
            await unauthed_createPostVote({
              postId: subject.id,
              repo,
              rkey,
              hydratedVoteRecordValue: {
                cid: hydratedVoteRecordValue.subject.cid,
                createdAt: hydratedVoteRecordValue.createdAt,
              },
              hydratedRecord,
              subjectId: subject.id,
            });
          } else if (
            hydratedVoteRecordValue.subject.uri.collection === CommentCollection
          ) {
            await unauthed_createCommentVote({
              hydratedRecord: { cid: hydratedRecord.cid },
              hydratedVoteRecordValue: {
                cid: hydratedVoteRecordValue.subject.cid,
                createdAt: hydratedVoteRecordValue.createdAt,
              },
              subject,
              repo,
              rkey,
            });
          }
        } else if (op.action === "delete") {
          // Try deleting from both tables. In reality only one will have a record.
          // Relies on sqlite not throwing an error if the record doesn't exist.
          const [commentTransaction] = await tx
            .delete(schema.CommentVote)
            .where(
              and(
                eq(schema.CommentVote.rkey, rkey),
                eq(schema.CommentVote.authorDid, repo),
              ),
            )
            .returning({ commentId: schema.CommentVote.commentId });

          const [postVoteTransaction] = await tx
            .delete(schema.PostVote)
            .where(
              and(
                eq(schema.PostVote.rkey, rkey),
                eq(schema.PostVote.authorDid, repo),
              ),
            )
            .returning({ postId: schema.PostVote.postId });

          if (commentTransaction?.commentId != null) {
            await tx
              .update(schema.CommentAggregates)
              .set({
                voteCount: sql`${schema.CommentAggregates.voteCount} - 1`,
              })
              .where(
                eq(
                  schema.CommentAggregates.commentId,
                  commentTransaction.commentId,
                ),
              );
            await tx.update(schema.PostAggregates).set({
              rank: sql<number>`
                (CAST(COALESCE(${schema.CommentAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.CommentAggregates.createdAt})) * 24 + 2,1.8)))`,
            });
          } else if (postVoteTransaction?.postId != null) {
            await tx
              .update(schema.PostAggregates)
              .set({
                voteCount: sql`${schema.PostAggregates.voteCount} - 1`,
              })
              .where(
                eq(schema.PostAggregates.postId, postVoteTransaction.postId),
              );
            await tx.update(schema.PostAggregates).set({
              rank: sql<number>`
                (CAST(COALESCE(${schema.CommentAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.CommentAggregates.createdAt})) * 24 + 2,1.8)))`,
            });
          }
        }

        await tx.insert(schema.ConsumedOffset).values({ offset: seq });
      });
    }
  });

  await Promise.all(promises);

  return new Response("OK");
}
