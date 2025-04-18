import "server-only";
import { getBlueskyProfile } from "@/lib/data/user";
import { Suspense } from "react";
import { type DID } from "../data/atproto/did";

const userAvatarSizes = {
  small: 22,
  smedium: 36,
  medium: 100,
  large: 150,
};

type Size = keyof typeof userAvatarSizes;

type UserAvatarProps = {
  did: DID;
  size?: Size;
};

export function UserAvatar(props: UserAvatarProps) {
  return (
    <Suspense fallback={<AvatarFallback size={props.size} />}>
      <AvatarImage {...props} />
    </Suspense>
  );
}

export function AvatarFallback({ size }: { size: UserAvatarProps["size"] }) {
  const sizePx = userAvatarSizes[size ?? "small"];
  return (
    <svg
      className="text-slate-500"
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="currentColor" />
    </svg>
  );
}

async function AvatarImage({
  did,
  size: sizeVariant = "small",
}: UserAvatarProps) {
  const profile = await getBlueskyProfile(did);
  if (!profile) {
    return <AvatarFallback size={sizeVariant} />;
  }
  const size = userAvatarSizes[sizeVariant];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={
        sizeVariant === "large"
          ? profile.avatar
          : profile.avatar.replace("/avatar/", "/avatar_thumbnail/")
      }
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full"
    />
  );
}
