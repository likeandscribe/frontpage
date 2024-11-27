import * as atprotoComment from "../data/atproto/comment";
import { DID } from "../data/atproto/did";
import { Operation } from "../data/atproto/event";
import * as atprotoPost from "../data/atproto/post";
import * as atprotoVote from "../data/atproto/vote";
import * as dbComment from "../data/db/comment";
import * as dbNotification from "../data/db/notification";
import * as dbPost from "../data/db/post";
import * as dbVote from "../data/db/vote";
import { getBlueskyProfile } from "../data/user";
import { sendDiscordMessage } from "../discord";

type HandlerInput = {
  op: Zod.infer<typeof Operation>;
  repo: DID;
  rkey: string;
};

// These handlers are called from the receive_hook route
// It processes operations received from the Drainpipe service
// Since we use read after write, we need to check if the record exists before creating it
// If it's a delete then setting the status to delete again doesn't matter

export async function handlePost({ op, repo, rkey }: HandlerInput) {
  if (op.action === "create") {
    const postRecord = await atprotoPost.getPost({
      repo,
      rkey,
    });

    const post = await dbPost.uncached_doesPostExist(repo, rkey);

    if (!post && postRecord) {
      const createdDbPost = await dbPost.createPost({
        post: postRecord,
        rkey,
        authorDid: repo,
        cid: postRecord.cid,
      });

      if (!createdDbPost) {
        throw new Error("Failed to insert post from relay in database");
      }

      const bskyProfile = await getBlueskyProfile(repo);
      await sendDiscordMessage({
        embeds: [
          {
            title: "New post on Frontpage",
            description: postRecord.title,
            url: `https://frontpage.fyi/post/${repo}/${rkey}`,
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
                value: postRecord.url,
              },
            ],
          },
        ],
      });
    }
  } else if (op.action === "delete") {
    await dbPost.deletePost({
      rkey,
      authorDid: repo,
    });
  }
}

export async function handleComment({ op, repo, rkey }: HandlerInput) {
  if (op.action === "create") {
    const commentRecord = await atprotoComment.getComment({
      rkey,
      repo,
    });

    const comment = await dbComment.uncached_doesCommentExist(rkey);

    console.log("comment", comment);
    if (!comment && commentRecord) {
      const createdComment = await dbComment.createComment({
        cid: commentRecord.cid,
        comment: commentRecord,
        repo,
        rkey,
      });

      if (!createdComment) {
        throw new Error("Failed to insert comment from relay in database");
      }

      const didToNotify = createdComment.parent
        ? createdComment.parent.authorDid
        : createdComment.post.authordid;

      if (didToNotify !== repo) {
        await dbNotification.createNotification({
          commentId: createdComment.id,
          did: didToNotify,
          reason: createdComment.parent ? "commentReply" : "postComment",
        });
      }
    }
  } else if (op.action === "delete") {
    await dbComment.deleteComment({ rkey, repo });
  }
}

export async function handleVote({ op, repo, rkey }: HandlerInput) {
  if (op.action === "create") {
    const hydratedRecord = await atprotoVote.getVote({
      repo,
      rkey,
    });

    switch (hydratedRecord.subject.uri.collection) {
      case atprotoPost.PostCollection:
        const postVote = await dbVote.uncached_doesPostVoteExist(
          repo,
          rkey,
          hydratedRecord.cid,
        );

        if (!postVote) {
          const createdDbPostVote = await dbVote.createPostVote({
            repo,
            rkey,
            vote: hydratedRecord,
            cid: hydratedRecord.cid,
          });

          if (!createdDbPostVote) {
            throw new Error(
              "Failed to insert post vote from relay in database",
            );
          }
        }
        break;
      case atprotoComment.CommentCollection:
        const commentVote = await dbVote.uncached_doesCommentVoteExist(
          repo,
          rkey,
          hydratedRecord.cid,
        );

        if (!commentVote) {
          const createdDbCommentVote = await dbVote.createCommentVote({
            cid: hydratedRecord.cid,
            vote: hydratedRecord,
            repo,
            rkey,
          });

          if (!createdDbCommentVote) {
            throw new Error(
              "Failed to insert comment vote from relay in database",
            );
          }
        }
        break;
      default:
        throw new Error(
          `Unknown collection: ${hydratedRecord.subject.uri.collection}`,
        );
    }
  } else if (op.action === "delete") {
    // do we get collections with jetstream now?
    await dbVote.deleteVote(rkey, repo);
  }
}
