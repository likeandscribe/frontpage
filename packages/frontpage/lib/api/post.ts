import "server-only";
import * as db from "../data/db/post";
import * as atproto from "../data/atproto/post";
import { ensureUser, getBlueskyProfile } from "../data/user";
import { DataLayerError } from "../data/error";
import { sendDiscordMessage } from "../discord";

export type ApiCreatePostInput = {
  post: atproto.Post;
  rkey: string;
  cid: string;
};

export async function createPost({ post, rkey, cid }: ApiCreatePostInput) {
  const user = await ensureUser();

  try {
    const createdPost = await atproto.createPost({
      title: post.title,
      url: post.url,
    });

    if (!createdPost) {
      throw new DataLayerError("Failed to create post");
    }

    const dbCreatedPost = await db.createPost({
      post,
      rkey,
      authorDid: user.did,
      cid,
    });

    if (!dbCreatedPost) {
      throw new DataLayerError("Failed to insert post in database");
    }
  } catch (e) {
    throw new DataLayerError(`Failed to create post: ${e}`);
  }
  const bskyProfile = await getBlueskyProfile(user.did);
  await sendDiscordMessage({
    embeds: [
      {
        title: "New post on Frontpage",
        description: post.title,
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
            value: post.url,
          },
        ],
      },
    ],
  });
}

export async function deletePost(rkey: string) {
  const user = await ensureUser();

  try {
    await atproto.deletePost(rkey);

    await db.deletePost({ rkey, authorDid: user.did });
  } catch (e) {
    throw new DataLayerError(`Failed to delete post: ${e}`);
  }
}
