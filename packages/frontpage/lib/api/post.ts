import "server-only";
import * as db from "../data/db/post";
import * as atproto from "../data/atproto/post";
import { ensureUser } from "../data/user";
import { DataLayerError } from "../data/error";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";
import { DID } from "../data/atproto/did";
import { after } from "next/server";

export type ApiCreatePostInput = {
  authorDid: DID;
  title: string;
  url: string;
};

export async function createPost({
  authorDid,
  title,
  url,
}: ApiCreatePostInput) {
  const user = await ensureUser();

  if (user.did !== authorDid) {
    throw new DataLayerError("You can only create posts for yourself");
  }

  const rkey = TID.next().toString();
  try {
    const dbCreatedPost = await db.createPost({
      post: { title, url, createdAt: new Date() },
      rkey,
      authorDid: user.did,
      status: "pending",
    });
    invariant(dbCreatedPost, "Failed to insert post in database");

    after(() =>
      atproto.createPost({
        title: title,
        url: url,
        rkey,
      }),
    );

    return { rkey };
  } catch (e) {
    await db.deletePost({ authorDid: user.did, rkey });
    throw new DataLayerError(`Failed to create post: ${e}`);
  }
}

export async function deletePost({ authorDid, rkey }: db.DeletePostInput) {
  const user = await ensureUser();

  if (authorDid !== user.did) {
    throw new DataLayerError("You can only delete your own posts");
  }

  try {
    after(() => atproto.deletePost(authorDid, rkey));
    await db.deletePost({ authorDid: user.did, rkey });
  } catch (e) {
    throw new DataLayerError(`Failed to delete post: ${e}`);
  }
}
