import "server-only";
import { z } from "zod";
import { ensureUser } from "../user";
import { DataLayerError } from "../error";
import { fetchAuthenticatedAtproto } from "@/lib/auth";
import { AtUri } from "./uri";
import { type DID } from "./did";

const CreateRecordResponse = z.object({
  uri: AtUri,
  cid: z.string(),
});

type CreateRecordInput = {
  record: unknown;
  collection: string;
  rkey: string;
};

export async function atprotoCreateRecord({
  record,
  collection,
  rkey,
}: CreateRecordInput) {
  const user = await ensureUser();
  const pdsUrl = new URL(user.pdsUrl);
  pdsUrl.pathname = "/xrpc/com.atproto.repo.createRecord";

  const response = await fetchAuthenticatedAtproto(pdsUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo: user.did,
      collection,
      rkey,
      validate: false,
      record: record,
    }),
    signal: AbortSignal.timeout(2500),
  });

  if (!response.ok) {
    throw new DataLayerError(`Failed to create record ${response.status}`, {
      cause: response,
    });
  }

  return CreateRecordResponse.parse(await response.json());
}

type DeleteRecordInput = {
  authorDid: DID;
  collection: string;
  rkey: string;
};

export async function atprotoDeleteRecord({
  authorDid,
  collection,
  rkey,
}: DeleteRecordInput) {
  const user = await ensureUser();

  if (user.did !== authorDid) {
    throw new DataLayerError("User does not own record");
  }

  const pdsUrl = new URL(user.pdsUrl);
  pdsUrl.pathname = "/xrpc/com.atproto.repo.deleteRecord";

  const response = await fetchAuthenticatedAtproto(pdsUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo: user.did,
      collection,
      rkey,
    }),
    signal: AbortSignal.timeout(2500),
  });

  if (!response.ok) {
    throw new DataLayerError("Failed to delete record", { cause: response });
  }
}

const AtProtoRecord = z.object({
  value: z.custom<unknown>(
    (value) => typeof value === "object" && value != null,
  ),
  cid: z.string(),
});

type GetRecordInput = {
  serviceEndpoint: string;
  repo: string;
  collection: string;
  rkey: string;
};

export async function atprotoGetRecord({
  serviceEndpoint,
  repo,
  collection,
  rkey,
}: GetRecordInput) {
  const url = new URL(`${serviceEndpoint}/xrpc/com.atproto.repo.getRecord`);
  url.searchParams.append("repo", repo);
  url.searchParams.append("collection", collection);
  url.searchParams.append("rkey", rkey);

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok)
    throw new Error("Failed to fetch record", { cause: response });

  const json = await response.json();

  return AtProtoRecord.parse(json);
}
