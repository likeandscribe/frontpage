CREATE TABLE `post_temp_labels` (
	`id` integer PRIMARY KEY NOT NULL,
	`post_id` integer NOT NULL,
	`post_label_id` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_label_id`) REFERENCES `temp_labels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `temp_labels` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint

INSERT INTO `temp_labels` (`label`) VALUES ('Politics'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Sports'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Technology'); --> statement-breakpoint  
INSERT INTO `temp_labels` (`label`) VALUES ('Entertainment'); --> statement-breakpoint 
INSERT INTO `temp_labels` (`label`) VALUES ('Science'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Business'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Education'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Lifestyle'); --> statement-breakpoint
INSERT INTO `temp_labels` (`label`) VALUES ('Other'); --> statement-breakpoint

CREATE TABLE `user_post_label_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`did` text NOT NULL,
	`post_label_id` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`post_label_id`) REFERENCES `temp_labels`(`id`) ON UPDATE no action ON DELETE no action
);
