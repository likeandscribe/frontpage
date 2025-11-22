import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function grabTitle(url: string): Promise<string> {
  url = encodeURI(url);
  const response = await fetch(`https://cardyb.bsky.app/v1/extract?url=${url}`)
  const body = await response.json()
  return body.title
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(`Invariant - ${message}`);
  }
}

export function exhaustiveCheck(value: never, message?: string): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled value (${message}): ${value}`);
}
