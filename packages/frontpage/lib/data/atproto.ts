import { cache } from "react";
import { getUser } from "./user";
import { AtpBaseClient } from "@repo/frontpage-atproto-client";
import { fetchAuthenticatedAtproto } from "../auth";
export { ids as NSIDS } from "@repo/frontpage-atproto-client/lexicons";

export const xrpcClient = cache(async (service?: string) => {
  const user = await getUser();

  const atpService = user ? user.pdsUrl : service;
  if (!atpService) {
    throw new Error("No service provided");
  }

  return new AtpBaseClient({
    fetch: user ? fetchAuthenticatedAtproto : undefined,
    service: atpService,
  });
});
