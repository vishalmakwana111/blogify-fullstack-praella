/*
  Warnings:

  - You are about to drop the column `postCount` on the `tags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "postCount";
