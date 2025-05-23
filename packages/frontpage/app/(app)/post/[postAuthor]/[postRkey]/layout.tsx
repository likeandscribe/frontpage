import { getUser } from "@/lib/data/user";
import { notFound } from "next/navigation";
import { PostCard } from "../../../_components/post-card";
import { getPost } from "@/lib/data/db/post";
import { getDidFromHandleOrDid } from "@/lib/data/atproto/identity";
import { Alert, AlertTitle, AlertDescription } from "@/lib/components/ui/alert";
import { Spinner } from "@/lib/components/ui/spinner";
import { NewComment } from "./_lib/comment-client";
import { SuperHackyScrollToTop } from "./scroller";

type Params = {
  postRkey: string;
  postAuthor: string;
};

export default async function PostLayout(props: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const params = await props.params;

  const { children } = props;

  void getUser(); // Prefetch user
  const didParam = await getDidFromHandleOrDid(params.postAuthor);
  if (!didParam) {
    notFound();
  }
  const post = await getPost(didParam, params.postRkey);
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      {/* This is needed to work around some next.js weirdness where sometimes you're not scrolled to the top of the page when navigating to the comments page. */}
      <SuperHackyScrollToTop />
      <PostCard
        author={post.authorDid}
        createdAt={post.createdAt}
        id={post.id}
        commentCount={post.commentCount}
        title={post.title}
        url={post.url}
        votes={post.voteCount}
        rkey={post.rkey}
        cid={post.cid}
        isUpvoted={post.userHasVoted}
      />
      {post.status === "pending" ? (
        // TODO: This should have a spinner and refresh on an interval
        <Alert>
          <AlertTitle className="flex items-center gap-2">
            <Spinner /> Posting...
          </AlertTitle>
          <AlertDescription>
            This post is traversing the atmosphere. Check back in a few seconds
            to see if it has landed and is ready to be discussed.
          </AlertDescription>
        </Alert>
      ) : post.status !== "live" ? (
        <Alert>
          <AlertTitle>This post has been deleted</AlertTitle>
          <AlertDescription>
            Deleted posts cannot receive new comments.
          </AlertDescription>
        </Alert>
      ) : null}
      {post.status === "live" ? (
        <NewComment postRkey={post.rkey} postAuthorDid={post.authorDid} />
      ) : null}
      {children}
    </main>
  );
}
