import "server-only";
import { getUser } from "../user";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";
import { DID } from "../atproto/did";
import {
  deleteCommentVoteAggregateTrigger,
  deletePostVoteAggregateTrigger,
  newCommentVoteAggregateTrigger,
  newPostVoteAggregateTrigger,
} from "./triggers";

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

    await newPostVoteAggregateTrigger(subject.id, tx);
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

    await newCommentVoteAggregateTrigger(subject.postId, subject.id, tx);
  });
}

// Try deleting from both tables. In reality only one will have a record.
// Relies on sqlite not throwing an error if the record doesn't exist.
export const unauthed_deleteVote = async (rkey: string, repo: DID) => {
  await db.transaction(async (tx) => {
    const [deletedCommentVoteRow] = await tx
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

    const [deletedPostVoteRow] = await tx
      .delete(schema.PostVote)
      .where(
        and(
          eq(schema.PostVote.rkey, rkey),
          eq(schema.PostVote.authorDid, repo),
        ),
      )
      .returning({ postId: schema.PostVote.postId });

    if (deletedCommentVoteRow?.commentId != null) {
      //the vote is a comment vote

      const [deletedCommentVoteCommentRow] = await tx
        .select({ postId: schema.Comment.postId })
        .from(schema.Comment)
        .where(eq(schema.Comment.id, deletedCommentVoteRow.commentId));

      if (!deletedCommentVoteCommentRow?.postId) {
        throw new Error("Post id not found");
      }

      await deleteCommentVoteAggregateTrigger(
        deletedCommentVoteCommentRow.postId,
        deletedCommentVoteRow.commentId,
        tx,
      );
    } else if (deletedPostVoteRow?.postId != null) {
      //the vote is a post vote
      await deletePostVoteAggregateTrigger(deletedPostVoteRow.postId, tx);
    }
  });
};
