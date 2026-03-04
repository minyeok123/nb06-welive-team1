/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `registers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `registers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `registers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registers" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "registers_username_key" ON "registers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "registers_email_key" ON "registers"("email");
