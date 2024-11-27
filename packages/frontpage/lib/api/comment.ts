import "server-only";
import * as atproto from "../data/atproto/comment";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import * as db from "../data/db/comment";
import { DID } from "../data/atproto/did";
import { createNotification } from "../data/db/notification";

export type ApiCreateCommentInput = atproto.CommentInput & {
  repo: DID;
};

export async function createComment({
  parent,
  post,
  content,
  repo,
}: ApiCreateCommentInput) {
  const user = await ensureUser();

  try {
    const { rkey, cid } = await atproto.createComment({
      parent,
      post,
      content,
    });

    if (!rkey || !cid) {
      throw new DataLayerError("Failed to create comment");
    }

    const comment = await atproto.getComment({
      rkey,
      repo: user.did,
    });

    if (!comment) {
      throw new DataLayerError(
        "Failed to retrieve atproto comment, database creation aborted",
      );
    }

    const createdComment = await db.createComment({
      cid,
      comment,
      repo,
      rkey: rkey,
    });

    if (!createdComment) {
      throw new DataLayerError("Failed to insert comment in database");
    }

    const didToNotify = createdComment.parent
      ? createdComment.parent.authorDid
      : createdComment.post.authordid;

    if (didToNotify !== repo) {
      await createNotification({
        commentId: createdComment.id,
        did: didToNotify,
        reason: createdComment.parent ? "commentReply" : "postComment",
      });
    }
  } catch (e) {
    throw new DataLayerError(`Failed to create comment: ${e}`);
  }
}

export async function deleteComment({ rkey, repo }: db.DeleteCommentInput) {
  await ensureUser();

  try {
    await atproto.deleteComment(rkey);
    await db.deleteComment({ rkey, repo });
  } catch (e) {
    throw new DataLayerError(`Failed to delete comment: ${e}`);
  }
}
