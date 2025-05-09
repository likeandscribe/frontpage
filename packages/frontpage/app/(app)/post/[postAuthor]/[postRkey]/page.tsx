import { NewComment } from "./_lib/comment-client";
import { Comment } from "./_lib/comment";
import { getCommentsForPost } from "@/lib/data/db/comment";
import { type Metadata } from "next";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { type PostPageParams, getPostPageData } from "./_lib/page-data";
import { LinkAlternateAtUri } from "@/lib/components/link-alternate-at";
import { nsids } from "@/lib/data/atproto/repo";
import { Suspense } from "react";
import { Skeleton } from "@/lib/components/ui/skeleton";
import clsx from "clsx";

export async function generateMetadata(props: {
  params: Promise<PostPageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { post } = await getPostPageData(params);

  const handle = await getVerifiedHandle(post.authorDid);
  const path = `/post/${params.postAuthor}/${params.postRkey}`;

  return {
    title: post.title,
    description: "Discuss this post on Frontpage.",
    alternates: {
      canonical: `https://frontpage.fyi${path}`,
    },
    openGraph: {
      title: post.title,
      description: "Discuss this post on Frontpage.",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [`@${handle}`],
      url: `https://frontpage.fyi${path}`,
      images: [
        {
          url: `${path}/og-image`,
        },
      ],
    },
  };
}

export default async function Post(props: { params: Promise<PostPageParams> }) {
  const params = await props.params;
  const { post, authorDid } = await getPostPageData(params);

  return (
    <>
      <LinkAlternateAtUri
        authority={authorDid}
        collection={nsids.FyiUnravelFrontpagePost}
        rkey={post.rkey}
      />
      {post.status === "live" ? (
        <NewComment postRkey={post.rkey} postAuthorDid={authorDid} />
      ) : null}
      <Suspense fallback={<CommentTreeFallback />}>
        <div className="flex flex-col gap-6">
          {getCommentsForPost(post.id).then((comments) =>
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                level={0}
                postAuthorParam={params.postAuthor}
                postRkey={post.rkey}
                allowReply={post.status === "live"}
              />
            )),
          )}
        </div>
      </Suspense>
    </>
  );
}

function CommentTreeFallback() {
  return (
    <div className="flex flex-col gap-6">
      <CommentSkeleton />
      <CommentSkeleton className="pl-8" />
      <CommentSkeleton />
    </div>
  );
}

function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex items-center gap-4 mt-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}
