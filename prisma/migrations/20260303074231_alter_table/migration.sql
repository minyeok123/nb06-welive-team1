/*
  Warnings:

  - The primary key for the `apartment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `boards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `comments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `complaints` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `residentRoster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `residents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `vote_options` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `vote_participations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `votes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `apartment_req` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `register_reqs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[register_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `start_complex_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_complex_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start_dong_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_dong_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start_floor_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_floor_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start_ho_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_ho_number` on the `apartment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `register_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "apartment_req" DROP CONSTRAINT "apartment_req_user_id_fkey";

-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_author_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_board_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_board_id_fkey";

-- DropForeignKey
ALTER TABLE "notices" DROP CONSTRAINT "notices_board_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_board_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "register_reqs" DROP CONSTRAINT "register_reqs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "residentRoster" DROP CONSTRAINT "residentRoster_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "residentRoster" DROP CONSTRAINT "residentRoster_apt_id_fkey";

-- DropForeignKey
ALTER TABLE "residentRoster" DROP CONSTRAINT "residentRoster_user_id_fkey";

-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_apt_id_fkey";

-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_apt_id_fkey";

-- DropForeignKey
ALTER TABLE "vote_options" DROP CONSTRAINT "vote_options_vote_id_fkey";

-- DropForeignKey
ALTER TABLE "vote_participations" DROP CONSTRAINT "vote_participations_resident_id_fkey";

-- DropForeignKey
ALTER TABLE "vote_participations" DROP CONSTRAINT "vote_participations_vote_id_fkey";

-- DropForeignKey
ALTER TABLE "vote_participations" DROP CONSTRAINT "vote_participations_vote_option_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_board_id_fkey";

-- AlterTable
ALTER TABLE "apartment" DROP CONSTRAINT "apartment_pkey",
ADD COLUMN     "aptStatus" "RegisterStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "start_complex_number",
ADD COLUMN     "start_complex_number" INTEGER NOT NULL,
DROP COLUMN "end_complex_number",
ADD COLUMN     "end_complex_number" INTEGER NOT NULL,
DROP COLUMN "start_dong_number",
ADD COLUMN     "start_dong_number" INTEGER NOT NULL,
DROP COLUMN "end_dong_number",
ADD COLUMN     "end_dong_number" INTEGER NOT NULL,
DROP COLUMN "start_floor_number",
ADD COLUMN     "start_floor_number" INTEGER NOT NULL,
DROP COLUMN "end_floor_number",
ADD COLUMN     "end_floor_number" INTEGER NOT NULL,
DROP COLUMN "start_ho_number",
ADD COLUMN     "start_ho_number" INTEGER NOT NULL,
DROP COLUMN "end_ho_number",
ADD COLUMN     "end_ho_number" INTEGER NOT NULL,
ADD CONSTRAINT "apartment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "apartment_id_seq";

-- AlterTable
ALTER TABLE "boards" DROP CONSTRAINT "boards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "boards_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "boards_id_seq";

-- AlterTable
ALTER TABLE "comments" DROP CONSTRAINT "comments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "board_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "comments_id_seq";

-- AlterTable
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "board_id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "complaints_id_seq";

-- AlterTable
ALTER TABLE "notices" DROP CONSTRAINT "notices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "board_id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notices_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "notices_id_seq";

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "board_id" SET DATA TYPE TEXT,
ALTER COLUMN "complaintId" SET DATA TYPE TEXT,
ALTER COLUMN "noticeId" SET DATA TYPE TEXT,
ALTER COLUMN "voteId" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "notifications_id_seq";

-- AlterTable
ALTER TABLE "residentRoster" DROP CONSTRAINT "residentRoster_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "apt_id" SET DATA TYPE TEXT,
ALTER COLUMN "admin_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "residentRoster_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "residentRoster_id_seq";

-- AlterTable
ALTER TABLE "residents" DROP CONSTRAINT "residents_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "apt_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "residents_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "residents_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "register_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "apt_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AlterTable
ALTER TABLE "vote_options" DROP CONSTRAINT "vote_options_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vote_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "vote_options_id_seq";

-- AlterTable
ALTER TABLE "vote_participations" DROP CONSTRAINT "vote_participations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "resident_id" SET DATA TYPE TEXT,
ALTER COLUMN "vote_id" SET DATA TYPE TEXT,
ALTER COLUMN "vote_option_id" DROP NOT NULL,
ALTER COLUMN "vote_option_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "vote_participations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "vote_participations_id_seq";

-- AlterTable
ALTER TABLE "votes" DROP CONSTRAINT "votes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "board_id" SET DATA TYPE TEXT,
ALTER COLUMN "author_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "votes_id_seq";

-- DropTable
DROP TABLE "apartment_req";

-- DropTable
DROP TABLE "register_reqs";

-- CreateTable
CREATE TABLE "registers" (
    "id" TEXT NOT NULL,
    "register_status" "RegisterStatus" NOT NULL,
    "apt_id" TEXT,
    "requested_role" "Role" NOT NULL,
    "dong" INTEGER,
    "ho" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "registers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registers_apt_id_register_status_idx" ON "registers"("apt_id", "register_status");

-- CreateIndex
CREATE INDEX "registers_requested_role_register_status_idx" ON "registers"("requested_role", "register_status");

-- CreateIndex
CREATE UNIQUE INDEX "users_register_id_key" ON "users"("register_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_participations" ADD CONSTRAINT "vote_participations_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_participations" ADD CONSTRAINT "vote_participations_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_participations" ADD CONSTRAINT "vote_participations_vote_option_id_fkey" FOREIGN KEY ("vote_option_id") REFERENCES "vote_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residentRoster" ADD CONSTRAINT "residentRoster_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residentRoster" ADD CONSTRAINT "residentRoster_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residentRoster" ADD CONSTRAINT "residentRoster_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
