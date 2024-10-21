ALTER TABLE `posts` ADD `vote_count` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `hot_score` integer;--> statement-breakpoint

CREATE INDEX `live_vote_count_idx` ON `posts` (`vote_count`) WHERE status = 'live';
