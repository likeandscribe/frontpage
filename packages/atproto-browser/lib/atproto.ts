import { cache } from "react";
import { z } from "zod";

import { FETCH_LIMIT } from "@/app/consts";
import { AtpBaseClient } from "@atproto/api";

const ListRecordsResponse = z.object({
  records: z.array(
    z.object({
      uri: z.string(),
      cid: z.string(),
    }),
  ),
  cursor: z.string().optional(),
});

export const listRecords = cache(
  async (pds: string, repo: string, collection: string, cursor?: string) => {
    const client = new AtpBaseClient(pds);
    const response = await client.com.atproto.repo.listRecords({
      limit: Number(FETCH_LIMIT),
      repo,
      collection,
      cursor,
    });
    if (!response.success) {
      throw new Error(`Failed to list records.`);
    }

    return ListRecordsResponse.parse(JSON.parse(JSON.stringify(response.data)));
  },
);

const DESCRIBE_REPO_KNOWN_ERRORS = ["RepoTakenDown", "RepoNotFound"] as const;

export const describeRepo = cache(async (pds: string, repo: string) => {
  const describeRepoUrl = new URL(`${pds}/xrpc/com.atproto.repo.describeRepo`);
  describeRepoUrl.searchParams.set("repo", repo);
  const res = await fetch(describeRepoUrl.toString());
  if (!res.ok && res.status !== 400) {
    throw new Error(`Failed to describe repo: ${res.statusText}`);
  }
  const body = await res.json();

  if (res.status >= 500) {
    throw new Error(`Failed to describe repo: ${res.statusText}`);
  }

  if (!res.ok) {
    const parsed = DescribeRespoFailure.parse(body);
    const knownError =
      DESCRIBE_REPO_KNOWN_ERRORS.find((e) => e === parsed.error) ?? null;

    return {
      success: false as const,
      knownError,
      ...parsed,
    };
  }

  return {
    success: true as const,
    ...DescribeRepoSuccess.parse(body),
  };
});

const DescribeRepoSuccess = z.object({
  collections: z.array(z.string()),
});

const DescribeRespoFailure = z.object({
  error: z.string(),
  message: z.string().optional(),
});
