/*
  Warnings:

  - You are about to drop the column `resient_roster_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_resient_roster_id_fkey";

-- DropIndex
DROP INDEX "users_resient_roster_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resient_roster_id";
