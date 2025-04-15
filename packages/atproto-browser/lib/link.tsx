"use client";
// eslint-disable-next-line no-restricted-imports
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps } from "react";

export default function Link(props: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  function prefetch() {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    router.prefetch(props.href.toString());
  }

  return (
    <NextLink
      {...props}
      prefetch={false}
      onMouseEnter={props.prefetch ? prefetch : undefined}
      onTouchStart={props.prefetch ? prefetch : undefined}
    />
  );
}
