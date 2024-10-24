import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import {
  and,
  eq,
  lt,
  desc,
  isNull,
  count,
  ExtractTablesWithRelations,
} from "drizzle-orm";
import { invariant } from "@/lib/utils";
import { ensureUser } from "../user";
import { DID } from "../atproto/did";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";

declare const tag: unique symbol;
export type Cursor = { readonly [tag]: "Cursor" };

function cursorToDate(cursor: Cursor): Date {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Date(cursor as any);
}

function createCursor(date: Date): Cursor {
  return date.toISOString() as unknown as Cursor;
}

export type Notification = Awaited<
  ReturnType<typeof getNotifications>
>["notifications"][number];

export const getNotifications = cache(
  async (limit: number, cursor: Cursor | null) => {
    const user = await ensureUser();

    const joins = await db
      .select()
      .from(schema.Notification)
      .where(
        and(
          eq(schema.Notification.did, user.did),
          cursor
            ? lt(schema.Notification.createdAt, cursorToDate(cursor))
            : undefined,
        ),
      )
      .leftJoin(
        schema.Comment,
        eq(schema.Comment.id, schema.Notification.commentId),
      )
      .leftJoin(schema.Post, eq(schema.Post.id, schema.Comment.postId))
      .groupBy(schema.Notification.id)
      .orderBy(desc(schema.Notification.id))
      .limit(limit);

    const newCursor =
      joins.length > 0
        ? createCursor(joins.at(-1)!.notifications.createdAt)
        : null;

    return {
      cursor: newCursor,
      notifications: joins.map((notification) => {
        const post = notification.posts;
        const comment = notification.comments;
        invariant(post, "Post should exist if it's in the notification");
        invariant(comment, "Comment should exist if it's in the notification");
        return {
          type: notification.notifications.reason,
          createdAt: notification.notifications.createdAt,
          read: !!notification.notifications.readAt,
          id: notification.notifications.id,
          post,
          comment,
        };
      }),
    };
  },
);

export const getNotificationCount = cache(async () => {
  const user = await ensureUser();
  const [row] = await db
    .select({
      count: count(),
    })
    .from(schema.Notification)
    .where(
      and(
        eq(schema.Notification.did, user.did),
        isNull(schema.Notification.readAt),
      ),
    );

  invariant(row, "Row should exist");
  return row.count;
});

export async function markNotificationRead(notificationId: number) {
  await ensureUser();
  await db
    .update(schema.Notification)
    .set({
      readAt: new Date(),
    })
    .where(eq(schema.Notification.id, notificationId));
}

export async function markAllNotificationsRead() {
  const user = await ensureUser();
  await db
    .update(schema.Notification)
    .set({
      readAt: new Date(),
    })
    .where(
      and(
        isNull(schema.Notification.readAt),
        eq(schema.Notification.did, user.did),
      ),
    );
}

type CreateNotificationInput = {
  did: DID;
  reason: "postComment" | "commentReply";
  commentId: number;
};

export async function unauthed_createNotification(
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
  { did, reason, commentId }: CreateNotificationInput,
) {
  await tx.insert(schema.Notification).values({
    did,
    reason,
    commentId,
  });
}
