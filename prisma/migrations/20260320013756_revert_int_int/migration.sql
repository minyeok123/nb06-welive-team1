/*
  Warnings:

  - The `target_dong` column on the `polls` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "target_dong",
ADD COLUMN     "target_dong" INTEGER[];
