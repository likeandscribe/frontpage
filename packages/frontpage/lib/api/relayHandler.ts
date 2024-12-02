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
import { invariant } from "../utils";

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

    invariant(postRecord, "atproto post record not found");

    const post = await dbPost.uncached_doesPostExist(repo, rkey);

    if (!post && postRecord) {
      const createdDbPost = await dbPost.createPost({
        post: {
          title: postRecord.title,
          url: postRecord.url,
          createdAt: new Date(postRecord.createdAt),
        },
        rkey,
        cid: postRecord.cid,
        authorDid: repo,
      });

      invariant(createdDbPost, "Failed to insert post from relay in database");

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
      authorDid: repo,
      rkey,
    });
  }
}

export async function handleComment({ op, repo, rkey }: HandlerInput) {
  if (op.action === "create") {
    const commentRecord = await atprotoComment.getComment({
      rkey,
      repo,
    });

    invariant(commentRecord, "atproto comment record not found");

    const comment = await dbComment.uncached_doesCommentExist(repo, rkey);

    if (!comment && commentRecord) {
      const createdComment = await dbComment.createComment({
        cid: commentRecord.cid,
        authorDid: repo,
        rkey,
        content: commentRecord.content,
        createdAt: new Date(commentRecord.createdAt),
        parent: commentRecord.parent
          ? {
              //TODO: is authority a DID?
              authorDid: commentRecord.parent.uri.authority as DID,
              rkey: commentRecord.parent.uri.rkey,
            }
          : undefined,
        post: {
          authorDid: commentRecord.post.uri.authority as DID,
          rkey: commentRecord.post.uri.rkey,
        },
      });

      if (!createdComment) {
        throw new Error("Failed to insert comment from relay in database");
      }

      const didToNotify = commentRecord.parent
        ? commentRecord.parent.uri.authority
        : commentRecord.post.uri.authority;

      if (didToNotify !== repo) {
        await dbNotification.createNotification({
          commentId: createdComment.id,
          did: didToNotify as DID,
          reason: commentRecord.parent ? "commentReply" : "postComment",
        });
      }
    }
  } else if (op.action === "delete") {
    await dbComment.deleteComment({ rkey, authorDid: repo });
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
        const createdDbPostVote = await dbVote.createPostVote({
          repo,
          rkey,
          cid: hydratedRecord.cid,
          subjectRkey: hydratedRecord.subject.uri.rkey,
          subjectAuthorDid: hydratedRecord.subject.uri.authority as DID,
        });

        if (!createdDbPostVote) {
          throw new Error("Failed to insert post vote from relay in database");
        }
        break;
      case atprotoComment.CommentCollection:
        const createdDbCommentVote = await dbVote.createCommentVote({
          repo,
          rkey,
          cid: hydratedRecord.cid,
          subjectRkey: hydratedRecord.subject.uri.rkey,
          subjectAuthorDid: hydratedRecord.subject.uri.authority as DID,
        });

        if (!createdDbCommentVote) {
          throw new Error(
            "Failed to insert comment vote from relay in database",
          );
        }
        break;
      default:
        throw new Error(
          `Unknown collection: ${hydratedRecord.subject.uri.collection}`,
        );
    }
  } else if (op.action === "delete") {
    await dbVote.deleteVote({ authorDid: repo, rkey });
  }
}
