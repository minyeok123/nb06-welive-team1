/*
  Warnings:

  - Made the column `is_house_hold` on table `residentRoster` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "residentRoster" ALTER COLUMN "is_house_hold" SET NOT NULL;
