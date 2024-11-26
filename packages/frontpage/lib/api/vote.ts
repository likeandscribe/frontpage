import "server-only";
import * as db from "../data/db/vote";
import * as atproto from "../data/atproto/vote";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import { PostCollection } from "../data/atproto/post";
import { DID } from "../data/atproto/did";
import { CommentCollection } from "../data/atproto/comment";

export type ApiCreateVoteInput = {
  rkey: string;
  cid: string;
  repo: DID;
  collection: typeof PostCollection | typeof CommentCollection;
};

export async function createVote({
  rkey,
  cid,
  repo,
  collection,
}: ApiCreateVoteInput) {
  await ensureUser();

  try {
    const createdVote = await atproto.createVote({
      subjectRkey: rkey,
      subjectCid: cid,
      subjectCollection: collection,
      subjectAuthorDid: repo,
    });

    if (!createdVote) {
      throw new DataLayerError("Failed to create vote");
    }

    if (collection == PostCollection) {
      const dbCreatedVote = await db.createPostVote({
        repo,
        rkey,
        vote: createdVote,
        cid,
      });

      if (!dbCreatedVote) {
        throw new DataLayerError("Failed to insert post vote in database");
      }
    } else if (collection == CommentCollection) {
      const dbCreatedVote = await db.createCommentVote({
        repo,
        rkey,
        vote: createdVote,
        cid,
      });

      if (!dbCreatedVote) {
        throw new DataLayerError("Failed to insert comment vote in database");
      }
    }
  } catch (e) {
    throw new DataLayerError(`Failed to create post vote: ${e}`);
  }
}
