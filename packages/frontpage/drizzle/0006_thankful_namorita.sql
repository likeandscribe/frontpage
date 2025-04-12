ALTER TABLE `comment_votes` ADD `status` text DEFAULT 'live';--> statement-breakpoint
ALTER TABLE `post_votes` ADD `status` text DEFAULT 'live';
