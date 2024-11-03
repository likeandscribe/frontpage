CREATE TABLE `notifications`(
  `id` integer PRIMARY KEY NOT NULL,
  `did` text NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `read_at` text,
  `reason` text NOT NULL,
  `comment_id` integer,
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE NO action ON DELETE NO action
);
