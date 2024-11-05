import "server-only";
import {
  atprotoCreateRecord,
  atprotoDeleteRecord,
  atprotoGetRecord,
} from "./record";
import { z } from "zod";
import { DataLayerError } from "../error";
import { DID, getPdsUrl } from "./did";
import { MAX_POST_TITLE_LENGTH, MAX_POST_URL_LENGTH } from "../db/constants";

export const PostCollection = "fyi.unravel.frontpage.post";

export const PostRecord = z.object({
  title: z.string().max(MAX_POST_TITLE_LENGTH),
  url: z.string().url().max(MAX_POST_URL_LENGTH),
  createdAt: z.string(),
});

export type Post = z.infer<typeof PostRecord>;

type PostInput = {
  title: string;
  url: string;
};

export async function createPost({ title, url }: PostInput) {
  const record = { title, url, createdAt: new Date().toISOString() };
  const parseResult = PostRecord.safeParse(record);
  if (!parseResult.success) {
    throw new DataLayerError("Invalid post record", {
      cause: parseResult.error,
    });
  }

  const result = await atprotoCreateRecord({
    record,
    collection: PostCollection,
  });

  return {
    rkey: result.uri.rkey,
  };
}

export async function deletePost(rkey: string) {
  await atprotoDeleteRecord({
    rkey,
    collection: PostCollection,
  });
}

export async function getPost({ rkey, repo }: { rkey: string; repo: DID }) {
  const service = await getPdsUrl(repo);

  if (!service) {
    throw new DataLayerError("Failed to get service url");
  }

  const { value } = await atprotoGetRecord({
    serviceEndpoint: service,
    repo,
    collection: PostCollection,
    rkey,
  });

  return PostRecord.parse(value);
}
