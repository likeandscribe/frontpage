"use server";

import { type DID } from "@/lib/data/atproto/did";
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
import { nsids } from "@/lib/data/atproto/repo";

export async function createCommentAction(
  input: {
    parent?: {
      rkey: string;
      did: DID;
    };
    postRkey: string;
    postAuthorDid: DID;
  },
  _prevState: unknown,
  formData: FormData,
) {
  const content = formData.get("comment") as string;
  const user = await ensureUser();

  const [post, parent] = await Promise.all([
    getPost(input.postAuthorDid, input.postRkey),
    input.parent
      ? getComment(input.parent.did, input.parent.rkey).then((c) => {
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
    parent,
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
    subjectUri: `at://${input.authorDid}/${nsids.FyiUnravelFrontpageComment}/${input.rkey}`,
    subjectDid: input.authorDid,
    subjectCollection: nsids.FyiUnravelFrontpageComment,
    subjectRkey: input.rkey,
    subjectCid: input.cid,
  });
}

export async function commentVoteAction(input: {
  cid: string;
  rkey: string;
  authorDid: DID;
}) {
  await ensureUser();
  await createVote({
    rkey: input.rkey,
    cid: input.cid,
    authorDid: input.authorDid,
    collection: nsids.FyiUnravelFrontpageComment,
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
