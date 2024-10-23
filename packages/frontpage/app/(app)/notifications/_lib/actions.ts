"use server";

import { markNotificationRead } from "@/lib/data/db/notification";

export async function markAsRead(id: number) {
  await markNotificationRead(id);
}
