-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_register_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "register_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
