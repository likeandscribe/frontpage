import "server-only";
import * as db from "../data/db/vote";
import * as atproto from "../data/atproto/vote";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import { PostCollection } from "../data/atproto/post";
import { DID } from "../data/atproto/did";
import { CommentCollection } from "../data/atproto/comment";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";

export type ApiCreateVoteInput = {
  subjectRkey: string;
  subjectCid: string;
  subjectAuthorDid: DID;
  subjectCollection: typeof PostCollection | typeof CommentCollection;
};

export async function createVote({
  subjectRkey,
  subjectAuthorDid,
  subjectCollection,
  subjectCid,
}: ApiCreateVoteInput) {
  const user = await ensureUser();

  const rkey = TID.next().toString();
  try {
    if (subjectCollection == PostCollection) {
      const dbCreatedVote = await db.createPostVote({
        repo: user.did,
        rkey,
        subjectRkey,
        subjectAuthorDid,
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    } else if (subjectCollection == CommentCollection) {
      const dbCreatedVote = await db.createCommentVote({
        repo: user.did,
        rkey,
        subjectRkey,
        subjectAuthorDid,
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    }

    const { cid } = await atproto.createVote({
      subjectRkey,
      subjectCid,
      subjectCollection,
      subjectAuthorDid,
    });

    invariant(cid, "Failed to create vote, cid missing");

    if (subjectCollection == PostCollection) {
      await db.updatePostVote({ authorDid: user.did, rkey, cid });
    } else if (subjectCollection == CommentCollection) {
      await db.updateCommentVote({ authorDid: user.did, rkey, cid });
    }
  } catch (e) {
    db.deleteVote({ authorDid: user.did, rkey });
    throw new DataLayerError(`Failed to create post vote: ${e}`);
  }
}

export async function deleteVote({ rkey }: db.DeleteVoteInput) {
  const user = await ensureUser();

  try {
    // await db.deleteVote({ authorDid: user.did, rkey });

    await atproto.deleteVote(user.did, rkey);
  } catch (e) {
    throw new DataLayerError(`Failed to delete vote: ${e}`);
  }
}
