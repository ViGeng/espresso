CREATE TABLE `coffee_beans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`origin` text,
	`roast_level` text,
	`notes` text,
	`created_at` text DEFAULT '2026-02-04T14:41:48.091Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coffee_drinking` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`maker_id` integer,
	`drinker_ids` text,
	`bean_id` integer,
	`cups` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`recorded_at` text DEFAULT '2026-02-04T14:41:48.091Z' NOT NULL,
	FOREIGN KEY (`maker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bean_id`) REFERENCES `coffee_beans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`initials` text NOT NULL,
	`color` text NOT NULL,
	`created_at` text DEFAULT '2026-02-04T14:41:48.090Z' NOT NULL
);
