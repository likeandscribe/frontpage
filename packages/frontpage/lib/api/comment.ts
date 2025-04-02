import "server-only";
import * as atproto from "../data/atproto/comment";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import * as db from "../data/db/comment";
import { DID } from "../data/atproto/did";
import { createNotification } from "../data/db/notification";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";
import { after } from "next/server";

export type ApiCreateCommentInput = Omit<atproto.CommentInput, "rkey"> & {
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
      atproto.createComment({
        parent,
        post,
        content: sanitizedContent,
        rkey,
      }),
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
    console.log("deleteComment", rkey);
    await atproto.deleteComment(authorDid, rkey);
    await db.deleteComment({ authorDid: user.did, rkey });
  } catch (e) {
    throw new DataLayerError(`Failed to delete comment: ${e}`);
  }
}
