/*
  Warnings:

  - Changed the type of `target_dong` on the `polls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_board_id_fkey";

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "board_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "polls" DROP COLUMN "target_dong",
ADD COLUMN     "target_dong" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
