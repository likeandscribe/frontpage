"use server";

import { getFrontpagePosts } from "@/lib/data/db/post";
import { PostCard } from "./_components/post-card";

export async function getMorePostsAction(cursor: number) {
  const { posts, nextCursor } = await getFrontpagePosts(cursor);

  return {
    postCards: (
      <>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            author={post.authorDid}
            createdAt={post.createdAt}
            id={post.id}
            title={post.title}
            url={post.url}
            votes={post.voteCount == 0 ? 1 : post.voteCount}
            commentCount={post.commentCount}
            cid={post.cid}
            rkey={post.rkey}
            isUpvoted={post.userHasVoted}
          />
        ))}
      </>
    ),
    /**
     * Number of posts in this page.
     */
    postCount: posts.length,
    nextCursor,
  };
}

export type Page = Awaited<ReturnType<typeof getMorePostsAction>>;
