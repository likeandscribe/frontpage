"use server";

import {
  CommentCollection,
  createComment,
  deleteComment,
} from "@/lib/data/atproto/comment";
import { DID } from "@/lib/data/atproto/did";
import { createVote, deleteVote } from "@/lib/data/atproto/vote";
import { getComment, uncached_doesCommentExist } from "@/lib/data/db/comment";
import { getPost } from "@/lib/data/db/post";
import { parseReportForm } from "@/lib/data/db/report-shared";
import { createReport } from "@/lib/data/db/report";
import { getVoteForComment } from "@/lib/data/db/vote";
import { ensureUser } from "@/lib/data/user";
import { revalidatePath } from "next/cache";
import { isBanned } from "@/lib/data/db/user";
import { TextLink } from "@/lib/components/ui/typography";

export async function createCommentAction(
  input: { parentRkey?: string; postRkey: string; postAuthorDid: DID },
  formData: FormData,
) {
  const content = formData.get("comment") as string;
  const user = await ensureUser();
  if (await isBanned(user.did)) {
    return {
      error: (
        <>
          Your account is currently banned from creating new comments.{" "}
          <TextLink href="/about#contact">Contact us</TextLink> to appeal.
        </>
      ),
    };
  }

  const [post, comment] = await Promise.all([
    getPost(input.postAuthorDid, input.postRkey),
    input.parentRkey
      ? getComment(input.parentRkey).then((c) => {
          if (!c) throw new Error("Comment not found");
          return c;
        })
      : undefined,
  ]);

  if (!post) {
    return { error: "Failed to create comment. Post not found." };
  }

  if (post.status !== "live") {
    throw new Error(`[naughty] Cannot comment on deleted post. ${user.did}`);
  }

  const { rkey } = await createComment({
    content,
    post,
    parent: comment,
  });
  await waitForComment(rkey);
  revalidatePath(`/post`);
}

const MAX_POLLS = 15;
async function waitForComment(rkey: string) {
  let exists = false;
  let polls = 0;
  while (!exists && polls < MAX_POLLS) {
    exists = await uncached_doesCommentExist(rkey);
    await new Promise((resolve) => setTimeout(resolve, 250));
    polls++;
  }
  if (!exists) {
    throw new Error(`Comment not found after polling: ${rkey}`);
  }
}

export async function deleteCommentAction(rkey: string) {
  await ensureUser();
  await deleteComment(rkey);
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
  if (await isBanned(user.did)) {
    throw new Error("Author is banned");
  }
  await createVote({
    subjectAuthorDid: input.authorDid,
    subjectCid: input.cid,
    subjectRkey: input.rkey,
    subjectCollection: CommentCollection,
  });
}

export async function commentUnvoteAction(commentId: number) {
  await ensureUser();
  const vote = await getVoteForComment(commentId);
  if (!vote) {
    console.error("Vote not found for comment", commentId);
    return;
  }

  await deleteVote(vote.rkey);
}
