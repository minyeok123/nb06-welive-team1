/*
  Warnings:

  - You are about to drop the column `author_id` on the `boards` table. All the data in the column will be lost.
  - Added the required column `apt_id` to the `boards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_author_id_fkey";

-- DropIndex
DROP INDEX "boards_author_id_idx";

-- AlterTable
ALTER TABLE "boards" DROP COLUMN "author_id",
ADD COLUMN     "apt_id" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
