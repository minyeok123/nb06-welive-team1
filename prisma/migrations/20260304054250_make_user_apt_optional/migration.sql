-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_apt_id_fkey";

-- AlterTable
ALTER TABLE "registers" ALTER COLUMN "apt_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "apt_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
