ALTER TABLE `comments` ADD `collection` text DEFAULT 'fyi.unravel.frontpage.comment' NOT NULL;--> statement-breakpoint
ALTER TABLE `comment_votes` ADD `collection` text DEFAULT 'fyi.unravel.frontpage.vote' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `collection` text DEFAULT 'fyi.unravel.frontpage.post' NOT NULL;--> statement-breakpoint
ALTER TABLE `post_votes` ADD `collection` text DEFAULT 'fyi.unravel.frontpage.vote' NOT NULL;
