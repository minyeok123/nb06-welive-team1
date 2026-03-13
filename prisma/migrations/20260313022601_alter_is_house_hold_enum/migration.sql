/*
  Warnings:

  - The values [HOUSEHOLD] on the enum `IsHouseHold` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IsHouseHold_new" AS ENUM ('HOUSEHOLDER', 'MEMBER');
ALTER TABLE "residents" ALTER COLUMN "is_houseHold" DROP DEFAULT;
ALTER TABLE "residents" ALTER COLUMN "is_houseHold" TYPE "IsHouseHold_new" USING ("is_houseHold"::text::"IsHouseHold_new");
ALTER TABLE "residentRoster" ALTER COLUMN "is_house_hold" TYPE "IsHouseHold_new" USING ("is_house_hold"::text::"IsHouseHold_new");
ALTER TYPE "IsHouseHold" RENAME TO "IsHouseHold_old";
ALTER TYPE "IsHouseHold_new" RENAME TO "IsHouseHold";
DROP TYPE "IsHouseHold_old";
ALTER TABLE "residents" ALTER COLUMN "is_houseHold" SET DEFAULT 'MEMBER';
COMMIT;
