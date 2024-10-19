import { TimeAgo } from "@/lib/components/time-ago";
import { Button } from "@/lib/components/ui/button";
import { getVerifiedHandle } from "@/lib/data/atproto/identity";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  Notification as NotificationType,
} from "@/lib/data/db/notification";
import { exhaustiveCheck } from "@/lib/utils";
import {
  ChatBubbleIcon,
  Link1Icon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { revalidatePath } from "next/cache";

export default async function NotificationsPage() {
  const notifications = await getNotifications(40, null);
  return (
    <>
      <h1 className="scroll-m-20 text-xl font-extrabold lg:text-2xl">
        Notifications
      </h1>
      <form
        action={async () => {
          "use server";
          await markAllNotificationsRead();
          // Revalidating the layout to refresh the notification count
          revalidatePath("/notifications", "layout");
        }}
      >
        <Button variant="outline" size="sm">
          <CheckCircledIcon className="mr-2" />
          Mark all as read
        </Button>
      </form>
      {notifications.notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </>
  );
}

async function getNotificationViewModel(notification: NotificationType) {
  const replierHandle = await getVerifiedHandle(notification.comment.authorDid);
  if (notification.type === "commentReply") {
    return {
      type: "commentReply",
      Icon: ChatBubbleIcon,
      title: `@${replierHandle ?? "<invalid handle>"} replied to your comment on ${notification.post.title}`,
      body: notification.comment.body,
      time: notification.createdAt,
      read: notification.read,
      id: notification.id,
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
    };
  }

  exhaustiveCheck(notification.type);
}

async function markAsRead(id: number) {
  "use server";
  await markNotificationRead(id);
  revalidatePath("/notifications");
}

async function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const model = await getNotificationViewModel(notification);
  return (
    <div
      key={notification.id}
      className={`mb-4 p-4 rounded-lg ${model.read ? "bg-secondary" : "bg-primary/10"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <model.Icon className="mr-2 h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">{model.title}</p>
            <TimeAgo createdAt={model.time} />
          </div>
        </div>
        {!notification.read && (
          <form action={markAsRead.bind(null, model.id)}>
            <Button variant="ghost" size="icon">
              <CheckCircledIcon className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          </form>
        )}
      </div>
      <div className="mt-2 text-sm">
        <p>{model.body}</p>
      </div>
    </div>
  );
}
