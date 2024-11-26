import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import { eq, sql, desc, and, isNull, or } from "drizzle-orm";
import * as schema from "@/lib/schema";
import { getUser, isAdmin } from "../user";
import * as atprotoPost from "../atproto/post";
import { DID } from "../atproto/did";
import { newPostAggregateTrigger } from "./triggers";

const buildUserHasVotedQuery = cache(async () => {
  const user = await getUser();

  return db
    .select({ postId: schema.PostVote.postId })
    .from(schema.PostVote)
    .where(user ? eq(schema.PostVote.authorDid, user.did) : sql`false`)
    .as("hasVoted");
});

const bannedUserSubQuery = db
  .select({
    did: schema.LabelledProfile.did,
    isHidden: schema.LabelledProfile.isHidden,
  })
  .from(schema.LabelledProfile)
  .as("bannedUser");

export const getFrontpagePosts = cache(async (offset: number) => {
  const POSTS_PER_PAGE = 10;

  const userHasVoted = await buildUserHasVotedQuery();

  const rows = await db
    .select({
      id: schema.PostAggregates.postId,
      rkey: schema.Post.rkey,
      cid: schema.Post.cid,
      title: schema.Post.title,
      url: schema.Post.url,
      createdAt: schema.Post.createdAt,
      authorDid: schema.Post.authorDid,
      voteCount: schema.PostAggregates.voteCount,
      commentCount: schema.PostAggregates.commentCount,
      rank: schema.PostAggregates.rank,
      userHasVoted: userHasVoted.postId,
      status: schema.Post.status,
    })
    .from(schema.PostAggregates)
    .innerJoin(schema.Post, eq(schema.PostAggregates.postId, schema.Post.id))
    .leftJoin(userHasVoted, eq(userHasVoted.postId, schema.Post.id))
    .leftJoin(
      bannedUserSubQuery,
      eq(bannedUserSubQuery.did, schema.Post.authorDid),
    )
    .where(
      and(
        eq(schema.Post.status, "live"),
        or(
          isNull(bannedUserSubQuery.isHidden),
          eq(bannedUserSubQuery.isHidden, false),
        ),
      ),
    )
    .orderBy(desc(schema.PostAggregates.rank))
    .limit(POSTS_PER_PAGE)
    .offset(offset);

  const posts = rows.map((row) => ({
    id: row.id,
    rkey: row.rkey,
    cid: row.cid,
    title: row.title,
    url: row.url,
    createdAt: row.createdAt,
    authorDid: row.authorDid,
    voteCount: row.voteCount,
    commentCount: row.commentCount,
    userHasVoted: Boolean(row.userHasVoted),
  }));

  return {
    posts,
    nextCursor: offset + POSTS_PER_PAGE,
  };
});

export const getUserPosts = cache(async (userDid: DID) => {
  const userHasVoted = await buildUserHasVotedQuery();

  const posts = await db
    .select({
      id: schema.Post.id,
      rkey: schema.Post.rkey,
      cid: schema.Post.cid,
      title: schema.Post.title,
      url: schema.Post.url,
      createdAt: schema.Post.createdAt,
      authorDid: schema.Post.authorDid,
      voteCount: schema.PostAggregates.voteCount,
      commentCount: schema.PostAggregates.commentCount,
      userHasVoted: userHasVoted.postId,
      status: schema.Post.status,
    })
    .from(schema.PostAggregates)
    .innerJoin(schema.Post, eq(schema.PostAggregates.postId, schema.Post.id))
    .leftJoin(userHasVoted, eq(userHasVoted.postId, schema.Post.id))
    .where(
      and(eq(schema.Post.authorDid, userDid), eq(schema.Post.status, "live")),
    );

  return posts.map((row) => ({
    id: row.id,
    rkey: row.rkey,
    cid: row.cid,
    title: row.title,
    url: row.url,
    createdAt: row.createdAt,
    authorDid: row.authorDid,
    voteCount: row.voteCount,
    commentCount: row.commentCount,
    userHasVoted: Boolean(row.userHasVoted),
  }));
});

export const getPost = cache(async (authorDid: DID, rkey: string) => {
  const userHasVoted = await buildUserHasVotedQuery();

  const rows = await db
    .select()
    .from(schema.Post)
    .where(
      and(eq(schema.Post.authorDid, authorDid), eq(schema.Post.rkey, rkey)),
    )
    .innerJoin(
      schema.PostAggregates,
      eq(schema.PostAggregates.postId, schema.Post.id),
    )
    .leftJoin(userHasVoted, eq(userHasVoted.postId, schema.Post.id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    ...row.posts,
    commentCount: row.post_aggregates.commentCount,
    voteCount: row.post_aggregates.voteCount,
    userHasVoted: Boolean(row.hasVoted),
  };
});

export async function uncached_doesPostExist(authorDid: DID, rkey: string) {
  const row = await db
    .select({ id: schema.Post.id })
    .from(schema.Post)
    .where(
      and(eq(schema.Post.authorDid, authorDid), eq(schema.Post.rkey, rkey)),
    )
    .limit(1);

  return Boolean(row[0]);
}

export type CreatePostInput = {
  post: atprotoPost.Post;
  authorDid: DID;
  rkey: string;
  cid: string;
};

export async function createPost({
  post,
  rkey,
  authorDid,
  cid,
}: CreatePostInput) {
  return await db.transaction(async (tx) => {
    const [insertedPostRow] = await tx
      .insert(schema.Post)
      .values({
        rkey,
        cid,
        authorDid,
        title: post.title,
        url: post.url,
        createdAt: new Date(post.createdAt),
      })
      .returning({ postId: schema.Post.id });

    if (!insertedPostRow) {
      throw new Error("Failed to insert post");
    }

    await newPostAggregateTrigger(insertedPostRow.postId, tx);

    return {
      postId: insertedPostRow.postId,
    };
  });
}

export type DeletePostInput = {
  rkey: string;
  authorDid: DID;
};

export async function deletePost({ rkey, authorDid }: DeletePostInput) {
  console.log("Deleting post", rkey);
  await db.transaction(async (tx) => {
    console.log("Updating post status to deleted", rkey);
    await tx
      .update(schema.Post)
      .set({ status: "deleted" })
      .where(
        and(eq(schema.Post.rkey, rkey), eq(schema.Post.authorDid, authorDid)),
      );
  });
  console.log("Done deleting post transaction");
}

type ModeratePostInput = {
  rkey: string;
  authorDid: DID;
  cid: string;
  hide: boolean;
};
export async function moderatePost({
  rkey,
  authorDid,
  cid,
  hide,
}: ModeratePostInput) {
  const adminUser = await isAdmin();

  if (!adminUser) {
    throw new Error("User is not an admin");
  }
  console.log(`Moderating post, setting hidden to ${hide}`);
  await db
    .update(schema.Post)
    .set({ status: hide ? "moderator_hidden" : "live" })
    .where(
      and(
        eq(schema.Post.rkey, rkey),
        eq(schema.Post.authorDid, authorDid),
        eq(schema.Post.cid, cid),
      ),
    );
}

export const getPostFromComment = cache(
  async ({ did, rkey }: { did: DID; rkey: string }) => {
    const [join] = await db
      .select()
      .from(schema.Comment)
      .where(
        and(eq(schema.Comment.rkey, rkey), eq(schema.Comment.authorDid, did)),
      )
      .leftJoin(schema.Post, eq(schema.Comment.postId, schema.Post.id));

    if (!join || !join.posts) {
      return null;
    }

    return { postRkey: join.posts.rkey, postAuthor: join.posts.authorDid };
  },
);
