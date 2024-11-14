import { NewComment } from "./_lib/comment-client";
import { Comment } from "./_lib/comment";
import { getCommentsForPost } from "@/lib/data/db/comment";
import { Metadata } from "next";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { PostPageParams, getPostPageData } from "./_lib/page-data";
import { LinkAlternateAtUri } from "@/lib/components/link-alternate-at";
import { PostCollection } from "@/lib/data/atproto/post";

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
  const comments = await getCommentsForPost(post.id);

  return (
    <div className="pt-2 px-4">
      <LinkAlternateAtUri
        authority={authorDid}
        collection={PostCollection}
        rkey={post.rkey}
      />
      {post.status === "live" ? (
        <NewComment postRkey={post.rkey} postAuthorDid={authorDid} />
      ) : null}
      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            level={0}
            postAuthorParam={params.postAuthor}
            postRkey={post.rkey}
            allowReply={post.status === "live"}
          />
        ))}
      </div>
    </div>
  );
}
