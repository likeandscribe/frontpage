import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}
