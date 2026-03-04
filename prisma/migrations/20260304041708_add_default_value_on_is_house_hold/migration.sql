/*
  Warnings:

  - You are about to drop the column `profile_img` on the `registers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "registers" DROP COLUMN "profile_img";

-- AlterTable
ALTER TABLE "residents" ALTER COLUMN "is_houseHold" SET DEFAULT 'MEMBER';
