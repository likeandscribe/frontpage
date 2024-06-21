"use server";

import { createComment } from "@/lib/data/atproto/comment";
import { deletePost } from "@/lib/data/atproto/post";
import { getComment, uncached_doesCommentExist } from "@/lib/data/db/comment";
import { getPost } from "@/lib/data/db/post";
import { ensureUser } from "@/lib/data/user";
import { revalidatePath } from "next/cache";

export async function createCommentAction(
  input: { parentRkey?: string; postRkey: string },
  _prevState: unknown,
  formData: FormData,
) {
  const content = formData.get("comment") as string;
  const user = await ensureUser();

  const [post, comment] = await Promise.all([
    getPost(input.postRkey),
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

  const { rkey } = await createComment({
    content,
    post,
    parent: comment,
  });
  await waitForComment(rkey);
  revalidatePath(`/post/${input.postRkey}`);
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

export async function deletePostAction(rkey: string) {
  await deletePost(rkey);
}
