/*
  Warnings:

  - You are about to drop the column `userId` on the `boards` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_userId_fkey";

-- AlterTable
ALTER TABLE "boards" DROP COLUMN "userId";
