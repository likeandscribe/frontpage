"use client";

import useSWRInfinite, { unstable_serialize } from "swr/infinite";
import { createContext, Fragment, ReactNode, startTransition } from "react";
import { useInView } from "react-intersection-observer";
import { SWRConfig } from "swr";

export type Page<TCursor> = {
  content: ReactNode;
  nextCursor: TCursor | null;
  pageSize: number;
};

type Props<TCursor> = {
  getMoreItemsAction: (cursor: TCursor | null) => Promise<Page<TCursor>>;
  emptyMessage: string;
  cacheKey: string;
  fallback: Page<TCursor> | Promise<Page<TCursor>>;
};

export function InfiniteList<TCursor>({ fallback, ...props }: Props<TCursor>) {
  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(() => [props.cacheKey, null])]: [fallback],
        },
      }}
    >
      <InfinteListInner {...props} />
    </SWRConfig>
  );
}

export const InfiniteListContext = createContext({
  revalidatePage: (): void => {
    throw new Error(
      "Cannot call InfiniteListContext.revalidate when not inside of an InfiniteList",
    );
  },
});

function InfinteListInner<TCursor>({
  getMoreItemsAction,
  emptyMessage,
  cacheKey,
}: Omit<Props<TCursor>, "fallback">) {
  const { data, size, setSize, mutate } = useSWRInfinite(
    (_, previousPageData: Page<TCursor> | null) => {
      if (previousPageData && !previousPageData.pageSize) return null; // reached the end
      return [cacheKey, previousPageData?.nextCursor ?? null];
    },
    ([_, cursor]) => {
      return getMoreItemsAction(cursor);
    },
    { suspense: true, revalidateOnMount: false },
  );
  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        startTransition(() => void setSize(size + 1));
      }
    },
  });

  // Data can't be undefined because we are using suspense. This is likely a bug in the swr types.
  const pages = data!;

  return (
    <div className="space-y-6">
      {pages.map((page, indx) => {
        return (
          <Fragment key={String(page.nextCursor)}>
            <InfiniteListContext.Provider
              value={{
                revalidatePage: () => {
                  const previousCursor = pages.at(indx - 1)?.nextCursor;
                  void mutate(data, {
                    revalidate: (_data, args) =>
                      !previousCursor ||
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (args as any)[1] === previousCursor,
                  });
                },
              }}
            >
              {page.content}
            </InfiniteListContext.Provider>

            {indx === pages.length - 1 ? (
              page.pageSize === 0 ? (
                <p className="text-center text-gray-400">{emptyMessage}</p>
              ) : (
                <p ref={inViewRef} className="text-center text-gray-400">
                  Loading...
                </p>
              )
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
