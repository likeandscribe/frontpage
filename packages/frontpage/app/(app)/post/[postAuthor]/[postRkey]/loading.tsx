import { Skeleton } from "@/lib/components/ui/skeleton";
import clsx from "clsx";

export default function CommentsLoading() {
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
