"use client";

import { Button } from "@/lib/components/ui/button";
import { markAllAsReadAction } from "./actions";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useContext, useTransition } from "react";
import { InfiniteListContext } from "@/lib/infinite-list";

export function MarkAsReadButton({
  notificationId,
}: {
  notificationId: number;
}) {
  const { revalidatePage } = useContext(InfiniteListContext);
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={() =>
        startTransition(async () => {
          await fetch(`/api/notification-read?id=${notificationId}`, {
            method: "POST",
          }).then((res) => res.arrayBuffer());
          await revalidatePage();
        })
      }
    >
      <Button variant="ghost" size="icon" disabled={isPending}>
        <CheckCircledIcon className="h-4 w-4" />
        <span className="sr-only">Mark as read</span>
      </Button>
    </form>
  );
}

export function MarkAllAsReadButton() {
  return (
    <form
      action={async () => {
        await markAllAsReadAction();
      }}
    >
      <Button variant="outline" size="sm">
        <CheckCircledIcon className="mr-2" />
        Mark all as read
      </Button>
    </form>
  );
}
