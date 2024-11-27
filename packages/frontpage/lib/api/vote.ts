import "server-only";
import * as db from "../data/db/vote";
import * as atproto from "../data/atproto/vote";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import { PostCollection } from "../data/atproto/post";
import { DID } from "../data/atproto/did";
import { CommentCollection } from "../data/atproto/comment";
import { invariant } from "../utils";

export type ApiCreateVoteInput = {
  subjectRkey: string;
  subjectCid: string;
  subjectAuthorDid: DID;
  subjectCollection: typeof PostCollection | typeof CommentCollection;
};

export async function createVote({
  subjectRkey,
  subjectCid,
  subjectAuthorDid,
  subjectCollection,
}: ApiCreateVoteInput) {
  const user = await ensureUser();

  try {
    const { rkey, cid } = await atproto.createVote({
      subjectRkey,
      subjectCid,
      subjectCollection,
      subjectAuthorDid,
    });

    invariant(rkey && cid, "Failed to create vote, rkey/cid missing");

    const vote = await atproto.getVote({ rkey, repo: user.did });

    invariant(
      vote,
      "Failed to retrieve atproto vote, database creation aborted",
    );

    if (subjectCollection == PostCollection) {
      const dbCreatedVote = await db.createPostVote({
        repo: user.did,
        cid,
        rkey,
        vote,
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    } else if (subjectCollection == CommentCollection) {
      const dbCreatedVote = await db.createCommentVote({
        repo: user.did,
        cid,
        rkey,
        vote,
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    }
  } catch (e) {
    throw new DataLayerError(`Failed to create post vote: ${e}`);
  }
}

export async function deleteVote(rkey: string) {
  const user = await ensureUser();

  try {
    await atproto.deleteVote(rkey);

    await db.deleteVote(rkey, user.did);
  } catch (e) {
    throw new DataLayerError(`Failed to delete vote: ${e}`);
  }
}
