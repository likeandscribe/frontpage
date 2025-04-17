import "server-only";
import {
  atprotoCreateRecord,
  atprotoDeleteRecord,
  atprotoGetRecord,
} from "./record";
import { createAtUriParser } from "./uri";
import { DataLayerError } from "../error";
import { z } from "zod";
import { type DID, getPdsUrl } from "./did";
import { MAX_COMMENT_LENGTH } from "../db/constants";
import { nsids } from "./repo";

export const CommentCollection = "fyi.unravel.frontpage.comment";

export const CommentRecord = z.object({
  content: z.string().max(MAX_COMMENT_LENGTH),
  parent: z
    .object({
      cid: z.string(),
      uri: createAtUriParser(z.literal(CommentCollection)),
    })
    .optional(),
  post: z.object({
    cid: z.string(),
    uri: createAtUriParser(z.literal(nsids.FyiUnravelFrontpagePost)),
  }),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof CommentRecord>;

export type CommentInput = {
  parent?: { cid: string; rkey: string; authorDid: DID };
  post: { cid: string; rkey: string; authorDid: DID };
  content: string;
  rkey: string;
};

export async function createComment({
  parent,
  post,
  content,
  rkey,
}: CommentInput) {
  // Collapse newlines into a single \n\n and trim whitespace
  const record = {
    content,
    parent: parent
      ? {
          cid: parent.cid,
          uri: `at://${parent.authorDid}/${CommentCollection}/${parent.rkey}`,
        }
      : undefined,
    post: {
      cid: post.cid,
      uri: `at://${post.authorDid}/${nsids.FyiUnravelFrontpagePost}/${post.rkey}`,
    },
    createdAt: new Date().toISOString(),
  };

  const parseResult = CommentRecord.safeParse(record);
  if (!parseResult.success) {
    throw new DataLayerError("Invalid comment record", {
      cause: parseResult.error,
    });
  }

  const result = await atprotoCreateRecord({
    record,
    collection: CommentCollection,
    rkey,
  });

  return {
    rkey: result.uri.rkey,
    cid: result.cid,
  };
}

export async function deleteComment(authorDid: DID, rkey: string) {
  await atprotoDeleteRecord({
    authorDid,
    rkey,
    collection: CommentCollection,
  });
}

export async function getComment({ rkey, repo }: { rkey: string; repo: DID }) {
  const service = await getPdsUrl(repo);

  if (!service) {
    throw new DataLayerError("Failed to get service url");
  }

  const { value, cid } = await atprotoGetRecord({
    serviceEndpoint: service,
    repo,
    collection: CommentCollection,
    rkey,
  });

  return { value: CommentRecord.parse(value), cid };
}
