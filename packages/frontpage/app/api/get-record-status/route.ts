import { badRequest, createApiRoute, unauthorized } from "@/lib/api-route";
import { getDidFromHandleOrDid } from "@/lib/data/atproto/identity";
import { nsids } from "@/lib/data/atproto/repo";
import { AtUri } from "@/lib/data/atproto/uri";
import { getComment } from "@/lib/data/db/comment";
import { getPost } from "@/lib/data/db/post";
import { getUser } from "@/lib/data/user";
import { notFound } from "next/navigation";

export const GET = createApiRoute(async (request) => {
  const user = await getUser();
  if (!user) {
    unauthorized("unauthorized");
  }
  const uri = AtUri.parse(new URL(request.url).searchParams.get("uri"));

  if (!uri) {
    badRequest("missing uri param");
  }

  const did = await getDidFromHandleOrDid(uri.authority);
  if (!did) {
    badRequest("invalid uri authority");
  }

  if (uri.collection === nsids.FyiUnravelFrontpagePost) {
    const post = await getPost(did, uri.rkey);
    if (!post) {
      notFound();
    }

    return {
      status: post.status,
    };
  } else if (uri.collection === nsids.FyiUnravelFrontpageComment) {
    const comment = await getComment(did, uri.rkey);
    if (!comment) {
      notFound();
    }
    return {
      status: comment.status,
    };
  }

  badRequest("invalid uri collection");
});
