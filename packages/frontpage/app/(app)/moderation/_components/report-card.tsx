import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/components/ui/card";
import { DID } from "@/lib/data/atproto/did";
import { Report } from "@/lib/data/db/report";
import { performModerationAction } from "../page";
import { UserHandle } from "./user-handle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CommentCollection } from "@/lib/data/atproto/comment";
import { PostCollection } from "@/lib/data/atproto/post";
import { getPostFromComment } from "@/lib/data/db/post";
import { getCommentLink, getPostLink } from "@/lib/navigation";

const createLink = async (
  collection?: string | null,
  author?: DID | null,
  rkey?: string | null,
) => {
  switch (collection) {
    case PostCollection:
      return getPostLink({ handleOrDid: author!, rkey: rkey! });

    case CommentCollection:
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
