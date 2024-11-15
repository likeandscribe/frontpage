import { TimeAgo } from "@/lib/components/time-ago";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import {
  Cursor,
  getNotifications,
  Notification as NotificationType,
} from "@/lib/data/db/notification";
import { InfiniteList, Page } from "@/lib/infinite-list";
import { exhaustiveCheck } from "@/lib/utils";
import { ChatBubbleIcon, Link1Icon } from "@radix-ui/react-icons";
import {
  MarkAllAsReadButton,
  MarkAsReadButton,
} from "./_lib/mark-as-read-button";
import { getCommentLink } from "@/lib/navigation";
import { NotificationLinkCard } from "./_lib/notification-link";
import { NOTIFICATIONS_CACHE_KEY } from "./_lib/constants";
import { CommentBody } from "../post/[postAuthor]/[postRkey]/_lib/comment";

export default async function NotificationsPage() {
  return (
    <div className="flex flex-col gap-y-4 px-4">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-xl font-extrabold lg:text-2xl">
          Notifications
        </h1>
        <MarkAllAsReadButton />
      </div>

      <InfiniteList
        cacheKey={NOTIFICATIONS_CACHE_KEY}
        emptyMessage="There are no more notifications."
        getMoreItemsAction={getMoreNotifications}
        fallback={await getMoreNotifications(null)}
        // We're revalidating all pages whenever any page in the list is revalidated for convenience.
        // This means that if someone scrolls back a bunch and then causes revalidation, it'll trigger loads of _sequential_ server action calls.
        // TODO: Possible fix this with a virtualised list that only keeps 3-5 pages mounted at a time
        revalidateAll
      />
    </div>
  );
}

async function getMoreNotifications(
  cursor: Cursor | null,
): Promise<Page<Cursor>> {
  "use server";
  const notifications = await getNotifications(40, cursor);

  return {
    content: (
      <>
        {notifications.notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </>
    ),

    nextCursor: notifications.cursor,
    pageSize: notifications.notifications.length,
  };
}

async function getNotificationViewModel(notification: NotificationType) {
  const replierHandle = await getVerifiedHandle(notification.comment.authorDid);

  const href = getCommentLink({
    post: {
      handleOrDid: notification.post.authorDid,
      rkey: notification.post.rkey,
    },
    handleOrDid: notification.comment.authorDid,
    rkey: notification.comment.rkey,
  });

  if (notification.type === "commentReply") {
    return {
      type: "commentReply",
      Icon: ChatBubbleIcon,
      title: `@${replierHandle ?? "<invalid handle>"} replied to your comment on "${notification.post.title}"`,
      body: notification.comment.body,
      time: notification.createdAt,
      read: notification.read,
      id: notification.id,
      href,
    };
  }

  if (notification.type === "postComment") {
    return {
      type: "postComment",
      Icon: Link1Icon,
      title: `@${replierHandle ?? "<invalid handle>"} commented on your post: "${notification.post.title}"`,
      body: notification.comment.body,
      time: notification.createdAt,
      read: notification.read,
      id: notification.id,
      href,
    };
  }

  exhaustiveCheck(notification.type);
}

async function NotificationCard({
  notification,
}: {
  notification: NotificationType;
}) {
  const model = await getNotificationViewModel(notification);
  return (
    <NotificationLinkCard
      href={model.href}
      read={model.read}
      id={notification.id}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <model.Icon className="text-gray-500 dark:text-gray-400 h-4 w-4 self-start mt-1 shrink-0" />
          <div>
            <p className="font-medium">{model.title}</p>
            <p className="text-gray-500 dark:text-gray-400">
              <TimeAgo createdAt={model.time} />
            </p>
            <div className="mt-2 text-sm">
              <CommentBody exerptOnly body={model.body} />
            </div>
          </div>
        </div>
        {!notification.read && <MarkAsReadButton notificationId={model.id} />}
      </div>
    </NotificationLinkCard>
  );
}
