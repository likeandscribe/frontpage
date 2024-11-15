import type { DID } from "@/lib/data/atproto/did";
import { getUserPosts } from "@/lib/data/db/post";
import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { PostCard } from "../../_components/post-card";
import { UserAvatar } from "@/lib/components/user-avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/lib/components/ui/tabs";
import { getBlueskyProfile } from "@/lib/data/user";
import { getUserComments } from "@/lib/data/db/comment";
import { Comment } from "../../post/[postAuthor]/[postRkey]/_lib/comment";
import { Suspense } from "react";
import {
  getDidFromHandleOrDid,
  getVerifiedHandle,
} from "@/lib/data/atproto/identity";
import { EllipsisDropdown } from "../../_components/ellipsis-dropdown";
import { ReportDialogDropdownButton } from "../../_components/report-dialog";
import { reportUserAction } from "@/lib/components/user-hover-card";
import { Metadata } from "next";
import { LinkAlternateAtUri } from "@/lib/components/link-alternate-at";

type Params = {
  user: string;
};

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const did = await getDidFromHandleOrDid(params.user);
  if (!did) {
    notFound();
  }
  const [handle, profile] = await Promise.all([
    getVerifiedHandle(did),
    getBlueskyProfile(did),
  ]);
  const description = `@${handle}'s profile on Frontpage`;
  return {
    title: `@${handle} on Frontpage`,
    description: description,
    openGraph: {
      title: `@${handle}`,
      description: description,
      type: "profile",
      images: profile?.avatar,
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function Profile(props: { params: Promise<Params> }) {
  const params = await props.params;
  unstable_noStore();
  const did = await getDidFromHandleOrDid(params.user);
  if (!did) {
    notFound();
  }

  const [userPosts, userComments, userHandle] = await Promise.all([
    getUserPosts(did),
    getUserComments(did),
    getVerifiedHandle(did),
  ]);

  const overview = [
    ...userPosts.map((p) => ({ ...p, type: "post" as const })),
    ...userComments.map((p) => ({ ...p, type: "comment" as const })),
  ].sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="pt-4">
      <LinkAlternateAtUri authority={did} />
      <div className="px-4 lg:px-0 flex items-center space-x-4 mb-4">
        <UserAvatar did={did} size="medium" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="md:text-2xl font-bold max-w-[185px] md:max-w-none truncate inline-block">
            {userHandle ?? "Invalid handle"}
          </h1>
          <EllipsisDropdown>
            <ReportDialogDropdownButton
              reportAction={reportUserAction.bind(null, { did })}
            />
          </EllipsisDropdown>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <div className="px-4 pb-0.5 w-full lg:px-0">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">
              Posts
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Comments
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <div className="flex flex-col divide-y divide-accent">
            {overview.map((entity) => {
              if (entity.type === "post") {
                return (
                  <PostCard
                    key={entity.id}
                    author={entity.authorDid}
                    createdAt={entity.createdAt}
                    id={entity.id}
                    title={entity.title}
                    url={entity.url}
                    votes={entity.voteCount}
                    commentCount={entity.commentCount}
                    cid={entity.cid}
                    rkey={entity.rkey}
                    isUpvoted={entity.userHasVoted}
                  />
                );
              }
              if (entity.type === "comment") {
                return (
                  <div key={entity.id} className="pt-4 pb-0.5 px-4">
                    <Comment
                      comment={entity}
                      postAuthorParam={entity.postAuthorDid as DID}
                      postRkey={entity.postRkey as string}
                      allowReply={false}
                    />
                  </div>
                );
              }
            })}
          </div>
        </TabsContent>
        <TabsContent value="posts">
          <Suspense>
            <div className="flex flex-col divide-y divide-accent">
              {userPosts.map((post) => {
                return (
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
                );
              })}
            </div>
          </Suspense>
        </TabsContent>
        <TabsContent value="comments">
          <Suspense>
            <div className="flex flex-col gap-4 px-4">
              {userComments.map((comment) => {
                return (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postAuthorParam={comment.postAuthorDid as DID}
                    postRkey={comment.postRkey as string}
                    allowReply={false}
                  />
                );
              })}
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
