-- Add avatarUrl to StudentProfile and originalFileName to CV.
ALTER TABLE `StudentProfile`
  ADD COLUMN `avatarUrl` VARCHAR(191) NULL AFTER `major`;

ALTER TABLE `CV`
  ADD COLUMN `originalFileName` VARCHAR(191) NULL AFTER `fileName`;

UPDATE `CV`
SET `originalFileName` = `fileName`
WHERE `originalFileName` IS NULL;

ALTER TABLE `CV`
  MODIFY `originalFileName` VARCHAR(191) NOT NULL;
