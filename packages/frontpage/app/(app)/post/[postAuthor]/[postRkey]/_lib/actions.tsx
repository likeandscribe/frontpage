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
import { createHeadlessEditor } from "@lexical/headless";
import {
  SerializedEditorState,
  $parseSerializedNode,
  LexicalEditor,
  $getRoot,
  EditorState,
  LexicalNode,
  $isTextNode,
  $isElementNode,
} from "lexical";
import { revalidatePath } from "next/cache";
import { deletePost } from "@/lib/data/atproto/post";

export async function createCommentAction(input: {
  parentRkey?: string;
  postRkey: string;
  postAuthorDid: DID;
  content: SerializedEditorState;
}) {
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

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status !== "live") {
    throw new Error(`[naughty] Cannot comment on deleted post. ${user.did}`);
  }

  const state = createHeadlessEditor().parseEditorState(input.content);

  // const { rkey } = await createComment({
  //   content,
  //   post,
  //   parent: comment,
  // });
  // await waitForComment(rkey);
  // revalidatePath(`/post`);
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

function editorStateToCommentContent(editorState: EditorState) {
  return editorState.read(() => {
    const root = $getRoot();
    root.getChildren().forEach((child) => {});

    const text = root.getTextContent();
  });
}

function $nodeToFacets(node: LexicalNode) {
  if ($isTextNode(node)) {
    if (node.hasFormat("bold")) {
      return node.selectStart;
    }
  }
  if ($isElementNode(node) && node.isEmpty()) return [];
}

export async function deletePostAction(rkey: string) {
  await deletePost(rkey);
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
  await ensureUser();
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
