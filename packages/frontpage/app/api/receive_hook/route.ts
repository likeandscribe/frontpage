import { db } from "@/lib/db";
import { z } from "zod";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.DRAINPIPE_CONSUMER_SECRET}`) {
    console.error("Unauthorized request");
    return new Response("Unauthorized", { status: 401 });
  }
  const parsed = Message.safeParse(await request.json());
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  const { ops, repo, seq } = parsed.data;
  const plc = await getPlcDoc(repo);
  const service = plc.service.find(
    (s) => s.type === "AtprotoPersonalDataServer",
  )?.serviceEndpoint;
  if (!service) {
    throw new Error("No AtprotoPersonalDataServer service found");
  }

  const promises = ops.map(async (op) => {
    const { collection, rkey } = op.path;

    if (collection === "fyi.unravel.frontpage.post") {
      await db.transaction(async (tx) => {
        if (op.action === "create") {
          const record = await atprotoGetRecord({
            serviceEndpoint: service,
            repo,
            collection,
            rkey,
          });
          const postRecord = PostRecord.parse(record.value);

          await tx.insert(schema.Post).values({
            rkey,
            cid: record.cid,
            title: postRecord.title,
            url: postRecord.url,
            authorDid: repo,
            createdAt: new Date(postRecord.createdAt),
          });
        } else if (op.action === "delete") {
          await tx.delete(schema.Post).where(eq(schema.Post.rkey, rkey));
        }

        await tx.insert(schema.ConsumedOffset).values({ offset: seq });
      });
    }
  });

  await Promise.all(promises);

  return new Response("OK");
}

const PostRecord = z.object({
  title: z.string(),
  url: z.string(),
  createdAt: z.string(),
});

const AtProtoRecord = z.object({
  value: z.custom<unknown>(
    (value) => typeof value === "object" && value != null,
  ),
  cid: z.string(),
});

type GetRecordInput = {
  serviceEndpoint: string;
  repo: string;
  collection: string;
  rkey: string;
};

async function atprotoGetRecord({
  serviceEndpoint,
  repo,
  collection,
  rkey,
}: GetRecordInput) {
  const url = new URL(`${serviceEndpoint}/xrpc/com.atproto.repo.getRecord`);
  url.searchParams.append("repo", repo);
  url.searchParams.append("collection", collection);
  url.searchParams.append("rkey", rkey);

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok)
    throw new Error("Failed to fetch record", { cause: response });

  const json = await response.json();

  return AtProtoRecord.parse(json);
}

async function getPlcDoc(did: string) {
  const response = await fetch(`https://plc.directory/${did}`, {
    next: {
      // TODO: Also revalidate this when we receive an identity change event
      // That would allow us to extend the revalidation time to 1 day
      revalidate: 60 * 60, // 1 hour
    },
  });

  return PlcDocument.parse(await response.json());
}

const PlcDocument = z.object({
  id: z.string(),
  service: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      serviceEndpoint: z.string(),
    }),
  ),
});

const Message = z.object({
  ops: z.array(
    z.object({
      cid: z.string(),
      path: z.string().transform((p, ctx) => {
        const collection = p.split("/")[0];
        const rkey = p.split("/")[1];
        if (!collection || !rkey) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid path: ${p}`,
          });

          return z.NEVER;
        }

        return {
          collection,
          rkey,
          full: p,
        };
      }),
      action: z.union([
        z.literal("create"),
        z.literal("update"),
        z.literal("delete"),
      ]),
    }),
  ),
  repo: z.string(),
  seq: z.string().transform((x, ctx) => {
    try {
      return BigInt(x);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid BigInt",
      });

      return z.NEVER;
    }
  }),
});
