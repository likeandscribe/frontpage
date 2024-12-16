import "server-only";
import * as atproto from "../data/atproto/comment";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import * as db from "../data/db/comment";
import { DID } from "../data/atproto/did";
import { createNotification } from "../data/db/notification";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";

export type ApiCreateCommentInput = Omit<atproto.CommentInput, "rkey"> & {
  repo: DID;
};

export async function createComment({
  parent,
  post,
  content,
  repo,
}: ApiCreateCommentInput) {
  const user = await ensureUser();

  const rkey = TID.next().toString();
  try {
    const dbCreatedComment = await db.createComment({
      cid: "",
      authorDid: user.did,
      rkey,
      content,
      createdAt: new Date(),
      parent,
      post,
    });

    invariant(dbCreatedComment, "Failed to insert comment in database");

    const { cid } = await atproto.createComment({
      parent,
      post,
      content,
      rkey,
    });

    invariant(cid, "Failed to create comment, rkey/cid missing");

    await db.updateComment({ authorDid: user.did, rkey, cid });

    const didToNotify = parent ? parent.authorDid : post.authorDid;

    if (didToNotify !== repo) {
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

export async function deleteComment({ rkey }: db.DeleteCommentInput) {
  const user = await ensureUser();

  try {
    console.log("deleteComment", rkey);
    await db.deleteComment({ authorDid: user.did, rkey });
    await atproto.deleteComment(user.did, rkey);
  } catch (e) {
    throw new DataLayerError(`Failed to delete comment: ${e}`);
  }
}
