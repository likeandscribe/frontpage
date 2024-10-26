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
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};
