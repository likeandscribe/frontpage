import { headers } from "next/headers";
import { type DID } from "../atproto/did";
import { getPostFromComment } from "./post";
import { nsids } from "../atproto/repo";

export const getRootHost = async () => {
  let host: string | null | undefined =
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (process.env.NODE_ENV === "development") {
    host = (await headers()).get("host");
  } else if (process.env.VERCEL_ENV === "preview") {
    const hostHeader = (await headers()).get("host");

    if (hostHeader === process.env.VERCEL_URL) {
      host = process.env.VERCEL_URL;
    } else if (hostHeader === process.env.VERCEL_BRANCH_URL) {
      host = process.env.VERCEL_BRANCH_URL;
    } else {
      throw new Error("Invalid host header");
    }
  }

  if (!host) {
    throw new Error("Host is not defined");
  }

  return host;
};

export const createFrontPageLink = async (
  author: DID,
  collection?: string,
  rkey?: string,
) => {
  switch (collection) {
    case nsids.FyiUnravelFrontpagePost:
      return `/post/${author}/${rkey}/`;

    case nsids.FyiUnravelFrontpageComment: {
      const { postAuthor, postRkey } = (await getPostFromComment({
        rkey: rkey!,
        did: author,
      }))!;
      return `/post/${postAuthor}/${postRkey}/${author}/${rkey}/`;
    }

    default:
      return `/profile/${author}/`;
  }
};
