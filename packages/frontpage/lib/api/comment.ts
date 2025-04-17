import "server-only";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import * as db from "../data/db/comment";
import { type DID } from "../data/atproto/did";
import { createNotification } from "../data/db/notification";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";
import { after } from "next/server";
import { getAtprotoClient, nsids } from "../data/atproto/repo";

export type ApiCreateCommentInput = {
  // TODO: Use strongRef type for parent and post
  parent?: { cid: string; rkey: string; authorDid: DID };
  post: { cid: string; rkey: string; authorDid: DID };
  content: string;
  authorDid: DID;
};

export async function createComment({
  parent,
  post,
  content,
  authorDid,
}: ApiCreateCommentInput) {
  const user = await ensureUser();

  const rkey = TID.next().toString();
  try {
    const sanitizedContent = content.replace(/\n\n+/g, "\n\n").trim();

    const dbCreatedComment = await db.createComment({
      authorDid: user.did,
      rkey,
      content: sanitizedContent,
      createdAt: new Date(),
      parent,
      post,
      status: "pending",
    });

    invariant(dbCreatedComment, "Failed to insert comment in database");

    after(() =>
      getAtprotoClient().fyi.unravel.frontpage.comment.create(
        {
          repo: user.did,
          rkey,
        },
        {
          parent: parent
            ? {
                cid: parent.cid,
                uri: `at://${parent.authorDid}/${nsids.FyiUnravelFrontpageComment}/${parent.rkey}`,
              }
            : undefined,
          post: {
            cid: post.cid,
            uri: `at://${post.authorDid}/${nsids.FyiUnravelFrontpagePost}/${post.rkey}`,
          },
          content: sanitizedContent,
          createdAt: new Date().toISOString(),
        },
      ),
    );

    const didToNotify = parent ? parent.authorDid : post.authorDid;

    if (didToNotify !== authorDid) {
      await createNotification({
        commentId: dbCreatedComment.id,
        did: didToNotify,
        reason: parent ? "commentReply" : "postComment",
      });
    }
  } catch (e) {
    await db.deleteComment({ authorDid: user.did, rkey });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new DataLayerError(`Failed to create comment: ${e}`);
  }
}

export async function deleteComment({
  authorDid,
  rkey,
}: db.DeleteCommentInput) {
  const user = await ensureUser();

  if (user.did !== authorDid) {
    throw new DataLayerError("You can only delete your own comments");
  }

  try {
    after(() =>
      getAtprotoClient().fyi.unravel.frontpage.comment.delete({
        repo: authorDid,
        rkey,
      }),
    );
    await db.deleteComment({ authorDid: user.did, rkey });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new DataLayerError(`Failed to delete comment: ${e}`);
  }
}
