-- 添加 auth_mode 字段，先允许 NULL
ALTER TABLE `target_accounts` ADD `auth_mode` text;--> statement-breakpoint
-- 为现有记录设置默认值
UPDATE `target_accounts` SET `auth_mode` = 'self' WHERE `auth_mode` IS NULL;--> statement-breakpoint
-- 添加 composio_user_id 字段
ALTER TABLE `target_accounts` ADD `composio_user_id` text;