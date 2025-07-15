import { getPdsUrl, type DID } from "@/lib/data/atproto/did";
import { type Operation } from "@/lib/data/atproto/event";
import { getAtprotoClient, nsids } from "@/lib/data/atproto/repo";
import { AtUri } from "@/lib/data/atproto/uri";
import * as dbComment from "@/lib/data/db/comment";
import * as dbNotification from "@/lib/data/db/notification";
import * as dbPost from "@/lib/data/db/post";
import * as dbVote from "@/lib/data/db/vote";
import { getBlueskyProfile } from "@/lib/data/user";
import { sendDiscordMessage } from "@/lib/discord";
import { invariant } from "@/lib/utils";
import type z from "zod";

type HandlerInput = {
  op: z.infer<typeof Operation>;
  repo: DID;
  rkey: string;
};

// These handlers are called from the receive_hook route
// It processes operations received from the Drainpipe service
// Since we use read after write, we need to check if the record exists before creating it
// If it's a delete then setting the status to delete again doesn't matter

async function getAtprotoClientFromRepo(repo: DID) {
  const pds = await getPdsUrl(repo);
  if (!pds) {
    throw new Error("Failed to get PDS");
  }
  return getAtprotoClient(pds);
}

export async function handlePost({ op, repo, rkey }: HandlerInput) {
  const atproto = await getAtprotoClientFromRepo(repo);

  if (op.action === "create") {
    const postRecord = await atproto.fyi.unravel.frontpage.post.get({
      repo,
      rkey,
    });

    invariant(postRecord, "atproto post record not found");

    const post = await dbPost.uncached_doesPostExist(repo, rkey);
    const { title, url, createdAt } = postRecord.value;

    if (post) {
      await dbPost.updatePost(repo, rkey, {
        status: "live",
        cid: postRecord.cid,
      });
    } else {
      await dbPost.createPost({
        post: {
          title,
          url,
          createdAt: new Date(createdAt),
        },
        rkey,
        cid: postRecord.cid,
        authorDid: repo,
        status: "live",
      });
    }

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
  } else if (op.action === "delete") {
    await dbPost.deletePost({
      authorDid: repo,
      rkey,
    });
  }
}

export async function handleComment({ op, repo, rkey }: HandlerInput) {
  const atproto = await getAtprotoClientFromRepo(repo);

  if (op.action === "create") {
    const commentRecord = await atproto.fyi.unravel.frontpage.comment.get({
      rkey,
      repo,
    });

    invariant(commentRecord, "atproto comment record not found");

    const comment = await dbComment.uncached_doesCommentExist(repo, rkey);

    if (comment) {
      console.log("comment already exists", commentRecord.value);
      await dbComment.updateComment(repo, rkey, {
        status: "live",
        cid: commentRecord.cid,
      });
    } else {
      const { content, createdAt, parent, post } = commentRecord.value;
      const postUri = AtUri.parse(post.uri);
      const parentUri = parent ? AtUri.parse(parent.uri) : null;
      const createdComment = await dbComment.createComment({
        cid: commentRecord.cid,
        authorDid: repo,
        rkey,
        content,
        createdAt: new Date(createdAt),
        parent: parentUri
          ? {
              //TODO: is authority a DID?
              authorDid: parentUri.authority as DID,
              rkey: parentUri.rkey,
            }
          : undefined,
        post: {
          authorDid: postUri.authority as DID,
          rkey: postUri.rkey,
        },
        status: "live",
      });

      if (!createdComment) {
        throw new Error("Failed to insert comment from relay in database");
      }

      const didToNotify = parentUri ? parentUri.authority : postUri.authority;

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
  const atproto = await getAtprotoClientFromRepo(repo);
  if (op.action === "create") {
    const hydratedRecord = await atproto.fyi.unravel.frontpage.vote.get({
      repo,
      rkey,
    });

    invariant(hydratedRecord, "atproto vote record not found");

    const { subject } = hydratedRecord.value;
    const subjectUri = AtUri.parse(subject.uri);

    switch (subjectUri.collection) {
      case nsids.FyiUnravelFrontpagePost: {
        const postVote = await dbVote.uncached_doesPostVoteExist(repo, rkey);
        if (postVote) {
          await dbVote.updatePostVote({
            authorDid: repo,
            rkey,
            status: "live",
            cid: hydratedRecord.cid,
          });
        } else {
          const createdDbPostVote = await dbVote.createPostVote({
            repo,
            rkey,
            cid: hydratedRecord.cid,
            subject: {
              rkey: subjectUri.rkey,
              authorDid: subjectUri.authority as DID,
              cid: subject.cid,
            },
            status: "live",
          });

          if (!createdDbPostVote) {
            throw new Error(
              "Failed to insert post vote from relay in database",
            );
          }
        }
        break;
      }
      case nsids.FyiUnravelFrontpageComment: {
        const commentVote = await dbVote.uncached_doesCommentVoteExist(
          repo,
          rkey,
        );
        if (commentVote) {
          await dbVote.updateCommentVote({
            authorDid: repo,
            rkey,
            status: "live",
            cid: hydratedRecord.cid,
          });
        } else {
          const createdDbCommentVote = await dbVote.createCommentVote({
            repo,
            rkey,
            cid: hydratedRecord.cid,
            subject: {
              rkey: subjectUri.rkey,
              authorDid: subjectUri.authority as DID,
              cid: subject.cid,
            },
            status: "live",
          });

          if (!createdDbCommentVote) {
            throw new Error(
              "Failed to insert comment vote from relay in database",
            );
          }
        }
        break;
      }
      default:
        invariant(subjectUri.collection, "Unknown collection");
    }
  } else if (op.action === "delete") {
    console.log("deleting vote", rkey);
    await dbVote.deleteVote({ authorDid: repo, rkey });
  }
}
