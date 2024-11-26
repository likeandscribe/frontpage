import "server-only";
import { ensureUser } from "../user";
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
  subjectRkey: string;
  subjectCid: string;
  subjectCollection: string;
  subjectAuthorDid: DID;
};

export async function createVote({
  subjectRkey,
  subjectCid,
  subjectCollection,
  subjectAuthorDid,
}: VoteInput) {
  await ensureUser();
  const uri = `at://${subjectAuthorDid}/${subjectCollection}/${subjectRkey}`;

  const record = {
    createdAt: new Date().toISOString(),
    subject: {
      cid: subjectCid,
      uri,
    },
  };

  VoteRecord.parse(record);

  const response = await atprotoCreateRecord({
    collection: VoteCollection,
    record: record,
  });

  const createdRecord = { createdAt: record.createdAt, subject: response };
  const parsedRecord = VoteRecord.parse(createdRecord);
  return parsedRecord;
}

export async function deleteVote(rkey: string) {
  await ensureUser();

  await atprotoDeleteRecord({
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
