import { Comment } from "../../_lib/comment";
import Link from "next/link";
import { type Metadata } from "next";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { type CommentPageParams, getCommentPageData } from "./_lib/page-data";
import { LinkAlternateAtUri } from "@/lib/components/link-alternate-at";
import { nsids } from "@/lib/data/atproto/repo";

function truncateText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export async function generateMetadata(props: {
  params: Promise<CommentPageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const { comment, post } = await getCommentPageData(params);

  const handle = await getVerifiedHandle(comment.authorDid);
  const path = `/post/${params.postAuthor}/${params.postRkey}/${params.commentAuthor}/${params.commentRkey}`;

  return {
    title:
      comment.status === "live"
        ? `@${handle}'s comment on "${truncateText(post.title, 15)}"`
        : "Deleted comment",
    description:
      comment.status === "live" ? truncateText(comment.body, 47) : null,
    alternates: {
      canonical: `https://frontpage.fyi${path}`,
    },
    openGraph:
      comment.status === "live"
        ? {
            title: `@${handle}'s comment on Frontpage`,
            description: truncateText(comment.body, 47),
            type: "article",
            publishedTime: comment.createdAt.toISOString(),
            authors: [`@${handle}`],
            url: `https://frontpage.fyi${path}`,
            images: [
              {
                url: `${path}/og-image`,
              },
            ],
          }
        : undefined,
  };
}

export default async function CommentPage(props: {
  params: Promise<CommentPageParams>;
}) {
  const params = await props.params;
  const { comment, post } = await getCommentPageData(params);

  return (
    <>
      <LinkAlternateAtUri
        authority={comment.authorDid}
        collection={nsids.FyiUnravelFrontpageComment}
        rkey={comment.rkey}
      />
      <div className="flex justify-end">
        <Link
          href={`/post/${params.postAuthor}/${params.postRkey}`}
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          See all comments
        </Link>
      </div>
      <Comment
        comment={comment}
        postAuthorParam={params.postAuthor}
        postRkey={post.rkey}
        allowReply={post.status === "live"}
      />
    </>
  );
}
