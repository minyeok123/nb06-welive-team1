/*
  Warnings:

  - You are about to drop the column `apt_adress` on the `apartment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apt_address]` on the table `apartment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apt_address` to the `apartment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "apartment_apt_adress_key";

-- AlterTable
ALTER TABLE "apartment" DROP COLUMN "apt_adress",
ADD COLUMN     "apt_address" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "apartment_apt_address_key" ON "apartment"("apt_address");
