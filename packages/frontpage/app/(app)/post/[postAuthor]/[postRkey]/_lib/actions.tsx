"use server";

import { CommentCollection } from "@/lib/data/atproto/comment";
import { DID } from "@/lib/data/atproto/did";
import { getComment } from "@/lib/data/db/comment";
import { getPost } from "@/lib/data/db/post";
import { parseReportForm } from "@/lib/data/db/report-shared";
import { createReport } from "@/lib/data/db/report";
import { getVoteForComment } from "@/lib/data/db/vote";
import { ensureUser } from "@/lib/data/user";
import { revalidatePath } from "next/cache";
import { createComment, deleteComment } from "@/lib/api/comment";
import { createVote, deleteVote } from "@/lib/api/vote";
import { invariant } from "@/lib/utils";

export async function createCommentAction(
  input: { parentRkey?: string; postRkey: string; postAuthorDid: DID },
  _prevState: unknown,
  formData: FormData,
) {
  const content = formData.get("comment") as string;
  const user = await ensureUser();

  const [post, comment] = await Promise.all([
    getPost(input.postAuthorDid, input.postRkey),
    input.parentRkey
      ? getComment(input.parentRkey).then((c) => {
          if (!c) throw new Error("Comment not found");
          return c;
        })
      : undefined,
  ]);

  invariant(post, "Post not found");

  invariant(
    post.status === "live",
    `[naughty] Cannot comment on deleted post. ${user.did}`,
  );

  invariant(post.cid, "Post cid is missing");

  await createComment({
    parent: comment,
    post: {
      authorDid: post.authorDid,
      rkey: post.rkey,
      cid: post.cid,
    },
    content,
    authorDid: user.did,
  });

  revalidatePath(`/post`);
}

export async function deleteCommentAction(rkey: string) {
  const user = await ensureUser();
  await deleteComment({ rkey, authorDid: user.did });
  revalidatePath("/post");
}

export async function reportCommentAction(
  input: {
    authorDid: DID;
    rkey: string;
    cid: string;
  },
  formData: FormData,
) {
  await ensureUser();
  const formResult = parseReportForm(formData);
  if (!formResult.success) {
    throw new Error("Invalid form data");
  }

  await createReport({
    ...formResult.data,
    subjectUri: `at://${input.authorDid}/${CommentCollection}/${input.rkey}`,
    subjectDid: input.authorDid,
    subjectCollection: CommentCollection,
    subjectRkey: input.rkey,
    subjectCid: input.cid,
  });
}

export async function commentVoteAction(input: {
  cid: string;
  rkey: string;
  authorDid: DID;
}) {
  const user = await ensureUser();
  await createVote({
    authorDid: user.did,
    subject: {
      rkey: input.rkey,
      cid: input.cid,
      authorDid: input.authorDid,
      collection: CommentCollection,
    },
  });
}

export async function commentUnvoteAction(commentId: number) {
  const user = await ensureUser();
  const vote = await getVoteForComment(commentId, user.did);
  if (!vote) {
    console.error("Vote not found for comment", commentId);
    return;
  }

  await deleteVote({ authorDid: user.did, rkey: vote.rkey });
}
