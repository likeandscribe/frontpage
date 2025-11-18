import "server-only";
import { getUser } from "../user";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import { cache } from "react";
import { type DID } from "../atproto/did";
import {
  deleteCommentVoteAggregateTrigger,
  deletePostVoteAggregateTrigger,
  newCommentVoteAggregateTrigger,
  newPostVoteAggregateTrigger,
} from "./triggers";
import { invariant } from "@/lib/utils";
import type { VoteCollectionType } from "../atproto/repo";

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

export const uncached_doesPostVoteExist = async (
  authorDid: DID,
  rkey: string,
) => {
  const row = await db
    .select({ id: schema.PostVote.id })
    .from(schema.PostVote)
    .where(
      and(
        eq(schema.PostVote.authorDid, authorDid),
        eq(schema.PostVote.rkey, rkey),
      ),
    )
    .limit(1);

  return Boolean(row[0]);
};

export const uncached_doesCommentVoteExist = async (
  authorDid: DID,
  rkey: string,
) => {
  const row = await db
    .select({ id: schema.CommentVote.id })
    .from(schema.CommentVote)
    .where(
      and(
        eq(schema.CommentVote.authorDid, authorDid),
        eq(schema.CommentVote.rkey, rkey),
      ),
    )
    .limit(1);

  return Boolean(row[0]);
};

export const getVoteForComment = cache(
  async (commentId: number, userDid: DID) => {
    const rows = await db
      .select()
      .from(schema.CommentVote)
      .where(
        and(
          eq(schema.CommentVote.authorDid, userDid),
          eq(schema.CommentVote.commentId, commentId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  },
);

export type CreateVoteInput = {
  repo: DID;
  rkey: string;
  cid?: string;
  subject: {
    rkey: string;
    authorDid: DID;
    cid: string;
  };
  status: "live" | "pending";
  collection: VoteCollectionType;
};

export const createPostVote = async ({
  repo,
  rkey,
  cid,
  subject,
  collection,
}: CreateVoteInput) => {
  return await db.transaction(async (tx) => {
    const post = (
      await tx
        .select()
        .from(schema.Post)
        .where(
          and(
            eq(schema.Post.rkey, subject.rkey),
            eq(schema.Post.authorDid, subject.authorDid),
            eq(schema.Post.cid, subject.cid),
          ),
        )
    )[0];

    invariant(
      post,
      `Post not found with rkey: ${subject.rkey} repo: ${subject.authorDid} cid: ${subject.cid}`,
    );

    if (post.authorDid === repo) {
      throw new Error(`[naughty] Cannot vote on own content ${repo}`);
    }
    const [insertedVote] = await tx
      .insert(schema.PostVote)
      .values({
        postId: post.id,
        authorDid: repo,
        createdAt: new Date(),
        cid: cid ?? "",
        rkey,
        collection,
      })
      .returning({ id: schema.PostVote.id });

    if (!insertedVote) {
      throw new Error("Failed to insert vote");
    }

    await newPostVoteAggregateTrigger(post.id, tx);

    return { id: insertedVote?.id };
  });
};

export async function createCommentVote({
  repo,
  rkey,
  cid,
  subject,
  collection,
}: CreateVoteInput) {
  return await db.transaction(async (tx) => {
    const comment = (
      await tx
        .select()
        .from(schema.Comment)
        .where(
          and(
            eq(schema.Comment.rkey, subject.rkey),
            eq(schema.Comment.authorDid, subject.authorDid),
          ),
        )
    )[0];

    invariant(comment, `Comment not found with rkey: ${subject.rkey}`);

    if (comment.authorDid === repo) {
      throw new Error(`[naughty] Cannot vote on own content ${repo}`);
    }

    const [insertedVote] = await tx
      .insert(schema.CommentVote)
      .values({
        commentId: comment.id,
        authorDid: repo,
        createdAt: new Date(),
        cid: cid ?? "",
        rkey,
        collection,
      })
      .returning({ id: schema.CommentVote.id });

    if (!insertedVote) {
      throw new Error("Failed to insert vote");
    }

    await newCommentVoteAggregateTrigger(comment.postId, comment.id, tx);

    return { id: insertedVote?.id };
  });
}

type UpdatePostVoteInput = Partial<
  Omit<InferSelectModel<typeof schema.PostVote>, "id">
> & {
  authorDid: DID;
  rkey: string;
};

export const updatePostVote = async (input: UpdatePostVoteInput) => {
  const { rkey, authorDid, ...updateFields } = input;

  return await db
    .update(schema.PostVote)
    .set(updateFields)
    .where(
      and(
        eq(schema.PostVote.rkey, rkey),
        eq(schema.PostVote.authorDid, authorDid),
      ),
    );
};

type UpdateCommentVoteInput = Partial<
  Omit<InferSelectModel<typeof schema.PostVote>, "id">
> & {
  authorDid: DID;
  rkey: string;
};

export const updateCommentVote = async (input: UpdateCommentVoteInput) => {
  const { rkey, authorDid, ...updateFields } = input;

  return await db
    .update(schema.CommentVote)
    .set(updateFields)
    .where(
      and(
        eq(schema.CommentVote.rkey, rkey),
        eq(schema.CommentVote.authorDid, authorDid),
      ),
    );
};

// Try deleting from both tables. In reality only one will have a record.
// Relies on sqlite not throwing an error if the record doesn't exist.
export type DeleteVoteInput = {
  authorDid: DID;
  rkey: string;
};

export const deleteVote = async ({ authorDid, rkey }: DeleteVoteInput) => {
  await db.transaction(async (tx) => {
    const [deletedCommentVoteRow] = await tx
      .delete(schema.CommentVote)
      .where(
        and(
          eq(schema.CommentVote.rkey, rkey),
          eq(schema.CommentVote.authorDid, authorDid),
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
          eq(schema.PostVote.authorDid, authorDid),
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
