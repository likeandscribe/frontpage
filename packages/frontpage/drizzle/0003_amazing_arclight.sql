CREATE TABLE `comment_aggregates` (
	`id` integer PRIMARY KEY NOT NULL,
	`comment_id` integer NOT NULL,
	`vote_count` integer,
	`rank` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comment_id_idx` ON `comment_aggregates` (`comment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_aggregates_comment_id_unique` ON `comment_aggregates` (`comment_id`);--> statement-breakpoint
CREATE TABLE `post_aggregates` (
	`id` integer PRIMARY KEY NOT NULL,
	`post_id` integer NOT NULL,
	`comment_count` integer,
	`vote_count` integer,
	`rank` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `post_id_idx` ON `post_aggregates` (`post_id`);--> statement-breakpoint
CREATE INDEX `rank_idx` ON `post_aggregates` (`rank`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_aggregates_post_id_unique` ON `post_aggregates` (`post_id`);