"use server";

import { createPost } from "@/lib/api/post";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { DataLayerError } from "@/lib/data/error";
import { ensureUser } from "@/lib/data/user";
import { redirect } from "next/navigation";

export async function newPostAction(_prevState: unknown, formData: FormData) {
  "use server";
  const user = await ensureUser();
  const title = formData.get("title");
  const url = formData.get("url");

  if (typeof title !== "string" || typeof url !== "string" || !title || !url) {
    return { error: "Provide a title and url." };
  }

  if (title.length > 120) {
    return { error: "Title too long" };
  }

  if (!URL.canParse(url)) {
    return { error: "Invalid URL" };
  }

  try {
    const [{ rkey }, handle] = await Promise.all([
      createPost({ authorDid: user.did, title, url }),
      getVerifiedHandle(user.did),
    ]);

    redirect(`/post/${handle}/${rkey}`);
  } catch (error) {
    if (!(error instanceof DataLayerError)) throw error;
    return { error: "Failed to create post" };
  }
}
