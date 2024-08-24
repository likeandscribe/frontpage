import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  customType,
  unique,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import type { DID } from "./data/atproto/did";
import {
  MAX_COMMENT_LENGTH,
  MAX_POST_TITLE_LENGTH,
  MAX_POST_URL_LENGTH,
} from "./data/db/constants";

const did = customType<{ data: DID }>({
  dataType() {
    return "text";
  },
});

const createStatusColumn = (col: string) =>
  text(col, { enum: ["live", "deleted", "moderator_hidden"] }).default("live");

export const Post = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey(),
    rkey: text("rkey").notNull(),
    cid: text("cid").notNull().unique(),
    title: text("title", {
      length: MAX_POST_TITLE_LENGTH,
    }).notNull(),
    url: text("url", {
      length: MAX_POST_URL_LENGTH,
    }).notNull(),
    createdAt: text("created_at")
      .default(sql`(CURRENT_DATE)`)
      .notNull(),
    authorDid: did("author_did").notNull(),
    // TODO: add notNull once this is rolled out
    status: createStatusColumn("status"),
  },
  (t) => ({
    unique_author_rkey: unique().on(t.authorDid, t.rkey),
  }),
);

export const PostVote = sqliteTable(
  "post_votes",
  {
    id: integer("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => Post.id),
    createdAt: text("created_at")
      .default(sql`(CURRENT_DATE)`)
      .notNull(),
    authorDid: did("author_did").notNull(),
    cid: text("cid").notNull().unique(),
    rkey: text("rkey").notNull(),
  },
  (t) => ({
    unique_authr_rkey: unique().on(t.authorDid, t.rkey),
    // Ensures you can only vote once per post
    unique_author_postId: unique().on(t.authorDid, t.postId),
  }),
);

export const Comment = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey(),
    rkey: text("rkey").notNull(),
    cid: text("cid").notNull().unique(),
    postId: integer("post_id")
      .notNull()
      .references(() => Post.id),
    body: text("body", {
      length: MAX_COMMENT_LENGTH,
    }).notNull(),
    createdAt: text("created_at")
      .default(sql`(CURRENT_DATE)`)
      .notNull(),
    authorDid: did("author_did").notNull(),
    // TODO: add notNull once this is rolled out
    status: createStatusColumn("status"),
    parentCommentId: integer("parent_comment_id"),
  },
  (t) => ({
    parentReference: foreignKey({
      columns: [t.parentCommentId],
      foreignColumns: [t.id],
      name: "parent_comment_id_fkey",
    }),
    unique_author_rkey: unique().on(t.authorDid, t.rkey),
  }),
);

export const CommentVote = sqliteTable(
  "comment_votes",
  {
    id: integer("id").primaryKey(),
    commentId: integer("comment_id")
      .notNull()
      .references(() => Comment.id),
    createdAt: text("created_at")
      .default(sql`(CURRENT_DATE)`)
      .notNull(),
    authorDid: did("author_did").notNull(),
    cid: text("cid").notNull().unique(),
    rkey: text("rkey").notNull(),
  },
  (t) => ({
    unique_authr_rkey: unique().on(t.authorDid, t.rkey),
    // Ensures you can only vote once per post
    unique_author_commentId: unique().on(t.authorDid, t.commentId),
  }),
);

export const BetaUser = sqliteTable("beta_users", {
  id: integer("id").primaryKey(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_DATE)`)
    .notNull(),
  did: did("did").notNull().unique(),
});

export const ConsumedOffset = sqliteTable("consumed_offsets", {
  offset: integer("offset").primaryKey(),
});
