-- AlterTable
ALTER TABLE "residentRoster" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "is_house_hold" DROP NOT NULL;
