import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/components/ui/card";
import { type DID } from "@/lib/data/atproto/did";
import { getReport, updateReport, type Report } from "@/lib/data/db/report";
import { UserHandle } from "./user-handle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPostFromComment, moderatePost } from "@/lib/data/db/post";
import { getCommentLink, getPostLink } from "@/lib/navigation";
import { nsids } from "@/lib/data/atproto/repo";
import { ensureUser } from "@/lib/data/user";
import {
  createModerationEvent,
  type ModerationEventDTO,
} from "@/lib/data/db/moderation";
import { moderateComment } from "@/lib/data/db/comment";
import { moderateUser } from "@/lib/data/db/user";
import { revalidatePath } from "next/cache";

async function performModerationAction(
  input: { reportId: number; status: "accepted" | "rejected" },
  _: FormData,
) {
  "use server";
  const user = await ensureUser();
  const report = await getReport(input.reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  const newModEvent: ModerationEventDTO = {
    subjectUri: report.subjectUri,
    subjectDid: report.subjectDid as DID,
    createdBy: user.did as DID,
    createdAt: new Date(),
    labelsAdded: report.reportReason,
    creatorReportReason: report.creatorComment,
  };

  if (report.subjectCollection) {
    if (report.subjectCollection === nsids.FyiUnravelFrontpagePost) {
      newModEvent.subjectCollection = nsids.FyiUnravelFrontpagePost;
    } else if (report.subjectCollection === nsids.FyiUnravelFrontpageComment) {
      newModEvent.subjectCollection = nsids.FyiUnravelFrontpageComment;
    }

    newModEvent.subjectRkey = report.subjectRkey;
    newModEvent.subjectCid = report.subjectCid;
  }

  const modAction = async () => {
    switch (report.subjectCollection) {
      case nsids.FyiUnravelFrontpagePost:
        return await moderatePost({
          rkey: report.subjectRkey!,
          authorDid: report.subjectDid as DID,
          cid: report.subjectCid!,
          hide: input.status === "accepted",
        });

      case nsids.FyiUnravelFrontpageComment:
        return await moderateComment({
          rkey: report.subjectRkey!,
          authorDid: report.subjectDid as DID,
          cid: report.subjectCid!,
          hide: input.status === "accepted",
        });

      default:
        return await moderateUser({
          userDid: report.subjectDid as DID,
          hide: input.status === "accepted",
          label: report.reportReason,
        });
    }
  };

  await Promise.all([
    createModerationEvent(newModEvent),
    updateReport(report.id, input.status, user.did),
    modAction(),
  ]);

  revalidatePath("/moderation");
  return;
}

const createLink = async (
  collection?: string | null,
  author?: DID | null,
  rkey?: string | null,
) => {
  switch (collection) {
    case nsids.FyiUnravelFrontpagePost:
      return getPostLink({ handleOrDid: author!, rkey: rkey! });

    case nsids.FyiUnravelFrontpageComment: {
      const { postAuthor, postRkey } = (await getPostFromComment({
        rkey: rkey!,
        did: author!,
      }))!;
      return getCommentLink({
        post: {
          handleOrDid: postAuthor,
          rkey: postRkey,
        },
        handleOrDid: author!,
        rkey: rkey!,
      });
    }

    default:
      return `/profile/${author}/`;
  }
};

export async function ReportCard({ report }: { report: Report }) {
  return (
    <Card className="mb-2 flex flex-col">
      <CardHeader>
        <CardTitle className="text-blue-400">
          {report.subjectCollection ?? "Reported User"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`px-2 py-1 mb-2 rounded-full text-xs inline-flex
              ${cn({
                "bg-yellow-500 text-destructive-foreground":
                  report.status === "pending",
                "bg-success text-success-foreground":
                  report.status === "accepted",
                "bg-destructive text-destructive-foreground":
                  report.status === "rejected",
              })}`}
        >
          {report.status}
        </p>
        <div className="flex flex-col mb-4 gap-1 flex-wrap">
          <p>
            <strong>Reported User: </strong>
            <UserHandle key={report.id} userDid={report.subjectDid as DID} />
          </p>
          <p>
            <strong className="mr-2">Reason:</strong>
            {report.reportReason}
          </p>
          <p>
            <strong className="mr-2">Reported By:</strong>
            <UserHandle userDid={report.createdBy as DID} />
          </p>
          <p>
            <strong className="mr-2">Comment:</strong>
            {report.creatorComment}
          </p>
        </div>
        {report.actionedAt ? (
          <div className="mb-2 flex flex-row gap-5">
            <p>
              <strong className="mr-2">Actioned at:</strong>
              <span className="italic">
                {report.actionedAt.toLocaleString()}
              </span>
            </p>
            <p>
              <strong className="mr-2">Actioned By:</strong>

              <UserHandle userDid={report.actionedBy as DID} />
            </p>
          </div>
        ) : null}
        <div className="flex">
          <form className="space-x-2">
            <Button
              variant="success"
              type="submit"
              formAction={performModerationAction.bind(null, {
                reportId: report.id,
                status: "accepted",
              })}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              type="submit"
              formAction={performModerationAction.bind(null, {
                reportId: report.id,
                status: "rejected",
              })}
            >
              Reject
            </Button>
          </form>
          <Link
            className="ml-2"
            href={await createLink(
              report.subjectCollection,
              report.subjectDid as DID,
              report.subjectRkey,
            )}
            target="_blank"
          >
            <Button variant="outline" type="button">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
