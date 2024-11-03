"use client";

import { Button } from "@/lib/components/ui/button";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useTransition } from "react";

import { useMarkAsReadMutation } from "./read-state";
import { markAllNotificationsReadAction } from "./actions";
import { revalidateInfiniteListPage } from "@/lib/infinite-list";
import { NOTIFICATIONS_CACHE_KEY } from "./constants";

export function MarkAsReadButton({
  notificationId,
}: {
  notificationId: number;
}) {
  const markAsRead = useMarkAsReadMutation(notificationId);
  const [isPending, startTransition] = useTransition();
  return (
    <form action={() => startTransition(markAsRead)} aria-busy={isPending}>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={(e) => e.stopPropagation()}
      >
        <CheckCircledIcon className="h-4 w-4" />
        <span className="sr-only">Mark as read</span>
      </Button>
    </form>
  );
}

export function MarkAllAsReadButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="contents"
      aria-busy={isPending}
      action={() =>
        startTransition(async () => {
          await markAllNotificationsReadAction();
          // Revalidating the first page should revalidate the entire list as we're passing revalidateAll to the InfiniteList component
          await revalidateInfiniteListPage(NOTIFICATIONS_CACHE_KEY, null);
        })
      }
    >
      <Button variant="outline" size="sm" disabled={isPending}>
        <CheckCircledIcon className="mr-2" />
        Mark all as read
      </Button>
    </form>
  );
}
