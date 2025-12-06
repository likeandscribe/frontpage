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

export function exhaustiveCheck(value: never, message?: string): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled value (${message}): ${value}`);
}

export function setAbortableTimeout(
  callback: () => void,
  delay: number,
  signal: AbortSignal,
) {
  if (signal.aborted) {
    return;
  }

  const timeoutId = setTimeout(() => {
    callback();
  }, delay);

  signal.addEventListener(
    "abort",
    () => {
      clearTimeout(timeoutId);
    },
    { once: true },
  );
}
