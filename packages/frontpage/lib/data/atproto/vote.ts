import "server-only";
import {
  atprotoCreateRecord,
  atprotoDeleteRecord,
  atprotoGetRecord,
} from "./record";
import { z } from "zod";
import { PostCollection } from "./post";
import { CommentCollection } from "./comment";
import { DID, getPdsUrl } from "./did";
import { createAtUriParser } from "./uri";
import { DataLayerError } from "../error";

export const VoteCollection = "fyi.unravel.frontpage.vote";

const VoteSubjectCollection = z.union([
  z.literal(PostCollection),
  z.literal(CommentCollection),
]);

export const VoteRecord = z.object({
  createdAt: z.string(),
  subject: z.object({
    cid: z.string(),
    uri: createAtUriParser(VoteSubjectCollection),
  }),
});

export type Vote = z.infer<typeof VoteRecord>;

export type VoteInput = {
  rkey: string;
  subject: {
    rkey: string;
    cid: string;
    authorDid: DID;
    collection: typeof PostCollection | typeof CommentCollection;
  };
};

export async function createVote({ rkey, subject }: VoteInput) {
  const uri = `at://${subject.authorDid}/${subject.collection}/${subject.rkey}`;

  const record = {
    createdAt: new Date().toISOString(),
    subject: {
      cid: subject.cid,
      uri,
    },
  };

  const parseResult = VoteRecord.safeParse(record);
  if (!parseResult.success) {
    throw new DataLayerError("Invalid vote record", {
      cause: parseResult.error,
    });
  }

  const response = await atprotoCreateRecord({
    collection: VoteCollection,
    record: record,
    rkey,
  });

  return {
    rkey: response.uri.rkey,
    cid: response.cid,
  };
}

export async function deleteVote(authorDid: DID, rkey: string) {
  await atprotoDeleteRecord({
    authorDid,
    collection: VoteCollection,
    rkey,
  });
}

export async function getVote({ rkey, repo }: { rkey: string; repo: DID }) {
  const service = await getPdsUrl(repo);

  if (!service) {
    throw new DataLayerError("Failed to get service url");
  }

  const { value, cid } = await atprotoGetRecord({
    serviceEndpoint: service,
    repo,
    collection: VoteCollection,
    rkey,
  });

  return { ...VoteRecord.parse(value), cid };
}
