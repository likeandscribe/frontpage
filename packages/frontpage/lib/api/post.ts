import "server-only";
import * as db from "../data/db/post";
import * as atproto from "../data/atproto/post";
import { ensureUser, getBlueskyProfile } from "../data/user";
import { DataLayerError } from "../data/error";
import { sendDiscordMessage } from "../discord";

export interface ApiCreatePostInput extends Omit<atproto.Post, "createdAt"> {}

export async function createPost({ title, url }: ApiCreatePostInput) {
  const user = await ensureUser();

  try {
    const { rkey, cid } = await atproto.createPost({
      title: title,
      url: url,
    });

    if (!rkey || !cid) {
      throw new DataLayerError("Failed to create post");
    }

    const post = await atproto.getPost({
      rkey,
      repo: user.did,
    });

    if (!post) {
      throw new DataLayerError(
        "Failed to retrieve atproto post, database creation aborted",
      );
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
    throw new DataLayerError(`Failed to create post: ${e}`);
  }
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
