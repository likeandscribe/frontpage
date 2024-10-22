import "server-only";
import {
  atprotoCreateRecord,
  atprotoDeleteRecord,
  atprotoGetRecord,
} from "./record";
import { z } from "zod";
import { DataLayerError } from "../error";
import { DID, getPdsUrl } from "./did";
import { XrpcClient } from "@atproto/xrpc";

export const PostCollection = "fyi.unravel.frontpage.post";

export const PostRecord = z.object({
  title: z.string(),
  url: z.string(),
  createdAt: z.string(),
});

export type Post = z.infer<typeof PostRecord>;

type PostInput = {
  title: string;
  url: string;
};

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
