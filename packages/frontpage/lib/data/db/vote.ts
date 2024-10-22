import "server-only";
import { getUser } from "../user";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { DID } from "../atproto/did";

export const getVoteForPost = cache(async (postId: number) => {
  const user = await getUser();
  if (!user) return null;

  const rows = await db
    .select()
    .from(schema.PostVote)
    .where(
      and(
        eq(schema.PostVote.authorDid, user.did),
        eq(schema.PostVote.postId, postId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
});

export const getVoteForComment = cache(async (commentId: number) => {
  const user = await getUser();
  if (!user) return null;

  const rows = await db
    .select()
    .from(schema.CommentVote)
    .where(
      and(
        eq(schema.CommentVote.authorDid, user.did),
        eq(schema.CommentVote.commentId, commentId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
});

export type UnauthedCreatePostVoteInput = {
  postId: number;
  repo: DID;
  hydratedVoteRecordValue: {
    createdAt: string;
    cid: string;
  };
  hydratedRecord: {
    cid: string;
  };
};

export const unauthed_createPostVote = async ({
  postId,
  repo,
  hydratedVoteRecordValue,
}: UnauthedCreatePostVoteInput) => {
  await db.transaction(async (tx) => {
    await tx.insert(schema.PostVote).values({
      postId,
      authorDid: repo,
      createdAt: new Date(hydratedVoteRecordValue.createdAt),
      cid: hydratedRecord.cid,
      rkey,
    });

    console.log("Updating post aggregates");
    await tx
      .update(schema.PostAggregates)
      .set({
        voteCount: sql`${schema.PostAggregates.voteCount} + 1`,
      })
      .where(eq(schema.PostAggregates.postId, subject.id));

    await tx.update(schema.PostAggregates).set({
      rank: sql<number>`
                (CAST(COALESCE(${schema.PostAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.PostAggregates.createdAt})) * 24 + 2,1.8)))`,
    });
  });
};
