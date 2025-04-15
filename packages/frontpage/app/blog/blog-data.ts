import { type DID, didSchema } from "@/lib/data/atproto/did";
import { AtUri } from "@/lib/data/atproto/uri";
import slugify from "slugify";
import { z } from "zod";

const FRONTPAGE_PDS_URL = "https://hydnum.us-west.host.bsky.network/xrpc";
export const FRONTPAGE_DID = "did:plc:klmr76mpewpv7rtm3xgpzd7x" as DID;
export const WHTWND_BLOG_COLLECTION = "com.whtwnd.blog.entry";

const Blog = z.object({
  value: z.object({
    content: z.string(),
    title: z.string(),
    createdAt: z.coerce.date(),
    visibility: z.union([
      z.literal("public"),
      z.literal("author"),
      z.literal("url"),
    ]),
  }),
  uri: AtUri,
  cid: z.string(),
});

const BlogMetaRecord = z.object({
  value: z.object({
    tags: z.array(z.string()).optional(),
    additionalAuthors: z.array(didSchema).optional(),
  }),
  uri: AtUri,
});
type BlogMeta = z.infer<typeof BlogMetaRecord>["value"];

const BlogArray = z.object({
  records: z.array(Blog),
});

// Functions

export async function listBlogs() {
  const blogListQueryParams = new URLSearchParams({
    repo: FRONTPAGE_DID,
    collection: WHTWND_BLOG_COLLECTION,
  });

  const blogList = await fetch(
    `${FRONTPAGE_PDS_URL}/com.atproto.repo.listRecords?${blogListQueryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const list = BlogArray.parse(await blogList.json()).records.filter(
    (b) => b.value.visibility === "public",
  );

  const metaList = await Promise.allSettled(
    list.map((b) => getMeta(b.uri.rkey)),
  );

  return list.map((b) => {
    const meta = metaList.find(
      (m) => m.status === "fulfilled" && m.value?.uri.rkey === b.uri.rkey,
    );
    if (meta?.status === "fulfilled") {
      return transformBlog(b, meta.value?.value ?? ({} satisfies BlogMeta));
    } else {
      return transformBlog(b, {} satisfies BlogMeta);
    }
  });
}

async function getMeta(rkey: string) {
  const queryParams = new URLSearchParams({
    repo: FRONTPAGE_DID,
    collection: "fyi.frontpage.dev.blog.meta",
    rkey,
  });

  const response = await fetch(
    `${FRONTPAGE_PDS_URL}/com.atproto.repo.getRecord?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (response.status !== 200) return null;

  const json = await response.json();
  return BlogMetaRecord.parse(json);
}

export async function getBlog(rkey: string) {
  const metaPromise = getMeta(rkey).catch(() => null);
  const queryParams = new URLSearchParams({
    repo: FRONTPAGE_DID,
    collection: WHTWND_BLOG_COLLECTION,
    rkey: rkey,
  });

  const response = await fetch(
    `${FRONTPAGE_PDS_URL}/com.atproto.repo.getRecord?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 400) return null;

  const blog = Blog.parse(await response.json());
  const meta = await metaPromise;

  return transformBlog(blog, meta?.value ?? ({} satisfies BlogMeta));
}

function transformBlog(blog: z.infer<typeof Blog>, meta: BlogMeta) {
  return {
    ...blog,
    additionalAuthors: meta.additionalAuthors ?? [],
    tags: meta.tags ?? [],
    slug: `${blog.uri.rkey}-${slugify(blog.value.title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    })}`,
  };
}
