import * as schema from "@/lib/schema";
import { ResultSet } from "@libsql/client";
import {
  AnyColumn,
  ExtractTablesWithRelations,
  and,
  eq,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";

const updateColumnValue = (column: AnyColumn, value: number) => {
  return sql`${column} + ${value}`;
};
const newRankSql = sql`(CAST(1 AS REAL) / (pow(2,1.8)))`;

export const calculateRankSql = (
  voteCountColumn: AnyColumn,
  createdAtColumn: AnyColumn,
) => {
  return sql<number>`
    (CAST(COALESCE(${voteCountColumn}, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(${createdAtColumn})) * 24 + 2, 1.8)))`;
};

//Post flow:

//  - on new post create new aggregate, upadte all post ranks
export const newPostAggregateTrigger = async (
  postId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx.insert(schema.PostAggregates).values({
    postId,
    commentCount: 0,
    voteCount: 1,
    rank: newRankSql,
    createdAt: new Date(),
  });

  await updateAllPostRanks(tx);
};

//Vote Post flow:
// - on new vote update post aggregate with vote count +1 and recalculate rank for all posts
export const newPostVoteAggregateTrigger = async (
  postId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx
    .update(schema.PostAggregates)
    .set({
      voteCount: updateColumnValue(schema.PostAggregates.voteCount, 1),
    })
    .where(eq(schema.PostAggregates.postId, postId));

  await updateAllPostRanks(tx);
};

// - on delete vote update post aggregate with vote count -1 and recalculate rank for all posts
export const deletePostVoteAggregateTrigger = async (
  postId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx
    .update(schema.PostAggregates)
    .set({
      voteCount: updateColumnValue(schema.PostAggregates.voteCount, -1),
    })
    .where(eq(schema.PostAggregates.postId, postId));

  await updateAllPostRanks(tx);
};

//Comment flow:

// - on new comment create new comment aggregate, update post aggregates with comment count +1 and recalculate rank for all comments on that post at the same nested level
export const newCommentAggregateTrigger = async (
  postId: number,
  commentId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx.insert(schema.CommentAggregates).values({
    commentId,
    voteCount: 1,
    rank: newRankSql,
    createdAt: new Date(),
  });

  await tx
    .update(schema.PostAggregates)
    .set({
      commentCount: updateColumnValue(schema.PostAggregates.commentCount, 1),
    })
    .where(eq(schema.PostAggregates.postId, postId));

  await updateSiblingCommentRanksOnPost(postId, commentId, tx);
};

// - on new vote update comment aggregate with vote count +1 and recalculate rank for all comments on post
export const newCommentVoteAggregateTrigger = async (
  postId: number,
  commentId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx
    .update(schema.CommentAggregates)
    .set({
      voteCount: updateColumnValue(schema.CommentAggregates.voteCount, 1),
    })
    .where(eq(schema.CommentAggregates.commentId, postId));

  await updateSiblingCommentRanksOnPost(postId, commentId, tx);
};

// - on delete comment update post aggregates with comment count -1 and recalculate comment_aggregate rank for all comments on that post
export const deleteCommentAggregateTrigger = async (
  postId: number,
  commentId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx
    .update(schema.PostAggregates)
    .set({
      commentCount: updateColumnValue(schema.PostAggregates.commentCount, -1),
    })
    .where(eq(schema.PostAggregates.postId, postId));

  await updateSiblingCommentRanksOnPost(postId, commentId, tx);
};

// - on delete vote update comment aggregate with vote count -1 and recalculate rank for all comments on post
export const deleteCommentVoteAggregateTrigger = async (
  postId: number,
  commentId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx
    .update(schema.CommentAggregates)
    .set({
      voteCount: updateColumnValue(schema.CommentAggregates.voteCount, -1),
    })
    .where(eq(schema.CommentAggregates.commentId, commentId));

  await updateSiblingCommentRanksOnPost(postId, commentId, tx);
};

export const updateAllPostRanks = async (
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  await tx.update(schema.PostAggregates).set({
    rank: calculateRankSql(
      schema.PostAggregates.voteCount,
      schema.PostAggregates.createdAt,
    ),
  });
};

export const updateSiblingCommentRanksOnPost = async (
  postId: number,
  commentId: number,
  tx: SQLiteTransaction<
    "async",
    ResultSet,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  const [comment] = await tx
    .select({ parentCommentId: schema.Comment.parentCommentId })
    .from(schema.Comment)
    .where(
      and(eq(schema.Comment.id, commentId), eq(schema.Comment.postId, postId)),
    );

  if (!comment) {
    throw new Error("Comment not found");
  }

  const commentIds = tx
    .select({ commentId: schema.Comment.id })
    .from(schema.Comment)
    .where(
      and(
        comment.parentCommentId === null
          ? isNull(schema.Comment.parentCommentId)
          : eq(schema.Comment.parentCommentId, comment.parentCommentId),
        eq(schema.Comment.postId, postId),
      ),
    );

  await tx
    .update(schema.CommentAggregates)
    .set({
      rank: calculateRankSql(
        schema.CommentAggregates.voteCount,
        schema.CommentAggregates.createdAt,
      ),
    })
    .where(inArray(schema.CommentAggregates.commentId, commentIds));
};
