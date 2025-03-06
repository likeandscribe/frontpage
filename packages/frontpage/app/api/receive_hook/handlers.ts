import * as atprotoComment from "@/lib/data/atproto/comment";
import { DID } from "@/lib/data/atproto/did";
import { Operation } from "@/lib/data/atproto/event";
import * as atprotoPost from "@/lib/data/atproto/post";
import * as atprotoVote from "@/lib/data/atproto/vote";
import * as dbComment from "@/lib/data/db/comment";
import * as dbNotification from "@/lib/data/db/notification";
import * as dbPost from "@/lib/data/db/post";
import * as dbVote from "@/lib/data/db/vote";
import { getBlueskyProfile } from "@/lib/data/user";
import { sendDiscordMessage } from "@/lib/discord";
import { invariant } from "@/lib/utils";

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
      const { title, url, createdAt } = postRecord.value;
      const createdDbPost = await dbPost.createPost({
        post: {
          title,
          url,
          createdAt: new Date(createdAt),
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
            description: title,
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
                value: url,
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
      const { content, createdAt, parent, post } = commentRecord.value;
      const createdComment = await dbComment.createComment({
        cid: commentRecord.cid,
        authorDid: repo,
        rkey,
        content,
        createdAt: new Date(createdAt),
        parent: parent
          ? {
              //TODO: is authority a DID?
              authorDid: parent.uri.authority as DID,
              rkey: parent.uri.rkey,
            }
          : undefined,
        post: {
          authorDid: post.uri.authority as DID,
          rkey: post.uri.rkey,
        },
      });

      if (!createdComment) {
        throw new Error("Failed to insert comment from relay in database");
      }

      const didToNotify = parent ? parent.uri.authority : post.uri.authority;

      if (didToNotify !== repo) {
        await dbNotification.createNotification({
          commentId: createdComment.id,
          did: didToNotify as DID,
          reason: parent ? "commentReply" : "postComment",
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

    invariant(hydratedRecord, "atproto vote record not found");

    const { subject } = hydratedRecord.value;

    switch (subject.uri.collection) {
      case atprotoPost.PostCollection:
        const postVote = await dbVote.uncached_doesPostVoteExist(repo, rkey);
        if (!postVote) {
          const createdDbPostVote = await dbVote.createPostVote({
            repo,
            rkey,
            cid: hydratedRecord.cid,
            subject: {
              rkey: subject.uri.rkey,
              authorDid: subject.uri.authority as DID,
            },
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
        );
        if (!commentVote) {
          const createdDbCommentVote = await dbVote.createCommentVote({
            repo,
            rkey,
            cid: hydratedRecord.cid,
            subject: {
              rkey: subject.uri.rkey,
              authorDid: subject.uri.authority as DID,
            },
          });

          if (!createdDbCommentVote) {
            throw new Error(
              "Failed to insert comment vote from relay in database",
            );
          }
        }
        break;
      default:
        throw new Error(`Unknown collection: ${subject.uri.collection}`);
    }
  } else if (op.action === "delete") {
    console.log("deleting vote", rkey);
    await dbVote.deleteVote({ authorDid: repo, rkey });
  }
}
