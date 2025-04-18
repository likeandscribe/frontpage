import { getUser } from "@/lib/data/user";
import { notFound } from "next/navigation";
import { PostCard } from "../../../_components/post-card";
import { getPost } from "@/lib/data/db/post";
import { getDidFromHandleOrDid } from "@/lib/data/atproto/identity";
import { Alert, AlertTitle, AlertDescription } from "@/lib/components/ui/alert";
import { Spinner } from "@/lib/components/ui/spinner";

type Params = {
  postRkey: string;
  postAuthor: string;
};

export default async function Post(props: {
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
      {children}
    </main>
  );
}
