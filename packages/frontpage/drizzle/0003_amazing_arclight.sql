CREATE TABLE `comment_aggregates` (
	`id` integer PRIMARY KEY NOT NULL,
	`comment_id` integer NOT NULL,
	`vote_count` integer,
	`rank` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
); --> statement-breakpoint

CREATE TABLE `post_aggregates` (
	`id` integer PRIMARY KEY NOT NULL,
	`post_id` integer NOT NULL,
	`comment_count` integer,
	`vote_count` integer,
	`rank` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
); --> statement-breakpoint

INSERT INTO `comment_aggregates` (`comment_id`, `vote_count`, `rank`, `created_at`) SELECT `id`, 0, null, `created_at` FROM `comments`; --> statement-breakpoint

UPDATE `comment_aggregates` SET `vote_count` = (
  SELECT COUNT(*)
  FROM `comment_votes`
  WHERE `comment_votes`.`comment_id` = `comment_aggregates`.`comment_id`
); --> statement-breakpoint

UPDATE `comment_aggregates` SET `created_at` = (
  SELECT `created_at`
  FROM `comments`
  WHERE `comments`.`id` = `comment_aggregates`.`comment_id`
); --> statement-breakpoint

UPDATE `comment_aggregates` SET `rank` = (
	CAST(COALESCE(`vote_count`, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(`created_at`)) * 24 + 2,1.8)));--> statement-breakpoint

INSERT INTO `post_aggregates` (`post_id`, `comment_count`, `vote_count`, `rank`, `created_at`) SELECT `id`, 0, 0, null, current_timestamp FROM `posts`;--> statement-breakpoint

UPDATE `post_aggregates` SET `comment_count` = (SELECT COUNT(*) FROM `comments` WHERE `comments`.`post_id` = `post_aggregates`.`post_id`); --> statement-breakpoint

UPDATE `post_aggregates` SET `vote_count` = (
  SELECT COUNT(*)
  FROM `post_votes`
  WHERE `post_votes`.`post_id` = `post_aggregates`.`post_id`
); --> statement-breakpoint

UPDATE `post_aggregates` SET `rank` = (
	CAST(COALESCE(`vote_count`, 1) AS REAL) / (pow((JULIANDAY('now') - JULIANDAY(`created_at`)) * 24 + 2,1.8)));--> statement-breakpoint

UPDATE `post_aggregates` SET `created_at` = (SELECT `created_at` FROM `posts` WHERE `posts`.`id` = `post_aggregates`.`post_id`); --> statement-breakpoint

CREATE INDEX `comment_id_idx` ON `comment_aggregates` (`comment_id`); --> statement-breakpoint
CREATE UNIQUE INDEX `comment_aggregates_comment_id_unique` ON `comment_aggregates` (`comment_id`); --> statement-breakpoint
CREATE UNIQUE INDEX `post_aggregates_post_id_unique` ON `post_aggregates` (`post_id`);--> statement-breakpoint
CREATE INDEX `post_id_idx` ON `post_aggregates` (`post_id`);--> statement-breakpoint
CREATE INDEX `rank_idx` ON `post_aggregates` (`rank`);
