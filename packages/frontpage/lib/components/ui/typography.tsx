import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export function Heading1({ children }: { children: ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}

export function Heading2({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {children}
    </h2>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function TextLink({
  href,
  children,
}: {
  href: LinkProps["href"];
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {children}
    </Link>
  );
}
