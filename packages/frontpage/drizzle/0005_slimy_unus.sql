DROP INDEX IF EXISTS `comments_cid_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS "admin_users_did_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "beta_users_did_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "comments_author_did_rkey_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "comment_aggregates_comment_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "comment_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "comment_votes_author_did_rkey_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "comment_votes_author_did_comment_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "labelled_profiles_did_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "oauth_auth_requests_state_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "posts_author_did_rkey_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "post_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "rank_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "post_aggregates_post_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "post_votes_author_did_rkey_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "post_votes_author_did_post_id_unique";--> statement-breakpoint
ALTER TABLE `comments` ALTER COLUMN "cid" TO "cid" text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_did_unique` ON `admin_users` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `beta_users_did_unique` ON `beta_users` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `comments_author_did_rkey_unique` ON `comments` (`author_did`,`rkey`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_aggregates_comment_id_unique` ON `comment_aggregates` (`comment_id`);--> statement-breakpoint
CREATE INDEX `comment_id_idx` ON `comment_aggregates` (`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_votes_author_did_rkey_unique` ON `comment_votes` (`author_did`,`rkey`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_votes_author_did_comment_id_unique` ON `comment_votes` (`author_did`,`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `labelled_profiles_did_unique` ON `labelled_profiles` (`did`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_auth_requests_state_unique` ON `oauth_auth_requests` (`state`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_author_did_rkey_unique` ON `posts` (`author_did`,`rkey`);--> statement-breakpoint
CREATE INDEX `post_id_idx` ON `post_aggregates` (`post_id`);--> statement-breakpoint
CREATE INDEX `rank_idx` ON `post_aggregates` (`rank`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_aggregates_post_id_unique` ON `post_aggregates` (`post_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_votes_author_did_rkey_unique` ON `post_votes` (`author_did`,`rkey`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_votes_author_did_post_id_unique` ON `post_votes` (`author_did`,`post_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `comment_votes_cid_unique`;--> statement-breakpoint
ALTER TABLE `comment_votes` ALTER COLUMN "cid" TO "cid" text NOT NULL DEFAULT '';--> statement-breakpoint
DROP INDEX IF EXISTS `posts_cid_unique`;--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "cid" TO "cid" text NOT NULL DEFAULT '';--> statement-breakpoint
DROP INDEX IF EXISTS `post_votes_cid_unique`;--> statement-breakpoint
ALTER TABLE `post_votes` ALTER COLUMN "cid" TO "cid" text NOT NULL DEFAULT '';