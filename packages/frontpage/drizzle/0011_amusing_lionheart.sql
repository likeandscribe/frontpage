DROP INDEX `comments_author_did_rkey_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `comments_author_did_collection_rkey_unique` ON `comments` (`author_did`,`collection`,`rkey`);--> statement-breakpoint
DROP INDEX `comment_votes_author_did_rkey_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `comment_votes_author_did_collection_rkey_unique` ON `comment_votes` (`author_did`,`collection`,`rkey`);--> statement-breakpoint
DROP INDEX `posts_author_did_rkey_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_author_did_collection_rkey_unique` ON `posts` (`author_did`,`collection`,`rkey`);--> statement-breakpoint
DROP INDEX `post_votes_author_did_rkey_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `post_votes_author_did_collection_rkey_unique` ON `post_votes` (`author_did`,`collection`,`rkey`);