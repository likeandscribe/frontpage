"use client";

import { Button } from "@/lib/components/ui/button";
import { markAsRead } from "./actions";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { InfiniteListContext } from "@/lib/infinite-list";

export function MarkAsReadButton({
  notificationId,
}: {
  notificationId: number;
}) {
  const { revalidatePage } = useContext(InfiniteListContext);
  return (
    <form
      action={async () => {
        await markAsRead(notificationId);
        revalidatePage();
      }}
    >
      <Button variant="ghost" size="icon">
        <CheckCircledIcon className="h-4 w-4" />
        <span className="sr-only">Mark as read</span>
      </Button>
    </form>
  );
}
