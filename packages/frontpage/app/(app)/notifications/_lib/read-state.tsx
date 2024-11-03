"use client";
import { InfiniteListContext } from "@/lib/infinite-list";
import { useContext } from "react";
import { mutate } from "swr";
import { NotificationCountKey } from "../../_components/notification-indicator-shared";

export function useMarkAsReadMutation(id: number) {
  const { revalidatePage } = useContext(InfiniteListContext);

  return async () => {
    await fetch(`/api/notification-read?id=${id}`, {
      method: "POST",
    });
    await Promise.all([revalidatePage(), mutate(NotificationCountKey)]);
  };
}
