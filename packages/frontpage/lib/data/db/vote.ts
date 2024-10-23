import "server-only";
import { getUser } from "../user";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
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
  repo: DID;
  rkey: string;
  hydratedVoteRecordValue: {
    createdAt: string;
    subject: {
      cid: string;
      uri: {
        rkey: string;
        value: string;
        authority: string;
        collection: string;
      };
    };
  };
  hydratedRecord: {
    cid: string;
  };
};

export const unauthed_createPostVote = async ({
  repo,
  rkey,
  hydratedVoteRecordValue,
  hydratedRecord,
}: UnauthedCreatePostVoteInput) => {
  await db.transaction(async (tx) => {
    const subject = (
      await tx
        .select()
        .from(schema.Post)
        .where(eq(schema.Post.rkey, hydratedVoteRecordValue.subject.uri.rkey))
    )[0];

    if (!subject) {
      throw new Error(
        `Subject not found with uri: ${hydratedVoteRecordValue.subject.uri.value}`,
      );
    }

    if (subject.authorDid === repo) {
      throw new Error(`[naughty] Cannot vote on own content ${repo}`);
    }
    await tx.insert(schema.PostVote).values({
      postId: subject.id,
      authorDid: repo,
      createdAt: new Date(hydratedVoteRecordValue.createdAt),
      cid: hydratedRecord.cid,
      rkey,
    });

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

export type UnauthedCreateCommentVoteInput = {
  repo: DID;
  rkey: string;
  hydratedVoteRecordValue: {
    createdAt: string;
    subject: {
      uri: {
        authority: string;
        collection: string;
        rkey: string;
        value: string;
      };
    };
  };
  hydratedRecord: {
    cid: string;
  };
};

export async function unauthed_createCommentVote({
  repo,
  rkey,
  hydratedVoteRecordValue,
  hydratedRecord,
}: UnauthedCreateCommentVoteInput) {
  await db.transaction(async (tx) => {
    const subject = (
      await tx
        .select()
        .from(schema.Comment)
        .where(
          eq(schema.Comment.rkey, hydratedVoteRecordValue.subject.uri.rkey),
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

    await tx.insert(schema.CommentVote).values({
      commentId: subject.id,
      authorDid: repo,
      createdAt: new Date(hydratedVoteRecordValue.createdAt),
      cid: hydratedRecord.cid,
      rkey,
    });

    const commentIds = tx
      .select({ commentId: schema.Comment.id })
      .from(schema.Comment)
      .where(eq(schema.Comment.postId, subject.postId));

    await tx
      .update(schema.CommentAggregates)
      .set({
        voteCount: sql`${schema.CommentAggregates.voteCount} + 1`,
      })
      .where(eq(schema.CommentAggregates.commentId, subject.id));

    await tx
      .update(schema.CommentAggregates)
      .set({
        rank: sql<number>`
                (CAST(COALESCE(${schema.CommentAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.CommentAggregates.createdAt})) * 24 + 2,1.8)))`,
      })
      .where(inArray(schema.CommentAggregates.commentId, commentIds));
  });
}

// Try deleting from both tables. In reality only one will have a record.
// Relies on sqlite not throwing an error if the record doesn't exist.
export const unauthed_deleteVote = async (rkey: string, repo: DID) => {
  await db.transaction(async (tx) => {
    const [commentTransaction] = await tx
      .delete(schema.CommentVote)
      .where(
        and(
          eq(schema.CommentVote.rkey, rkey),
          eq(schema.CommentVote.authorDid, repo),
        ),
      )
      .returning({
        commentId: schema.CommentVote.commentId,
      });

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
      //the vote is a comment vote

      const postId = tx
        .select({ postId: schema.Comment.postId })
        .from(schema.Comment)
        .where(eq(schema.Comment.id, commentTransaction.commentId));

      const commentIds = tx
        .select({ commentId: schema.Comment.id })
        .from(schema.Comment)
        .where(eq(schema.Comment.postId, postId));

      await tx
        .update(schema.CommentAggregates)
        .set({
          voteCount: sql`${schema.CommentAggregates.voteCount} - 1`,
        })
        .where(
          eq(schema.CommentAggregates.commentId, commentTransaction.commentId),
        );

      await tx
        .update(schema.CommentAggregates)
        .set({
          rank: sql<number>`
                (CAST(COALESCE(${schema.CommentAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.CommentAggregates.createdAt})) * 24 + 2,1.8)))`,
        })
        .where(inArray(schema.CommentAggregates.commentId, commentIds));
    } else if (postVoteTransaction?.postId != null) {
      //the vote is a post vote
      await tx
        .update(schema.PostAggregates)
        .set({
          voteCount: sql`${schema.PostAggregates.voteCount} - 1`,
        })
        .where(eq(schema.PostAggregates.postId, postVoteTransaction.postId));
      await tx.update(schema.PostAggregates).set({
        rank: sql<number>`
                (CAST(COALESCE(${schema.PostAggregates.voteCount}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${schema.PostAggregates.createdAt})) * 24 + 2,1.8)))`,
      });
    }
  });
};
