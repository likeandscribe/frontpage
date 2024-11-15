import Link from "next/link";
import { createVote, deleteVote } from "@/lib/data/atproto/vote";
import { getVoteForPost } from "@/lib/data/db/vote";
import { ensureUser, getUser } from "@/lib/data/user";
import { TimeAgo } from "@/lib/components/time-ago";
import { VoteButton } from "./vote-button";
import { PostCollection, deletePost } from "@/lib/data/atproto/post";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import { UserHoverCard } from "@/lib/components/user-hover-card";
import type { DID } from "@/lib/data/atproto/did";
import { parseReportForm } from "@/lib/data/db/report-shared";
import { createReport } from "@/lib/data/db/report";
import { EllipsisDropdown } from "./ellipsis-dropdown";
import { revalidatePath } from "next/cache";
import { ReportDialogDropdownButton } from "./report-dialog";
import { DeleteButton } from "./delete-button";
import { ShareDropdownButton } from "./share-button";

type PostProps = {
  id: number;
  title: string;
  url: string;
  votes: number;
  author: DID;
  createdAt: Date;
  commentCount: number;
  rkey: string;
  cid: string;
  isUpvoted: boolean;
};

export async function PostCard({
  id,
  title,
  url,
  votes,
  author,
  createdAt,
  commentCount,
  rkey,
  cid,
  isUpvoted,
}: PostProps) {
  const [handle, user] = await Promise.all([
    getVerifiedHandle(author),
    getUser(),
  ]);
  const postHref = `/post/${handle}/${rkey}`;

  return (
    // TODO: Make article route to postHref via onClick on card except innser links or buttons
    <article className="w-full py-2 px-2 bg-white dark:bg-slate-900 space-y-2 border-b-2 border-b-accent">
      <div className="flex justify-between items-center">
        <div className="flex items-center px-3 space-x-1.5">
          <UserHoverCard did={author} asChild>
            <Link
              href={`/profile/${handle}`}
              className="text-xs hover:underline max-w-[185px] md:max-w-none truncate inline-block"
            >
              by {handle}
            </Link>
          </UserHoverCard>
          <span aria-hidden>•</span>
          <TimeAgo createdAt={createdAt} side="bottom" className="text-xs" />
        </div>

        {user ? (
          <EllipsisDropdown>
            <ShareDropdownButton path={postHref} />
            <ReportDialogDropdownButton
              reportAction={reportPostAction.bind(null, {
                rkey,
                cid,
                author,
              })}
            />
            {user?.did === author ? (
              <DeleteButton deleteAction={deletePostAction.bind(null, rkey)} />
            ) : null}
          </EllipsisDropdown>
        ) : null}
      </div>

      <div className="px-3">
        <h2 className="mb-1 text-xl">
          <a
            href={url}
            className="hover:underline flex flex-wrap items-center gap-x-2"
          >
            {title}
            <span className="text-gray-500 dark:text-gray-400 font-normal text-sm md:text-base">
              ({new URL(url).host})
            </span>
          </a>
        </h2>
      </div>

      <div className="pr-2 flex items-center gap-6">
        <VoteButton
          voteAction={async () => {
            "use server";
            await ensureUser();
            await createVote({
              subjectAuthorDid: author,
              subjectCid: cid,
              subjectRkey: rkey,
              subjectCollection: PostCollection,
            });
          }}
          unvoteAction={async () => {
            "use server";
            await ensureUser();
            const vote = await getVoteForPost(id);
            if (!vote) {
              // TODO: Show error notification
              console.error("Vote not found for post", id);
              return;
            }
            await deleteVote(vote.rkey);
          }}
          initialState={
            (await getUser())?.did === author
              ? "authored"
              : isUpvoted
                ? "voted"
                : "unvoted"
          }
          votes={votes}
        />
        <Link
          href={postHref}
          className="hover:underline flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
          {commentCount}
        </Link>
      </div>
    </article>
  );
}

export async function deletePostAction(rkey: string) {
  "use server";
  await ensureUser();
  await deletePost(rkey);

  revalidatePath("/");
}

export async function reportPostAction(
  input: {
    rkey: string;
    cid: string;
    author: DID;
  },
  formData: FormData,
) {
  "use server";
  await ensureUser();

  const formResult = parseReportForm(formData);
  if (!formResult.success) {
    throw new Error("Invalid form data");
  }

  await createReport({
    ...formResult.data,
    subjectUri: `at://${input.author}/${PostCollection}/${input.rkey}`,
    subjectDid: input.author,
    subjectCollection: PostCollection,
    subjectRkey: input.rkey,
    subjectCid: input.cid,
  });
}
