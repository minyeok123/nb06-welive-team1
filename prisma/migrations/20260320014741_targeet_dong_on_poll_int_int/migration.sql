/*
  Warnings:

  - Changed the type of `target_dong` on the `polls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "target_dong",
ADD COLUMN     "target_dong" INTEGER NOT NULL;
