/*
  Warnings:

  - Added the required column `discription` to the `apartment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apartment" ADD COLUMN     "discription" TEXT NOT NULL;
