/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `residentRoster` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "residentRoster_phone_number_key" ON "residentRoster"("phone_number");
