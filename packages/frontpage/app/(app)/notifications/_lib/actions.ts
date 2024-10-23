"use server";

import { markAllNotificationsRead } from "@/lib/data/db/notification";
import { revalidatePath } from "next/cache";

export async function markAllAsReadAction() {
  await markAllNotificationsRead();
  // Revalidating the layout to refresh the notification count
  revalidatePath("/notifications", "layout");
}
