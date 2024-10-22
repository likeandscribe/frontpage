"use server";

import { xrpcClient } from "@/lib/data/atproto";
import { DID } from "@/lib/data/atproto/did";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { AtUri } from "@/lib/data/atproto/record";
import { uncached_doesPostExist } from "@/lib/data/db/post";
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

  const xrpc = await xrpcClient();

  try {
    const { uri } = await xrpc.fyi.unravel.frontpage.post.create(
      { repo: user.did },
      {
        title,
        url,
        createdAt: new Date().toISOString(),
      },
    );
    const rkey = AtUri.parse(uri).rkey;
    const [handle] = await Promise.all([
      getVerifiedHandle(user.did),
      waitForPost(user.did, rkey),
    ]);
    redirect(`/post/${handle}/${rkey}`);
  } catch (error) {
    if (!(error instanceof DataLayerError)) throw error;
    return { error: "Failed to create post" };
  }
}

const MAX_POLLS = 10;
async function waitForPost(authorDid: DID, rkey: string) {
  let exists = false;
  let polls = 0;
  while (!exists && polls < MAX_POLLS) {
    exists = await uncached_doesPostExist(authorDid, rkey);
    await new Promise((resolve) => setTimeout(resolve, 250));
    polls++;
  }
}
