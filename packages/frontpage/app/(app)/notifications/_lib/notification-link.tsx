"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useMarkAsReadMutation } from "./read-state";

type NotificationLinkCardProps = {
  href: string;
  read: boolean;
  id: number;
  children: ReactNode;
};

export function NotificationLinkCard({
  href,
  read,
  id,
  children,
}: NotificationLinkCardProps) {
  const markAsRead = useMarkAsReadMutation(id);
  return (
    <Link
      onClick={() => {
        if (!read) {
          void markAsRead();
        }
      }}
      href={href}
      className={`block mb-4 p-4 rounded-lg ${read ? "bg-secondary" : "bg-primary/10"}`}
    >
      {children}
    </Link>
  );
}
