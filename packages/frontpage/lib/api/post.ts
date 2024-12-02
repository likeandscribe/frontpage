import "server-only";
import * as db from "../data/db/post";
import * as atproto from "../data/atproto/post";
import { ensureUser, getBlueskyProfile } from "../data/user";
import { DataLayerError } from "../data/error";
import { sendDiscordMessage } from "../discord";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";

export type ApiCreatePostInput = {
  title: string;
  url: string;
  createdAt: Date;
};

export async function createPost({
  title,
  url,
  createdAt,
}: ApiCreatePostInput) {
  const user = await ensureUser();

  const rkey = TID.next().toString();
  try {
    const dbCreatedPost = await db.createPost({
      post: { title, url, createdAt },
      rkey,
      authorDid: user.did,
    });
    invariant(dbCreatedPost, "Failed to insert post in database");

    const { cid } = await atproto.createPost({
      title: title,
      url: url,
    });

    invariant(cid, "Failed to create comment, rkey/cid missing");

    db.updatePost({ authorDid: user.did, rkey, cid });

    const bskyProfile = await getBlueskyProfile(user.did);

    await sendDiscordMessage({
      embeds: [
        {
          title: "New post on Frontpage",
          description: title,
          url: `https://frontpage.fyi/post/${user.did}/${rkey}`,
          color: 10181046,
          author: bskyProfile
            ? {
                name: `@${bskyProfile.handle}`,
                icon_url: bskyProfile.avatar,
                url: `https://frontpage.fyi/profile/${bskyProfile.handle}`,
              }
            : undefined,
          fields: [
            {
              name: "Link",
              value: url,
            },
          ],
        },
      ],
    });

    return { rkey, cid };
  } catch (e) {
    db.deletePost({ authorDid: user.did, rkey });
    throw new DataLayerError(`Failed to create post: ${e}`);
  }
}

export async function deletePost({ rkey }: db.DeletePostInput) {
  const user = await ensureUser();

  try {
    await atproto.deletePost(user.did, rkey);

    await db.deletePost({ authorDid: user.did, rkey });
  } catch (e) {
    throw new DataLayerError(`Failed to delete post: ${e}`);
  }
}
