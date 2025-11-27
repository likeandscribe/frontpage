import { useSyncExternalStore } from "react";
import { setAbortableTimeout } from "./utils";

const Breakpoints = {
  sm: "(width >= 40rem)",
  md: "(width >= 48rem)",
  lg: "(width >= 64rem)",
  xl: "(width >= 80rem)",
  "2xl": "(width >= 96rem)",
};

export type Breakpoint = keyof typeof Breakpoints;

const matchMediaMap = new Map<
  Breakpoint,
  {
    mq: MediaQueryList;
    matches: boolean;
  }
>();

if (typeof window !== "undefined") {
  for (const [breakpoint, query] of Object.entries(Breakpoints)) {
    const mq = window.matchMedia(query);
    const storeItem = {
      mq: mq,
      matches: mq.matches,
    };
    matchMediaMap.set(breakpoint as Breakpoint, storeItem);

    mq.addEventListener("change", (event) => {
      storeItem.matches = event.matches;
    });
  }
}

export function useMediaQuery(
  breakpoint: Breakpoint,
  serverSnapshot: boolean = false,
): boolean {
  const subscribe = (callback: () => void) => {
    const storeItem = matchMediaMap.get(breakpoint)!;

    const controller = new AbortController();
    storeItem.mq.addEventListener(
      "change",
      () => {
        // In the future we may want to make the debounce delay configurable via a "coarsness" parameter
        setAbortableTimeout(callback, 300, controller.signal);
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      controller.abort();
    };
  };

  const getSnapshot = () => {
    // console.log(breakpoint, matchMediaMap.get(breakpoint)?.matches);
    return matchMediaMap.get(breakpoint)?.matches ?? false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
