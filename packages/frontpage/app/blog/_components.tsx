import { UserAvatar } from "@/lib/components/user-avatar";
import { UserHoverCard } from "@/lib/components/user-hover-card";
import { DID } from "@/lib/data/atproto/did";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function BackLink({
  children,
  href,
}: {
  children: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      <ArrowLeftIcon /> {children ?? "Home"}
    </Link>
  );
}

export function AuthorAvatar({ did }: { did: DID }) {
  return (
    <UserHoverCard did={did}>
      <UserAvatar did={did} size="small" />
    </UserHoverCard>
  );
}
