import "server-only";
import { z } from "zod";
import { isDid } from "./did";
import { nsids } from "./repo";

// This module refers to the event emitted by Jetstream

export const Collection = z.union([
  z.literal(nsids.FyiUnravelFrontpagePost),
  z.literal(nsids.FyiFrontpageFeedPost),
  z.literal(nsids.FyiUnravelFrontpageComment),
  z.literal(nsids.FyiFrontpageFeedComment),
  z.literal(nsids.FyiUnravelFrontpageVote),
  z.literal(nsids.FyiFrontpageFeedVote),
]);

export type Collection = z.infer<typeof Collection>;

const Path = z.string().transform((p, ctx) => {
  const collectionResult = Collection.safeParse(p.split("/")[0]);
  if (!collectionResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid collection: "${p.split("/")[0]}". Expected one of ${Collection.options
        .map((c) => c.value)
        .join(", ")}`,
    });
    return z.NEVER;
  }
  const rkey = p.split("/")[1];
  if (!rkey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid path: ${p}`,
    });

    return z.NEVER;
  }

  return {
    collection: collectionResult.data,
    rkey,
    value: p,
  };
});

export const Operation = z.union([
  z.object({
    action: z.union([z.literal("create"), z.literal("update")]),
    path: Path,
    cid: z.string(),
  }),
  z.object({
    action: z.literal("delete"),
    path: Path,
  }),
]);

export const Commit = z.object({
  ops: z.array(Operation),
  repo: z.string().refine(isDid),
  seq: z.string().transform((x, ctx) => {
    try {
      const n = parseInt(x);
      if (isNaN(n)) {
        throw new Error("Invalid BigInt");
      }

      return parseInt(x);
    } catch (_e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid BigInt",
      });

      return z.NEVER;
    }
  }),
});
