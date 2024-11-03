import { unstable_noStore } from "next/cache";
import { InfiniteList } from "@/lib/infinite-list";
import { getFrontpagePosts } from "@/lib/data/db/post";
import { PostCard } from "./_components/post-card";

export default async function Home() {
  unstable_noStore();

  // Calling an action directly is not recommended in the doc but here we do it as a DRY shortcut.
  const initialData = await getMorePostsAction(0);

  return (
    <InfiniteList
      cacheKey="posts"
      getMoreItemsAction={getMorePostsAction}
      emptyMessage="No posts remaining"
      fallback={initialData}
    />
  );
}

async function getMorePostsAction(cursor: number | null) {
  "use server";
  const { posts, nextCursor } = await getFrontpagePosts(cursor ?? 0);

  return {
    content: (
      <>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            author={post.authorDid}
            createdAt={post.createdAt}
            id={post.id}
            title={post.title}
            url={post.url}
            votes={post.voteCount}
            commentCount={post.commentCount}
            cid={post.cid}
            rkey={post.rkey}
            isUpvoted={post.userHasVoted}
          />
        ))}
      </>
    ),
    pageSize: posts.length,
    nextCursor,
  };
}
