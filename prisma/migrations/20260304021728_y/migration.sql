/*
  Warnings:

  - Made the column `apt_id` on table `registers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "registers" ADD COLUMN     "profile_img" TEXT,
ALTER COLUMN "apt_id" SET NOT NULL;
