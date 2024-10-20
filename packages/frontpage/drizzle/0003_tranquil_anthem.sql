ALTER TABLE `posts` ADD `vote_count` integer;--> statement-breakpoint

UPDATE `posts` SET `vote_count` = (
  SELECT COUNT(*)
  FROM `post_votes`
  WHERE `post_votes`.`post_id` = `posts`.`id`
); --> statement-breakpoint

ALTER TABLE `posts` ADD `hot_score` integer;--> statement-breakpoint

UPDATE `posts` SET `hot_score` = (
  CAST(COALESCE(`vote_count`, 1) AS REAL) / (
		pow((JULIANDAY('now') - JULIANDAY(`created_at`)) * 24 + 2,1.8))); --> statement-breakpoint

CREATE INDEX `live_vote_count_idx` ON `posts` (`vote_count`) WHERE status = 'live';
