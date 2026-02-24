-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "IsPublic" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "RegisterStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IsHouseHold" AS ENUM ('HOUSEHOLD', 'MEMBER');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('COMPLAINT', 'VOTE', 'NOTICE');

-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('MAINTENANCE', 'EMERGENCY', 'COMMUNITY', 'RESIDENT_VOTE', 'RESIDENT_COUNCIL', 'ETC');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'SIGNUP_REQ', 'COMPLAINT_REQ', 'COMPLAINT_IN_PROGRESS', 'COMPLAINT_RESOLVED', 'COMPLAINT_REJECTED', 'NOTICE_REG', 'POLL_REG', 'POLL_CLOSED', 'POLL_RESULT', 'SYSTEM', 'TEST');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "resient_roster_id" INTEGER,
    "profile_img" TEXT,
    "nickname" TEXT NOT NULL,
    "apt_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "register_status" "RegisterStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "register_reqs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "register_status" "RegisterStatus" NOT NULL,
    "apt_id" INTEGER,
    "requested_role" "Role" NOT NULL,
    "dong" TEXT,
    "ho" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "register_reqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment_req" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "apt_name" TEXT NOT NULL,
    "apt_adress" TEXT NOT NULL,
    "office_number" TEXT NOT NULL,
    "start_complex_number" TEXT NOT NULL,
    "end_complex_number" TEXT NOT NULL,
    "start_dong_number" TEXT NOT NULL,
    "end_dong_number" TEXT NOT NULL,
    "start_floor_number" TEXT NOT NULL,
    "end_floor_number" TEXT NOT NULL,
    "start_ho_number" TEXT NOT NULL,
    "end_ho_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartment_req_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment" (
    "id" SERIAL NOT NULL,
    "apt_name" TEXT NOT NULL,
    "apt_adress" TEXT NOT NULL,
    "office_number" TEXT NOT NULL,
    "start_complex_number" TEXT NOT NULL,
    "end_complex_number" TEXT NOT NULL,
    "start_dong_number" TEXT NOT NULL,
    "end_dong_number" TEXT NOT NULL,
    "start_floor_number" TEXT NOT NULL,
    "end_floor_number" TEXT NOT NULL,
    "start_ho_number" TEXT NOT NULL,
    "end_ho_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "apt_id" INTEGER NOT NULL,
    "dong" INTEGER NOT NULL,
    "ho" INTEGER NOT NULL,
    "is_houseHold" "IsHouseHold" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" SERIAL NOT NULL,
    "board_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "is_public" "IsPublic" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" SERIAL NOT NULL,
    "board_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "target_dong" TEXT[],
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" SERIAL NOT NULL,
    "board_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL,
    "category" "NoticeCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "board_type" "BoardType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "board_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_options" (
    "id" SERIAL NOT NULL,
    "vote_id" INTEGER NOT NULL,
    "option" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_participations" (
    "id" SERIAL NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "vote_id" INTEGER NOT NULL,
    "vote_option_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vote_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "board_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "notification_type" "NotificationType" NOT NULL,
    "complaintId" INTEGER,
    "noticeId" INTEGER,
    "voteId" INTEGER,
    "notificated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residentRoster" (
    "id" SERIAL NOT NULL,
    "apt_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "dong" INTEGER NOT NULL,
    "ho" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_house_hold" "IsHouseHold" NOT NULL,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "is_residence" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residentRoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_resient_roster_id_key" ON "users"("resient_roster_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "register_reqs_user_id_key" ON "register_reqs"("user_id");

-- CreateIndex
CREATE INDEX "register_reqs_apt_id_register_status_idx" ON "register_reqs"("apt_id", "register_status");

-- CreateIndex
CREATE INDEX "register_reqs_requested_role_register_status_idx" ON "register_reqs"("requested_role", "register_status");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_req_user_id_key" ON "apartment_req"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_req_apt_adress_key" ON "apartment_req"("apt_adress");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_apt_adress_key" ON "apartment"("apt_adress");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_office_number_key" ON "apartment"("office_number");

-- CreateIndex
CREATE UNIQUE INDEX "residents_user_id_key" ON "residents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "residents_apt_id_user_id_key" ON "residents"("apt_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_board_id_key" ON "complaints"("board_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE UNIQUE INDEX "votes_board_id_key" ON "votes"("board_id");

-- CreateIndex
CREATE UNIQUE INDEX "notices_board_id_key" ON "notices"("board_id");

-- CreateIndex
CREATE INDEX "boards_board_type_created_at_idx" ON "boards"("board_type", "created_at");

-- CreateIndex
CREATE INDEX "boards_author_id_idx" ON "boards"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "vote_options_vote_id_option_key" ON "vote_options"("vote_id", "option");

-- CreateIndex
CREATE UNIQUE INDEX "vote_participations_resident_id_vote_id_key" ON "vote_participations"("resident_id", "vote_id");

-- CreateIndex
CREATE UNIQUE INDEX "residentRoster_user_id_key" ON "residentRoster"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_apt_id_fkey" FOREIGN KEY ("apt_id") REFERENCES "apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_resient_roster_id_fkey" FOREIGN KEY ("resient_roster_id") REFERENCES "residentRoster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "register_reqs" ADD CONSTRAINT "register_reqs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_req" ADD CONSTRAINT "apartment_req_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "register_reqs"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "vote_participations" ADD CONSTRAINT "vote_participations_vote_option_id_fkey" FOREIGN KEY ("vote_option_id") REFERENCES "vote_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
