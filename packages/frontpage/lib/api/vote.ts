import "server-only";
import * as db from "../data/db/vote";
import * as atproto from "../data/atproto/vote";
import { DataLayerError } from "../data/error";
import { ensureUser } from "../data/user";
import { type DID } from "../data/atproto/did";
import { invariant } from "../utils";
import { TID } from "@atproto/common-web";
import { after } from "next/server";
import { nsids } from "../data/atproto/repo";

export type ApiCreateVoteInput = {
  authorDid: DID;
  subject: {
    rkey: string;
    cid: string;
    authorDid: DID;
    collection:
      | typeof nsids.FyiUnravelFrontpagePost
      | typeof nsids.FyiUnravelFrontpageComment;
  };
};

export async function createVote({ authorDid, subject }: ApiCreateVoteInput) {
  const user = await ensureUser();

  if (authorDid !== user.did) {
    throw new DataLayerError("You can only vote for yourself");
  }

  const rkey = TID.next().toString();
  try {
    if (subject.collection == nsids.FyiUnravelFrontpagePost) {
      const dbCreatedVote = await db.createPostVote({
        repo: authorDid,
        rkey,
        subject: {
          rkey: subject.rkey,
          authorDid: subject.authorDid,
          cid: subject.cid,
        },
        status: "pending",
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    } else if (subject.collection == nsids.FyiUnravelFrontpageComment) {
      const dbCreatedVote = await db.createCommentVote({
        repo: authorDid,
        rkey,
        subject: {
          rkey: subject.rkey,
          authorDid: subject.authorDid,
          cid: subject.cid,
        },
        status: "pending",
      });

      invariant(dbCreatedVote, "Failed to insert post vote in database");
    }

    after(() =>
      atproto.createVote({
        rkey,
        subject,
      }),
    );
  } catch (e) {
    await db.deleteVote({ authorDid: user.did, rkey });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new DataLayerError(`Failed to create post vote: ${e}`);
  }
}

export async function deleteVote({ authorDid, rkey }: db.DeleteVoteInput) {
  const user = await ensureUser();
  if (authorDid !== user.did) {
    throw new DataLayerError("You can only delete your own votes");
  }

  try {
    after(() => atproto.deleteVote(authorDid, rkey));
    await db.deleteVote({ authorDid: user.did, rkey });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new DataLayerError(`Failed to delete vote: ${e}`);
  }
}
